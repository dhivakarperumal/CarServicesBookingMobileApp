// import { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   TextInput,
// } from "react-native";
// import {
//   collection,
//   onSnapshot,
//   updateDoc,
//   doc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "../../firebase";
// import { Picker } from "@react-native-picker/picker";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";

// const BOOKING_STATUS = [
//   "Approved",
//   "Processing",
//   "Waiting for Spare",
//   "Service Going on",
//   "Bill Pending",
//   "Bill Completed",
//   "Service Completed",
// ];

// export default function Services() {
//   const router = useRouter();

//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [updatingId, setUpdatingId] = useState(null);

//   /* 🔥 Realtime Fetch */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "allServices"), (snap) => {
//       const data = snap.docs.map((d) => ({
//         id: d.id,
//         ...d.data(),
//       }));
//       setServices(data);
//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   /* 🔄 Status Update */
//   const handleStatusChange = async (service, newStatus) => {
//     try {
//       setUpdatingId(service.id);

//       await updateDoc(doc(db, "allServices", service.id), {
//         serviceStatus: newStatus,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   /* 🔍 Search */
//   const filteredServices = useMemo(() => {
//     return services.filter((s) => {
//       const text = `
//         ${s.bookingId || ""}
//         ${s.name || ""}
//         ${s.phone || ""}
//         ${s.brand || ""}
//         ${s.model || ""}
//       `.toLowerCase();

//       return text.includes(search.toLowerCase());
//     });
//   }, [services, search]);

//   /* 🎨 Status Color */
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Approved":
//         return "#6366f1";
//       case "Processing":
//         return "#9333ea";
//       case "Waiting for Spare":
//         return "#f59e0b";
//       case "Service Going on":
//         return "#f97316";
//       case "Bill Pending":
//         return "#ec4899";
//       case "Bill Completed":
//         return "#06b6d4";
//       case "Service Completed":
//         return "#16a34a";
//       default:
//         return "#6b7280";
//     }
//   };

//   if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
//       <View style={{ flex: 1, padding: 12 }}>
//         <TextInput
//           placeholder="Search booking, name, phone, car"
//           placeholderTextColor="#64748b"
//           value={search}
//           onChangeText={setSearch}
//           style={{
//             backgroundColor: "#0f172a",
//             borderWidth: 1,
//             borderColor: "#0b3b6f",
//             padding: 16,
//             borderRadius: 12,
//             marginBottom: 12,
//             color: "#fff",
//           }}
//         />

//         <FlatList
//           data={filteredServices}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: 140 }}
//           renderItem={({ item }) => (
//             <View
//               style={{
//                 backgroundColor: "#0f172a",
//                 padding: 16,
//                 borderRadius: 16,
//                 marginBottom: 12,
//                 borderWidth: 1,
//                 borderColor: "#0b3b6f",
//                 position: "relative",
//               }}
//             >
//               <Text style={{ fontWeight: "700", color: "#38bdf8" }}>
//                 {item.bookingId || "No Booking"}
//               </Text>

//               <Text style={{ color: "#fff", marginTop: 18 }}>{item.name}</Text>
//               <Text style={{ color: "#94a3b8" }}>{item.phone}</Text>
//               <Text style={{ color: "#94a3b8" }}>
//                 {item.brand} {item.model}
//               </Text>

//               {/* 🔹 STATUS TOP RIGHT */}
//               <View
//                 style={{
//                   position: "absolute",
//                   top: 10,
//                   right: 10,
//                   backgroundColor: getStatusColor(item.serviceStatus),
//                   paddingHorizontal: 10,
//                   paddingVertical: 4,
//                   borderRadius: 12,
//                 }}
//               >
//                 <Text
//                   style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
//                 >
//                   {item.serviceStatus}
//                 </Text>
//               </View>

