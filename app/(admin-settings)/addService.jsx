import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  doc,
  collection,
  setDoc,
  updateDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useLocalSearchParams, useRouter } from "expo-router";

/* 🔢 ICON OPTIONS (text only for mobile) */
const iconOptions = ["Car", "Wrench", "Settings", "ShieldCheck"];

export default function AddService() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    bigDescription: "",
    icon: "Car",
    image: "",
    supportedBrands: [""],
    sparePartsIncluded: [""],
    status: "active",
  });

  /* 🔢 GENERATE SERVICE CODE */
  const generateServiceCode = async () => {
    const counterRef = doc(db, "counters", "serviceCounter");

    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      const next = (snap.exists() ? snap.data().current : 0) + 1;
      tx.set(counterRef, { current: next }, { merge: true });
      return `SE${String(next).padStart(3, "0")}`;
    });
  };

  /* 🔄 FETCH FOR EDIT */
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      const snap = await getDoc(doc(db, "services", id));

      if (snap.exists()) {
        const data = snap.data();

        setForm({
          name: data.name || "",
          price: String(data.price || ""),
          description: data.description || "",
          bigDescription: data.bigDescription || "",
          icon: data.icon || "Car",
          image: data.image || "",
          supportedBrands: data.supportedBrands?.length
            ? data.supportedBrands
            : [""],
          sparePartsIncluded: data.sparePartsIncluded?.length
            ? data.sparePartsIncluded
            : [""],
          status: data.status || "active",
        });

        setEditId(id);
      }
    };

    fetchService();
  }, [id]);

  /* 📷 IMAGE PICKER */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (!res.canceled) {
      setForm({
        ...form,
        image: `data:image/jpeg;base64,${res.assets[0].base64}`,
      });
    }
  };

  /* 🔧 ARRAY HANDLERS */
  const updateArray = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const removeField = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  /* ➕ SUBMIT */
  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      Alert.alert("Error", "Name and price required");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        await updateDoc(doc(db, "services", editId), {
          ...form,
          price: Number(form.price),
          supportedBrands: form.supportedBrands.filter((b) => b.trim()),
          sparePartsIncluded: form.sparePartsIncluded.filter((p) => p.trim()),
          updatedAt: serverTimestamp(),
        });

        Alert.alert("Success", "Service updated");
      } else {
        const code = await generateServiceCode();
        const docRef = doc(collection(db, "services"));

        await setDoc(docRef, {
          docRefId: docRef.id,
          code,
          ...form,
          price: Number(form.price),
          supportedBrands: form.supportedBrands.filter((b) => b.trim()),
          sparePartsIncluded: form.sparePartsIncluded.filter((p) => p.trim()),
          createdAt: serverTimestamp(),
        });

        Alert.alert("Success", "Service added");
      }

      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>
        {editId ? "Update Car Service" : "Add Car Service"}
      </Text>

      {/* NAME */}
      <TextInput
        placeholder="Service Name"
        placeholderTextColor="#64748b"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
        style={styles.input}
      />

      {/* PRICE */}
      <TextInput
        placeholder="Price ₹"
        placeholderTextColor="#64748b"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(v) => setForm({ ...form, price: v })}
        style={styles.input}
      />

      {/* ICON */}
      <Text style={styles.label}>Select Icon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} >
        {iconOptions.map((i) => (
          <TouchableOpacity
            key={i}
            style={[styles.iconChip, form.icon === i && styles.iconChipActive]}
            onPress={() => setForm({ ...form, icon: i })}
          >
            <Text
              style={{
                color: form.icon === i ? "#020617" : "#94a3b8",
                fontWeight: "600",
              }}
            >
              {i}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* DESCRIPTION */}
      <TextInput
        placeholder="Short Description"
        placeholderTextColor="#64748b"
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
        style={styles.input}
      />

      {/* BIG DESCRIPTION */}
      <TextInput
        placeholder="Full Service Details"
        placeholderTextColor="#64748b"
        value={form.bigDescription}
        onChangeText={(v) => setForm({ ...form, bigDescription: v })}
        style={[styles.input, { height: 100 }]}
        multiline
      />

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text style={{ color: "#fff" }}>Upload Image</Text>
      </TouchableOpacity>

      {form.image ? (
        <Image source={{ uri: form.image }} style={styles.preview} />
      ) : null}

      {/* BRANDS */}
      <Text style={styles.section}>Supported Brands</Text>
      {form.supportedBrands.map((b, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={b}
            onChangeText={(v) => updateArray("supportedBrands", i, v)}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity onPress={() => removeField("supportedBrands", i)}>
            <Text style={styles.remove}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => addField("supportedBrands")}>
        <Text style={styles.add}>+ Add Brand</Text>
      </TouchableOpacity>

      {/* SPARES */}
      <Text style={styles.section}>Spare Parts Included</Text>
      {form.sparePartsIncluded.map((b, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={b}
            onChangeText={(v) => updateArray("sparePartsIncluded", i, v)}
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={() => removeField("sparePartsIncluded", i)}
          >
            <Text style={styles.remove}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => addField("sparePartsIncluded")}>
        <Text style={styles.add}>+ Add Spare</Text>
      </TouchableOpacity>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>
            {editId ? "Update Service" : "Add Service"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },

  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
    color: "#fff",
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#38bdf8",
  },

  iconChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  iconChipActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },

  imageBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  preview: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  section: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#fff",
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  remove: {
    marginLeft: 12,
    color: "#ef4444",
    fontWeight: "700",
  },

  add: {
    color: "#38bdf8",
    marginBottom: 14,
    fontWeight: "600",
  },

  submit: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40, // 👈 ADD THIS
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
