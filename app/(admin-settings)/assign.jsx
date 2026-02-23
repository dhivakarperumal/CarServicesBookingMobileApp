// import { useEffect, useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import {
//   collection,
//   onSnapshot,
//   doc,
//   updateDoc,
//   getDocs,
//   addDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase";

// export default function AdminAssignServices() {
//   const router = useRouter();

//   const [bookings, setBookings] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [bookingModalVisible, setBookingModalVisible] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [assigning, setAssigning] = useState(false);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);

//   const [filter, setFilter] = useState("new"); // new | todayAssigned | notTodayAssigned

//   /* 🔥 FETCH BOOKINGS */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
//       const list = snap.docs
//         .map((d) => ({ id: d.id, ...d.data() }))
//         .filter((b) => b.serviceStatus !== "Service Completed");

//       setBookings(list);
//       setLoading(false);
//     });

//     return unsub;
//   }, []);

//   /* 🔥 DATE HELPER */
//   const isToday = (timestamp) => {
//     if (!timestamp) return false;
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//     const today = new Date();

//     return (
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getFullYear() === today.getFullYear()
//     );
//   };

//   /* 🔥 FILTERED BOOKINGS */
//   const filteredBookings = useMemo(() => {
//     return bookings.filter((b) => {
//       if (filter === "new") return !b.assignedEmployeeId;

//       if (filter === "todayAssigned")
//         return b.serviceStatus === "Approved" && isToday(b.assignedAt);

//       if (filter === "notTodayAssigned")
//         return b.serviceStatus === "Approved" && !isToday(b.assignedAt);

//       return true;
//     });
//   }, [bookings, filter]);

//   /* 🔥 FETCH FREE MECHANICS */
//   const fetchAvailableEmployees = async () => {
//     setLoadingEmployees(true);

//     const snap = await getDocs(collection(db, "employees"));

//     const list = snap.docs
//       .map((d) => ({ id: d.id, ...d.data() }))
//       .filter(
//         (emp) =>
//           emp.status === "active" &&
//           emp.role === "mechanic" &&
//           emp.workStatus !== "busy"
//       );

//     setEmployees(list);
//     setLoadingEmployees(false);
//   };

//   /* 🔥 OPEN MODAL */
//   const openAssignModal = async (booking) => {
//     setSelectedBooking(booking);
//     setSelectedEmployeeId(null);
//     setBookingModalVisible(false);
//     await fetchAvailableEmployees();
//     setModalVisible(true);
//   };

//   /* 🔥 ASSIGN FUNCTION */
//   const assignEmployee = async () => {
//     if (!selectedBooking || !selectedEmployeeId || assigning) return;

//     try {
//       setAssigning(true);

//       const bookingDocId = selectedBooking.id;
//       const serviceId = selectedBooking.bookingId || "";
//       const customerUid = selectedBooking.uid || "";

//       const selectedEmployee = employees.find(
//         (emp) => emp.id === selectedEmployeeId
//       );

//       if (!selectedEmployee) {
//         Alert.alert("Error", "Employee data not found");
//         return;
//       }

//       const employeeAuthUid = selectedEmployee.authUid || "";

//       /* 1️⃣ UPDATE BOOKING */
//       await updateDoc(doc(db, "bookings", bookingDocId), {
//         bookingDocId,
//         serviceId,
//         customerUid,

//         assignedEmployeeId: selectedEmployeeId,
//         assignedEmployeeAuthUid: employeeAuthUid,

//         assignedEmployeeName: selectedEmployee.name || "",
//         assignedEmployeePhone: selectedEmployee.phone || "",
//         assignedEmployeeShift: selectedEmployee.shift || "",

//         carBrand: selectedBooking.brand || "",
//         carModel: selectedBooking.model || "",
//         carIssue: selectedBooking.issue || "",

//         customerName: selectedBooking.name || "",
//         customerPhone: selectedBooking.phone || "",
//         customerEmail: selectedBooking.email || "",

//         serviceStatus: "Approved",
//         assignedAt: new Date(),
//       });

//       /* 2️⃣ UPDATE EMPLOYEE */
//       await updateDoc(doc(db, "employees", selectedEmployeeId), {
//         currentBookingId: bookingDocId,
//         workStatus: "busy",
//       });

