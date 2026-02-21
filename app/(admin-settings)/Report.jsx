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
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

/* GROUP BY MONTH */
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

export default function ReportsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [billings, setBillings] = useState([]);

  const [typeFilter, setTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

  /* FIRESTORE */
  useEffect(() => {
    const u1 = onSnapshot(collection(db, "bookings"), (s) =>
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

  /* BUILD REPORTS */
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

  /* 🧾 GENERATE PDF */
  const generatePDF = async (report) => {
    const rows = report.items
      .map((i, idx) => {
        const date = dayjs(
          i.createdAt?.toDate() || i.updatedAt?.toDate()
        ).format("DD MMM YYYY");

        const name =
          i.customerName ||
          i.partName ||
          i.name ||
          "-";

        const amount = i.grandTotal
          ? `₹${i.grandTotal}`
          : i.stockQty
          ? `Stock: ${i.stockQty}`
          : "-";

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${date}</td>
            <td>${name}</td>
            <td>${amount}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <html>
        <body>
          <h2>${report.name}</h2>
          <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <tr>
              <th>S No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Amount / Stock</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri);
  };

  /* UI */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#15173D" }}>
      <ScrollView style={styles.container}>
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

        {/* LIST */}
        <FlatList
          data={filteredReports}
          keyExtractor={(item, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bold}>{item.name}</Text>
              <Text>{item.type}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => setSelectedReport(item)}
                >
                  <Text style={styles.btnText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => generatePDF(item)}
                >
                  <Text style={styles.btnText}>PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>

      {/* MODAL */}
      <Modal visible={!!selectedReport} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.bold}>{selectedReport?.name}</Text>
            <TouchableOpacity onPress={() => setSelectedReport(null)}>
              <Ionicons name="close" size={26} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={selectedReport?.items || []}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.modalRow}>
                <Text>{index + 1}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 16 },

  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  picker: { flex: 1, backgroundColor: "#fff" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  bold: { fontWeight: "bold" },

  actions: { flexDirection: "row", gap: 10, marginTop: 8 },

  viewBtn: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 8,
  },

  pdfBtn: {
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 8,
  },

  btnText: { color: "#fff" },

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
  },
});