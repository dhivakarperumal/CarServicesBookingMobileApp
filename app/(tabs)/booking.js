import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

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

  const handleChange = (key, value) => {
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

      const bookingData = {
        bookingId,
        ...formData,
        status: BOOKING_STATUS.BOOKED,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

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
      console.log(error);
      Alert.alert("Error", "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Service</Text>

      {/* NAME */}
      <Input label="Full Name" value={formData.name} onChange={(v) => handleChange("name", v)} />

      {/* PHONE */}
      <Input label="Phone" value={formData.phone} onChange={(v) => handleChange("phone", v)} />

      {/* EMAIL */}
      <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />

      {/* BRAND */}
      <Text style={styles.label}>Car Brand</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={formData.brand}
          onValueChange={(v) => handleChange("brand", v)}
        >
          <Picker.Item label="Select Brand" value="" />
          <Picker.Item label="Honda" value="Honda" />
          <Picker.Item label="Hyundai" value="Hyundai" />
          <Picker.Item label="BMW" value="BMW" />
          <Picker.Item label="Audi" value="Audi" />
        </Picker>
      </View>

      {/* MODEL */}
      <Input label="Car Model" value={formData.model} onChange={(v) => handleChange("model", v)} />

      {/* ISSUE */}
      <Text style={styles.label}>Issue</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={formData.issue}
          onValueChange={(v) => handleChange("issue", v)}
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

      {/* LOCATION */}
      <Input label="Location" value={formData.location} onChange={(v) => handleChange("location", v)} />

      {/* ADDRESS */}
      <Input
        label="Service Address"
        value={formData.address}
        onChange={(v) => handleChange("address", v)}
        multiline
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleBooking}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Booking..." : "Book Service"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({ label, value, onChange, multiline = false }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={[styles.input, multiline && { height: 80 }]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },

  label: { fontSize: 14, marginBottom: 6, color: "#374151" },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
  },

  picker: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#06b6d4",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
