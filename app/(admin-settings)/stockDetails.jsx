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
import { SafeAreaView } from "react-native-safe-area-context";

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
      p.name?.toLowerCase().includes(search.toLowerCase()),
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
        0,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <View style={{ flex: 1, backgroundColor: "#020617", padding: 12 }}>
        {/* SEARCH */}
        <TextInput
          placeholder="Search product..."
          placeholderTextColor="#9ca3af"
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

              <Text style={{ color: "#94a3b8" }}>
                Variants: {item.variants?.length || 0}
              </Text>

              <Text style={{ color: "#94a3b8" }}>
                Total Stock:{" "}
                <Text
                  style={{
                    color: item.totalStock < 5 ? "#ef4444" : "#16a34a",
                    fontWeight: "700",
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
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          {v.position} | {v.material}
                        </Text>

                        <Text style={{ color: "#94a3b8" }}>
                          Stock: {v.stock}
                        </Text>

                        <TextInput
                          placeholder="Add qty"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={stockInputs[key] || ""}
                          onChangeText={(text) =>
                            handleStockChange(item.docId, i, text)
                          }
                          style={styles.input}
                        />

                        <Text style={{ color: "#16a34a", fontWeight: "700" }}>
                          New: {Number(v.stock) + Number(stockInputs[key] || 0)}
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
              <Text style={{ color: "#fff" }}>Prev</Text>
            </TouchableOpacity>

            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {page} / {totalPages}
            </Text>

            <TouchableOpacity
              disabled={page === totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={styles.pageBtn}
            >
              <Text style={{ color: "#fff" }}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  search: {
    backgroundColor: "#0f172a",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#0b3b6f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: "800",
    fontSize: 16,
    color: "#38bdf8",
  },
  manageBtn: {
    marginTop: 10,
    backgroundColor: "#020617",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  variantCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#0b3b6f",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  updateBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
});
