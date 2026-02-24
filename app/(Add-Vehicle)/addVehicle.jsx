import React, { useState, useEffect } from "react";
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
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export default function BookService({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    altPhone: "",
    vehicleType: "",
    vehicleNumber: "",
    brand: "",
    model: "",
    issue: "",
    otherIssue: "",
    address: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  const handleChange = (key, value) =>
    setFormData({ ...formData, [key]: value });

  const generateBookingId = async () => {
    const counterRef = doc(db, "counters", "bookingCounter");

    const bookingId = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let nextValue = snap.exists() ? snap.data().value + 1 : 1;

      transaction.set(counterRef, { value: nextValue }, { merge: true });

      return `BS${String(nextValue).padStart(3, "0")}`;
    });

    return bookingId;
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert("Login Required", "Please login first");
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.vehicleType ||
      !formData.vehicleNumber
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const bookingId = await generateBookingId();

      const bookingData = {
        bookingId,
        uid: currentUser.uid,
        ...formData,
        status: "Booked",
        createdAt: serverTimestamp(),
      };

      const bookingRef = await addDoc(
        collection(db, "bookings"),
        bookingData
      );

      await setDoc(
        doc(db, "users", currentUser.uid, "bookings", bookingRef.id),
        { ...bookingData, docId: bookingRef.id }
      );

      Alert.alert("Success", `Booking Created: ${bookingId}`);

      setFormData({
        name: "",
        phone: "",
        email: "",
        altPhone: "",
        vehicleType: "",
        vehicleNumber: "",
        brand: "",
        model: "",
        issue: "",
        otherIssue: "",
        address: "",
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Service</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={formData.name}
        onChangeText={(v) => handleChange("name", v)}
      />

      <TextInput
        placeholder="Phone"
        style={styles.input}
        keyboardType="numeric"
        value={formData.phone}
        onChangeText={(v) => handleChange("phone", v)}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={formData.email}
        onChangeText={(v) => handleChange("email", v)}
      />

      {/* VEHICLE TYPE */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.vehicleType}
          onValueChange={(v) => handleChange("vehicleType", v)}
        >
          <Picker.Item label="Select Vehicle Type" value="" />
          <Picker.Item label="Two Wheeler" value="Two Wheeler" />
          <Picker.Item label="Four Wheeler" value="Four Wheeler" />
        </Picker>
      </View>

      {/* VEHICLE NUMBER */}
      <TextInput
        placeholder="Vehicle Number"
        style={styles.input}
        value={formData.vehicleNumber}
        onChangeText={(v) => handleChange("vehicleNumber", v)}
      />

      {/* BRAND */}
      <TextInput
        placeholder="Brand"
        style={styles.input}
        value={formData.brand}
        onChangeText={(v) => handleChange("brand", v)}
      />

      {/* MODEL */}
      <TextInput
        placeholder="Model"
        style={styles.input}
        value={formData.model}
        onChangeText={(v) => handleChange("model", v)}
      />

      {/* ISSUE */}
      <TextInput
        placeholder="Issue"
        style={styles.input}
        value={formData.issue}
        onChangeText={(v) => handleChange("issue", v)}
      />

      {/* ADDRESS */}
      <TextInput
        placeholder="Service Address"
        style={styles.input}
        value={formData.address}
        onChangeText={(v) => handleChange("address", v)}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Booking..." : "Book Service"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0ea5e9",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});