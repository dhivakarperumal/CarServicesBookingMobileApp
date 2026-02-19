import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({
        docId: d.id, // ✅ always unique
        ...d.data(),
      }));

      setProducts(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const inStock = item.totalStock > 0;

    return (
      <View style={styles.card}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.brand}>{item.brand}</Text>

          {/* PRICE SECTION */}
          <View style={styles.priceRow}>
            <Text style={styles.offerPrice}>₹ {item.offerPrice}</Text>
            <Text style={styles.mrp}>₹ {item.mrp}</Text>
            <Text style={styles.offer}>{item.offer}% OFF</Text>
          </View>

          {/* STOCK */}
          <Text
            style={[
              styles.stock,
              { color: inStock ? "#16a34a" : "#ef4444" },
            ]}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Text>

          {/* RATING */}
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Car Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.docId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },

  brand: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  offerPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#06b6d4",
    marginRight: 8,
  },

  mrp: {
    fontSize: 13,
    color: "#9ca3af",
    textDecorationLine: "line-through",
    marginRight: 6,
  },

  offer: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
  },

  stock: {
    fontSize: 12,
    fontWeight: "600",
  },

  rating: {
    fontSize: 12,
    color: "#f59e0b",
    marginTop: 2,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
