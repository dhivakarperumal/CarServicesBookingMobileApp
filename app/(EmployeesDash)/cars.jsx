// import { useEffect, useState, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   TextInput,
//   Modal,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   collection,
//   onSnapshot,
//   doc,
//   updateDoc,
//   addDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase";
// import { KeyboardAvoidingView, Platform } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// export default function CarsScreen() {
//   const [cars, setCars] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");

//   const [partsModal, setPartsModal] = useState(false);
//   const [selectedCar, setSelectedCar] = useState(null);

//   const [parts, setParts] = useState([{ partName: "", qty: 1, price: 0 }]);
//   const [savingParts, setSavingParts] = useState(false);

//   /* 🔥 FETCH SERVICES */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "assignedServices"), (snap) => {
//       const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setCars(list);
//       setLoading(false);
//     });

//     return unsub;
//   }, []);

//   /* 🔎 SEARCH + FILTER */
//   const filteredCars = useMemo(() => {
//     return cars
//       .filter((item) => {
//         if (filter === "all") return true;
//         return item.serviceStatus === filter;
//       })
//       .filter((item) => {
//         const text = search.toLowerCase();

//         return (
//           item.serviceId?.toLowerCase().includes(text) ||
//           item.carBrand?.toLowerCase().includes(text) ||
//           item.carModel?.toLowerCase().includes(text) ||
//           item.employeeName?.toLowerCase().includes(text)
//         );
//       });
//   }, [cars, search, filter]);

//   /* 🔥 TOTAL PARTS COST */
//   const totalPartsCost = useMemo(
//     () =>
//       parts.reduce(
//         (sum, p) => sum + Number(p.qty || 0) * Number(p.price || 0),
//         0,
//       ),
//     [parts],
//   );

//   /* 🔥 START SERVICE */
//   const startService = async (item) => {
//     await updateDoc(doc(db, "assignedServices", item.id), {
//       serviceStatus: "In Progress",
//       startedAt: new Date(),
//     });
//   };

//   /* 🔥 OPEN PARTS MODAL */
//   const openPartsModal = (item) => {
//     setSelectedCar(item);
//     setParts([{ partName: "", qty: 1, price: 0 }]);
//     setPartsModal(true);
//   };

//   const addPartRow = () =>
//     setParts([...parts, { partName: "", qty: 1, price: 0 }]);

//   const removePartRow = (i) => setParts(parts.filter((_, idx) => idx !== i));

//   const handlePartChange = (i, field, value) => {
//     const copy = [...parts];
//     copy[i][field] = value;
//     setParts(copy);
//   };

//   /* 🔥 SAVE PARTS */
//   const saveParts = async () => {
//     if (!selectedCar) return;

//     const validParts = parts.filter((p) => p.partName);

//     if (validParts.length === 0) {
//       Alert.alert("Add at least one part");
//       return;
//     }

//     try {
//       setSavingParts(true);

//       const partsRef = collection(
//         db,
//         "assignedServices",
//         selectedCar.id,
//         "parts",
//       );

//       for (let p of validParts) {
//         await addDoc(partsRef, {
//           serviceId: selectedCar.serviceId || selectedCar.bookingDocId || "",
//           partName: p.partName,
//           qty: Number(p.qty),
//           price: Number(p.price),
//           total: Number(p.qty) * Number(p.price),
//           createdAt: new Date(),
//         });
//       }

//       await updateDoc(doc(db, "assignedServices", selectedCar.id), {
//         partsAdded: true,
//         partsTotalCost:
//           Number(selectedCar.partsTotalCost || 0) + totalPartsCost,
//         serviceStatus: "Parts Added",
//       });

//       setPartsModal(false);
//       setSelectedCar(null);
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Failed to save parts");
//     } finally {
//       setSavingParts(false);
//     }
//   };

//   /* 🔥 COMPLETE SERVICE */
//   const completeService = async (item) => {
//     if (!item.partsAdded) {
//       Alert.alert("Add Parts", "Please add parts before completing");
//       return;
//     }

//     await updateDoc(doc(db, "assignedServices", item.id), {
//       serviceStatus: "Completed",
//       completedAt: new Date(),
//     });
//   };

//   /* 🎨 STATUS COLOR */
//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "Completed":
//         return { bg: "#d1fae5", text: "#065f46" };
//       case "In Progress":
//         return { bg: "#e0f2fe", text: "#075985" };
//       case "Parts Added":
//         return { bg: "#ede9fe", text: "#5b21b6" };
//       default:
//         return { bg: "#fef3c7", text: "#92400e" };
//     }
//   };

