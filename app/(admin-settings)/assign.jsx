import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Picker } from "@react-native-picker/picker";

export default function AdminAssignServices() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [globalModalVisible, setGlobalModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [filter, setFilter] = useState("notAssigned");
  const [searchText, setSearchText] = useState("");

  /* 🔥 FETCH BOOKINGS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((b) => b.serviceStatus !== "Service Completed");

      setBookings(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  /* ✅ STRICT UNASSIGNED FILTER */
  const unassignedBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        !b.assignedEmployeeId &&
        !b.assignedEmployeeName &&
        b.serviceStatus !== "Approved"
    );
  }, [bookings]);

  /* 🔍 FILTER + SEARCH */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const search = searchText.toLowerCase();

      const matchesSearch =
        b.name?.toLowerCase().includes(search) ||
        b.phone?.toLowerCase().includes(search) ||
        b.brand?.toLowerCase().includes(search) ||
        b.model?.toLowerCase().includes(search) ||
        b.issue?.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      if (filter === "notAssigned")
        return !b.assignedEmployeeId && !b.assignedEmployeeName;

      if (filter === "all") return true;

      return true;
    });
  }, [bookings, filter, searchText]);

  /* 🔥 FETCH EMPLOYEES (SORT BY LEAST JOBS) */
  const fetchAvailableEmployees = async () => {
    setLoadingEmployees(true);

    const snap = await getDocs(collection(db, "employees"));

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(
        (emp) => emp.status === "active" && emp.role === "mechanic"
      );

    setEmployees(list);
    setLoadingEmployees(false);
  };

  /* 🔥 OPEN CARD MODAL */
  const openAssignModal = async (booking) => {
    if (booking.assignedEmployeeId) {
      Alert.alert("Already Assigned");
      return;
    }

    setSelectedBooking(booking);
    setSelectedEmployeeId(null);
    await fetchAvailableEmployees();
    setModalVisible(true);
  };

  /* 🔥 ASSIGN FUNCTION */
  const assignEmployee = async () => {
    if (!selectedBooking || !selectedEmployeeId || assigning) return;

    if (selectedBooking.assignedEmployeeId) {
      Alert.alert("Already Assigned", "This service already has a mechanic.");
      return;
    }

    try {
      setAssigning(true);

      const bookingDocId = selectedBooking.id;
      const serviceId = selectedBooking.bookingId || "";
      const customerUid = selectedBooking.uid || "";

      const selectedEmployee = employees.find(
        (emp) => emp.id === selectedEmployeeId,
      );

      if (!selectedEmployee) {
        Alert.alert("Error", "Employee data not found");
        return;
      }

      const employeeAuthUid = selectedEmployee.authUid || "";

      /* 1️⃣ UPDATE BOOKING */
      await updateDoc(doc(db, "bookings", bookingDocId), {
        assignedEmployeeId: selectedEmployeeId,
        assignedEmployeeAuthUid: employeeAuthUid,
        assignedEmployeeName: selectedEmployee.name || "",
        serviceStatus: "Approved",
        assignedAt: serverTimestamp(),
      });

      /* 2️⃣ UPDATE EMPLOYEE */
      await updateDoc(doc(db, "employees", selectedEmployeeId), {
        assignedBookingIds: arrayUnion(bookingDocId),
      });

      /* 3️⃣ CREATE assignedServices */
      await addDoc(collection(db, "assignedServices"), {
        bookingDocId,
        serviceId,
        customerUid,
        employeeDocId: selectedEmployeeId,
        employeeAuthUid,
        employeeName: selectedEmployee.name || "",
        carBrand: selectedBooking.brand || "",
        carModel: selectedBooking.model || "",
        carIssue: selectedBooking.issue || "",
        customerName: selectedBooking.name || "",
        customerPhone: selectedBooking.phone || "",
        customerEmail: selectedBooking.email || "",
        serviceStatus: "Assigned",
        assignedAt: serverTimestamp(),
        startedAt: null,
        completedAt: null,
      });

      Alert.alert("Success", "Booking assigned");

      setModalVisible(false);
      setGlobalModalVisible(false);
      setSelectedBooking(null);
      setSelectedEmployeeId(null);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#22c55e"; // green
      case "Assigned":
        return "#38bdf8"; // cyan blue
      case "Cancelled":
        return "#ef4444"; // red
      case "Booked":
        return "#f59e0b"; // amber
      default:
        return "#64748b"; // gray
    }
  };

  /* 🔥 BOOKING CARD */
  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.car}>
        {item.brand} - {item.model}
      </Text>

      <Text style={styles.service}>Issue: {item.issue}</Text>
      <Text style={styles.customer}>Customer: {item.name}</Text>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* 👨‍🔧 SHOW ASSIGNED NAME */}
      {item.assignedEmployeeName && (
        <Text style={{ marginTop: 6, color: "#16a34a", fontWeight: "700" }}>
          👨‍🔧 {item.assignedEmployeeName}
        </Text>
      )}

      {/* ✅ HIDE BUTTON IF ASSIGNED */}
      {!item.assignedEmployeeId && !item.assignedEmployeeName && (
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={() => openAssignModal(item)}
        >
          <Text style={styles.btnText}>Assign Mechanic</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /* 🔥 EMPLOYEE CARD */
  const renderEmployee = ({ item }) => {
    const isSelected = selectedEmployeeId === item.id;
    const jobCount = item.assignedBookingIds?.length || 0;

    return (
      <TouchableOpacity
        style={[
          styles.staffCard,
          isSelected && { borderWidth: 2, borderColor: "#111" },
        ]}
        onPress={() => setSelectedEmployeeId(item.id)}
      >
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffSub}>Jobs: {jobCount}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search car, customer, phone..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {/* 🔘 FILTER */}
      <View style={styles.filterRow}>
        {[
          { key: "notAssigned", label: "Not Assigned" },
          { key: "all", label: "All" },
        ].map((btn) => (
          <TouchableOpacity
            key={btn.key}
            style={[
              styles.filterBtn,
              filter === btn.key && styles.activeFilter,
            ]}
            onPress={() => setFilter(btn.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === btn.key && { color: "#fff" },
              ]}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 LIST */}
      {filteredBookings.length === 0 ? (
        <Text style={styles.empty}>No Services Found</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* ➕ GLOBAL ASSIGN BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={async () => {
          setSelectedBooking(null);
          setSelectedEmployeeId(null);
          await fetchAvailableEmployees();
          setGlobalModalVisible(true);
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
          +
        </Text>
      </TouchableOpacity>

      {/* 🔥 GLOBAL MODAL */}
      <Modal visible={globalModalVisible} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={styles.modalTitle}>Assign Service</Text>

          <Text style={{ fontWeight: "700", marginBottom: 6 }}>
            Select Service
          </Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedBooking?.id || ""}
              onValueChange={(val) =>
                setSelectedBooking(
                  unassignedBookings.find((b) => b.id === val)
                )
              }
            >
              <Picker.Item label="Select service" value="" />
              {unassignedBookings.map((b) => (
                <Picker.Item
                  key={b.id}
                  label={`${b.brand} - ${b.model} (${b.name})`}
                  value={b.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={{ fontWeight: "700", marginBottom: 6 }}>
            Select Mechanic
          </Text>

          {loadingEmployees ? (
            <ActivityIndicator size="large" />
          ) : (
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <Picker.Item label="Select mechanic" value="" />
                {employees.map((emp) => (
                  <Picker.Item
                    key={emp.id}
                    label={`${emp.name} (Jobs: ${
                      emp.assignedBookingIds?.length || 0
                    })`}
                    value={emp.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.assignConfirmBtn,
              (!selectedEmployeeId || !selectedBooking) && {
                backgroundColor: "#ccc",
              },
            ]}
            disabled={!selectedEmployeeId || !selectedBooking || assigning}
            onPress={assignEmployee}
          >
            <Text style={styles.btnText}>
              {assigning ? "Assigning..." : "Confirm Assign"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setGlobalModalVisible(false)}
          >
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 16 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
    fontWeight: "600",
  },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  activeFilter: { backgroundColor: "#111827" },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 4,
  },

  car: { fontSize: 16, fontWeight: "800" },
  service: { marginTop: 6, fontSize: 14 },
  customer: { marginTop: 4, fontSize: 13, color: "#6b7280" },

  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  statusText: { fontSize: 11, fontWeight: "700" },

  assignBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  btnText: { color: "#fff", fontWeight: "800" },

  modal: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },

  selectedBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  selectedText: { fontWeight: "800" },
  selectedSub: { color: "#6b7280", marginTop: 4 },

  staffCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  staffName: { fontWeight: "800" },
  staffSub: { fontSize: 12, color: "#6b7280" },

  assignConfirmBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#020617",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  /* 👨‍🔧 STAFF CARD (FUTURE USE) */
  staffCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  staffName: {
    fontWeight: "800",
    fontSize: 14,
    color: "#111827",
  },

  staffSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* 📦 SELECTED BOOKING BOX (CARD MODAL) */
  selectedBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  selectedText: {
    fontWeight: "800",
    fontSize: 14,
    color: "#111827",
  },

  selectedSub: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
  },

  /* ➕ FAB */
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#111827",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
