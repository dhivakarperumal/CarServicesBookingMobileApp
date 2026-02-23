import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
  const colors = {
    paid: "#16a34a",
    partial: "#fb923c",
    pending: "#facc15",
  };

  return (
    <View
      style={[styles.badge, { backgroundColor: colors[status] || "#9ca3af" }]}
    >
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

export default function BillingsScreen() {
  const router = useRouter();

  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountSort, setAmountSort] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  /* 🔥 LIVE FIRESTORE */
  useEffect(() => {
    const q = query(collection(db, "billings"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        invoiceNo: d.data().invoiceNo || "INV---",
        customerName: d.data().customerName || "Unknown",
        carNumber: d.data().carNumber || "-",
        paymentStatus: d.data().paymentStatus?.toLowerCase() || "pending",
      }));

      setBills(data);
    });

    return () => unsub();
  }, []);

  /* 💰 STATS */
  const totalRevenue = bills.reduce(
    (sum, b) => sum + Number(b.grandTotal || 0),
    0,
  );

  const pendingCount = bills.filter((b) => b.paymentStatus !== "paid").length;

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  /* 🔎 FILTER */
  const filtered = useMemo(() => {
    let data = bills.filter((b) => {
      const text =
        `${b.invoiceNo} ${b.customerName} ${b.carNumber}`.toLowerCase();
      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || b.paymentStatus === statusFilter)
      );
    });

    if (amountSort === "low") data.sort((a, b) => a.grandTotal - b.grandTotal);
    if (amountSort === "high") data.sort((a, b) => b.grandTotal - a.grandTotal);

    return data;
  }, [bills, search, statusFilter, amountSort]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedBills = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, amountSort]);

  /* ❌ DELETE */
  const deleteInvoice = async (id) => {
    Alert.alert("Delete", "Delete this invoice?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteDoc(doc(db, "billings", id));
        },
      },
    ]);
  };

  /* UI */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Service Billings</Text>

        <TouchableOpacity
          onPress={() => router.push("/(serviceslist)/AddBillingsScreen")}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 🔽 BODY */}
      <View style={styles.container}>
        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>{formatCurrency(totalRevenue)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{pendingCount}</Text>
          </View>
        </View>

        {/* SEARCH */}
        <TextInput
          placeholder="Search invoice / customer / car"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

        {/* FILTERS */}
        <View style={styles.row}>
          <Picker
            selectedValue={statusFilter}
            dropdownIconColor="#38bdf8"
            style={styles.picker}
            onValueChange={(v) => setStatusFilter(v)}
          >
            <Picker.Item label="All Status" value="all" />
            <Picker.Item label="Paid" value="paid" />
            <Picker.Item label="Partial" value="partial" />
            <Picker.Item label="Pending" value="pending" />
          </Picker>

          <Picker
            selectedValue={amountSort}
            dropdownIconColor="#38bdf8"
            style={styles.picker}
            onValueChange={(v) => setAmountSort(v)}
          >
            <Picker.Item label="Amount Sort" value="none" />
            <Picker.Item label="Low → High" value="low" />
            <Picker.Item label="High → Low" value="high" />
          </Picker>
        </View>

        {/* LIST */}
        <FlatList
          data={paginatedBills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.invoice}>{item.invoiceNo}</Text>
                <StatusBadge status={item.paymentStatus} />
              </View>

              <Text style={styles.customer}>{item.customerName}</Text>
              <Text style={styles.car}>{item.carNumber}</Text>

              <View style={styles.cardBottom}>
                <Text style={styles.amount}>
                  {formatCurrency(item.grandTotal)}
                </Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteInvoice(item.id)}
                >
                  <Ionicons name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* PAGINATION */}
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((p) => p - 1)}
          >
            <Text>Prev</Text>
          </TouchableOpacity>

          <Text>
            {currentPage} / {totalPages || 1}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((p) => p + 1)}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
  },

  /* ===== STATS ===== */

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },

  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },

  /* ===== INPUT ===== */

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  picker: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#fff",
  },

  /* ===== CARD ===== */

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  invoice: {
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: 14,
  },

  customer: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  car: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  amount: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  /* ===== BADGE ===== */

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  /* ===== DELETE ===== */

  deleteBtn: {
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 10,
  },

  /* ===== PAGINATION ===== */

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
});