//       /* 3️⃣ CREATE assignedServices DOC */
//       await addDoc(collection(db, "assignedServices"), {
//         bookingDocId,
//         serviceId,
//         customerUid,

//         employeeDocId: selectedEmployeeId,
//         employeeAuthUid,

//         employeeName: selectedEmployee.name || "",
//         employeePhone: selectedEmployee.phone || "",
//         employeeShift: selectedEmployee.shift || "",

//         carBrand: selectedBooking.brand || "",
//         carModel: selectedBooking.model || "",
//         carIssue: selectedBooking.issue || "",

//         customerName: selectedBooking.name || "",
//         customerPhone: selectedBooking.phone || "",
//         customerEmail: selectedBooking.email || "",

//         serviceStatus: "Assigned",
//         assignedAt: new Date(),
//         startedAt: null,
//         completedAt: null,

//         trackNumber: "",
//         notes: "",
//       });

//       Alert.alert("Success", "Mechanic assigned & job created");

//       setModalVisible(false);
//       setSelectedBooking(null);
//       setSelectedEmployeeId(null);
//       setEmployees([]);
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Assignment failed");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   /* 🔥 BOOKING CARD */
//   const renderBooking = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.car}>
//         {item.brand} - {item.model}
//       </Text>

//       <Text style={styles.service}>Issue: {item.issue}</Text>
//       <Text style={styles.customer}>Customer: {item.name}</Text>

//       <View style={styles.statusBadge}>
//         <Text style={styles.statusText}>{item.serviceStatus}</Text>
//       </View>

//       {!item.assignedEmployeeId && (
//         <TouchableOpacity
//           style={styles.assignBtn}
//           onPress={() => openAssignModal(item)}
//         >
//           <Text style={styles.btnText}>Assign Mechanic</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   /* 🔥 EMPLOYEE CARD */
//   const renderEmployee = ({ item }) => {
//     const isSelected = selectedEmployeeId === item.id;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.staffCard,
//           isSelected && { borderWidth: 2, borderColor: "#111" },
//         ]}
//         onPress={() => setSelectedEmployeeId(item.id)}
//         disabled={assigning}
//       >
//         <Text style={styles.staffName}>{item.name}</Text>
//         <Text style={styles.staffSub}>{item.shift}</Text>

//         <Text
//           style={{
//             marginTop: 4,
//             color: item.workStatus === "busy" ? "red" : "green",
//             fontSize: 12,
//           }}
//         >
//           {item.workStatus === "busy" ? "Busy" : "Available"}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#111" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* 🔥 FILTER BUTTONS */}
//       <View style={styles.filterRow}>
//         {[
//           { key: "new", label: "New" },
//           { key: "todayAssigned", label: "Today Assigned" },
//           { key: "notTodayAssigned", label: "Not Today" },
//         ].map((btn) => (
//           <TouchableOpacity
//             key={btn.key}
//             style={[
//               styles.filterBtn,
//               filter === btn.key && styles.activeFilter,
//             ]}
//             onPress={() => setFilter(btn.key)}
//           >
//             <Text
//               style={[
//                 styles.filterText,
//                 filter === btn.key && { color: "#fff" },
//               ]}
//             >
//               {btn.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* 🔥 BOOKING LIST */}
//       {filteredBookings.length === 0 ? (
//         <Text style={styles.empty}>No Services Found</Text>
//       ) : (
//         <FlatList
//           data={filteredBookings}
//           keyExtractor={(item) => item.id}
//           renderItem={renderBooking}
//           contentContainerStyle={{ paddingBottom: 120 }}
//         />
//       )}

//       {/* 🔥 FLOATING BUTTON */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => setBookingModalVisible(true)}
//       >
//         <Text style={styles.fabText}>＋</Text>
//       </TouchableOpacity>

//       {/* 🔥 MECHANIC MODAL */}
//       <Modal visible={modalVisible} animationType="slide">
//         <SafeAreaView style={styles.modal}>
//           <Text style={styles.modalTitle}>Select Mechanic</Text>

