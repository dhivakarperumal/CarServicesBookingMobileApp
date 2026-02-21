import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

export default function ServicesListAll() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [visibleCount, setVisibleCount] = useState(8);

  /* 🔥 FETCH SERVICES REALTIME */
  useEffect(() => {
    let q;

    try {
      q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    } catch {
      q = query(collection(db, "services"));
    }

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setServices(list);
    });

    return () => unsub();
  }, []);

  /* 🔎 FILTER */
  useEffect(() => {
    const list = services.filter((srv) => {
      const name = srv.name?.toLowerCase() || "";
      const cat = srv.category?.toLowerCase() || "";

      const matchSearch =
        name.includes(search.toLowerCase()) ||
        cat.includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || srv.category === categoryFilter;

      return matchSearch && matchCategory;
    });

    setFiltered(list);
    setVisibleCount(8);
  }, [services, search, categoryFilter]);

  /* 🗑 DELETE */
  const handleDelete = async (id) => {
    Alert.alert("Delete", "Delete this service?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "services", id));
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  /* 📂 CATEGORY LIST */
  const categories = [
    "all",
    ...new Set(services.map((s) => s.category).filter(Boolean)),
  ];

  /* 🧾 CARD */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      <Text style={styles.name}>{item.name}</Text>

      {item.category && (
        <Text style={styles.category}>{item.category}</Text>
      )}

      <Text style={styles.price}>
        ₹{Number(item.price || 0).toLocaleString()}
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push(`/admin/addservices/${item.id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111827" }}>

      {/* 🔳 WHITE CONTENT */}
      <View style={styles.container}>
        {/* 🔍 SEARCH */}
        <TextInput
          placeholder="Search service..."
          placeholderTextColor="#9ca3af"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />


        {/* 📋 LIST */}
        <FlatList
          data={filtered.slice(0, visibleCount)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}                         // ✅ 2 columns
          columnWrapperStyle={{
            justifyContent: "space-between",     // spacing between cards
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,                  // space for FAB
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No services found</Text>
          }
        />
        {/* ⬇ LOAD MORE */}
        {visibleCount < filtered.length && (
          <TouchableOpacity
            style={styles.loadMore}
            onPress={() => setVisibleCount((p) => p + 8)}
          >
            <Text style={styles.loadText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ➕ FLOATING ADD BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/admin/addservices")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* 🔷 HEADER */
  header: {
    height: 56,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  /* 🔳 WHITE CONTENT */
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },

  search: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#15173D",
    marginBottom: 10,
    color:"#fff"
  },

  picker: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 10,
  },

 card: {
  backgroundColor: "#f9fafb",
  padding: 12,
  borderRadius: 14,
  marginBottom: 12,
  width: "48%",

  borderWidth: 1,
  borderColor: "#d1d5db",

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },

  name: { fontWeight: "700", fontSize: 15 },

  category: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  price: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  editBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "600" },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#9ca3af",
  },

  loadMore: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  loadText: { fontWeight: "600" },

  /* ➕ FAB */
  fab: {
    position: "absolute",
    bottom: 74,
    right: 20,
    backgroundColor: "#111827",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});