//   /* 🔥 CARD UI */
//   const renderItem = ({ item }) => {
//     const statusStyle = getStatusStyle(item.serviceStatus);

//     return (
//       <View style={styles.card}>
//         <Text style={styles.number}>Service ID: {item.serviceId || "N/A"}</Text>

//         <Text style={styles.model}>
//           {item.carBrand} - {item.carModel}
//         </Text>

//         <Text style={styles.subText}>Mechanic: {item.employeeName || "-"}</Text>

//         {item.partsTotalCost ? (
//           <Text style={styles.parts}>Parts Cost: ₹{item.partsTotalCost}</Text>
//         ) : null}

//         <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
//           <Text style={[styles.statusText, { color: statusStyle.text }]}>
//             {item.serviceStatus || "Assigned"}
//           </Text>
//         </View>

//         {item.serviceStatus === "Assigned" && (
//           <TouchableOpacity
//             style={styles.updateBtn}
//             onPress={() => startService(item)}
//           >
//             <Text style={styles.updateText}>Start Service</Text>
//           </TouchableOpacity>
//         )}

//         {item.serviceStatus === "In Progress" && !item.partsAdded && (
//           <TouchableOpacity
//             style={styles.partsBtn}
//             onPress={() => openPartsModal(item)}
//           >
//             <Text style={styles.updateText}>Add Parts</Text>
//           </TouchableOpacity>
//         )}

//         {item.partsAdded && item.serviceStatus !== "Completed" && (
//           <TouchableOpacity
//             style={styles.completeBtn}
//             onPress={() => completeService(item)}
//           >
//             <Text style={styles.updateText}>Mark Completed</Text>
//           </TouchableOpacity>
//         )}
//       </View>
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
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//     >
//       <SafeAreaView style={styles.container}>
//         {/* 🔎 SEARCH */}
//         <TextInput
//           placeholder="Search service, car, mechanic..."
//           placeholderTextColor="#94a3b8"
//           value={search}
//           onChangeText={setSearch}
//           style={styles.search}
//         />

//         {/* 🎛 FILTER TABS */}
//         <View style={styles.filterRow}>
//           {["all", "Assigned", "In Progress", "Parts Added", "Completed"].map(
//             (f) => (
//               <TouchableOpacity
//                 key={f}
//                 style={[styles.filterBtn, filter === f && styles.activeFilter]}
//                 onPress={() => setFilter(f)}
//               >
//                 <Text
//                   style={[styles.filterText, filter === f && { color: "#fff" }]}
//                 >
//                   {f}
//                 </Text>
//               </TouchableOpacity>
//             ),
//           )}
//         </View>

//         {filteredCars.length === 0 ? (
//           <Text style={styles.empty}>No Cars Found</Text>
//         ) : (
//           <FlatList
//             data={filteredCars}
//             keyExtractor={(i) => i.id}
//             renderItem={renderItem}
//             contentContainerStyle={{ paddingBottom: 140 }}
//           />
//         )}

//         {/* 🔥 PARTS MODAL */}
//         <Modal
//           visible={partsModal}
//           animationType="slide"
//           onRequestClose={() => setPartsModal(false)}
//         >
//           <SafeAreaView style={styles.modal}>
//             <TouchableOpacity
//               onPress={() => setPartsModal(false)}
//               style={styles.closeIcon}
//             >
//               <Ionicons name="close" size={26} color="#fff" />
//             </TouchableOpacity>
//             <Text style={styles.modalTitle}>Add Parts</Text>

//             <ScrollView>
//               {parts.map((item, index) => (
//                 <View key={index} style={styles.partCard}>
//                   <TextInput
//                     placeholder="Part name"
//                     placeholderTextColor="#64748b"
//                     value={item.partName}
//                     onChangeText={(v) => handlePartChange(index, "partName", v)}
//                     style={styles.input}
//                   />

//                   <View style={{ flexDirection: "row", gap: 8 }}>
//                     <TextInput
//                       placeholder="Qty"
//                       placeholderTextColor="#64748b"
//                       keyboardType="numeric"
//                       value={String(item.qty)}
//                       onChangeText={(v) => handlePartChange(index, "qty", v)}
//                       style={[styles.input, { flex: 1 }]}
//                     />