//           {selectedBooking && (
//             <View style={styles.selectedBox}>
//               <Text style={styles.selectedText}>
//                 {selectedBooking.brand} - {selectedBooking.model}
//               </Text>
//               <Text style={styles.selectedSub}>
//                 Issue: {selectedBooking.issue}
//               </Text>
//             </View>
//           )}

//           {loadingEmployees ? (
//             <ActivityIndicator size="large" color="#111" />
//           ) : employees.length === 0 ? (
//             <Text style={styles.empty}>No Available Mechanics</Text>
//           ) : (
//             <FlatList
//               data={employees}
//               keyExtractor={(item) => item.id}
//               renderItem={renderEmployee}
//             />
//           )}

//           <TouchableOpacity
//             style={[
//               styles.assignConfirmBtn,
//               !selectedEmployeeId && { backgroundColor: "#ccc" },
//             ]}
//             disabled={!selectedEmployeeId || assigning}
//             onPress={assignEmployee}
//           >
//             <Text style={styles.btnText}>
//               {assigning ? "Assigning..." : "Confirm Assign"}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.closeBtn}
//             onPress={() => {
//               setModalVisible(false);
//               setSelectedEmployeeId(null);
//             }}
//           >
//             <Text style={styles.btnText}>Close</Text>
//           </TouchableOpacity>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f4f6f8",
//     paddingHorizontal: 16,
//   },

//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },

//   empty: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 15,
//     color: "#6b7280",
//     fontWeight: "500",
//   },

//   /* 🔥 HEADER */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//   },

//   back: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#111",
//   },

//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   /* 🔥 FILTER TABS */
//   filterRow: {
//     flexDirection: "row",
//     backgroundColor: "#e5e7eb",
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 14,
//   },

//   filterBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   activeFilter: {
//     backgroundColor: "#111827",
//   },

//   filterText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#374151",
//   },

//   /* 🔥 BOOKING CARD */
//   card: {
//     backgroundColor: "#ffffff",
//     padding: 16,
//     borderRadius: 18,
//     marginBottom: 14,

//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 4,
//   },

//   car: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   service: {
//     marginTop: 6,
//     fontSize: 14,
//     color: "#4b5563",
//     fontWeight: "500",
//   },

//   customer: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#6b7280",
//   },

//   /* 🔥 STATUS BADGE */
//   statusBadge: {
//     alignSelf: "flex-start",
//     marginTop: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },

//   statusText: {
//     fontSize: 11,
//     fontWeight: "700",
//   },

//   /* 🔥 ASSIGN BUTTON */
//   assignBtn: {
//     marginTop: 14,
//     backgroundColor: "#111827",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   assignConfirmBtn: {
//     marginTop: 14,
//     backgroundColor: "#111827",
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   btnText: {
//     color: "#ffffff",
//     fontWeight: "800",
//     fontSize: 14,
//     letterSpacing: 0.4,
//   },

//   /* 🔥 MODAL */
//   modal: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//     padding: 16,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "900",
//     textAlign: "center",
//     marginBottom: 16,
//     color: "#111827",
//   },

//   selectedBox: {
//     backgroundColor: "#ffffff",
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },

//   selectedText: {
//     fontWeight: "800",
//     fontSize: 15,
//     color: "#111827",
//   },

//   selectedSub: {
//     color: "#6b7280",
//     marginTop: 4,
//     fontSize: 13,
//   },

//   /* 🔥 MECHANIC CARD */
//   staffCard: {
//     backgroundColor: "#ffffff",
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },

//   staffName: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   staffSub: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 4,
//   },

//   /* 🔥 CLOSE BUTTON */
//   closeBtn: {
//     marginTop: 10,
//     backgroundColor: "#ef4444",
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   /* 🔥 FLOATING BUTTON */
//   fab: {
//     position: "absolute",
//     bottom: 28,
//     right: 20,
//     backgroundColor: "#111827",
//     width: 62,
//     height: 62,
//     borderRadius: 31,
//     justifyContent: "center",
//     alignItems: "center",

//     shadowColor: "#000",
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//   },

