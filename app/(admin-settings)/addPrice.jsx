import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AddPrice() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState([""]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔄 FETCH FOR EDIT */
  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;

      const snap = await getDoc(doc(db, "pricingPackages", id));

      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setPrice(String(data.price || ""));
        setFeatures(data.features?.length ? data.features : [""]);
        setEditId(id);
      } else {
        Alert.alert("Error", "Package not found");
        router.back();
      }
    };

    fetchPackage();
  }, [id]);

  /* 🔹 FEATURE HANDLERS */
  const handleFeatureChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const addFeatureField = () => setFeatures((prev) => [...prev, ""]);

  const removeFeatureField = (index) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated.length ? updated : [""]);
  };

  /* 🔹 SUBMIT */
  const handleSubmit = async () => {
    if (!title.trim() || !price) {
      Alert.alert("Error", "Title & Price required");
      return;
    }

    const cleanFeatures = features
      .map((f) => f.trim())
      .filter((f) => f !== "");

    if (!cleanFeatures.length) {
      Alert.alert("Error", "Add at least one feature");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        /* 🔄 UPDATE */
        await updateDoc(doc(db, "pricingPackages", editId), {
          title: title.trim(),
          price: Number(price),
          features: cleanFeatures,
          updatedAt: serverTimestamp(),
        });

        Alert.alert("Success", "Package updated");
      } else {
        /* ➕ ADD */
        await addDoc(collection(db, "pricingPackages"), {
          title: title.trim(),
          price: Number(price),
          features: cleanFeatures,
          createdAt: serverTimestamp(),
        });

        Alert.alert("Success", "Package added");
      }

      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {editId ? "Update Package" : "Add Package"}
      </Text>

      {/* TITLE */}
      <TextInput
        placeholder="Package Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* PRICE */}
      <TextInput
        placeholder="Price ₹"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* FEATURES */}
      <View style={styles.featureHeader}>
        <Text style={styles.section}>Features</Text>

        <TouchableOpacity style={styles.addBtn} onPress={addFeatureField}>
          <Text style={{ color: "#fff" }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {features.map((f, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            placeholder={`Feature ${i + 1}`}
            value={f}
            onChangeText={(v) => handleFeatureChange(i, v)}
            style={[styles.input, { flex: 1 }]}
          />

          <TouchableOpacity onPress={() => removeFeatureField(i)}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff" }}>
            {editId ? "Update Package" : "Save Package"}
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
  section: { fontWeight: "bold", fontSize: 15 },
  featureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  remove: {
    marginLeft: 10,
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  submit: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
});