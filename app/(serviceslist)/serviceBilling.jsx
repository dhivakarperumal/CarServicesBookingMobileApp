import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
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

export default function ServiceBillingScreen({ route, navigation }) {
  const { serviceId } = route.params;

  const [service, setService] = useState(null);
  const [parts, setParts] = useState([]);
  const [labour, setLabour] = useState("");
  const [gstPercent, setGstPercent] = useState("18");

  useEffect(() => {
    const loadService = async () => {
      try {
        const serviceRef = doc(db, "allServices", serviceId);
        const serviceSnap = await getDoc(serviceRef);

        if (!serviceSnap.exists()) {
          Alert.alert("Error", "Service not found");
          return;
        }

        const serviceData = {
          id: serviceSnap.id,
          ...serviceSnap.data(),
        };

        setService(serviceData);

        const partsSnap = await getDocs(
          collection(db, "allServices", serviceId, "parts")
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
      } catch (err) {
        console.log(err);
      }
    };

    loadService();
  }, []);

  const partsTotal = parts.reduce((sum, p) => sum + p.total, 0);
  const labourAmount = Number(labour || 0);
  const gst = Number(gstPercent || 0);

  const subTotal = partsTotal + labourAmount;
  const gstAmount = (subTotal * gst) / 100;
  const grandTotal = subTotal + gstAmount;

  const generateBill = async () => {
    if (!service) return;

    if (grandTotal <= 0) {
      Alert.alert("Error", "Invalid amount");
      return;
    }

    try {
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
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to generate bill");
    }
  };

  if (!service) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontWeight: "bold" }}>{service.name}</Text>
      <Text>{service.phone}</Text>
      <Text>
        {service.brand} {service.model}
      </Text>
      <Text>Booking: {service.bookingId}</Text>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Parts</Text>

      <FlatList
        data={parts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 4,
            }}
          >
            <Text>{item.partName}</Text>
            <Text>
              {item.qty} × ₹{item.price}
            </Text>
            <Text>₹{item.total}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Labour Charges"
        keyboardType="numeric"
        value={labour}
        onChangeText={setLabour}
        style={{
          borderWidth: 1,
          marginTop: 12,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="GST %"
        keyboardType="numeric"
        value={gstPercent}
        onChangeText={setGstPercent}
        style={{
          borderWidth: 1,
          marginTop: 12,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <View style={{ marginTop: 16 }}>
        <Text>Parts Total: ₹{partsTotal}</Text>
        <Text>Labour: ₹{labourAmount}</Text>
        <Text>GST: ₹{gstAmount.toFixed(2)}</Text>
        <Text style={{ fontWeight: "bold" }}>
          Grand Total: ₹{grandTotal.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={generateBill}
        style={{
          backgroundColor: "black",
          padding: 14,
          marginTop: 18,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Generate Invoice
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}