//   fabText: {
//     color: "#ffffff",
//     fontSize: 30,
//     fontWeight: "900",
//     marginTop: -2,
//   },
// });

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
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminAssignServices() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [filter, setFilter] = useState("new");

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

  /* 🔥 DATE HELPER */
  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /* 🔥 FILTER BOOKINGS */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filter === "new") return !b.assignedEmployeeId;

      if (filter === "todayAssigned")
        return b.serviceStatus === "Approved" && isToday(b.assignedAt);

      if (filter === "notTodayAssigned")
        return b.serviceStatus === "Approved" && !isToday(b.assignedAt);

      return true;
    });
  }, [bookings, filter]);

  /* 🔥 FETCH MECHANICS (ALLOW MULTI BOOKING) */
  const fetchAvailableEmployees = async () => {
    setLoadingEmployees(true);

    const snap = await getDocs(collection(db, "employees"));

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((emp) => emp.status === "active" && emp.role === "mechanic");

    setEmployees(list);
    setLoadingEmployees(false);
  };

  /* 🔥 OPEN MODAL */
  const openAssignModal = async (booking) => {
    setSelectedBooking(booking);
    setSelectedEmployeeId(null);
    await fetchAvailableEmployees();
    setModalVisible(true);
  };

  /* 🔥 ASSIGN FUNCTION (MULTI BOOKING SAME EMPLOYEE) */
  const assignEmployee = async () => {
    if (!selectedBooking || !selectedEmployeeId || assigning) return;

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
        assignedAt: new Date(),
      });

      /* 2️⃣ UPDATE EMPLOYEE → ADD BOOKING TO ARRAY */
      await updateDoc(doc(db, "employees", selectedEmployeeId), {
        assignedBookingIds: arrayUnion(bookingDocId),
      });

      /* 3️⃣ CREATE assignedServices DOC */
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
        assignedAt: new Date(),
        startedAt: null,
        completedAt: null,
      });

      Alert.alert("Success", "Booking assigned");

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

  /* 🔥 EMPLOYEE CARD */
  const renderEmployee = ({ item }) => {
    const isSelected = selectedEmployeeId === item.id;
    const jobCount = item.assignedBookingIds?.length || 0;

    return (
      <TouchableOpacity
        style={[
          styles.staffCard,
          isSelected && { borderColor: "#38bdf8", borderWidth: 2 },
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
      {/* 🔥 FILTER BUTTONS */}
      <View style={styles.filterRow}>
        {[
          { key: "new", label: "New" },
          { key: "todayAssigned", label: "Today Assigned" },
          { key: "notTodayAssigned", label: "Not Today" },
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

      {/* 🔥 BOOKING LIST */}
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

      {/* 🔥 MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={styles.modalTitle}>Select Mechanic</Text>

          {selectedBooking && (
            <View style={styles.selectedBox}>
              <Text style={styles.selectedText}>
                {selectedBooking.brand} - {selectedBooking.model}
              </Text>
              <Text style={styles.selectedSub}>
                Issue: {selectedBooking.issue}
              </Text>
            </View>
          )}

          {loadingEmployees ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={employees}
              keyExtractor={(item) => item.id}
              renderItem={renderEmployee}
            />
          )}

          <TouchableOpacity
            style={[
              styles.assignConfirmBtn,
              !selectedEmployeeId && { backgroundColor: "#ccc" },
            ]}
            disabled={!selectedEmployeeId || assigning}
            onPress={assignEmployee}
          >
            <Text style={styles.btnText}>
              {assigning ? "Assigning..." : "Confirm Assign"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 14,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
    fontWeight: "600",
  },

  /* FILTER */
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

  activeFilter: {
    backgroundColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  /* BOOKING CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  car: {
    fontSize: 15,
    fontWeight: "800",
    color: "#38bdf8",
  },

  service: {
    marginTop: 6,
    color: "#fff",
  },

  customer: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
  },

  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
  },

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

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  /* MODAL */
  modal: {
    flex: 1,
    padding: 14,
    backgroundColor: "#020617",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 14,
  },

  selectedBox: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  selectedText: {
    color: "#fff",
    fontWeight: "700",
  },

  selectedSub: {
    color: "#94a3b8",
    marginTop: 4,
  },

  /* STAFF */
  staffCard: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  staffName: {
    color: "#fff",
    fontWeight: "700",
  },

  staffSub: {
    fontSize: 12,
    color: "#94a3b8",
  },

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
});