//                     <TextInput
//                       placeholder="Price"
//                       placeholderTextColor="#64748b"
//                       keyboardType="numeric"
//                       value={String(item.price)}
//                       onChangeText={(v) => handlePartChange(index, "price", v)}
//                       style={[styles.input, { flex: 1 }]}
//                     />
//                   </View>

//                   <Text style={styles.total}>
//                     Total: ₹{Number(item.qty) * Number(item.price)}
//                   </Text>

//                   {parts.length > 1 && (
//                     <TouchableOpacity onPress={() => removePartRow(index)}>
//                       <Text style={styles.remove}>Remove</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               ))}

//               <TouchableOpacity style={styles.addRow} onPress={addPartRow}>
//                 <Text style={styles.updateText}>+ Add Part</Text>
//               </TouchableOpacity>
//             </ScrollView>

//             <Text style={styles.grandTotal}>
//               Parts Total: ₹{totalPartsCost}
//             </Text>

//             <TouchableOpacity style={styles.saveBtn} onPress={saveParts}>
//               {savingParts ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.updateText}>Save Parts</Text>
//               )}
//             </TouchableOpacity>
//           </SafeAreaView>
//         </Modal>
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 14,
//     backgroundColor: "#020617",
//   },

//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },

//   /* 🔥 HEADER */
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   back: { fontSize: 22, fontWeight: "bold", color: "#111" },
//   headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

//   serviceId: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#2563eb",
//   },

//   search: {
//     backgroundColor: "#0f172a",
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#0b3b6f",
//     color: "#fff",
//   },

//   filterRow: {
//     flexDirection: "row",
//     backgroundColor: "#0f172a",
//     borderRadius: 16,
//     padding: 6,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#0b3b6f",
//   },

//   filterBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//   },

//   activeFilter: {
//     backgroundColor: "#2563eb",
//     shadowColor: "#38bdf8",
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//   },

//   filterText: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#64748b",
//   },

//   partCard: {
//     backgroundColor: "#0f172a",
//     padding: 18, // was 14
//     borderRadius: 18,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "rgba(56,189,248,0.15)",
//   },

