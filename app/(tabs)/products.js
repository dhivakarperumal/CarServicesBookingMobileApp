import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebase";
import { useRouter } from "expo-router";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({
        docId: d.id,
        ...d.data(),
      }));

      setProducts(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const inStock = item.totalStock > 0;

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}

          {/* OFFER BADGE */}
          {item.offer > 0 && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>{item.offer}% OFF</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{item.name}</Text>

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.offerPrice}>₹ {item.offerPrice}</Text>
          <Text style={styles.mrp}>₹ {item.mrp}</Text>
        </View>

        <View style={styles.brandRatingRow}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>




        {/* <Text style={styles.discount}>{item.offer}% OFF</Text> */}

        {/* STOCK */}
        {/* <Text style={[styles.stock, inStock ? styles.inStock : styles.outStock]}>
          {inStock ? "In Stock" : "Out of Stock"}
        </Text> */}



        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/products/${item.slug}`)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
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
        numColumns={2} // ✅ 2 per row
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  imageContainer: {
    position: "relative",
    marginBottom: 10,
  },

  offerBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  offerBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  brandRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1120",
  },

  card: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.2)",
  },

  image: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    marginBottom: 10,
  },

  imagePlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    marginBottom: 10,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  brand: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 6,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
  },

  offerPrice: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 6,
  },

  mrp: {
    color: "#64748B",
    fontSize: 11,
    textDecorationLine: "line-through",
  },

  discount: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },

  stock: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },

  inStock: {
    color: "#22C55E",
  },

  outStock: {
    color: "#EF4444",
  },

  rating: {
    color: "#FBBF24",
    fontSize: 11,
    marginBottom: 8,
  },

  button: {
    borderWidth: 1,
    borderColor: "#0EA5E9",
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
  },
});