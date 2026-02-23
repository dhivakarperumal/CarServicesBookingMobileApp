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
//   TextInput,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   collection,
//   onSnapshot,
//   doc,
//   updateDoc,
//   getDocs,
//   addDoc,
//   arrayUnion,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "../../firebase";
// import { Picker } from "@react-native-picker/picker";

// export default function AdminAssignServices() {
//   const [bookings, setBookings] = useState([]);
//   const [employees, setEmployees] = useState([]);

//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [globalModalVisible, setGlobalModalVisible] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [assigning, setAssigning] = useState(false);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);

//   const [filter, setFilter] = useState("notAssigned");
//   const [searchText, setSearchText] = useState("");

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

//   /* 🔥 UNASSIGNED LIST FOR GLOBAL MODAL */
//   const unassignedBookings = useMemo(() => {
//     return bookings.filter((b) => !b.assignedEmployeeId);
//   }, [bookings]);

//   /* 🔍 FILTER + SEARCH */
//   const filteredBookings = useMemo(() => {
//     return bookings.filter((b) => {
//       const search = searchText.toLowerCase();

//       const matchesSearch =
//         b.name?.toLowerCase().includes(search) ||
//         b.phone?.toLowerCase().includes(search) ||
//         b.brand?.toLowerCase().includes(search) ||
//         b.model?.toLowerCase().includes(search) ||
//         b.issue?.toLowerCase().includes(search);

//       if (!matchesSearch) return false;

//       if (filter === "notAssigned") return !b.assignedEmployeeId;
//       if (filter === "all") return true;

//       return true;
//     });
//   }, [bookings, filter, searchText]);

//   /* 🔥 FETCH EMPLOYEES */
//   const fetchAvailableEmployees = async () => {
//     setLoadingEmployees(true);

//     const snap = await getDocs(collection(db, "employees"));

//     const list = snap.docs
//       .map((d) => ({ id: d.id, ...d.data() }))
//       .filter((emp) => emp.status === "active" && emp.role === "mechanic");

//     setEmployees(list);
//     setLoadingEmployees(false);
//   };

//   /* 🔥 OPEN CARD MODAL */
//   const openAssignModal = async (booking) => {
//     setSelectedBooking(booking);
//     setSelectedEmployeeId(null);
//     await fetchAvailableEmployees();
//     setModalVisible(true);
//   };

//   /* 🔥 ASSIGN FUNCTION (USED BY BOTH MODALS) */
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
//         assignedEmployeeId: selectedEmployeeId,
//         assignedEmployeeAuthUid: employeeAuthUid,
//         assignedEmployeeName: selectedEmployee.name || "",
//         serviceStatus: "Approved",
//         assignedAt: serverTimestamp(),
//       });

//       /* 2️⃣ UPDATE EMPLOYEE */
//       await updateDoc(doc(db, "employees", selectedEmployeeId), {
//         assignedBookingIds: arrayUnion(bookingDocId),
//       });

//       /* 3️⃣ CREATE assignedServices */
//       await addDoc(collection(db, "assignedServices"), {
//         bookingDocId,
//         serviceId,
//         customerUid,
//         employeeDocId: selectedEmployeeId,
//         employeeAuthUid,
//         employeeName: selectedEmployee.name || "",
//         carBrand: selectedBooking.brand || "",
//         carModel: selectedBooking.model || "",
//         carIssue: selectedBooking.issue || "",
//         customerName: selectedBooking.name || "",
//         customerPhone: selectedBooking.phone || "",
//         customerEmail: selectedBooking.email || "",
//         serviceStatus: "Assigned",
//         assignedAt: serverTimestamp(),
//         startedAt: null,
//         completedAt: null,
//       });

//       Alert.alert("Success", "Booking assigned");

