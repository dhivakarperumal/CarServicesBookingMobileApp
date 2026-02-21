// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { db } from "../../firebase";
// import {
//   collection,
//   onSnapshot,
//   doc,
//   deleteDoc,
//   updateDoc,
// } from "firebase/firestore";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function AllProducts() {
//   const router = useRouter();

//   const [products, setProducts] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);

//   /* 🔥 REALTIME FETCH */
//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "products"), (snap) => {
//       const list = snap.docs.map((doc) => ({
//         docId: doc.id,
//         ...doc.data(),
//       }));
//       setProducts(list);
//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   /* 🔍 SEARCH FILTER */
//   const filtered = products.filter((p) =>
//     p.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   /* 🗑️ DELETE */
//   const handleDelete = (docId) => {
//     Alert.alert("Delete", "Delete this product?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           await deleteDoc(doc(db, "products", docId));
//         },
//       },
//     ]);
//   };

//   /* 🔄 TOGGLE STATUS */
//   const toggleStatus = async (p) => {
//     await updateDoc(doc(db, "products", p.docId), {
//       isActive: !p.isActive,
//     });
//   };

//   /* ✏️ EDIT */
//   const handleEdit = (p) => {
//     router.push({
//       pathname: "/(admin)/addproducts",
//       params: { editId: p.docId },
//     });
//   };

//   /* 🧾 PRODUCT CARD */
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Image
//         source={{ uri: item.thumbnail || "https://via.placeholder.com/300" }}
//         style={styles.image}
//       />

//       <View style={styles.cardBody}>
//         <Text style={styles.name}>{item.name}</Text>

//         <Text style={styles.price}>
//           ₹ {item.offerPrice || item.mrp}
//         </Text>

//         <Text style={styles.stock}>Stock: {item.totalStock || 0}</Text>

//         <View style={styles.row}>
//           <Text style={styles.rating}>⭐ {item.rating || 0}</Text>

//           <TouchableOpacity
//             onPress={() => toggleStatus(item)}
//             style={[
//               styles.status,
//               item.isActive ? styles.active : styles.inactive,
//             ]}
//           >
//             <Text style={styles.statusText}>
//               {item.isActive ? "Active" : "Inactive"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* ACTIONS */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => handleEdit(item)}
//           >
//             <Ionicons name="create-outline" size={20} color="#2563eb" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => handleDelete(item.docId)}
//           >
//             <Ionicons name="trash-outline" size={20} color="#dc2626" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#06b6d4" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* 🔍 SEARCH */}
//       <TextInput
//         placeholder="Search products..."
//         placeholderTextColor="#9ca3af"
//         style={styles.search}
//         value={search}
//         onChangeText={setSearch}
//       />

//       <FlatList
//         data={filtered}
//         keyExtractor={(item) => item.docId}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <Text style={styles.empty}>No products found</Text>
//         }
//         contentContainerStyle={{ paddingBottom: 80 }}
//       />

//       {/* ➕ ADD BUTTON */}
//       <TouchableOpacity
//         style={styles.addBtn}
//         onPress={() => router.push("/(admin)/addproducts")}
//       >
//         <Ionicons name="add" size={26} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// }

// /* 🎨 STYLES */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: "#0f172a",
//     padding: 14,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#0f172a",
//   },

//   search: {
//     backgroundColor: "#1e293b",
//     color: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     marginBottom: 14,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },

//   image: {
//     width: "100%",
//     height: 160,
//   },

//   cardBody: {
//     padding: 12,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//   },

//   price: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "#000",
//     marginTop: 4,
//   },

//   stock: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 2,
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 6,
//     alignItems: "center",
//   },

//   rating: {
//     fontSize: 13,
//     color: "#374151",
//   },

//   status: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 10,
//   },

//   active: {
//     backgroundColor: "#dcfce7",
//   },

//   inactive: {
//     backgroundColor: "#fee2e2",
//   },

//   statusText: {
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//     marginTop: 10,
//   },

//   iconBtn: {
//     padding: 6,
//   },

//   empty: {
//     textAlign: "center",
//     color: "#9ca3af",
//     marginTop: 40,
//   },

//   addBtn: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     backgroundColor: "#000",
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 6,
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AllProducts() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* 🔥 REALTIME FETCH */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* 🔍 SEARCH FILTER */
  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* 🗑️ DELETE */
  const handleDelete = (docId) => {
    Alert.alert("Delete", "Delete this product?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "products", docId));
        },
      },
    ]);
  };

  /* 🔄 TOGGLE STATUS */
  const toggleStatus = async (p) => {
    await updateDoc(doc(db, "products", p.docId), {
      isActive: !p.isActive,
    });
  };

  /* ✏️ EDIT */
  const handleEdit = (p) => {
    router.push({
      pathname: "/(Products)/addproducts",
      params: { editId: p.docId },
    });
  };

  /* 🧾 PRODUCT CARD */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.thumbnail || "https://via.placeholder.com/300" }}
        style={styles.image}
      />

      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.price}>
          ₹ {item.offerPrice || item.mrp}
        </Text>

        <Text style={styles.stock}>
          Stock: {item.totalStock || 0}
        </Text>

        <View style={styles.row}>
          <Text style={styles.rating}>⭐ {item.rating || 0}</Text>

          <TouchableOpacity
            onPress={() => toggleStatus(item)}
            style={[
              styles.status,
              item.isActive ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.statusText}>
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#2563eb" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item.docId)}
          >
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search products..."
        placeholderTextColor="#9ca3af"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.docId}
        renderItem={renderItem}
        numColumns={2} // ✅ 2 COLUMN GRID
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No products found</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ➕ ADD BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/(Products)/addproducts")}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    // backgroundColor: "#0f172a",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },

  search: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    width: "48%", // ✅ REQUIRED FOR 2 COLUMN
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 120, // ✅ SMALLER FOR GRID
  },

  cardBody: {
    padding: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginTop: 2,
  },

  stock: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },

  rating: {
    fontSize: 12,
    color: "#374151",
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  active: {
    backgroundColor: "#dcfce7",
  },

  inactive: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },

  iconBtn: {
    padding: 4,
  },

  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
  },

  addBtn: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});