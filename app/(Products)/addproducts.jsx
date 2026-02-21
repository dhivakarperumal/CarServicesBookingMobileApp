import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { db } from "../../firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    getDocs,
    getDoc,
} from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddProduct() {
    const router = useRouter();
    const { editId } = useLocalSearchParams();

    const [loading, setLoading] = useState(false);

    const [product, setProduct] = useState({
        name: "",
        brand: "",
        description: "",
        mrp: "",
        offer: "",
        offerPrice: "",
        rating: "",
        isFeatured: false,
        isActive: true,

        warrantyAvailable: false,
        warrantyMonths: "",
        returnAvailable: false,
        returnDays: "",
        tags: "",
    });

    const [variants, setVariants] = useState([
        { sku: "", position: "", material: "", stock: "" },
    ]);

    const [images, setImages] = useState([]);

    /* 🔄 AUTO OFFER PRICE */
    useEffect(() => {
        const mrp = Number(product.mrp || 0);
        const offer = Number(product.offer || 0);

        if (mrp && offer >= 0) {
            const price = mrp - (mrp * offer) / 100;
            setProduct((p) => ({ ...p, offerPrice: price.toFixed(2) }));
        }
    }, [product.mrp, product.offer]);

    /* 📷 PICK IMAGE */
    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            quality: 0.4,
        });

        if (!res.canceled) {
            const base64 = `data:image/jpeg;base64,${res.assets[0].base64}`;
            setImages((prev) => [...prev, base64]);
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    /* ➕ ADD VARIANT */
    const addVariant = () => {
        setVariants([
            ...variants,
            { sku: "", position: "", material: "", stock: "" },
        ]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, key, value) => {
        const list = [...variants];
        list[index][key] = value;
        setVariants(list);
    };

    /* 🆔 GENERATE PRODUCT ID */
    const generateProductId = async () => {
        const snap = await getDocs(collection(db, "products"));
        return `PR${String(snap.size + 1).padStart(3, "0")}`;
    };


    useEffect(() => {
  if (!editId) return;

  const loadProduct = async () => {
    try {
      const snap = await getDoc(doc(db, "products", editId));

      if (snap.exists()) {
        const data = snap.data();

        setProduct({
          name: data.name || "",
          brand: data.brand || "",
          description: data.description || "",
          mrp: String(data.mrp || ""),
          offer: String(data.offer || ""),
          offerPrice: String(data.offerPrice || ""),
          rating: String(data.rating || ""),
          isFeatured: data.isFeatured || false,
          isActive: data.isActive ?? true,

          warrantyAvailable: data.warranty?.available || false,
          warrantyMonths: String(data.warranty?.months || ""),
          returnAvailable: data.returnPolicy?.available || false,
          returnDays: String(data.returnPolicy?.days || ""),
          tags: data.tags?.join(", ") || "",
        });

        setVariants(
          data.variants?.map((v) => ({
            sku: v.sku || "",
            position: v.position || "",
            material: v.material || "",
            stock: String(v.stock || ""),
          })) || [{ sku: "", position: "", material: "", stock: "" }]
        );

        setImages(data.images || []);
      }
    } catch (err) {
      console.log("Load edit error:", err);
      Alert.alert("Error", "Failed to load product");
    }
  };

  loadProduct();
}, [editId]);
    /* 💾 SAVE PRODUCT */
const handleSave = async () => {
  if (!product.name) {
    Alert.alert("Error", "Product name required");
    return;
  }

  setLoading(true);

  try {
    let productId = null;

    // ✅ Only generate ID for NEW product
    if (!editId) {
      productId = await generateProductId();
    }

    const totalStock = variants.reduce(
      (sum, v) => sum + Number(v.stock || 0),
      0
    );

    const data = {
      ...product,

      // ✅ Only set id for new product
      ...(productId && { id: productId }),

      mrp: Number(product.mrp),
      offer: Number(product.offer),
      offerPrice: Number(product.offerPrice),
      rating: Number(product.rating || 0),

      warranty: {
        available: product.warrantyAvailable,
        months: product.warrantyAvailable
          ? Number(product.warrantyMonths || 0)
          : 0,
      },

      returnPolicy: {
        available: product.returnAvailable,
        days: product.returnAvailable
          ? Number(product.returnDays || 0)
          : 0,
      },

      tags: product.tags
        ? product.tags.split(",").map((t) => t.trim())
        : [],

      variants: variants.map((v) => ({
        ...v,
        stock: Number(v.stock),
      })),

      images,
      thumbnail: images[0] || "",
      totalStock,

      updatedAt: serverTimestamp(),
    };

    if (editId) {
      // ✅ UPDATE EXISTING
      await updateDoc(doc(db, "products", editId), data);
    } else {
      // ✅ CREATE NEW
      await addDoc(collection(db, "products"), {
        ...data,
        createdAt: serverTimestamp(),
      });
    }

    Alert.alert("Success", editId ? "Product updated" : "Product saved");
    router.back();
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Failed to save product");
  }

  setLoading(false);
};

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
            {/* 🔷 HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {editId ? "Update Product" : "Add Product"}
                </Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container}>
                {/* BASIC */}
                <Input
                    label="Product Name"
                    value={product.name}
                    onChangeText={(t) => setProduct({ ...product, name: t })}
                />

                <Input
                    label="Brand"
                    value={product.brand}
                    onChangeText={(t) => setProduct({ ...product, brand: t })}
                />

                <Input
                    label="Description"
                    value={product.description}
                    onChangeText={(t) => setProduct({ ...product, description: t })}
                    multiline
                />

                {/* PRICE */}
                <Input
                    label="MRP"
                    value={product.mrp}
                    onChangeText={(t) => setProduct({ ...product, mrp: t })}
                    keyboardType="numeric"
                />

                <Input
                    label="Offer %"
                    value={product.offer}
                    onChangeText={(t) => setProduct({ ...product, offer: t })}
                    keyboardType="numeric"
                />

                <Input label="Offer Price" value={product.offerPrice} editable={false} />

                <Input
                    label="Rating"
                    value={product.rating}
                    onChangeText={(t) => setProduct({ ...product, rating: t })}
                    keyboardType="numeric"
                />

                {/* VARIANTS */}
                <Text style={styles.section}>Variants</Text>

                {variants.map((v, i) => (
                    <View key={i} style={styles.variantCard}>
                        <Input
                            placeholder="SKU"
                            value={v.sku}
                            onChangeText={(t) => handleVariantChange(i, "sku", t)}
                        />
                        <Input
                            placeholder="Position"
                            value={v.position}
                            onChangeText={(t) => handleVariantChange(i, "position", t)}
                        />
                        <Input
                            placeholder="Material"
                            value={v.material}
                            onChangeText={(t) => handleVariantChange(i, "material", t)}
                        />
                        <Input
                            placeholder="Stock" 
                            value={v.stock}
                            keyboardType="numeric"
                            onChangeText={(t) => handleVariantChange(i, "stock", t)}
                        />

                        <TouchableOpacity onPress={() => removeVariant(i)}>
                            <Text style={styles.remove}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addVariant}>
                    <Text style={styles.addText}>+ Add Variant</Text>
                </TouchableOpacity>

                {/* IMAGES */}
                <Text style={styles.section}>Images</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <Text>Select Image</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((img, i) => (
                        <View key={i} style={{ marginRight: 10 }}>
                            <Image source={{ uri: img }} style={styles.preview} />
                            <TouchableOpacity onPress={() => removeImage(i)}>
                                <Text style={styles.remove}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* WARRANTY */}
                <Text style={styles.section}>Warranty</Text>

                <View style={styles.switchRow}>
                    <Text style={{ color: "#fff" }}>Warranty Available</Text>
                    <Switch
                        value={product.warrantyAvailable}
                        onValueChange={(v) =>
                            setProduct({ ...product, warrantyAvailable: v })
                        }
                    />
                </View>

                {product.warrantyAvailable && (
                    <Input
                        label="Warranty Months"
                        value={product.warrantyMonths}
                        keyboardType="numeric"
                        onChangeText={(t) =>
                            setProduct({ ...product, warrantyMonths: t })
                        }
                    />
                )}

                {/* RETURN */}
                <Text style={styles.section}>Return Policy</Text>

                <View style={styles.switchRow}>
                    <Text style={{ color: "#fff" }}>Return Available</Text>
                    <Switch
                        value={product.returnAvailable}
                        onValueChange={(v) =>
                            setProduct({ ...product, returnAvailable: v })
                        }
                    />
                </View>

                {product.returnAvailable && (
                    <Input
                        label="Return Days"
                        value={product.returnDays}
                        keyboardType="numeric"
                        onChangeText={(t) =>
                            setProduct({ ...product, returnDays: t })
                        }
                    />
                )}

                {/* TAGS */}
                <Input
                    label="Tags (comma separated)"
                    value={product.tags}
                    onChangeText={(t) => setProduct({ ...product, tags: t })}
                />

                {/* SWITCHES */}
                <View style={styles.switchRow}>
                    <Text style={{ color: "#fff" }}>Featured</Text>
                    <Switch
                        value={product.isFeatured}
                        onValueChange={(v) =>
                            setProduct({ ...product, isFeatured: v })
                        }
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={{ color: "#fff" }}>Active</Text>
                    <Switch
                        value={product.isActive}
                        onValueChange={(v) =>
                            setProduct({ ...product, isActive: v })
                        }
                    />
                </View>

                {/* SAVE */}
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveText}>
                        {loading ? "Saving..." : "Save Product"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

/* 🧩 INPUT */
const Input = ({ label, ...props }) => (
    <View style={{ marginBottom: 12 }}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={styles.input}
            placeholderTextColor="#9ca3af"
            {...props}
        />
    </View>
);

/* 🎨 STYLES */
const styles = StyleSheet.create({
  /* 🔷 HEADER */
  header: {
    height: 56,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#0b3b6f",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  /* MAIN FORM */
  container: {
    backgroundColor: "#020617",
    padding: 14,
    paddingBottom: 40,
  },

  label: {
    color: "#cbd5f5",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  section: {
    color: "#38bdf8",
    marginTop: 18,
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 14,
  },

  variantCard: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  remove: {
    color: "#ef4444",
    marginTop: 6,
    fontWeight: "500",
  },

  addBtn: {
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },

  imagePicker: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  preview: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});