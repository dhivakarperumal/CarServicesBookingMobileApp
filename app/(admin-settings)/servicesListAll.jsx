import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const ITEMS_PER_PAGE = 8;
const { width } = Dimensions.get("window");

export default function ServicesListAll() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* 🔹 FETCH DATA */
  useEffect(() => {
    let q;

    try {
      q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    } catch {
      q = collection(db, "services");
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          docId: d.id,
          ...d.data(),
        }));
        setServices(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
        Alert.alert("Error", "Failed to load services");
      }
    );

    return () => unsub();
  }, []);

  /* 🔹 RESET PAGE ON FILTER */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  /* 🔹 DELETE */
  const handleDelete = (id) => {
    Alert.alert("Delete", "Delete this service?", [
      { text: "Cancel" },
      {
        text: "Delete",
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

  /* 🔹 CATEGORY LIST */
  const categories = useMemo(() => {
    const cats = services
      .map((s) => s.category?.trim())
      .filter(Boolean);

    return ["all", ...new Set(cats)];
  }, [services]);

  /* 🔹 FILTER */
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const name = srv.name?.toLowerCase() || "";
      const cat = srv.category?.toLowerCase() || "";

      const matchSearch =
        name.includes(search.toLowerCase()) ||
        cat.includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" ||
        srv.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [services, search, categoryFilter]);

  /* 🔹 PAGINATION */
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* 🔹 SEARCH */}
      <TextInput
        placeholder="Search service..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* 🔹 CATEGORY FILTER */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategoryFilter(item)}
            style={[
              styles.chip,
              categoryFilter === item && styles.chipActive,
            ]}
          >
            <Text
              style={
                categoryFilter === item
                  ? styles.chipTextActive
                  : styles.chipText
              }
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* 🔹 GRID LIST */}
      <FlatList
        data={paginatedServices}
        keyExtractor={(item) => item.docId}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* IMAGE */}
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
              </View>
            )}

            {/* NAME */}
            <Text numberOfLines={1} style={styles.title}>
              {item.name}
            </Text>

            {/* PRICE */}
            <Text style={styles.price}>
              ₹{Number(item.price || 0).toLocaleString()}
            </Text>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/(admin-settings)/addService?id=${item.docId}`
                  )
                }
                style={styles.iconBtn}
              >
                <MaterialIcons name="edit" size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.docId)}
                style={styles.iconBtn}
              >
                <MaterialIcons name="delete" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No services found</Text>
        }
      />

      {/* 🔹 FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(admin-settings)/addService")}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* 🔹 STYLES */
const cardWidth = (width - 36) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },

  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  chip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#000" },
  chipText: { fontSize: 12 },
  chipTextActive: { fontSize: 12, color: "#fff" },

  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 6,
  },

  imagePlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  title: { fontWeight: "bold", fontSize: 14 },
  price: { fontSize: 13, marginTop: 2, fontWeight: "600" },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },

  iconBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#000",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});