//               {/* STATUS DROPDOWN */}
//               {updatingId === item.id ? (
//                 <ActivityIndicator style={{ marginTop: 10 }} />
//               ) : (
//                 <View
//                   style={{
//                     backgroundColor: "#020617",
//                     borderWidth: 1,
//                     borderColor: "#0b3b6f",
//                     borderRadius: 12,
//                     marginTop: 10,
//                     overflow: "hidden",
//                   }}
//                 >
//                   <Picker
//                     selectedValue={item.serviceStatus}
//                     onValueChange={(value) => handleStatusChange(item, value)}
//                     dropdownIconColor="#38bdf8"
//                     style={{ color: "#fff" }}
//                     itemStyle={{ color: "#fff" }}
//                   >
//                     {BOOKING_STATUS.map((status) => (
//                       <Picker.Item key={status} label={status} value={status} />
//                     ))}
//                   </Picker>
//                 </View>
//               )}

//               {/* ACTION ROW */}
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   marginTop: 12,
//                   alignItems: "center",
//                 }}
//               >
//                 {/* LEFT → GENERATE BILL */}
//                 {item.serviceStatus === "Bill Pending" && (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(serviceslist)/ServiceBillingScreen",
//                         params: { id: item.id },
//                       })
//                     }
//                     style={{
//                       marginTop: 10,
//                       backgroundColor: "#2563eb",
//                       paddingVertical: 10,
//                       paddingHorizontal: 16,
//                       borderRadius: 12,
//                       shadowColor: "#38bdf8",
//                       shadowOpacity: 0.4,
//                       shadowRadius: 8,
//                     }}
//                   >
//                     <Text style={{ color: "#fff", textAlign: "center" }}>
//                       Generate Bill
//                     </Text>
//                   </TouchableOpacity>
//                 )}

//                 {/* RIGHT → ADD PARTS */}
//                 {item.serviceStatus === "Service Going on" && (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(serviceslist)/addserviceparts",
//                         params: { serviceId: item.id },
//                       })
//                     }
//                     style={{
//                       backgroundColor: "#020617",
//                       paddingVertical: 8,
//                       paddingHorizontal: 14,
//                       borderRadius: 12,
//                       borderWidth: 1,
//                       borderColor: "#38bdf8",
//                     }}
//                   >
//                     <Text style={{ color: "#fff" }}>+ Add Parts</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           )}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }


// import { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   TextInput,
//   Modal,
//   Pressable,
//   Alert,
// } from "react-native";
// import {
//   collection,
//   onSnapshot,
//   updateDoc,
//   doc,
//   serverTimestamp,
//   addDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase";
// import { Picker } from "@react-native-picker/picker";
// import { useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";

// const BOOKING_STATUS = [
//   "Approved",
//   "Processing",
//   "Waiting for Spare",
//   "Service Going on",
//   "Bill Pending",
//   "Bill Completed",
//   "Service Completed",
// ];

// export default function Services() {
//   const router = useRouter();

//   const [services, setServices] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("Approved");
//   const [updatingId, setUpdatingId] = useState(null);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
//   const [assigning, setAssigning] = useState(false);

//   /* 🔥 SERVICES */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "allServices"), (snap) => {
//       const data = snap.docs.map((d) => ({
//         id: d.id,
//         ...d.data(),
//       }));
//       setServices(data);
//       setLoading(false);
//     });
//     return () => unsub();
//   }, []);

//   /* 🔥 EMPLOYEES */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "employees"), (snap) => {
//       const data = snap.docs.map((d) => ({
//         id: d.id,
//         ...d.data(),
//       }));
//       setEmployees(data);
//     });
//     return () => unsub();
//   }, []);

//   /* 🔍 FILTER + SEARCH */
//   const filteredServices = useMemo(() => {
//     return services
//       .filter((s) => {
//         if (statusFilter === "All") return true;
//         return s.serviceStatus === statusFilter;
//       })
//       .filter((s) => {
//         const text = `
//           ${s.bookingId || ""}
//           ${s.name || ""}
//           ${s.phone || ""}
//           ${s.brand || ""}
//           ${s.model || ""}
//         `.toLowerCase();

//         return text.includes(search.toLowerCase());
//       });
//   }, [services, search, statusFilter]);

//   /* 🚫 ONLY UNASSIGNED */
//   const unassignedServices = useMemo(() => {
//     return services.filter((s) => !s.assignedEmployeeId);
//   }, [services]);

