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
import { KeyboardAvoidingView, Platform } from "react-native";

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

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

      await setDoc(
        doc(db, "users", currentUser.uid, "bookings", bookingRef.id),
        { ...bookingData, docId: bookingRef.id },
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 50, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Book Service</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        <TextInput
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          keyboardType="numeric"
          value={formData.phone}
          onChangeText={(v) => handleChange("phone", v)}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
        />

        {/* VEHICLE TYPE */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.vehicleType}
            onValueChange={(v) => handleChange("vehicleType", v)}
            dropdownIconColor="#38bdf8" 
          >
            <Picker.Item label="Select Vehicle Type" value="" />
            <Picker.Item label="Two Wheeler" value="Two Wheeler" />
            <Picker.Item label="Four Wheeler" value="Four Wheeler" />
          </Picker>
        </View>

        {/* VEHICLE NUMBER */}
        <TextInput
          placeholder="Vehicle Number"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.vehicleNumber}
          onChangeText={(v) => handleChange("vehicleNumber", v)}
        />

        {/* BRAND */}
        <TextInput
          placeholder="Brand"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.brand}
          onChangeText={(v) => handleChange("brand", v)}
        />

        {/* MODEL */}
        <TextInput
          placeholder="Model"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.model}
          onChangeText={(v) => handleChange("model", v)}
        />

        {/* ISSUE */}
        <TextInput
          placeholder="Issue"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={formData.issue}
          onChangeText={(v) => handleChange("issue", v)}
        />

        {/* ADDRESS */}
        <TextInput
          placeholder="Service Address"
          placeholderTextColor="#94a3b8"
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },

  title: {
    fontSize: 24,
    color: "#38bdf8",
    marginBottom: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    color: "#fff",

    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  picker: {
    color: "#ffffff",
    paddingHorizontal: 10,
  },

  pickerContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",

    overflow: "hidden",
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  buttonText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
