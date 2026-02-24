

import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const BOOKING_STATUS = [
  "Approved",
  "Processing",
  "Waiting for Spare",
  "Service Going on",
  "Bill Pending",
  "Bill Completed",
  "Service Completed",
];

export default function Services() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  /* 🔥 SERVICES */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "allServices"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setServices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* 🔥 EMPLOYEES */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "employees"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  /* 🔍 FILTER */
  const filteredServices = useMemo(() => {
    return services
      .filter((s) =>
        statusFilter === "All"
          ? true
          : (s.serviceStatus || "Approved") === statusFilter
      )
      .filter((s) => {
        const text = `
          ${s.bookingId || ""}
          ${s.name || ""}
          ${s.phone || ""}
          ${s.brand || ""}
          ${s.model || ""}
        `.toLowerCase();

        return text.includes(search.toLowerCase());
      });
  }, [services, search, statusFilter]);

  /* 👨‍🔧 AVAILABLE EMPLOYEES */
  const availableEmployees = useMemo(() => {
    return employees.filter((e) => e.workStatus !== "busy");
  }, [employees]);

  /* 🧾 UNASSIGNED SERVICES (for FAB picker) */
  const unassignedServices = useMemo(() => {
    return services.filter((s) => !s.assignedEmployeeId);
  }, [services]);

  /* 🎨 STATUS COLOR */
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#6366f1";
      case "Processing":
        return "#9333ea";
      case "Waiting for Spare":
        return "#f59e0b";
      case "Service Going on":
        return "#f97316";
      case "Bill Pending":
        return "#ec4899";
      case "Bill Completed":
        return "#06b6d4";
      case "Service Completed":
        return "#16a34a";
      default:
        return "#6b7280";
    }
  };

  /* 🔄 STATUS UPDATE */
  const handleStatusChange = async (service, newStatus) => {
    if (!service.assignedEmployeeId) {
      Alert.alert("Assign mechanic first");
      return;
    }

    try {
      setUpdatingId(service.id);

      await updateDoc(doc(db, "allServices", service.id), {
        serviceStatus: newStatus,
        updatedAt: serverTimestamp(),
      });

      if (newStatus === "Service Completed" && service.assignedEmployeeId) {
        await updateDoc(doc(db, "employees", service.assignedEmployeeId), {
          workStatus: "available",
          currentServiceId: null,
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingId(null);
    }
  };

  /* 🧑‍🔧 ASSIGN EMPLOYEE */
  const assignEmployee = async () => {
    if (!selectedBooking || !selectedEmployeeId || assigning) return;

    try {
      setAssigning(true);

      const serviceDocId = selectedBooking.id;

      const selectedEmployee = availableEmployees.find(
        (emp) => emp.id === selectedEmployeeId,
      );

      if (!selectedEmployee) {
        Alert.alert("Error", "Employee not available");
        return;
      }

      await updateDoc(doc(db, "allServices", serviceDocId), {
        assignedEmployeeId: selectedEmployeeId,
        assignedEmployeeName: selectedEmployee.name || "",
        serviceStatus: "Processing",
        assignedAt: new Date(),
      });

      await updateDoc(doc(db, "employees", selectedEmployeeId), {
        currentServiceId: serviceDocId,
        workStatus: "busy",
      });

      await addDoc(collection(db, "assignedServices"), {
        serviceDocId,
        employeeDocId: selectedEmployeeId,
        employeeName: selectedEmployee.name || "",
        customerName: selectedBooking.name || "",
        serviceStatus: "Assigned",
        assignedAt: new Date(),
      });

      Alert.alert("Success", "Mechanic assigned");

      setModalVisible(false);
      setSelectedBooking(null);
      setSelectedEmployeeId(null);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={{ flex: 1, padding: 12 }}>
        {/* 🔍 SEARCH */}
        <TextInput
          placeholder="Search booking, name, phone, car"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#0f172a",
            borderWidth: 1,
            borderColor: "#0b3b6f",
            padding: 16,
            borderRadius: 12,
            marginBottom: 10,
            color: "#fff",
          }}
        />

        {/* 🔘 STATUS DROPDOWN */}
        <View
          style={{
            backgroundColor: "#020617",
            borderWidth: 1,
            borderColor: "#38bdf8",
            borderRadius: 14,
            marginBottom: 10,
            paddingHorizontal: 4,
            overflow: "hidden",
          }}
        >
          <Picker
            selectedValue={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          >
            <Picker.Item label="All" value="All" />

            {BOOKING_STATUS.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>

        {/* 📋 LIST */}
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#0f172a",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#0b3b6f",
                position: "relative",
              }}
            >
              <Text style={{ fontWeight: "700", color: "#38bdf8" }}>
                {item.bookingId || "No Booking"}
              </Text>

              <Text style={{ color: "#fff", marginTop: 18 }}>{item.name}</Text>
              <Text style={{ color: "#94a3b8" }}>{item.phone}</Text>
              <Text style={{ color: "#94a3b8" }}>
                {item.brand} {item.model}
              </Text>

      {/* STATUS BADGE */}
      <View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: getStatusColor(item.serviceStatus),
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 11 }}>
          {item.serviceStatus || "Approved"}
        </Text>
      </View>

      {/* CUSTOMER */}
      <Text style={{ color: "#fff", marginTop: 18, fontWeight: "600" }}>
        {item.name}
      </Text>

      <Text style={{ color: "#94a3b8" }}>{item.phone}</Text>

      {/* CAR DETAILS */}
      <Text style={{ color: "#94a3b8", marginTop: 2 }}>
         {item.brand} {item.model}
      </Text>

      {/* ISSUE */}
      {item.issue && (
        <Text style={{ color: "#eab308", marginTop: 4 }}>
           {item.issue}
        </Text>
      )}

      {/* TRACK NUMBER */}
      {item.trackNumber && (
        <Text style={{ color: "#22c55e", marginTop: 4 }}>
           Track: {item.trackNumber}
        </Text>
      )}

   

      

      {/* ASSIGNED MECHANIC */}
      {item.assignedEmployeeName && (
        <Text style={{ color: "#22c55e", marginTop: 6 }}>
          {item.assignedEmployeeName}
        </Text>
      )}

      {/* ASSIGN BUTTON */}
      {!item.assignedEmployeeId && (
        <TouchableOpacity
          onPress={() => {
            setSelectedBooking(item);
            setModalVisible(true);
          }}
          style={{
            backgroundColor: "#38bdf8",
            paddingVertical: 10,
            borderRadius: 12,
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#020617", fontWeight: "700" }}>
            Assign Mechanic
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )}
/>

        {/* ➕ FAB BUTTON */}
        <TouchableOpacity
          onPress={() => {
            setSelectedBooking(null);
            setModalVisible(true);
          }}
          style={{
            position: "absolute",
            bottom: 30,
            right: 20,
            backgroundColor: "#38bdf8",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#020617", fontSize: 28 }}>+</Text>
        </TouchableOpacity>

        {/* 🪟 ASSIGN MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.75)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#020617",
                borderRadius: 18,
                padding: 18,
                borderWidth: 1,
                borderColor: "#0b3b6f",
              }}
            >
              <Text
                style={{
                  color: "#38bdf8",
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 14,
                  textAlign: "center",
                }}
              >
                Assign Mechanic
              </Text>

              {/* 🔧 SERVICE PICKER (only for FAB flow) */}
              {!selectedBooking && (
                <Picker
                  selectedValue={selectedBooking?.id || ""}
                  onValueChange={(val) =>
                    setSelectedBooking(
                      unassignedServices.find((s) => s.id === val),
                    )
                  }
                  dropdownIconColor="#38bdf8"
                  style={{ color: "#fff" }}
                >
                  <Picker.Item label="Select Service" value="" />
                  {unassignedServices.map((s) => (
                    <Picker.Item
                      key={s.id}
                      label={`${s.bookingId} - ${s.name}`}
                      value={s.id}
                    />
                  ))}
                </Picker>
              )}

              {/* 👨‍🔧 EMPLOYEE PICKER */}
              <Picker
                selectedValue={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
                dropdownIconColor="#38bdf8"
                style={{ color: "#fff", marginTop: 10 }}
              >
                <Picker.Item label="Select mechanic" value="" />
                {availableEmployees.map((emp) => (
                  <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                ))}
              </Picker>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#38bdf8",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={assignEmployee}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "#38bdf8",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#020617", fontWeight: "700" }}>
                    Assign
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
