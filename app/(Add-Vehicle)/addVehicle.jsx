import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
  runTransaction,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { setDoc } from "firebase/firestore";

export default function AddServiceVehicle() {
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    vehicleNumber: "",
    brand: "",
    model: "",
    issue: "",
    address: "",
  });



  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // 🔹 Generate Auto Booking ID
  const generateAddVehicleId = async () => {
    const counterRef = doc(db, "counters", "addVehicleCounter");

    const serviceId = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(counterRef);
      let nextValue = snap.exists() ? snap.data().value + 1 : 1;

      transaction.set(counterRef, { value: nextValue }, { merge: true });

      return `AD${String(nextValue).padStart(3, "0")}`;
    });

    return serviceId;
  };

  // 🔹 Submit Form
  const handleSubmit = async () => {
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

      let uid = currentUser?.uid;

      // 🔹 1️⃣ If user NOT logged in → create Auth user
      if (!uid) {
        if (!formData.email) {
          Alert.alert("Email required", "Email is required for new user");
          setSubmitting(false);
          return;
        }

        // 🔐 Use phone as password
        const tempPassword = formData.phone.trim();

        if (tempPassword.length < 6) {
          Alert.alert("Invalid phone", "Phone must be at least 6 digits");
          setSubmitting(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          tempPassword
        );

        uid = cred.user.uid;

        // 🔹 Create users collection document
        await setDoc(doc(db, "users", uid), {
          username: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "user",
          active: true,
          createdAt: serverTimestamp(),
        });
      }

      // 🔹 2️⃣ Generate Booking ID
      const addVehicleId = await generateAddVehicleId();
      const now = new Date();

      // 🔹 3️⃣ Prepare Service Data
      const serviceData = {
        bookingId: addVehicleId,
        addVehicleId,
        uid,

        // User details
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,

        // Vehicle details
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        brand: formData.brand,
        model: formData.model,
        issue: formData.issue,

        // Status
        serviceStatus: "Approved",
        addVehicle: true,
        addVehicleStatus: "Pending",

        createdAt: serverTimestamp(),
        createdDate: now.toLocaleDateString("en-GB"),
        createdTime: now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // 🔹 4️⃣ Save Service
      await addDoc(collection(db, "allServices"), serviceData);

      Alert.alert("Success", `Service Created: ${addVehicleId}`);

      // 🔹 Reset vehicle fields
      setFormData((prev) => ({
        ...prev,
        vehicleType: "",
        vehicleNumber: "",
        brand: "",
        model: "",
        issue: "",
      }));

      router.replace("/(adminTabs)/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

 return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
  <View style={{ flex: 1, backgroundColor: "#020617" }}>
    {/* 🔹 HEADER */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#38bdf8" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Add Service Vehicle</Text>
    </View>

    {/* 🔹 FORM AREA */}
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TextInput
            placeholder="Customer Name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.name}
            onChangeText={(v) => handleChange("name", v)}
          />

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            keyboardType="numeric"
            value={formData.phone}
            onChangeText={(v) => handleChange("phone", v)}
          />

          <TextInput
            placeholder="Email (optional)"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
          />

          <TextInput
            placeholder="Service Address"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.address}
            onChangeText={(v) => handleChange("address", v)}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.vehicleType}
              onValueChange={(v) => handleChange("vehicleType", v)}
              dropdownIconColor="#38bdf8"
              style={{ color: "#fff" }}
            >
              <Picker.Item label="Select Vehicle Type" value="" />
              <Picker.Item label="Two Wheeler" value="Two Wheeler" />
              <Picker.Item label="Four Wheeler" value="Four Wheeler" />
            </Picker>
          </View>

          <TextInput
            placeholder="Vehicle Number"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.vehicleNumber}
            onChangeText={(v) => handleChange("vehicleNumber", v)}
          />

          <TextInput
            placeholder="Brand"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.brand}
            onChangeText={(v) => handleChange("brand", v)}
          />

          <TextInput
            placeholder="Model"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={formData.model}
            onChangeText={(v) => handleChange("model", v)}
          />

          <TextInput
            placeholder="Issue / Complaint"
            placeholderTextColor="#94a3b8"
            style={[styles.input, { height: 90 }]}
            multiline
            value={formData.issue}
            onChangeText={(v) => handleChange("issue", v)}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Saving..." : "Add Service"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#0f172a",
  },
  header: {
  height: 56,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#0f172a",
  backgroundColor: "#020617",
},

headerTitle: {
  color: "#38bdf8",
  fontSize: 18,
  fontWeight: "600",
  marginLeft: 16,
},
  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#020617",
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 16,
  },
});

