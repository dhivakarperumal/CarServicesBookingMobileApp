import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebase";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(data);
    });

    return () => unsub();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <Text style={styles.price}>₹ {item.price}</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2} // ✅ 2 columns
        columnWrapperStyle={{ justifyContent: "space-between" }} // spacing
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No services available</Text>
        }
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },

  card: {
    width: "48%", // ✅ Important for 2-column layout
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.2)",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },

  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    marginBottom: 10,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0EA5E9",
    marginBottom: 10,
  },

  button: {
    borderWidth: 1,
    borderColor: "#0EA5E9",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#0EA5E9",
    fontWeight: "600",
    fontSize: 12,
  },

  empty: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 50,
  },
});