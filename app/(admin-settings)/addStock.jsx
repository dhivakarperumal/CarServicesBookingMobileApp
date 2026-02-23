import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddStock() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState("");
  const [addQty, setAddQty] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* 🔹 FETCH PRODUCTS */
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

  const selectedProduct = products.find((p) => p.docId === selectedProductId);

  const selectedVariant = selectedProduct?.variants?.[selectedVariantIndex];

  const currentStock = Number(selectedVariant?.stock || 0);
  const newStock = currentStock + Number(addQty || 0);

  /* 🔹 UPDATE STOCK */
  const handleUpdateStock = async () => {
    if (!selectedProductId || selectedVariantIndex === "") {
      alert("Select product and variant");
      return;
    }

    if (Number(addQty) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      setUpdating(true);

      const updatedVariants = selectedProduct.variants.map((v, i) => {
        if (i === Number(selectedVariantIndex)) {
          return {
            ...v,
            stock: newStock,
          };
        }
        return v;
      });

      const totalStock = updatedVariants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0,
      );

      await updateDoc(doc(db, "products", selectedProduct.docId), {
        variants: updatedVariants,
        totalStock,
      });

      alert("Stock added successfully");

      setSelectedProductId("");
      setSelectedVariantIndex("");
      setAddQty("");
    } catch (error) {
      console.log(error);
      alert("Stock update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            marginBottom: 14,
            color: "#38bdf8",
          }}
        >
          Add Stock
        </Text>

        {/* 🔹 PRODUCT PICKER */}
        <Text
          style={{
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 6,
          }}
        >
          Select Product
        </Text>

        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedProductId}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
            onValueChange={(value) => {
              setSelectedProductId(value);
              setSelectedVariantIndex("");
              setAddQty("");
            }}
          >
            <Picker.Item label="Select Product" value="" />
            {products.map((p) => (
              <Picker.Item
                key={p.docId}
                label={`${p.name} (Stock: ${p.totalStock || 0})`}
                value={p.docId}
              />
            ))}
          </Picker>
        </View>

        {/* 🔹 VARIANT PICKER */}
        {selectedProduct && (
          <>
            <Text
              style={{
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Select Variant
            </Text>

            <View style={styles.pickerBox}>
              <Picker
                selectedValue={selectedVariantIndex}
                dropdownIconColor="#38bdf8"
                style={{ color: "#fff" }}
                onValueChange={(value) => setSelectedVariantIndex(value)}
              >
                <Picker.Item label="Select Variant" value="" />

                {selectedProduct.variants?.map((v, i) => (
                  <Picker.Item
                    key={i}
                    label={`${v.position} | ${v.material} | SKU: ${v.sku} (Stock: ${v.stock})`}
                    value={i}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* 🔹 STOCK INFO */}
        {selectedVariant && (
          <View style={styles.stockBox}>
            <Text style={{ color: "#94a3b8" }}>
              Current Stock: <Text style={styles.blue}>{currentStock}</Text>
            </Text>

            <TextInput
              placeholder="Enter quantity to add"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={addQty}
              onChangeText={setAddQty}
              style={styles.input}
            />

            <Text style={{ color: "#94a3b8" }}>
              New Stock: <Text style={styles.green}>{newStock}</Text>
            </Text>
          </View>
        )}

        {/* 🔹 UPDATE BUTTON */}
        <TouchableOpacity
          onPress={handleUpdateStock}
          style={styles.button}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? "Updating..." : "Update Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
    color: "#38bdf8",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#94a3b8",
  },
  pickerBox: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    overflow: "hidden",
  },
  stockBox: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },
  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#0b3b6f",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    color: "#fff",
  },
  blue: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  green: {
    color: "#16a34a",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});
