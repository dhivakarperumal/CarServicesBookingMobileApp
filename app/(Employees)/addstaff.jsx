import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";

const auth = getAuth();

const roles = [
  "Service Manager",
  "Mechanic",
  "Senior Mechanic",
  "Electrician",
  "Denter",
  "Painter",
  "Car Washer",
  "Receptionist",
  "Accountant",
];

const departments = [
  "Mechanical",
  "Electrical",
  "Body Shop",
  "Paint Booth",
  "Washing",
  "Front Office",
  "Accounts",
];

const shifts = [
  "Morning (9 AM - 6 PM)",
  "General (10 AM - 7 PM)",
  "Evening (12 PM - 9 PM)",
];

const genders = ["Male", "Female", "Other"];

export default function AddEditStaffScreen() {
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showDate, setShowDate] = useState(null);
  const [showTime, setShowTime] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    department: "",
    shift: "",
    salary: "",
    gender: "",
    dob: "",
    joiningDate: "",
    timeIn: "",
    timeOut: "",
    address: "",
    status: "active",
    photo: "",
  });

  /* ===== EMPLOYEE ID ===== */
  const generateEmployeeId = async () => {
    const ref = doc(db, "counters", "employees");
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const next = (snap.exists() ? snap.data().current : 0) + 1;
      tx.set(ref, { current: next }, { merge: true });
      return `EMP${String(next).padStart(3, "0")}`;
    });
  };

  /* ===== LOAD EDIT ===== */
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "employees", id));
        if (snap.exists()) {
          setForm((p) => ({ ...p, ...snap.data() }));
        }
      } catch (e) {
        Alert.alert("Error", "Failed to load employee");
      }
    };

    load();
  }, [id]);

  /* ===== IMAGE PICK ===== */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });

    if (!res.canceled) {
      setForm((p) => ({ ...p, photo: res.assets[0].base64 }));
    }
  };

  /* ===== VALIDATION ===== */
  const validate = () => {
    if (!form.name || !form.email || !form.phone) {
      Alert.alert("Error", "Name, Email, Phone required");
      return false;
    }

    if (!isEdit && form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (form.timeIn && form.timeOut && form.timeOut <= form.timeIn) {
      Alert.alert("Error", "Time Out must be after Time In");
      return false;
    }

    return true;
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let data = { ...form };

      if (!isEdit) {
        data.employeeId = await generateEmployeeId();

        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password,
        );

        data.authUid = cred.user.uid;
      }

      if (isEdit) {
        await updateDoc(doc(db, "employees", id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "employees"), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      Alert.alert("Success", isEdit ? "Updated" : "Added");
      router.replace("/(Employees)/employees");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== DATE / TIME ===== */
  const handleDate = (field, date) => {
    const value = date.toISOString().split("T")[0];
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleTime = (field, time) => {
    const value = time.toTimeString().slice(0, 5);
    setForm((p) => ({ ...p, [field]: value }));
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#38bdf8" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Employee" : "Add Employee"}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>

<ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 200 }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#64748b"
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#64748b"
          style={styles.input}
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        <TextInput
          placeholder="Phone"
          placeholderTextColor="#64748b"
          style={styles.input}
          keyboardType="number-pad"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t, password: t })}
        />

        {!isEdit && (
          <TextInput
            placeholder="Generated Password"
            placeholderTextColor="#64748b"
            style={[styles.input, { backgroundColor: "#0f172a" }]}
            value={form.password}
            editable={false}
          />
        )}

        {/* ROLE */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={form.role}
            onValueChange={(v) => setForm({ ...form, role: v })}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Role" value="" />
            {roles.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>

        {/* DEPARTMENT */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={form.department}
            onValueChange={(v) => setForm({ ...form, department: v })}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Department" value="" />
            {departments.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>

        {/* SHIFT */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={form.shift}
            onValueChange={(v) => setForm({ ...form, shift: v })}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Shift" value="" />
            {shifts.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Salary"
          placeholderTextColor="#64748b"
          style={styles.input}
          keyboardType="numeric"
          value={form.salary}
          onChangeText={(t) => setForm({ ...form, salary: t })}
        />

        {/* GENDER */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(v) => setForm({ ...form, gender: v })}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Gender" value="" />
            {genders.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>

        {/* DATE */}
        <TouchableOpacity onPress={() => setShowDate("dob")}>
          <TextInput
            placeholder="Date of Birth"
            placeholderTextColor="#64748b"
            style={styles.input}
            value={form.dob}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowDate("joining")}>
          <TextInput
            placeholder="Joining Date"
            placeholderTextColor="#64748b"
            style={styles.input}
            value={form.joiningDate}
            editable={false}
          />
        </TouchableOpacity>

        {/* TIME */}
        <TouchableOpacity onPress={() => setShowTime("timeIn")}>
          <TextInput
            placeholder="Time In"
            placeholderTextColor="#64748b"
            style={styles.input}
            value={form.timeIn}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowTime("timeOut")}>
          <TextInput
            placeholder="Time Out"
            placeholderTextColor="#64748b"
            style={styles.input}
            value={form.timeOut}
            editable={false}
          />
        </TouchableOpacity>

        <TextInput
          placeholder="Address"
          placeholderTextColor="#64748b"
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          multiline
          value={form.address}
          onChangeText={(t) => setForm({ ...form, address: t })}
        />

        {/* PHOTO */}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadText}>
            {form.photo ? "Photo Selected" : "Upload Photo"}
          </Text>
        </TouchableOpacity>

        {/* SAVE */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Employee"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* DATE PICKERS */}
      {showDate === "dob" && (
        <DateTimePicker
          mode="date"
          value={new Date()}
          onChange={(e, d) => {
            setShowDate(null);
            if (d) handleDate("dob", d);
          }}
        />
      )}

      {showDate === "joining" && (
        <DateTimePicker
          mode="date"
          value={new Date()}
          onChange={(e, d) => {
            setShowDate(null);
            if (d) handleDate("joiningDate", d);
          }}
        />
      )}

      {showTime === "timeIn" && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          onChange={(e, d) => {
            setShowTime(null);
            if (d) handleTime("timeIn", d);
          }}
        />
      )}

      {showTime === "timeOut" && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          onChange={(e, d) => {
            setShowTime(null);
            if (d) handleTime("timeOut", d);
          }}
        />
      )}
    </SafeAreaView>
  );
}

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
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  input: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  pickerBox: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    overflow: "hidden",
  },

  uploadBtn: {
    backgroundColor: "#020617",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  uploadText: {
    color: "#38bdf8",
    fontWeight: "700",
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 60,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});
