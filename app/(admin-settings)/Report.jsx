import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import dayjs from "dayjs";

/* 🔹 GROUP BY MONTH */
const groupByMonth = (data, dateKey = "createdAt") => {
  const map = {};
  data.forEach((item) => {
    if (!item[dateKey]) return;
    const month = dayjs(item[dateKey].toDate()).format("YYYY-MM");
    if (!map[month]) map[month] = [];
    map[month].push(item);
  });
  return map;
};

/* 🔹 STAT CARD */
const StatCard = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <View>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <Ionicons name={icon} size={24} color="#2563eb" />
  </View>
);

export default function ReportsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [billings, setBillings] = useState([]);

  const [typeFilter, setTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

  /* 🔥 FIRESTORE REALTIME */
  useEffect(() => {
    const u1 = onSnapshot(collection(db, "appointments"), (s) =>
      setAppointments(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const u2 = onSnapshot(collection(db, "carInventory"), (s) =>
      setInventory(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const u3 = onSnapshot(collection(db, "billings"), (s) =>
      setBillings(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  /* 🔹 BUILD REPORTS */
  const reports = useMemo(() => {
    const rows = [];

    const push = (grouped, type, title) => {
      Object.entries(grouped).forEach(([month, items]) => {
        rows.push({
          name: `${title} (${dayjs(month).format("MMM YYYY")})`,
          type,
          month,
          items,
        });
      });
    };

    push(groupByMonth(appointments), "Appointments", "Appointments Report");
    push(groupByMonth(inventory, "updatedAt"), "Inventory", "Inventory Report");
    push(groupByMonth(billings), "Billing", "Billing Report");

    return rows.sort((a, b) => b.month.localeCompare(a.month));
  }, [appointments, inventory, billings]);

  const availableMonths = [
    ...new Set(reports.map((r) => r.month)),
  ].sort((a, b) => b.localeCompare(a));

  const filteredReports = reports.filter((r) => {
    const typeMatch = typeFilter === "All" || r.type === typeFilter;
    const monthMatch = monthFilter === "All" || r.month === monthFilter;
    return typeMatch && monthMatch;
  });

  /* UI */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#15173D" }}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* STATS */}
        <View style={styles.statsRow}>
          <StatCard
            title="Appointments"
            value={appointments.length}
            icon="calendar-outline"
          />
          <StatCard
            title="Billing"
            value={billings.length}
            icon="document-text-outline"
          />
          <StatCard
            title="Inventory"
            value={inventory.length}
            icon="cube-outline"
          />
        </View>

        {/* FILTERS */}
        <View style={styles.row}>
          <Picker
            selectedValue={typeFilter}
            style={styles.picker}
            onValueChange={setTypeFilter}
          >
            <Picker.Item label="All Types" value="All" />
            <Picker.Item label="Appointments" value="Appointments" />
            <Picker.Item label="Inventory" value="Inventory" />
            <Picker.Item label="Billing" value="Billing" />
          </Picker>

          <Picker
            selectedValue={monthFilter}
            style={styles.picker}
            onValueChange={setMonthFilter}
          >
            <Picker.Item label="All Months" value="All" />
            {availableMonths.map((m) => (
              <Picker.Item
                key={m}
                label={dayjs(m).format("MMM YYYY")}
                value={m}
              />
            ))}
          </Picker>
        </View>

        {/* REPORT LIST */}
        <FlatList
          data={filteredReports}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.bold}>{item.name}</Text>
              <Text>{item.type}</Text>
              <Text>{dayjs(item.month).format("MMM YYYY")}</Text>

              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => setSelectedReport(item)}
              >
                <Text style={styles.btnText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {filteredReports.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No reports found
          </Text>
        )}
      </ScrollView>

      {/* 🔍 MODAL */}
      <Modal visible={!!selectedReport} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.headerTitle}>
              {selectedReport?.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedReport(null)}>
              <Ionicons name="close" size={26} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={selectedReport?.items || []}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.modalRow}>
                <Text>{index + 1}.</Text>
                <Text>
                  {dayjs(
                    item.createdAt?.toDate() ||
                      item.updatedAt?.toDate()
                  ).format("DD MMM YYYY")}
                </Text>
                <Text>
                  {item.customerName ||
                    item.partName ||
                    item.name}
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#15173D",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 16 },

  statsRow: { gap: 10, marginBottom: 10 },

  statCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statLabel: { color: "#6b7280" },
  statValue: { fontWeight: "bold", fontSize: 16 },

  row: { flexDirection: "row", gap: 10, marginBottom: 10 },

  picker: { flex: 1, backgroundColor: "#fff" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  bold: { fontWeight: "bold" },

  viewBtn: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },

  btnText: { color: "#fff", textAlign: "center" },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
});