//       setModalVisible(false);
//       setGlobalModalVisible(false);
//       setSelectedBooking(null);
//       setSelectedEmployeeId(null);
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
//     const jobCount = item.assignedBookingIds?.length || 0;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.staffCard,
//           isSelected && { borderWidth: 2, borderColor: "#111" },
//         ]}
//         onPress={() => setSelectedEmployeeId(item.id)}
//       >
//         <Text style={styles.staffName}>{item.name}</Text>
//         <Text style={styles.staffSub}>Jobs: {jobCount}</Text>
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
//       {/* 🔍 SEARCH */}
//       <TextInput
//         placeholder="Search car, customer, phone..."
//         value={searchText}
//         onChangeText={setSearchText}
//         style={styles.searchInput}
//       />

//       {/* 🔘 FILTER */}
//       <View style={styles.filterRow}>
//         {[
//           { key: "notAssigned", label: "Not Assigned" },
//           { key: "all", label: "All" },
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

//       {/* 📋 LIST */}
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

//       {/* ➕ GLOBAL ASSIGN BUTTON */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={async () => {
//           setSelectedBooking(null);
//           setSelectedEmployeeId(null);
//           await fetchAvailableEmployees();
//           setGlobalModalVisible(true);
//         }}
//       >
//         <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
//           +
//         </Text>
//       </TouchableOpacity>

//       {/* 🔥 CARD MODAL (UNCHANGED) */}
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
//             <ActivityIndicator size="large" />
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
//             onPress={() => setModalVisible(false)}
//           >
//             <Text style={styles.btnText}>Close</Text>
//           </TouchableOpacity>
//         </SafeAreaView>
//       </Modal>

//       {/* 🔥 GLOBAL MODAL */}
//       <Modal visible={globalModalVisible} animationType="slide">
//   <SafeAreaView style={styles.modal}>
//     <Text style={styles.modalTitle}>Assign Service</Text>

//     {/* 🔽 SELECT SERVICE */}
//     <Text style={{ fontWeight: "700", marginBottom: 6 }}>
//       Select Service
//     </Text>

//     <View
//       style={{
//         borderWidth: 1,
//         borderColor: "#e5e7eb",
//         borderRadius: 12,
//         backgroundColor: "#fff",
//         marginBottom: 14,
//       }}
//     >
//       <Picker
//         selectedValue={selectedBooking?.id || ""}
//         onValueChange={(val) =>
//           setSelectedBooking(
//             unassignedBookings.find((b) => b.id === val)
//           )
//         }
//       >
//         <Picker.Item label="Select service" value="" />

//         {unassignedBookings.map((b) => (
//           <Picker.Item
//             key={b.id}
//             label={`${b.brand} - ${b.model} (${b.name})`}
//             value={b.id}
//           />
//         ))}
//       </Picker>
//     </View>

//     {/* 🔽 SELECT MECHANIC */}
//     <Text style={{ fontWeight: "700", marginBottom: 6 }}>
//       Select Mechanic
//     </Text>

//     {loadingEmployees ? (
//       <ActivityIndicator size="large" />
//     ) : (
//       <View
//         style={{
//           borderWidth: 1,
//           borderColor: "#e5e7eb",
//           borderRadius: 12,
//           backgroundColor: "#fff",
//           marginBottom: 14,
//         }}
//       >
//         <Picker
//           selectedValue={selectedEmployeeId}
//           onValueChange={setSelectedEmployeeId}
//         >
//           <Picker.Item label="Select mechanic" value="" />

//           {employees.map((emp) => (
//             <Picker.Item
//               key={emp.id}
//               label={`${emp.name} (Jobs: ${
//                 emp.assignedBookingIds?.length || 0
//               })`}
//               value={emp.id}
//             />
//           ))}
//         </Picker>
//       </View>
//     )}