//   /* 👨‍🔧 AVAILABLE MECHANICS */
//   const availableEmployees = useMemo(() => {
//     return employees.filter((e) => e.workStatus !== "busy");
//   }, [employees]);

//   /* 🎨 STATUS COLOR */
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Approved":
//         return "#6366f1";
//       case "Processing":
//         return "#9333ea";
//       case "Waiting for Spare":
//         return "#f59e0b";
//       case "Service Going on":
//         return "#f97316";
//       case "Bill Pending":
//         return "#ec4899";
//       case "Bill Completed":
//         return "#06b6d4";
//       case "Service Completed":
//         return "#16a34a";
//       default:
//         return "#6b7280";
//     }
//   };

//   /* 🔄 STATUS UPDATE */
//   const handleStatusChange = async (service, newStatus) => {
//     try {
//       setUpdatingId(service.id);

//       await updateDoc(doc(db, "allServices", service.id), {
//         serviceStatus: newStatus,
//         updatedAt: serverTimestamp(),
//       });

//       /* 🔓 FREE MECHANIC WHEN COMPLETED */
//       if (newStatus === "Service Completed" && service.assignedEmployeeId) {
//         await updateDoc(doc(db, "employees", service.assignedEmployeeId), {
//           workStatus: "available",
//           currentServiceId: null,
//         });
//       }
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   /* 🧑‍🔧 ASSIGN */
//   const assignEmployee = async () => {
//     if (!selectedBooking || !selectedEmployeeId || assigning) return;

//     try {
//       setAssigning(true);

//       const serviceDocId = selectedBooking.id;

//       const selectedEmployee = availableEmployees.find(
//         (emp) => emp.id === selectedEmployeeId
//       );

//       if (!selectedEmployee) {
//         Alert.alert("Error", "Employee not available");
//         return;
//       }

//       await updateDoc(doc(db, "allServices", serviceDocId), {
//         assignedEmployeeId: selectedEmployeeId,
//         assignedEmployeeName: selectedEmployee.name || "",
//         serviceStatus: "Approved",
//         assignedAt: new Date(),
//       });

//       await updateDoc(doc(db, "employees", selectedEmployeeId), {
//         currentServiceId: serviceDocId,
//         workStatus: "busy",
//       });

//       await addDoc(collection(db, "assignedServices"), {
//         serviceDocId,
//         employeeDocId: selectedEmployeeId,
//         employeeName: selectedEmployee.name || "",
//         customerName: selectedBooking.name || "",
//         serviceStatus: "Assigned",
//         assignedAt: new Date(),
//       });

//       Alert.alert("Success", "Mechanic assigned");

//       setModalVisible(false);
//       setSelectedBooking(null);
//       setSelectedEmployeeId(null);
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Assignment failed");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
//       <View style={{ flex: 1, padding: 12 }}>
//         {/* 🔍 SEARCH */}
//         <TextInput
//           placeholder="Search booking, name, phone, car"
//           placeholderTextColor="#64748b"
//           value={search}
//           onChangeText={setSearch}
//           style={{
//             backgroundColor: "#0f172a",
//             borderWidth: 1,
//             borderColor: "#0b3b6f",
//             padding: 16,
//             borderRadius: 12,
//             marginBottom: 10,
//             color: "#fff",
//           }}
//         />

//         {/* 🧾 FILTER CHIPS */}
//         <View style={{ height: 50, marginBottom: 10 }}>
//           <FlatList
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             data={["All", ...BOOKING_STATUS]}
//             keyExtractor={(item) => item}
//             contentContainerStyle={{
//               alignItems: "center",
//               paddingRight: 10,
//             }}
//             style={{ flexGrow: 0 }}   // ✅ VERY IMPORTANT
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 onPress={() => setStatusFilter(item)}
//                 style={{
//                   paddingHorizontal: 14,
//                   paddingVertical: 8,
//                   borderRadius: 20,
//                   marginRight: 8,
//                   borderWidth: 1,
//                   borderColor:
//                     statusFilter === item ? "#38bdf8" : "#0b3b6f",
//                   backgroundColor:
//                     statusFilter === item ? "#38bdf8" : "#020617",
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: statusFilter === item ? "#020617" : "#fff",
//                     fontWeight: "600",
//                   }}
//                 >
//                   {item}
//                 </Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* 📋 LIST */}
//         <FlatList
//           data={filteredServices}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: 140 }}
//           renderItem={({ item }) => (
//             <View
//               style={{
//                 backgroundColor: "#0f172a",
//                 padding: 16,
//                 borderRadius: 16,
//                 marginBottom: 12,
//                 borderWidth: 1,
//                 borderColor: "#0b3b6f",
//                 position: "relative",
//               }}
//             >
//               <Text style={{ fontWeight: "700", color: "#38bdf8" }}>
//                 {item.bookingId || "No Booking"}
//               </Text>

