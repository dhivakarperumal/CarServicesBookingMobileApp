import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ITEMS_PER_PAGE = 6;

export default function StockDetails() {
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [stockInputs, setStockInputs] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  /* FETCH PRODUCTS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* SEARCH */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* PAGINATION */
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  /* STOCK INPUT */
  const handleStockChange = (productId, index, value) => {
    setStockInputs((prev) => ({
      ...prev,
      [`${productId}-${index}`]: value,
    }));
  };

  /* UPDATE STOCK */
  const updateStock = async (product) => {
    try {
      const updatedVariants = product.variants.map((v, i) => {
        const key = `${product.docId}-${i}`;
        const addedStock = Number(stockInputs[key] || 0);

        return {
          ...v,
          stock: Number(v.stock) + addedStock,
        };
      });

      const totalStock = updatedVariants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0
      );

      await updateDoc(doc(db, "products", product.docId), {
        variants: updatedVariants,
        totalStock,
      });

      setStockInputs({});
      setExpanded(null);
      alert("Stock updated");
    } catch (error) {
      alert("Failed to update stock");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {/* SEARCH */}
      <TextInput
        placeholder="Search product..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setPage(1);
        }}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={paginatedProducts}
        keyExtractor={(item) => item.docId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>

            <Text>Variants: {item.variants?.length || 0}</Text>

            <Text>
              Total Stock:{" "}
              <Text
                style={{
                  color: item.totalStock < 5 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {item.totalStock || 0}
              </Text>
            </Text>

            {/* MANAGE BUTTON */}
            <TouchableOpacity
              onPress={() =>
                setExpanded(expanded === item.docId ? null : item.docId)
              }
              style={styles.manageBtn}
            >
              <Text style={{ color: "#000" }}>
                {expanded === item.docId ? "Hide" : "Manage"}
              </Text>
            </TouchableOpacity>

            {/* VARIANTS */}
            {expanded === item.docId && (
              <View style={{ marginTop: 10 }}>
                {item.variants?.map((v, i) => {
                  const key = `${item.docId}-${i}`;

                  return (
                    <View key={i} style={styles.variantCard}>
                      <Text>
                        {v.position} | {v.material}
                      </Text>

                      <Text>Stock: {v.stock}</Text>

                      <TextInput
                        placeholder="Add qty"
                        keyboardType="numeric"
                        value={stockInputs[key] || ""}
                        onChangeText={(text) =>
                          handleStockChange(item.docId, i, text)
                        }
                        style={styles.input}
                      />

                      <Text style={{ color: "green", fontWeight: "bold" }}>
                        New:{" "}
                        {Number(v.stock) +
                          Number(stockInputs[key] || 0)}
                      </Text>
                    </View>
                  );
                })}

                <TouchableOpacity
                  onPress={() => updateStock(item)}
                  style={styles.updateBtn}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Update Stock
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* PAGINATION */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => setPage((p) => p - 1)}
            style={styles.pageBtn}
          >
            <Text>Prev</Text>
          </TouchableOpacity>

          <Text>
            {page} / {totalPages}
          </Text>

          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage((p) => p + 1)}
            style={styles.pageBtn}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  manageBtn: {
    marginTop: 8,
    backgroundColor: "#e5e7eb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  variantCard: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  updateBtn: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pageBtn: {
    padding: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
});