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
      setForm({ ...form, image: `data:image/jpeg;base64,${res.assets[0].base64}` });
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {editId ? "Update Car Service" : "Add Car Service"}
      </Text>

      {/* NAME */}
      <TextInput
        placeholder="Service Name"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
        style={styles.input}
      />

      {/* PRICE */}
      <TextInput
        placeholder="Price ₹"
        keyboardType="numeric"
        value={form.price}
        onChangeText={(v) => setForm({ ...form, price: v })}
        style={styles.input}
      />

      {/* ICON */}
      <Text style={styles.label}>Select Icon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {iconOptions.map((i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.iconChip,
              form.icon === i && styles.iconChipActive,
            ]}
            onPress={() => setForm({ ...form, icon: i })}
          >
            <Text
              style={{
                color: form.icon === i ? "#fff" : "#111",
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
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
        style={styles.input}
      />

      {/* BIG DESCRIPTION */}
      <TextInput
        placeholder="Full Service Details"
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
          <TouchableOpacity onPress={() => removeField("sparePartsIncluded", i)}>
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
  container: { flex: 1, padding: 16, backgroundColor: "#f1f5f9" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: { marginBottom: 6, fontWeight: "600" },
  iconChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },
  iconChipActive: { backgroundColor: "#111827" },
  imageBtn: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  preview: { width: "100%", height: 150, borderRadius: 12, marginBottom: 10 },
  section: { fontWeight: "bold", marginTop: 10, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  remove: { marginLeft: 10, color: "red", fontWeight: "bold" },
  add: { color: "#2563eb", marginBottom: 10 },
  submit: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
});