//               <Text style={{ color: "#fff", marginTop: 18 }}>{item.name}</Text>
//               <Text style={{ color: "#94a3b8" }}>{item.phone}</Text>
//               <Text style={{ color: "#94a3b8" }}>
//                 {item.brand} {item.model}
//               </Text>

//               {/* STATUS BADGE */}
//               <View
//                 style={{
//                   position: "absolute",
//                   top: 10,
//                   right: 10,
//                   backgroundColor: getStatusColor(item.serviceStatus),
//                   paddingHorizontal: 10,
//                   paddingVertical: 4,
//                   borderRadius: 12,
//                 }}
//               >
//                 <Text style={{ color: "#fff", fontSize: 11 }}>
//                   {item.serviceStatus}
//                 </Text>
//               </View>

//               {/* DROPDOWN */}
//               {updatingId === item.id ? (
//                 <ActivityIndicator style={{ marginTop: 10 }} />
//               ) : (
//                 <Picker
//                   selectedValue={item.serviceStatus}
//                   onValueChange={(value) =>
//                     handleStatusChange(item, value)
//                   }
//                   style={{ color: "#fff" }}
//                 >
//                   {BOOKING_STATUS.map((status) => (
//                     <Picker.Item key={status} label={status} value={status} />
//                   ))}
//                 </Picker>
//               )}

//               {/* ASSIGNED NAME */}
//               {item.assignedEmployeeName && (
//                 <Text style={{ color: "#22c55e", marginTop: 4 }}>
//                    👨‍🔧 {item.assignedEmployeeName}
//                 </Text>
//               )}

//               {/* ACTION ROW */}
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   marginTop: 12,
//                 }}
//               >
//                 {item.serviceStatus === "Bill Pending" && (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname:
//                           "/(serviceslist)/ServiceBillingScreen",
//                         params: { id: item.id },
//                       })
//                     }
//                     style={{
//                       backgroundColor: "#2563eb",
//                       paddingVertical: 10,
//                       paddingHorizontal: 16,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "#fff" }}>Generate Bill</Text>
//                   </TouchableOpacity>
//                 )}

//                 {item.serviceStatus === "Service Going on" && (
//                   <TouchableOpacity
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(serviceslist)/addserviceparts",
//                         params: { serviceId: item.id },
//                       })
//                     }
//                     style={{
//                       backgroundColor: "#020617",
//                       paddingVertical: 8,
//                       paddingHorizontal: 14,
//                       borderRadius: 12,
//                       borderWidth: 1,
//                       borderColor: "#38bdf8",
//                     }}
//                   >
//                     <Text style={{ color: "#fff" }}>+ Add Parts</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           )}
//         />

//         {/* ➕ FAB */}
//         <TouchableOpacity
//           onPress={() => setModalVisible(true)}
//           style={{
//             position: "absolute",
//             bottom: 30,
//             right: 20,
//             backgroundColor: "#38bdf8",
//             width: 60,
//             height: 60,
//             borderRadius: 30,
//             justifyContent: "center",
//             alignItems: "center",
//             marginBottom: 60,
//           }}
//         >
//           <Text style={{ color: "#020617", fontSize: 30 }}>+</Text>
//         </TouchableOpacity>