//     {/* ✅ CONFIRM BUTTON */}
//     <TouchableOpacity
//       style={[
//         styles.assignConfirmBtn,
//         (!selectedEmployeeId || !selectedBooking) && {
//           backgroundColor: "#ccc",
//         },
//       ]}
//       disabled={!selectedEmployeeId || !selectedBooking || assigning}
//       onPress={assignEmployee}
//     >
//       <Text style={styles.btnText}>
//         {assigning ? "Assigning..." : "Confirm Assign"}
//       </Text>
//     </TouchableOpacity>

//     {/* ❌ CLOSE */}
//     <TouchableOpacity
//       style={styles.closeBtn}
//       onPress={() => setGlobalModalVisible(false)}
//     >
//       <Text style={styles.btnText}>Close</Text>
//     </TouchableOpacity>
//   </SafeAreaView>
// </Modal>
//     </SafeAreaView>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f4f6f8",
//     padding: 16,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   empty: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 15,
//     color: "#6b7280",
//     fontWeight: "500",
//   },

//   /* 🔍 SEARCH */
//   searchInput: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     fontSize: 14,
//   },

//   /* 🔘 FILTER */
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

//   /* 📋 BOOKING CARD */
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 14,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//   },

//   car: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#111827",
//   },

//   service: {
//     marginTop: 6,
//     fontSize: 14,
//     color: "#374151",
//   },

//   customer: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#6b7280",
//   },

//   statusBadge: {
//     marginTop: 8,
//     alignSelf: "flex-start",
//     backgroundColor: "#e5e7eb",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   statusText: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: "#111827",
//   },

//   assignBtn: {
//     marginTop: 12,
//     backgroundColor: "#111827",
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   btnText: {
//     color: "#fff",
//     fontWeight: "800",
//     fontSize: 14,
//   },

//   /* 👨‍🔧 STAFF CARD */
//   staffCard: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },

//   staffName: {
//     fontWeight: "800",
//     fontSize: 14,
//     color: "#111827",
//   },

//   staffSub: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 2,
//   },

//   /* 📦 SELECTED BOOKING BOX */
//   selectedBox: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },

//   selectedText: {
//     fontWeight: "800",
//     fontSize: 14,
//     color: "#111827",
//   },

//   selectedSub: {
//     color: "#6b7280",
//     marginTop: 4,
//     fontSize: 12,
//   },

//   /* 🪟 MODAL */
//   modal: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#f9fafb",
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "900",
//     textAlign: "center",
//     marginBottom: 16,
//     color: "#111827",
//   },

//   assignConfirmBtn: {
//     marginTop: 14,
//     backgroundColor: "#111827",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   closeBtn: {
//     marginTop: 10,
//     backgroundColor: "#ef4444",
//     paddingVertical: 13,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   /* ➕ FAB */
//   fab: {
//     position: "absolute",
//     bottom: 30,
//     right: 20,
//     backgroundColor: "#111827",
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
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
      .filter((emp) => emp.status === "active" && emp.role === "mechanic")
      .sort(
        (a, b) =>
          (a.assignedBookingIds?.length || 0) -
          (b.assignedBookingIds?.length || 0)
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
        (emp) => emp.id === selectedEmployeeId
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

  /* 🔥 BOOKING CARD */
  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.car}>
        {item.brand} - {item.model}
      </Text>

      <Text style={styles.service}>Issue: {item.issue}</Text>
      <Text style={styles.customer}>Customer: {item.name}</Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.serviceStatus}</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* 🔍 SEARCH */
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
  },

  /* 🔘 FILTER */
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeFilter: {
    backgroundColor: "#111827",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  /* 📋 BOOKING CARD */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  car: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  service: {
    marginTop: 6,
    fontSize: 14,
    color: "#374151",
  },

  customer: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },

  assignedText: {
    marginTop: 6,
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },

  assignBtn: {
    marginTop: 12,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },

  /* 🪟 MODAL */
  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },

  /* 📦 PICKER BOX */
  pickerBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 14,
  },

  assignConfirmBtn: {
    marginTop: 14,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
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