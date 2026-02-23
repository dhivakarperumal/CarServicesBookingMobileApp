import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const ITEMS_PER_PAGE = 10;

export default function StaffsScreen() {
  const router = useRouter();

  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadStaff = async () => {
    const snap = await getDocs(collection(db, "employees"));
    setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // ===== FILTER =====
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search);

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "all" || s.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [staff, search, statusFilter, departmentFilter]);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ===== DELETE =====
  const handleDelete = (id) => {
    Alert.alert("Delete", "Delete this staff member?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteDoc(doc(db, "employees", id));
          loadStaff();
        },
      },
    ]);
  };

  // ===== STATS =====
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "active").length;
  const inactiveStaff = staff.filter((s) => s.status !== "active").length;
  const departments = new Set(staff.map((s) => s.department)).size;

  const Card = ({ title, value, icon, color }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={22} color="#fff" />
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
  <View style={styles.staffCard}>

    {/* STATUS BADGE (TOP RIGHT) */}
    <View
      style={[
        styles.statusCorner,
        item.status === "active" ? styles.active : styles.inactive,
      ]}
    >
      <Text style={styles.statusText}>{item.status}</Text>
    </View>

    <Text style={styles.name}>
      {index + 1}. {item.name}
    </Text>

    <Text style={styles.sub}>{item.email}</Text>
    <Text style={styles.sub}>{item.phone}</Text>

    <View style={styles.rowWrap}>
      <Text style={styles.badge}>{item.role}</Text>
      <Text style={styles.badge}>{item.department}</Text>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/addstaff",
            params: { id: item.id },
          })
        }
        style={styles.actionBtn}
      >
        <MaterialCommunityIcons name="pencil" size={18} color="#38bdf8" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.actionBtn}
      >
        <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Staff Management</Text>

        <View style={{ width: 22 }} />
      </View>
      <View style={styles.container}>
        {/* FLOATING ADD BUTTON */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(Employees)/addstaff")}
        >
          <MaterialCommunityIcons name="plus" color="#fff" size={26} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ===== STATS ===== */}
          <View style={styles.stats}>
            <Card
              title="Total Staff"
              value={totalStaff}
              icon="account-group"
              color="#3b82f6"
            />
            <Card
              title="Active"
              value={activeStaff}
              icon="account-check"
              color="#10b981"
            />
            <Card
              title="Inactive"
              value={inactiveStaff}
              icon="account-remove"
              color="#ef4444"
            />
            <Card
              title="Departments"
              value={departments}
              icon="office-building"
              color="#8b5cf6"
            />
          </View>

          {/* ===== SEARCH ===== */}
          <TextInput
            placeholder="Search name, email, phone"
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          {/* ===== STATUS FILTER ===== */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {["all", "active", "inactive"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatusFilter(s)}
                  style={[
                    styles.filterBtn,
                    statusFilter === s && styles.filterActive,
                  ]}
                >
                  <Text
                    style={{
                      color: statusFilter === s ? "#fff" : "#94a3b8",
                      fontSize: 12,
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* ===== LIST ===== */}
          <FlatList
            data={paginatedStaff}
            contentContainerStyle={{ paddingBottom: 140 }}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((p) => p - 1)}
              >
                <Text style={styles.pageBtn}>Prev</Text>
              </TouchableOpacity>

              <Text style={styles.pageText}>
                {currentPage} / {totalPages}
              </Text>

              <TouchableOpacity
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage((p) => p + 1)}
              >
                <Text style={styles.pageBtn}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  statusCorner: {
  position: "absolute",
  top: 12,
  right: 12,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  zIndex: 10,
},

statusText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "700",
},

  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  card: {
    backgroundColor: "#0f172a",
    width: "48%",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  cardTitle: { color: "#94a3b8", fontSize: 12 },
  cardValue: { fontSize: 22, fontWeight: "800", color: "#fff" },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  search: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 14,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  filters: { flexDirection: "row", gap: 10, marginBottom: 10 },

  filterBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  filterActive: {
    backgroundColor: "#2563eb",
    borderColor: "#38bdf8",
  },

  staffCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    paddingTop: 28 , 
  },

  name: { fontWeight: "700", fontSize: 15, color: "#fff" },
  sub: { color: "#94a3b8", fontSize: 12 },

  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },

  badge: {
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    color: "#94a3b8",
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    color: "#fff",
  },

  active: { backgroundColor: "#10b981" },
  inactive: { backgroundColor: "#ef4444" },

  actions: { flexDirection: "row", gap: 12, marginTop: 10 },

  actionBtn: {
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  pageBtn: { color: "#38bdf8", fontWeight: "700" },
  pageText: { fontWeight: "700", color: "#fff" },

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
  },
});
