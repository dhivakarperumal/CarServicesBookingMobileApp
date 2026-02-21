import { Picker } from "@react-native-picker/picker";
import {
    addDoc,
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase";

const BOOKING_STATUS = {
  BOOKED: "Booked",
};

export default function BookingScreen() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    brand: "",
    model: "",
    issue: "",
    otherIssue: "",
    address: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  const generateBookingId = async () => {
    const counterRef = doc(db, "counters", "bookingCounter");

    const bookingId = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      let nextValue = 1;

      if (counterSnap.exists()) {
        nextValue = counterSnap.data().value + 1;
      }

      transaction.set(counterRef, { value: nextValue }, { merge: true });

      return `BS${String(nextValue).padStart(3, "0")}`;
    });

    return bookingId;
  };

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const validate = () => {
    if (!formData.name) return "Name is required";
    if (!formData.phone) return "Phone is required";
    if (!formData.brand) return "Car brand is required";
    if (!formData.model) return "Car model is required";
    if (!formData.issue) return "Issue is required";
    if (!formData.location) return "Location is required";
    if (!formData.address) return "Address is required";
    return null;
  };

  const handleBooking = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation", error);
      return;
    }

    try {
      setLoading(true);

      const bookingId = await generateBookingId();

      await addDoc(collection(db, "bookings"), {
        bookingId,
        ...formData,
        status: BOOKING_STATUS.BOOKED,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", `Booking Successful: ${bookingId}`);

      setFormData({
        name: "",
        phone: "",
        email: "",
        brand: "",
        model: "",
        issue: "",
        otherIssue: "",
        address: "",
        location: "",
      });
    } catch (error) {
      Alert.alert("Error", "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Book Service</Text>

      <Input label="Full Name" value={formData.name} onChange={(v) => handleChange("name", v)} />
      <Input label="Phone" value={formData.phone} onChange={(v) => handleChange("phone", v)} />
      <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />

      {/* BRAND */}
      <Text style={styles.label}>Car Brand</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          dropdownIconColor="#0EA5E9"
          selectedValue={formData.brand}
          onValueChange={(v) => handleChange("brand", v)}
          style={{ color: "#fff" }}
        >
          <Picker.Item label="Select Brand" value="" />
          <Picker.Item label="Honda" value="Honda" />
          <Picker.Item label="Hyundai" value="Hyundai" />
          <Picker.Item label="BMW" value="BMW" />
          <Picker.Item label="Audi" value="Audi" />
        </Picker>
      </View>

      <Input label="Car Model" value={formData.model} onChange={(v) => handleChange("model", v)} />

      {/* ISSUE */}
      <Text style={styles.label}>Issue</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          dropdownIconColor="#0EA5E9"
          selectedValue={formData.issue}
          onValueChange={(v) => handleChange("issue", v)}
          style={{ color: "#fff" }}
        >
          <Picker.Item label="Select Issue" value="" />
          <Picker.Item label="Engine Problem" value="Engine Problem" />
          <Picker.Item label="Brake Issue" value="Brake Issue" />
          <Picker.Item label="Electrical" value="Electrical" />
          <Picker.Item label="Others" value="Others" />
        </Picker>
      </View>

      {formData.issue === "Others" && (
        <Input
          label="Describe Issue"
          value={formData.otherIssue}
          onChange={(v) => handleChange("otherIssue", v)}
        />
      )}

      <Input label="Location" value={formData.location} onChange={(v) => handleChange("location", v)} />
      <Input label="Service Address" value={formData.address} onChange={(v) => handleChange("address", v)} multiline />

      <TouchableOpacity style={styles.button} onPress={handleBooking} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Book Service</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#64748B"
        multiline={multiline}
        style={[styles.input, multiline && { height: 90 }]}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
  },

  label: {
    color: "#94A3B8",
    marginBottom: 6,
    fontSize: 13,
  },

  input: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
  },

  pickerWrapper: {
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});
