import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

/* ================= COMPONENT ================= */
export default function ReviewsSettings() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    rating: 0,
    message: "",
    image: "",
  });

  /* 🔹 FETCH REVIEWS */
  const fetchReviews = async () => {
    const snap = await getDocs(collection(db, "reviews"));
    setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* 🔹 IMAGE PICKER */
  const handleImagePick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.3,
    });

    if (!res.canceled) {
      setForm((prev) => ({
        ...prev,
        image: `data:image/jpeg;base64,${res.assets[0].base64}`,
      }));
    }
  };

  /* 🔹 SAVE / UPDATE */
  const handleSubmit = async () => {
    if (!form.rating) {
      Alert.alert("Please select rating");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "reviews", editId), {
          ...form,
          rating: Number(form.rating),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "reviews"), {
          ...form,
          rating: Number(form.rating),
          status: false,
          createdAt: serverTimestamp(),
        });
      }

      setForm({ name: "", rating: 0, message: "", image: "" });
      setEditId(null);
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      console.log(err);
    }
  };

  /* 🔹 DELETE */
  const handleDelete = (id) => {
    Alert.alert("Delete Review?", "", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteDoc(doc(db, "reviews", id));
          fetchReviews();
        },
      },
    ]);
  };

  /* 🔹 TOGGLE STATUS */
  const toggleStatus = async (id, status) => {
    await updateDoc(doc(db, "reviews", id), {
      status: !status,
    });
    fetchReviews();
  };

  /* 🔹 FILTER */
  const filtered = reviews.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.message?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <TextInput
        placeholder="Search reviews..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.addText}>Add Review</Text>
      </TouchableOpacity>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* IMAGE */}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="image-outline" size={20} color="#9ca3af" />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>

              {/* STARS */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color={i <= item.rating ? "#facc15" : "#e5e7eb"}
                  />
                ))}
              </View>

              <Text style={styles.message}>{item.message}</Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => toggleStatus(item.id, item.status)}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={item.status ? "green" : "#9ca3af"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setEditId(item.id);
                  setForm(item);
                  setShowModal(true);
                }}
              >
                <MaterialIcons name="edit" size={22} color="#2563eb" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* MODAL */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>
            {editId ? "Edit Review" : "Add Review"}
          </Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <TouchableOpacity style={styles.imageBtn} onPress={handleImagePick}>
            <Text style={{ color: "#fff" }}>Pick Image</Text>
          </TouchableOpacity>

          {form.image && (
            <Image source={{ uri: form.image }} style={styles.preview} />
          )}

          {/* STARS */}
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name="star"
                size={28}
                color={i <= form.rating ? "#facc15" : "#e5e7eb"}
                onPress={() => setForm({ ...form, rating: i })}
              />
            ))}
          </View>

          <TextInput
            placeholder="Message"
            style={styles.input}
            multiline
            value={form.message}
            onChangeText={(t) => setForm({ ...form, message: t })}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={{ color: "#fff" }}>
                {editId ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "center",
  },

  addText: { color: "#fff", fontWeight: "600" },

  card: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  avatar: { width: 50, height: 50, borderRadius: 25 },

  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  name: { fontWeight: "600", fontSize: 15 },

  starRow: { flexDirection: "row", marginTop: 2 },

  message: { fontSize: 13, color: "#6b7280", marginTop: 4 },

  actions: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  modal: { flex: 1, backgroundColor: "#fff", padding: 16 },

  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  imageBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  preview: { width: 80, height: 80, borderRadius: 40, alignSelf: "center" },

  starPicker: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  saveBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 10,
  },
});