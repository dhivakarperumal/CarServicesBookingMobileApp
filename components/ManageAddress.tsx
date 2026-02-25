import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { Modal } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const INDIAN_STATES = [
  "Tamil Nadu", "Kerala", "Karnataka", "Maharashtra",
  "Delhi", "Telangana", "Andhra Pradesh"
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  const clean = (val: string) =>
    val?.trim().toLowerCase();

  const handleSave = async () => {
    if (!user) return;

    let {
      fullName,
      phone,
      email,
      street,
      city,
      pinCode,
      state,
      country = "India",
    } = form;

    // ✅ Trim values
    fullName = fullName?.trim();
    phone = phone?.trim();
    email = email?.trim();
    street = street?.trim();
    city = city?.trim();
    pinCode = pinCode?.trim();
    state = state?.trim();

    if (!fullName || !phone || !street || !city || !pinCode || !state) {
      Toast.show({
        type: "warning",
        text1: "Validation Error",
        text2: "Please fill all required fields",
      });
      return;
    }

    try {
      setLoading(true);

      const ref = collection(db, "users", user.uid, "addresses");
      const snap = await getDocs(ref);

      const duplicate = snap.docs.some((doc) => {
        if (editId && doc.id === editId) return false; 

        const d = doc.data();
        return (
          clean(d.fullName) === clean(fullName) &&
          clean(d.phone) === clean(phone) &&
          clean(d.street) === clean(street) &&
          clean(d.city) === clean(city) &&
          clean(d.state) === clean(state) &&
          clean(d.pinCode) === clean(pinCode)
        );
      });

      if (duplicate) {
        Toast.show({
          type: "warning",
          text1: "Duplicate Address",
          text2: "This address already exists",
        });
        return;
      }

      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "addresses", editId),
          {
            fullName,
            phone,
            email,
            street,
            city,
            pinCode,
            state,
            country,
          }
        );
        Toast.show({
          type: "success",
          text1: "Updated Successfully",
          text2: "Address has been updated",
        });
      } else {
        await addDoc(ref, {
          fullName,
          phone,
          email,
          street,
          city,
          pinCode,
          state,
          country,
          createdAt: serverTimestamp(),
        });
        Toast.show({
          type: "success",
          text1: "Address Added",
          text2: "New address saved successfully",
        });
      }

      setForm(initialForm);
      setEditId(null);
      fetchAddresses();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Failed to save address",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", deleteId));
      fetchAddresses();

      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Address removed successfully",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Something went wrong",
      });
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (addr: any) => {
    setForm(addr);
    setEditId(addr.id);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#0B1120" }}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >

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
    <Ionicons name="create-outline" size={20} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.deleteBtn}
    onPress={() => {
      setDeleteId(item.id);
      setShowDeleteModal(true);
    }}
  >
    <MaterialIcons name="delete-outline" size={22} color="#fff" />
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
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Delete Address?</Text>
            <Text style={modalStyles.subtitle}>
              Are you sure you want to delete this address?
            </Text>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.deleteBtn}
                onPress={confirmDelete}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
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
    padding: 7,
    borderRadius: 25,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    padding: 6,
    borderRadius: 25,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: 10,
    marginRight: 10,
  },
 
  editBtn: {
  backgroundColor: "#4CAF50",
  padding: 10,
  borderRadius: 8,
  marginRight: 10,
},

deleteBtn: {
  backgroundColor: "#F44336",
  padding: 10,
  borderRadius: 8,
},
});