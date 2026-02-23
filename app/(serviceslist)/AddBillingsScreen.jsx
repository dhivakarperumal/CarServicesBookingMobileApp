import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";

export default function AddBillingsScreen() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [parts, setParts] = useState([]);

  const [labour, setLabour] = useState("");
  const [gstPercent, setGstPercent] = useState("18");

  /* 🔥 FETCH SERVICES */
  useEffect(() => {
    const fetchServices = async () => {
      const snap = await getDocs(collection(db, "allServices"));
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchServices();
  }, []);

  /* 🔍 SELECT SERVICE */
  const selectService = async (s) => {
    setSelectedService(s);
    setSearch("");

    const partsSnap = await getDocs(
      collection(db, "allServices", s.id, "parts"),
    );

    const partsData = partsSnap.docs.map((d) => {
      const data = d.data();
      return {
        partName: data.partName,
        qty: Number(data.qty || 0),
        price: Number(data.price || 0),
        total: Number(data.qty || 0) * Number(data.price || 0),
      };
    });

    setParts(partsData);
  };

  /* 💰 CALCULATIONS */
  const partsTotal = parts.reduce((sum, p) => sum + p.total, 0);
  const labourAmount = Number(labour || 0);
  const gst = Number(gstPercent || 0);

  const subTotal = partsTotal + labourAmount;
  const gstAmount = (subTotal * gst) / 100;
  const grandTotal = subTotal + gstAmount;

  /* 💾 SAVE BILL */
  const handleGenerateBill = async () => {
    if (!selectedService) return Alert.alert("Select a service");

    if (parts.length === 0) return Alert.alert("No spare parts found");

    if (grandTotal <= 0) return Alert.alert("Invalid billing amount");

    try {
      const invoiceNo = `INV-${Date.now()}`;

      await addDoc(collection(db, "billings"), {
        invoiceNo,

        serviceId: selectedService.id,
        bookingId: selectedService.bookingId,

        customerName: selectedService.name,
        mobileNumber: selectedService.phone,
        car: `${selectedService.brand || ""} ${selectedService.model || ""}`,

        parts,
        partsTotal,
        labour: labourAmount,
        gstPercent: gst,
        gstAmount,
        subTotal,
        grandTotal,

        paymentStatus: "Pending",
        paymentMode: "",
        status: "Generated",

        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Invoice generated 🚗💰");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to generate invoice");
    }
  };

  /* UI */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#15173D" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#38bdf8" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Generate Invoice</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH */}
        <TextInput
          placeholder="Search Booking / Name / Phone"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

        {/* SEARCH LIST */}
        {search !== "" &&
          services
            .filter((s) =>
              `${s.bookingId} ${s.name} ${s.phone}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.searchItem}
                onPress={() => selectService(s)}
              >
                <Text style={{ color: "#38bdf8", fontWeight: "700" }}>
                  {s.bookingId}
                </Text>
                <Text style={{ color: "#fff" }}>
                  {s.name} ({s.brand} {s.model})
                </Text>
              </TouchableOpacity>
            ))}

        {/* SERVICE DETAILS */}
        {selectedService && (
          <View style={styles.card}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{selectedService.name}</Text>

            <Text style={styles.label}>Mobile</Text>
            <Text style={styles.value}>{selectedService.phone}</Text>

            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>
              {selectedService.brand} {selectedService.model}
            </Text>

            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{selectedService.bookingId}</Text>
          </View>
        )}

        {/* PARTS LIST */}
        {parts.length > 0 && (
          <View key={i} style={styles.partRow}>
            <View>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {i + 1}. {p.partName}
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                {p.qty} × ₹{p.price}
              </Text>
            </View>

            <Text style={{ color: "#38bdf8", fontWeight: "700" }}>
              ₹{p.total}
            </Text>
          </View>
        )}

        {/* LABOUR & GST */}
        {selectedService && (
          <>
            <TextInput
              placeholder="Labour Charges ₹"
              keyboardType="numeric"
              value={labour}
              onChangeText={setLabour}
              style={styles.input}
            />

            <TextInput
              placeholder="GST %"
              keyboardType="numeric"
              value={gstPercent}
              onChangeText={setGstPercent}
              style={styles.input}
            />
          </>
        )}

        {/* TOTAL */}
        {selectedService && (
          <View style={styles.totalBox}>
            <Text>Parts Total: ₹{partsTotal}</Text>
            <Text>Labour: ₹{labourAmount}</Text>
            <Text>
              GST ({gst}%): ₹{gstAmount.toFixed(2)}
            </Text>
            <Text style={styles.grand}>
              Grand Total: ₹{grandTotal.toFixed(2)}
            </Text>
          </View>
        )}

        {/* ACTION BUTTON */}
        {selectedService && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleGenerateBill}>
            <Text style={styles.btnText}>Generate Invoice</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
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

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  searchItem: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  label: { color: "#94a3b8", fontSize: 12 },
  value: { color: "#fff", fontWeight: "600", marginBottom: 6 },

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  totalBox: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  muted: { color: "#94a3b8" },
  white: { color: "#fff", fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "#0b3b6f",
    marginVertical: 8,
  },

  grandLabel: { color: "#fff", fontWeight: "700" },

  grand: {
    color: "#38bdf8",
    fontWeight: "800",
    fontSize: 16,
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
  },
});