//         {/* 🪟 ASSIGN MODAL */}
//         <Modal visible={modalVisible} animationType="fade" transparent>
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: "rgba(0,0,0,0.75)",
//               justifyContent: "center",
//               padding: 20,
//             }}
//           >
//             <View
//               style={{
//                 backgroundColor: "#020617",
//                 borderRadius: 18,
//                 padding: 18,
//                 borderWidth: 1,
//                 borderColor: "#0b3b6f",
//                 shadowColor: "#38bdf8",
//                 shadowOpacity: 0.3,
//                 shadowRadius: 10,
//                 elevation: 10,
//               }}
//             >
//               {/* TITLE */}
//               <Text
//                 style={{
//                   color: "#38bdf8",
//                   fontSize: 18,
//                   fontWeight: "700",
//                   marginBottom: 14,
//                   textAlign: "center",
//                 }}
//               >
//                 Assign Mechanic
//               </Text>

//               {/* SERVICE PICKER LABEL */}
//               <Text style={{ color: "#94a3b8", marginBottom: 6 }}>
//                 Select Service
//               </Text>

//               <View
//                 style={{
//                   borderWidth: 1,
//                   borderColor: "#0b3b6f",
//                   borderRadius: 12,
//                   backgroundColor: "#020617",
//                   marginBottom: 14,
//                   overflow: "hidden",
//                 }}
//               >
//                 <Picker
//                   selectedValue={selectedBooking?.id || ""}
//                   onValueChange={(val) =>
//                     setSelectedBooking(
//                       unassignedServices.find((s) => s.id === val)
//                     )
//                   }
//                   dropdownIconColor="#38bdf8"
//                   style={{ color: "#fff" }}
//                 >
//                   <Picker.Item label="Select service" value="" />
//                   {unassignedServices.map((s) => (
//                     <Picker.Item
//                       key={s.id}
//                       label={`${s.bookingId} - ${s.name}`}
//                       value={s.id}
//                     />
//                   ))}
//                 </Picker>
//               </View>

//               {/* EMPLOYEE PICKER LABEL */}
//               <Text style={{ color: "#94a3b8", marginBottom: 6 }}>
//                 Select Mechanic
//               </Text>

//               <View
//                 style={{
//                   borderWidth: 1,
//                   borderColor: "#0b3b6f",
//                   borderRadius: 12,
//                   backgroundColor: "#020617",
//                   marginBottom: 18,
//                   overflow: "hidden",
//                 }}
//               >
//                 <Picker
//                   selectedValue={selectedEmployeeId}
//                   onValueChange={setSelectedEmployeeId}
//                   dropdownIconColor="#38bdf8"
//                   style={{ color: "#fff" }}
//                 >
//                   <Picker.Item label="Select mechanic" value="" />
//                   {availableEmployees.map((emp) => (
//                     <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
//                   ))}
//                 </Picker>
//               </View>

//               {/* BUTTON ROW */}
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   gap: 10,
//                 }}
//               >
//                 <Pressable
//                   onPress={() => setModalVisible(false)}
//                   style={{
//                     flex: 1,
//                     paddingVertical: 12,
//                     borderRadius: 12,
//                     borderWidth: 1,
//                     borderColor: "#38bdf8",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ color: "#fff", fontWeight: "600" }}>
//                     Cancel
//                   </Text>
//                 </Pressable>

//                 <Pressable
//                   onPress={assignEmployee}
//                   style={{
//                     flex: 1,
//                     paddingVertical: 12,
//                     borderRadius: 12,
//                     backgroundColor: "#38bdf8",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: "#020617",
//                       fontWeight: "700",
//                     }}
//                   >
//                     Assign
//                   </Text>
//                 </Pressable>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// }

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
        (emp) => emp.id === selectedEmployeeId
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

       {/* 📋 LIST */}
<FlatList
  data={filteredServices}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ paddingBottom: 140 }}
  ListEmptyComponent={
    <Text
      style={{
        color: "#94a3b8",
        textAlign: "center",
        marginTop: 40,
      }}
    >
      No services found
    </Text>
  }
  renderItem={({ item }) => (
    <View
      style={{
        backgroundColor: "#0f172a",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: item.assignedEmployeeId ? "#0b3b6f" : "#f59e0b",
        position: "relative",
      }}
    >
      {/* BS ID */}
      <Text style={{ color: "#38bdf8", fontWeight: "700", fontSize: 15 }}>
        {item.bookingId}
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
                      unassignedServices.find((s) => s.id === val)
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