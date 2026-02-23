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
          form.password
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEdit ? "Edit Employee" : "Add Employee"}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
        />

        <TextInput
          placeholder="Phone"
          style={styles.input}
          keyboardType="number-pad"
          value={form.phone}
          onChangeText={(t) =>
            setForm({ ...form, phone: t, password: t })
          }
        />

        {!isEdit && (
          <TextInput
            placeholder="Generated Password"
            style={[styles.input, { backgroundColor: "#eee" }]}
            value={form.password}
            editable={false}
          />
        )}

        {/* ROLE */}
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={form.role}
            onValueChange={(v) => setForm({ ...form, role: v })}
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
          >
            <Picker.Item label="Select Shift" value="" />
            {shifts.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Salary"
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
          >
            <Picker.Item label="Select Gender" value="" />
            {genders.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>

        {/* DATE */}
        <TouchableOpacity
          onPress={() => setShowDate("dob")}
        >
          <TextInput
            placeholder="Date of Birth"
            style={styles.input}
            value={form.dob}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDate("joining")}
        >
          <TextInput
            placeholder="Joining Date"
            style={styles.input}
            value={form.joiningDate}
            editable={false}
          />
        </TouchableOpacity>

        {/* TIME */}
        <TouchableOpacity onPress={() => setShowTime("timeIn")}>
          <TextInput
            placeholder="Time In"
            style={styles.input}
            value={form.timeIn}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowTime("timeOut")}>
          <TextInput
            placeholder="Time Out"
            style={styles.input}
            value={form.timeOut}
            editable={false}
          />
        </TouchableOpacity>

        <TextInput
          placeholder="Address"
          style={[styles.input, { height: 100 }]}
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
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  container: { flex: 1, backgroundColor: "#f4f6f9", padding: 14 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },

  uploadBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  uploadText: { fontWeight: "bold" },

  saveBtn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },

  saveText: { color: "#fff", fontWeight: "bold" },
});