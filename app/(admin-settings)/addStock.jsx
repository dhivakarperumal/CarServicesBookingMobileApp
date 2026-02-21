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

  const selectedProduct = products.find(
    (p) => p.docId === selectedProductId
  );

  const selectedVariant =
    selectedProduct?.variants?.[selectedVariantIndex];

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
        0
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
    <View style={styles.container}>
      <Text style={styles.header}>Add Stock</Text>

      {/* 🔹 PRODUCT PICKER */}
      <Text style={styles.label}>Select Product</Text>

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedProductId}
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
          <Text style={styles.label}>Select Variant</Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedVariantIndex}
              onValueChange={(value) =>
                setSelectedVariantIndex(value)
              }
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
          <Text>
            Current Stock:{" "}
            <Text style={styles.blue}>{currentStock}</Text>
          </Text>

          <TextInput
            placeholder="Enter quantity to add"
            keyboardType="numeric"
            value={addQty}
            onChangeText={setAddQty}
            style={styles.input}
          />

          <Text>
            New Stock:{" "}
            <Text style={styles.green}>{newStock}</Text>
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
  );
}

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10,
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  stockBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  blue: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  green: {
    color: "#16a34a",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});