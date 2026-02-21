import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ServiceBillingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [parts, setParts] = useState([]);
  const [labour, setLabour] = useState("");
  const [gstPercent, setGstPercent] = useState("18");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* 🔥 LOAD SERVICE */
  useEffect(() => {
    if (!id) return;

    const loadService = async () => {
      try {
        setLoading(true);

        const serviceSnap = await getDoc(doc(db, "allServices", id));

        if (!serviceSnap.exists()) {
          Alert.alert("Error", "Service not found");
          router.back();
          return;
        }

        const serviceData = {
          id: serviceSnap.id,
          ...serviceSnap.data(),
        };

        if (serviceData.serviceStatus === "Bill Completed") {
          Alert.alert("Bill already completed");
          router.back();
          return;
        }

        setService(serviceData);

        const partsSnap = await getDocs(
          collection(db, "allServices", id, "parts"),
        );

        const partsData = partsSnap.docs.map((d) => {
          const data = d.data();
          const qty = Number(data.qty || 0);
          const price = Number(data.price || 0);

          return {
            partName: data.partName,
            qty,
            price,
            total: qty * price,
          };
        });

        setParts(partsData);
      } catch (err) {
        Alert.alert("Error", "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  /* 🧮 CALCULATIONS */
  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.total, 0),
    [parts],
  );

  const labourAmount = Number(labour || 0);
  const gst = Number(gstPercent || 0);

  const subTotal = partsTotal + labourAmount;
  const gstAmount = (subTotal * gst) / 100;
  const grandTotal = subTotal + gstAmount;

  /* 💾 GENERATE BILL */
  const generateBill = async () => {
    if (!service) return;

    if (grandTotal <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    try {
      setSaving(true);

      const invoiceNo = `INV-${Date.now()}`;

      await addDoc(collection(db, "billings"), {
        invoiceNo,
        serviceId: service.id,
        bookingId: service.bookingId,
        customerName: service.name,
        mobileNumber: service.phone,
        car: `${service.brand || ""} ${service.model || ""}`,
        parts,
        partsTotal,
        labour: labourAmount,
        gstPercent: gst,
        gstAmount,
        subTotal,
        grandTotal,
        paymentStatus: "Pending",
        status: "Generated",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "allServices", service.id), {
        serviceStatus: "Bill Completed",
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Invoice Generated 🚗💰");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to generate bill");
    } finally {
      setSaving(false);
    }
  };

  /* ⏳ LOADING */
  if (loading || !service) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading service...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* 🔙 HEADER */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Billing</Text>

        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={parts}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Details</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{service.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Mobile:</Text>
                <Text style={styles.value}>{service.phone}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Vehicle:</Text>
                <Text style={styles.value}>
                  {service.brand} {service.model}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Booking ID:</Text>
                <Text style={styles.value}>{service.bookingId}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Parts Used</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.partRow}>
            <View>
              <Text style={styles.partName}>{item.partName}</Text>
              <Text style={styles.partSub}>
                {item.qty} × ₹{item.price}
              </Text>
            </View>
            <Text style={styles.partTotal}>₹{item.total}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.inputLabel}>Labour Charges</Text>
            <TextInput
              placeholder="Enter labour amount"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={labour}
              onChangeText={setLabour}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>GST (%)</Text>
            <TextInput
              placeholder="Enter GST percentage"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={gstPercent}
              onChangeText={setGstPercent}
              style={styles.input}
            />

            <View style={styles.totalCard}>
              <Text style={styles.totalTitle}>Invoice Summary</Text>

              <View style={styles.rowBetween}>
                <Text style={{ color: "#94a3b8" }}>Parts Total</Text>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  ₹{partsTotal}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={{ color: "#94a3b8" }}>Labour</Text>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  ₹{labourAmount}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={{ color: "#94a3b8" }}>GST</Text>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  ₹{gstAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.grandLabel}>Grand Total</Text>
                <Text style={styles.grandTotal}>₹{grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={generateBill}
              disabled={saving}
              style={styles.button}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Invoice</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { padding: 16 },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    color: "#38bdf8",
  },

  label: { fontWeight: "600", color: "#94a3b8" },
  value: { fontWeight: "600", color: "#fff" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
    color: "#fff",
  },

  partRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  partName: { fontWeight: "700", color: "#fff" },
  partSub: { fontSize: 12, color: "#94a3b8" },
  partTotal: { fontWeight: "700", fontSize: 14, color: "#38bdf8" },

  footer: { padding: 16 },

  inputLabel: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#38bdf8",
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  totalCard: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  totalTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    color: "#fff",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#0b3b6f",
    marginVertical: 8,
  },

  grandLabel: {
    fontWeight: "700",
    fontSize: 15,
    color: "#fff",
  },

  grandTotal: {
    fontWeight: "800",
    fontSize: 17,
    color: "#38bdf8",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});
