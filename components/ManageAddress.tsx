import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { Picker } from "@react-native-picker/picker";

const INDIAN_STATES = [
  "Tamil Nadu","Kerala","Karnataka","Maharashtra",
  "Delhi","Telangana","Andhra Pradesh"
];

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  pinCode: "",
  state: "",
  country: "India",
};

export default function ManageAddress() {
  const [form, setForm] = useState(initialForm);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const user = auth.currentUser;

  /* ================= FETCH ================= */
  const fetchAddresses = async () => {
    if (!user) return;

    const snap = await getDocs(
      collection(db, "users", user.uid, "addresses")
    );

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setAddresses(list);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!user) return;

    const { fullName, phone, street, city, pinCode, state } = form;
    if (!fullName || !phone || !street || !city || !pinCode || !state) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "addresses", editId),
          form
        );
        Alert.alert("Success", "Address updated");
      } else {
        await addDoc(
          collection(db, "users", user.uid, "addresses"),
          { ...form, createdAt: serverTimestamp() }
        );
        Alert.alert("Success", "Address added");
      }

      setForm(initialForm);
      setEditId(null);
      fetchAddresses();
    } catch {
      Alert.alert("Error", "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id: string) => {
    Alert.alert("Confirm", "Delete this address?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "users", user.uid, "addresses", id));
          fetchAddresses();
        },
      },
    ]);
  };

  /* ================= EDIT ================= */
  const handleEdit = (addr: any) => {
    setForm(addr);
    setEditId(addr.id);
  };

  return (
    <ScrollView style={{ flex: 1 }}>

      {/* ===== SAVED ADDRESSES ===== */}
      {addresses.length > 0 && (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.text}>
                {item.street}, {item.city}, {item.state} - {item.pinCode}
              </Text>
              <Text style={styles.text}>{item.phone}</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                >
                  <Text>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* ===== FORM ===== */}
     <TextInput
  placeholder="Full Name"
  placeholderTextColor="#9CA3AF"
  style={styles.input}
  value={form.fullName}
  onChangeText={(v) => setForm({ ...form, fullName: v })}
/>
      <TextInput
        placeholder="Phone"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={form.phone}
        onChangeText={(v) => setForm({ ...form, phone: v })}
      />

      <TextInput
  placeholder="Email"
  placeholderTextColor="#9CA3AF"
  style={styles.input}
  value={form.email}
  onChangeText={(v) => setForm({ ...form, email: v })}
  keyboardType="email-address"
/>

      <TextInput
        placeholder="Street"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={form.street}
        onChangeText={(v) => setForm({ ...form, street: v })}
      />

      <TextInput
        placeholder="City"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={form.city}
        onChangeText={(v) => setForm({ ...form, city: v })}
      />

      <TextInput
        placeholder="Pin Code"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={form.pinCode}
        onChangeText={(v) => setForm({ ...form, pinCode: v })}
      />

      <Picker
        selectedValue={form.state}
        onValueChange={(v) => setForm({ ...form, state: v })}
        style={styles.input}
      >
        <Picker.Item label="Select State" value="" />
        {INDIAN_STATES.map((s) => (
          <Picker.Item key={s} label={s} value={s} />
        ))}
      </Picker>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={{ fontWeight: "700" }}>
            {editId ? "Update Address" : "Add Address"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: { color: "#fff", fontWeight: "700" },
  text: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", marginTop: 8 },
  editBtn: {
    backgroundColor: "#0ea5e9",
    padding: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    padding: 6,
    borderRadius: 6,
  },
  input: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
});