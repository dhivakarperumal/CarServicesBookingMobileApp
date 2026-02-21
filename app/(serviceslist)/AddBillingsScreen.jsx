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
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
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
      collection(db, "allServices", s.id, "parts")
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
    if (!selectedService)
      return Alert.alert("Select a service");

    if (parts.length === 0)
      return Alert.alert("No spare parts found");

    if (grandTotal <= 0)
      return Alert.alert("Invalid billing amount");

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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Generate Invoice</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* SEARCH */}
        <TextInput
          placeholder="Search Booking / Name / Phone"
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
                .includes(search.toLowerCase())
            )
            .map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.searchItem}
                onPress={() => selectService(s)}
              >
                <Text style={{ fontWeight: "bold" }}>{s.bookingId}</Text>
                <Text>
                  {s.name} ({s.brand} {s.model})
                </Text>
              </TouchableOpacity>
            ))}

        {/* SERVICE DETAILS */}
        {selectedService && (
          <View style={styles.card}>
            <Text>Customer: {selectedService.name}</Text>
            <Text>Mobile: {selectedService.phone}</Text>
            <Text>
              Car: {selectedService.brand} {selectedService.model}
            </Text>
            <Text>Booking ID: {selectedService.bookingId}</Text>
          </View>
        )}

        {/* PARTS LIST */}
        {parts.length > 0 && (
          <View style={styles.card}>
            {parts.map((p, i) => (
              <View key={i} style={styles.partRow}>
                <Text>{i + 1}. {p.partName}</Text>
                <Text>
                  {p.qty} × ₹{p.price} = ₹{p.total}
                </Text>
              </View>
            ))}
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
            <Text>GST ({gst}%): ₹{gstAmount.toFixed(2)}</Text>
            <Text style={styles.grand}>
              Grand Total: ₹{grandTotal.toFixed(2)}
            </Text>
          </View>
        )}

        {/* ACTION BUTTON */}
        {selectedService && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleGenerateBill}
          >
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
    backgroundColor: "#15173D",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 16 },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  searchItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  totalBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  grand: {
    fontWeight: "bold",
    color: "green",
    marginTop: 6,
  },

  saveBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 12,
    marginBottom: 30,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});