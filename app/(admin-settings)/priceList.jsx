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
  Dimensions,
} from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 36) / 2; // 2 columns spacing

export default function PriceList() {
  const router = useRouter();

  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* 🔹 FETCH PACKAGES */
  const fetchPackages = async () => {
    try {
      const snap = await getDocs(collection(db, "pricingPackages"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPackages(list);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      Alert.alert("Error", "Failed to load packages");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  /* 🔹 DELETE */
  const handleDelete = async (id) => {
    Alert.alert("Delete", "Delete this package?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "pricingPackages", id));
            fetchPackages();
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  /* 🔹 SEARCH FILTER */
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [packages, search]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* 🔹 SEARCH */}
      <TextInput
        placeholder="Search package..."
        placeholderTextColor="#64748b" // ✅ visible placeholder
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      {/* 🔹 GRID LIST */}
      <FlatList
        data={filteredPackages}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.price}>
              ₹{Number(item.price || 0).toLocaleString()}
            </Text>

            {/* FEATURES */}
            {item.features?.slice(0, 2).map((f, i) => (
              <Text key={i} style={styles.feature}>
                ✔ {f}
              </Text>
            ))}

            {item.features?.length > 2 && (
              <Text style={styles.more}>+{item.features.length - 2} more</Text>
            )}

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(admin-settings)/addprice?id=${item.id}`)
                }
                style={styles.iconBtn}
              >
                <MaterialIcons name="edit" size={16} color="#38bdf8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.iconBtn}
              >
                <MaterialIcons name="delete" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No packages found</Text>}
      />

      {/* 🔹 FAB */}
      <TouchableOpacity
        onPress={() => router.push("/(admin-settings)/addprice")}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#020617",
  },

  search: {
    borderWidth: 1,
    borderColor: "#0b3b6f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#0f172a",
    color: "#fff",
  },

  card: {
    width: cardWidth,
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  title: {
    fontWeight: "600",
    fontSize: 14,
    color: "#fff",
  },

  price: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
    color: "#38bdf8",
  },

  feature: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 3,
  },

  more: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  iconBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: "#020617",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
