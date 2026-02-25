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
import { KeyboardAvoidingView, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  const [tab, setTab] = useState("unassigned");
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

  /* 🔥 FETCH EMPLOYEES */
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    const snap = await getDocs(collection(db, "employees"));

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((emp) => emp.status === "active" && emp.role === "mechanic");

    setEmployees(list);
    setLoadingEmployees(false);
  };

  const availableEmployees = employees.filter(
    (emp) => emp.workStatus !== "busy"
  );

  /* 🔍 SEARCH */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const search = searchText.toLowerCase();

      const matches =
        b.name?.toLowerCase().includes(search) ||
        b.phone?.toLowerCase().includes(search) ||
        b.brand?.toLowerCase().includes(search) ||
        b.model?.toLowerCase().includes(search);

      if (!matches) return false;

      if (tab === "unassigned") return !b.assignedEmployeeId;
      if (tab === "assigned") return b.assignedEmployeeId;

      return true;
    });
  }, [bookings, searchText, tab]);

  const assignedCount = bookings.filter((b) => b.assignedEmployeeId).length;
  const unassignedCount = bookings.filter((b) => !b.assignedEmployeeId).length;

  /* 🔥 OPEN CARD MODAL */
  const openAssignModal = async (booking) => {
    setSelectedBooking(booking);
    setSelectedEmployeeId(null);
    await fetchEmployees();
    setModalVisible(true);
  };

  /* 🔥 ASSIGN FUNCTION */
  const assignEmployee = async () => {
    if (!selectedBooking || !selectedEmployeeId || assigning) return;

    try {
      setAssigning(true);

      const bookingDocId = selectedBooking.id;
      const serviceId = selectedBooking.bookingId || "";
      const customerUid = selectedBooking.uid || "";

      const selectedEmployee = employees.find(
        (emp) => emp.id === selectedEmployeeId
      );

      const employeeAuthUid = selectedEmployee?.authUid || "";

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
        workStatus: "busy",
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
        serviceStatus: "Assigned",
        assignedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Mechanic assigned");

      setModalVisible(false);
      setGlobalModalVisible(false);
      setSelectedBooking(null);
      setSelectedEmployeeId(null);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  /* 🔥 BOOKING CARD */
const renderBooking = ({ item }) => (
  <View style={styles.card}>
    {/* 🔹 TOP ROW → ID + STATUS */}
    <View style={styles.topRow}>
      <Text style={styles.bookingId}>
        {item.bookingId || "BOOKING"}
      </Text>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: item.assignedEmployeeId
              ? "#16a34a"
              : "#f59e0b",
          },
        ]}
      >
        <Text style={styles.statusText}>
          {item.assignedEmployeeId ? "Assigned" : "Unassigned"}
        </Text>
      </View>
    </View>

    {/* 🚗 VEHICLE */}
    <Text style={styles.car}>
      {item.brand} - {item.model}
    </Text>

    {item.vehicleNumber && (
      <Text style={styles.vehicleNo}>🚘 {item.vehicleNumber}</Text>
    )}

    {/* 👤 CUSTOMER */}
    <Text style={styles.customer}>👤 {item.name}</Text>

    {item.phone && (
      <Text style={styles.subText}>📞 {item.phone}</Text>
    )}

    {/* 🛠 ISSUE */}
    {item.issue && (
      <Text style={styles.issue}>🛠 Issue: {item.issue}</Text>
    )}

    {/* 📍 ADDRESS */}
    {item.address && (
      <Text style={styles.subText}>📍 {item.address}</Text>
    )}

    {/* 👨‍🔧 ASSIGNED EMPLOYEE */}
    {item.assignedEmployeeName && (
      <Text style={styles.assignedText}>
        👨‍🔧 {item.assignedEmployeeName}
      </Text>
    )}

    {/* 🔘 ASSIGN BUTTON */}
    {!item.assignedEmployeeId && (
      <TouchableOpacity
        style={styles.assignBtn}
        onPress={() => openAssignModal(item)}
      >
        <Text style={styles.btnText}>Assign Mechanic</Text>
      </TouchableOpacity>
    )}
  </View>
);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        {/* 🔘 TABS */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "unassigned" && styles.activeTab]}
            onPress={() => setTab("unassigned")}
          >
            <Text style={styles.tabText}>Unassigned ({unassignedCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === "assigned" && styles.activeTab]}
            onPress={() => setTab("assigned")}
          >
            <Text style={styles.tabText}>Assigned ({assignedCount})</Text>
          </TouchableOpacity>
        </View>

        {/* 🔍 SEARCH */}
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        {/* 📋 LIST */}
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        {/* ➕ GLOBAL ASSIGN BUTTON */}
        <TouchableOpacity
          style={styles.fab}
          onPress={async () => {
            setSelectedBooking(null);
            setSelectedEmployeeId(null);
            await fetchEmployees();
            setGlobalModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#fff" />
        </TouchableOpacity>

        {/* 🔥 GLOBAL MODAL */}
        <Modal visible={globalModalVisible} animationType="slide">
          <SafeAreaView style={styles.modal}>
            <Text style={styles.modalTitle}>Assign Service</Text>

            <Text>Select Booking</Text>
            <Picker
              selectedValue={selectedBooking?.id || ""}
              onValueChange={(val) =>
                setSelectedBooking(bookings.find((b) => b.id === val))
              }
              style={styles.picker}
            >
              <Picker.Item label="Select booking" value="" />
              {bookings
                .filter((b) => !b.assignedEmployeeId)
                .map((b) => (
                  <Picker.Item
                    key={b.id}
                    label={`${b.brand} ${b.model} (${b.name})`}
                    value={b.id}
                  />
                ))}
            </Picker>

            <Text>Select Mechanic</Text>
            <Picker
              selectedValue={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              style={styles.picker}
            >
              <Picker.Item label="Select mechanic" value="" />
              {availableEmployees.map((emp) => (
                <Picker.Item
                  key={emp.id}
                  label={`${emp.name} (Jobs: ${
                    emp.assignedBookingIds?.length || 0
                  })`}
                  value={emp.id}
                />
              ))}
            </Picker>

            <TouchableOpacity
              style={styles.assignConfirmBtn}
              disabled={!selectedBooking || !selectedEmployeeId}
              onPress={assignEmployee}
            >
              <Text style={styles.btnText}>Assign</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setGlobalModalVisible(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {/* 🔥 CARD MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Assign Mechanic</Text>

              {selectedBooking && (
                <View style={styles.selectedBox}>
                  <Text style={styles.selectedText}>
                    {selectedBooking.brand} {selectedBooking.model}
                  </Text>
                  <Text style={styles.selectedSub}>
                    {selectedBooking.name}
                  </Text>
                </View>
              )}

              <Picker
                selectedValue={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
                style={styles.picker}
              >
                <Picker.Item label="Select mechanic" value="" />
                {availableEmployees.map((emp) => (
                  <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                ))}
              </Picker>

              <TouchableOpacity
                style={styles.assignConfirmBtn}
                disabled={!selectedEmployeeId}
                onPress={assignEmployee}
              >
                <Text style={styles.btnText}>Assign</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* SCREEN */
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* 🔘 TABS */
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#38bdf8",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#020617",
  },

  /* 🔍 SEARCH */
  searchInput: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 15,
  },

  /* 📦 CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  car: {
    fontSize: 16,
    fontWeight: "800",
    color: "#38bdf8",
  },

  customer: {
    marginTop: 4,
    fontSize: 14,
    color: "#e5e7eb",
    fontWeight: "600",
  },

  assignBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  /* ➕ FAB */
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },

  /* 🪟 GLOBAL MODAL */
  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#38bdf8",
    textAlign: "center",
    marginBottom: 20,
  },

  pickerBox: {
    backgroundColor: "#020617",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    marginBottom: 16,
    overflow: "hidden",
  },

  picker: {
    color: "#fff",
  },

  assignConfirmBtn: {
    marginTop: 20,
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
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

  /* 🔲 CARD MODAL OVERLAY */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },

  selectedBox: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },

  selectedText: {
    fontWeight: "800",
    fontSize: 14,
    color: "#f8fafc",
  },

  selectedSub: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12,
  },
  topRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
},

bookingId: {
  color: "#38bdf8",
  fontWeight: "900",
  fontSize: 13,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 10,
},

statusText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "800",
},

vehicleNo: {
  marginTop: 4,
  fontSize: 13,
  color: "#4ade80",
  fontWeight: "700",
},

subText: {
  fontSize: 12,
  color: "#94a3b8",
  marginTop: 2,
},

issue: {
  marginTop: 6,
  fontSize: 13,
  color: "#facc15",
  fontWeight: "600",
},

assignedText: {
  marginTop: 8,
  color: "#22c55e",
  fontWeight: "800",
},
});