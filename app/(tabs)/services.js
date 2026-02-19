import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>₹ {item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No services available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#ecfeff",
    borderRadius: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  price: {
    fontSize: 14,
    color: "#374151",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9ca3af",
  },
});
