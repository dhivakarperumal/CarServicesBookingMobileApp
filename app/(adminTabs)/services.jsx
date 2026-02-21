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
//     <View style={{ flex: 1, padding: 12 }}>
//       {/* SEARCH */}
//       <TextInput
//         placeholder="Search booking, name, phone, car"
//         value={search}
//         onChangeText={setSearch}
//         style={{
//           borderWidth: 1,
//           borderColor: "#ddd",
//           padding: 10,
//           borderRadius: 10,
//           marginBottom: 10,
//         }}
//       />

//       <FlatList
//         data={filteredServices}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View
//             style={{
//               backgroundColor: "#fff",
//               padding: 14,
//               borderRadius: 12,
//               marginBottom: 12,
//               elevation: 3,
//             }}
//           >
//             <Text style={{ fontWeight: "bold" }}>
//               {item.bookingId || "No Booking"}
//             </Text>

//             <Text>{item.name}</Text>
//             <Text>{item.phone}</Text>
//             <Text>
//               {item.brand} {item.model}
//             </Text>

//             {/* STATUS CHIP */}
//             <View
//               style={{
//                 backgroundColor: getStatusColor(item.serviceStatus),
//                 paddingVertical: 4,
//                 paddingHorizontal: 10,
//                 borderRadius: 20,
//                 alignSelf: "flex-start",
//                 marginTop: 6,
//               }}
//             >
//               <Text style={{ color: "#fff", fontSize: 12 }}>
//                 {item.serviceStatus}
//               </Text>
//             </View>

//             {/* STATUS DROPDOWN */}
//             {updatingId === item.id ? (
//               <ActivityIndicator style={{ marginTop: 10 }} />
//             ) : (
//               <View
//                 style={{
//                   borderWidth: 1,
//                   borderColor: "#ddd",
//                   borderRadius: 8,
//                   marginTop: 8,
//                   overflow: "hidden",
//                 }}
//               >
//                 <Picker
//                   selectedValue={item.serviceStatus}
//                   onValueChange={(value) =>
//                     handleStatusChange(item, value)
//                   }
//                 >
//                   {BOOKING_STATUS.map((status) => (
//                     <Picker.Item
//                       key={status}
//                       label={status}
//                       value={status}
//                     />
//                   ))}
//                 </Picker>
//               </View>
//             )}

//             {/* BILL BUTTON ONLY WHEN BILL PENDING */}
//             {item.serviceStatus === "Bill Pending" && (
//               <TouchableOpacity
//                 onPress={() =>
//                   router.push({
//                     pathname: "/(serviceslist)/ServiceBillingScreen",
//                     params: { id: item.id }, 
//                   })
//                 }
//                 style={{
//                   marginTop: 10,
//                   backgroundColor: "black",
//                   padding: 10,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Text style={{ color: "#fff", textAlign: "center" }}>
//                   Generate Bill
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       />
//     </View>
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
} from "react-native";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  /* 🔥 Realtime Fetch */
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

  /* 🔄 Status Update */
  const handleStatusChange = async (service, newStatus) => {
    try {
      setUpdatingId(service.id);

      await updateDoc(doc(db, "allServices", service.id), {
        serviceStatus: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setUpdatingId(null);
    }
  };

  /* 🔍 Search */
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const text = `
        ${s.bookingId || ""}
        ${s.name || ""}
        ${s.phone || ""}
        ${s.brand || ""}
        ${s.model || ""}
      `.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [services, search]);

  /* 🎨 Status Color */
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search booking, name, phone, car"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
              elevation: 3,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {item.bookingId || "No Booking"}
            </Text>

            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>
            <Text>
              {item.brand} {item.model}
            </Text>

            {/* STATUS CHIP */}
            <View
              style={{
                backgroundColor: getStatusColor(item.serviceStatus),
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 20,
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {item.serviceStatus}
              </Text>
            </View>

            {/* STATUS DROPDOWN */}
            {updatingId === item.id ? (
              <ActivityIndicator style={{ marginTop: 10 }} />
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={item.serviceStatus}
                  onValueChange={(value) =>
                    handleStatusChange(item, value)
                  }
                >
                  {BOOKING_STATUS.map((status) => (
                    <Picker.Item key={status} label={status} value={status} />
                  ))}
                </Picker>
              </View>
            )}

            {/* ACTION ROW */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
                alignItems: "center",
              }}
            >
              {/* LEFT → GENERATE BILL */}
              {item.serviceStatus === "Bill Pending" && (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(serviceslist)/ServiceBillingScreen",
                    params: { id: item.id }, 
                  })
                }
                style={{
                  marginTop: 10,
                  backgroundColor: "black",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Generate Bill
                </Text>
              </TouchableOpacity>
            )}

              {/* RIGHT → ADD PARTS */}
              {item.serviceStatus === "Service Going on" && (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(serviceslist)/addserviceparts",
                      params: { serviceId: item.id },
                    })
                  }
                  style={{
                    backgroundColor: "#16a34a",
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff" }}>+ Add Parts</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}