//   total: {
//     marginTop: 10,
//     fontWeight: "800",
//     fontSize: 16, // NEW
//     color: "#10b981",
//   },
//   remove: {
//     marginTop: 8,
//     color: "#f87171",
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   addRow: {
//     backgroundColor: "#38bdf8",
//     padding: 16, // was 14
//     borderRadius: 16,
//     alignItems: "center",
//     marginBottom: 18,
//   },

//   grandTotal: {
//     fontSize: 20, // was 18
//     fontWeight: "900",
//     color: "#38bdf8",
//     marginBottom: 18,
//   },

//   empty: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 15,
//     color: "#6b7280",
//     fontWeight: "500",
//   },

//   partsBtn: {
//     marginTop: 14,
//     backgroundColor: "#38bdf8",
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   completeBtn: {
//     marginTop: 14,
//     backgroundColor: "#10b981",
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   modal: {
//     flex: 1,
//     padding: 22, // was 16
//     backgroundColor: "#020617",
//   },

//   modalTitle: {
//     fontSize: 24, // was 20
//     fontWeight: "900",
//     marginBottom: 20,
//     color: "#e5e7eb",
//   },
//   input: {
//     backgroundColor: "#020617",
//     padding: 14, // was 10
//     borderRadius: 12,
//     marginBottom: 14,
//     color: "#fff",
//     fontSize: 16, // NEW
//     borderWidth: 1,
//     borderColor: "rgba(56,189,248,0.2)",
//   },

//   saveBtn: {
//     backgroundColor: "#10b981",
//     paddingVertical: 16, // was 14
//     borderRadius: 16,
//     alignItems: "center",
//     marginBottom: 14,
//   },

//   /* 🔥 CARD */
//   card: {
//     backgroundColor: "#0f172a",
//     padding: 22,
//     borderRadius: 20,
//     marginBottom: 18,
//     minHeight: 180,
//     borderWidth: 1,
//     borderColor: "#0b3b6f",

//     shadowColor: "#38bdf8",
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//   },

//   number: {
//     fontWeight: "800",
//     fontSize: 18, // was 16
//     color: "#38bdf8",
//   },

//   model: {
//     marginTop: 6,
//     fontSize: 16, // was 14
//     color: "#fff",
//     fontWeight: "700",
//   },

//   subText: {
//     marginTop: 6,
//     fontSize: 14, // was 12
//     color: "#94a3b8",
//   },

//   parts: {
//     marginTop: 8,
//     fontSize: 14, // was 12
//     color: "#10b981",
//     fontWeight: "700",
//   },

//   statusBadge: {
//     position: "absolute",
//     top: 12,
//     right: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 20,
//     shadowOpacity: 0.4,
//   },

//   statusText: {
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   updateBtn: {
//     marginTop: 14,
//     backgroundColor: "#2563eb",
//     paddingVertical: 14, // was 12
//     borderRadius: 14,
//     alignItems: "center",

//     shadowColor: "#38bdf8",
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//   },
//   updateText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 13,
//   },
//   closeIcon: {
//     position: "absolute",
//     right: 20,
//     top: 20,
//     zIndex: 50,
//   },
// });

import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

/* 🔁 STATUS FLOW */
const STATUS_FLOW = [
  "Processing",
  "Service Going on",
  "Bill Pending",
  "Bill Completed",
  "Service Completed",
];

export default function CarsScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState("booked"); // booked | addVehicle

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [partsModal, setPartsModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const [parts, setParts] = useState([{ partName: "", qty: 1, price: 0 }]);
  const [savingParts, setSavingParts] = useState(false);

  /* 🔥 FETCH ONLY CURRENT MECHANIC SERVICES */
  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const q = query(
      collection(db, "assignedServices"),
      where("employeeAuthUid", "==", currentUid),
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCars(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  /* 🔹 SPLIT BY TAB */
  const bookedCars = cars.filter((c) => !c.addVehicle);
  const addVehicleCars = cars.filter((c) => c.addVehicle === true);

  const currentMainList = mainTab === "booked" ? bookedCars : addVehicleCars;

  /* 🔎 SEARCH + FILTER */
  const filteredCars = useMemo(() => {
    return currentMainList
      .filter((item) => {
        if (filter === "all") return true;
        return item.serviceStatus === filter;
      })
      .filter((item) => {
        const text = search.toLowerCase();
        return (
          item.serviceId?.toLowerCase().includes(text) ||
          item.carBrand?.toLowerCase().includes(text) ||
          item.carModel?.toLowerCase().includes(text) ||
          item.employeeName?.toLowerCase().includes(text)
        );
      });
  }, [currentMainList, search, filter]);

  /* 🔥 TOTAL PARTS COST */
  const totalPartsCost = useMemo(
    () =>
      parts.reduce(
        (sum, p) => sum + Number(p.qty || 0) * Number(p.price || 0),
        0,
      ),
    [parts],
  );

  /* 🔁 NEXT STATUS ONLY */
  const getNextStatuses = (currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus || "Processing");
    if (currentIndex === -1) return [STATUS_FLOW[0]];
    return STATUS_FLOW.slice(currentIndex, currentIndex + 2);
  };

  /* 🔁 STATUS UPDATE */
  const updateStatus = async (item, newStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(
      item.serviceStatus || "Processing",
    );
    const newIndex = STATUS_FLOW.indexOf(newStatus);

    if (newIndex < currentIndex) {
      Alert.alert("Invalid", "Cannot move status backward");
      return;
    }

    if (
      newStatus === "Bill Pending" &&
      item.serviceStatus === "Service Going on" &&
      !item.partsAdded
    ) {
      Alert.alert("Add Parts First");
      return;
    }

    try {
      const updateData = { serviceStatus: newStatus };

      if (newStatus === "Service Going on") {
        updateData.startedAt = new Date();
      }

      if (newStatus === "Bill Completed") {
        updateData.billCompletedAt = new Date();
      }

      if (newStatus === "Service Completed") {
        updateData.completedAt = new Date();
      }

      /* 🔥 1️⃣ UPDATE assignedServices */
      await updateDoc(doc(db, "assignedServices", item.id), updateData);

      /* 🔥 2️⃣ UPDATE allServices (IMPORTANT) */
      if (item.bookingDocId) {
        await updateDoc(doc(db, "allServices", item.bookingDocId), updateData);
      }

      /* 🔥 3️⃣ FREE EMPLOYEE WHEN SERVICE COMPLETED */
      if (newStatus === "Service Completed" && item.employeeDocId) {
        await updateDoc(doc(db, "employees", item.employeeDocId), {
          assigned: false,
          workStatus: "idle",
          currentServiceId: null,
          currentServiceCode: null,
        });
      }
    } catch (error) {
      console.log("Status update error:", error);
      Alert.alert("Failed to update status");
    }
  };

  /* 🔧 PARTS MODAL */
  const openPartsModal = (item) => {
    setSelectedCar(item);
    setParts([{ partName: "", qty: 1, price: 0 }]);
    setPartsModal(true);
  };

  const addPartRow = () =>
    setParts([...parts, { partName: "", qty: 1, price: 0 }]);

  const removePartRow = (i) => setParts(parts.filter((_, idx) => idx !== i));

  const handlePartChange = (i, field, value) => {
    const copy = [...parts];
    copy[i][field] = value;
    setParts(copy);
  };

  /* 💾 SAVE PARTS */
  const saveParts = async () => {
    if (!selectedCar) return;

    const validParts = parts.filter((p) => p.partName);

    if (validParts.length === 0) {
      Alert.alert("Add at least one part");
      return;
    }

    try {
      setSavingParts(true);

      const partsRef = collection(
        db,
        "assignedServices",
        selectedCar.id,
        "parts",
      );

      for (let p of validParts) {
        await addDoc(partsRef, {
          serviceId: selectedCar.serviceId || "",
          partName: p.partName,
          qty: Number(p.qty),
          price: Number(p.price),
          total: Number(p.qty) * Number(p.price),
          createdAt: new Date(),
        });
      }

      await updateDoc(doc(db, "assignedServices", selectedCar.id), {
        partsAdded: true,
        partsTotalCost:
          Number(selectedCar.partsTotalCost || 0) + totalPartsCost,
        serviceStatus: "Bill Pending",
      });

      setPartsModal(false);
      setSelectedCar(null);
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to save parts");
    } finally {
      setSavingParts(false);
    }
  };

  /* 🎨 STATUS COLOR */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Processing":
        return { bg: "#e0f2fe", text: "#075985" };
      case "Service Going on":
        return { bg: "#ede9fe", text: "#5b21b6" };
      case "Bill Pending":
        return { bg: "#fce7f3", text: "#9d174d" };
      case "Bill Completed":
        return { bg: "#cffafe", text: "#155e75" };
      case "Service Completed":
        return { bg: "#d1fae5", text: "#065f46" };
      default:
        return { bg: "#e5e7eb", text: "#374151" };
    }
  };

  /* 🔥 CARD UI */
  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.serviceStatus);

    return (
      <View style={styles.card}>
        <Text style={styles.idText}>Booking ID: {item.bookingId || "N/A"}</Text>
        <Text style={styles.number}>Service ID: {item.serviceId || "N/A"}</Text>

        <Text style={styles.model}>
          {item.carBrand} - {item.carModel}
        </Text>

        {/* 👤 CUSTOMER DETAILS */}
        <Text style={styles.subText}>Customer: {item.customerName || "-"}</Text>

        <Text style={styles.subText}>Phone: {item.customerPhone || "-"}</Text>

        <Text style={styles.subText}>Email: {item.customerEmail || "-"}</Text>

        <Text style={styles.subText}>Mechanic: {item.employeeName || "-"}</Text>

        {item.partsTotalCost ? (
          <Text style={styles.parts}>Parts Cost: ₹{item.partsTotalCost}</Text>
        ) : null}

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.serviceStatus || "Processing"}
          </Text>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            enabled={item.serviceStatus !== "Service Completed"}
            selectedValue={item.serviceStatus || "Processing"}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
            onValueChange={(value) => updateStatus(item, value)}
          >
            {getNextStatuses(item.serviceStatus).map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>

        {item.serviceStatus === "Service Going on" && !item.partsAdded && (
          <TouchableOpacity
            style={styles.partsBtn}
            onPress={() => openPartsModal(item)}
          >
            <Text style={styles.updateText}>Add Parts</Text>
          </TouchableOpacity>
        )}
      </View>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* 🔹 MAIN TABS */}
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => setMainTab("booked")}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: mainTab === "booked" ? "#38bdf8" : "#020617",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: mainTab === "booked" ? "#020617" : "#38bdf8",
                fontWeight: "700",
              }}
            >
              Booked ({bookedCars.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMainTab("addVehicle")}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: mainTab === "addVehicle" ? "#38bdf8" : "#020617",
              borderRadius: 10,
              alignItems: "center",
              marginLeft: 6,
            }}
          >
            <Text
              style={{
                color: mainTab === "addVehicle" ? "#020617" : "#38bdf8",
                fontWeight: "700",
              }}
            >
              Add Vehicle ({addVehicleCars.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔎 SEARCH */}
        <TextInput
          placeholder="Search service, car, mechanic..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* 🎛 FILTER TABS */}
        {/* 🎛 FILTER DROPDOWN */}
        <View style={{ width: "50%", marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: "#0f172a",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#0b3b6f",
            }}
          >
            <Picker
              selectedValue={filter}
              dropdownIconColor="#38bdf8"
              style={{ color: "#fff" }}
              onValueChange={(v) => setFilter(v)}
            >
              <Picker.Item label="All" value="all" />
              {STATUS_FLOW.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
        </View>

        {filteredCars.length === 0 ? (
          <Text style={styles.empty}>No Cars Found</Text>
        ) : (
          <FlatList
            data={filteredCars}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}
          />
        )}

        {/* 🔧 PARTS MODAL */}
        <Modal visible={partsModal} animationType="slide">
          <SafeAreaView style={styles.modal}>
            <TouchableOpacity
              onPress={() => setPartsModal(false)}
              style={styles.closeIcon}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add Parts</Text>

            <ScrollView>
              {parts.map((item, index) => (
                <View key={index} style={styles.partCard}>
                  <TextInput
                    placeholder="Part name"
                    placeholderTextColor="#64748b"
                    value={item.partName}
                    onChangeText={(v) => handlePartChange(index, "partName", v)}
                    style={styles.input}
                  />

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder="Qty"
                      keyboardType="numeric"
                      value={String(item.qty)}
                      onChangeText={(v) => handlePartChange(index, "qty", v)}
                      style={[styles.input, { flex: 1 }]}
                    />

                    <TextInput
                      placeholder="Price"
                      keyboardType="numeric"
                      value={String(item.price)}
                      onChangeText={(v) => handlePartChange(index, "price", v)}
                      style={[styles.input, { flex: 1 }]}
                    />
                  </View>

                  <Text style={styles.total}>
                    Total: ₹{Number(item.qty) * Number(item.price)}
                  </Text>

                  {parts.length > 1 && (
                    <TouchableOpacity onPress={() => removePartRow(index)}>
                      <Text style={styles.remove}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addRow} onPress={addPartRow}>
                <Text style={styles.updateText}>+ Add Part</Text>
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles.grandTotal}>
              Parts Total: ₹{totalPartsCost}
            </Text>

            <TouchableOpacity style={styles.saveBtn} onPress={saveParts}>
              {savingParts ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateText}>Save Parts</Text>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#020617",
  },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* 🔥 HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { fontSize: 22, fontWeight: "bold", color: "#111" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  serviceId: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },

  search: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },
  pickerWrapper: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#020617",
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
    paddingVertical: 10,
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

  partCard: {
    backgroundColor: "#0f172a",
    padding: 18, // was 14
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)",
  },

  total: {
    marginTop: 10,
    fontWeight: "800",
    fontSize: 16, // NEW
    color: "#10b981",
  },
  remove: {
    marginTop: 8,
    color: "#f87171",
    fontWeight: "700",
    textAlign: "center",
  },

  addRow: {
    backgroundColor: "#38bdf8",
    padding: 16, // was 14
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  grandTotal: {
    fontSize: 20, // was 18
    fontWeight: "900",
    color: "#38bdf8",
    marginBottom: 18,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  partsBtn: {
    marginTop: 14,
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  completeBtn: {
    marginTop: 14,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  modal: {
    flex: 1,
    padding: 22, // was 16
    backgroundColor: "#020617",
  },

  modalTitle: {
    fontSize: 24, // was 20
    fontWeight: "900",
    marginBottom: 20,
    color: "#e5e7eb",
  },
  input: {
    backgroundColor: "#020617",
    padding: 14, // was 10
    borderRadius: 12,
    marginBottom: 14,
    color: "#fff",
    fontSize: 16, // NEW
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },

  saveBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 16, // was 14
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
  },

  /* 🔥 CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  idText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },

  number: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 4,
  },

  model: {
    fontWeight: "800",
    fontSize: 18,
    color: "#38bdf8",
    marginTop: 6,
  },

  subText: {
    marginTop: 6,
    fontSize: 14,
    color: "#cbd5f5",
  },

  parts: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#10b981",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  updateBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 14, // was 12
    borderRadius: 14,
    alignItems: "center",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  updateText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 14,
  },
  closeIcon: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 50,
  },
});
