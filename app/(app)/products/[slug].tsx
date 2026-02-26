import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { auth, db } from "../../../firebase";

export default function ProductDetails() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const q = query(collection(db, "products"), where("slug", "==", slug));

      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = {
          docId: snap.docs[0].id,
          ...snap.docs[0].data(),
        };
        setProduct(data);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!product) return null;

  const variant = product.variants?.[selectedVariantIndex];
  const currentStock = variant?.stock || 0;

  const increaseQty = () => {
    if (currentStock === 0) {
      Toast.show({
        type: "error",
        text1: "Out of Stock",
        text2: "This product is currently unavailable",
      });
      return;
    }

    if (qty >= currentStock) {
      Toast.show({
        type: "warning",
        text1: "Stock Limit Reached",
        text2: `Only ${currentStock} items available`,
      });
      return;
    }

    setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleAddToCart = async () => {
    const user = auth.currentUser;

    if (!user) {
      Toast.show({
        type: "warning",
        text1: "Login Required",
        text2: "Please login to continue",
      });
      return;
    }

    if (currentStock === 0) {
      Toast.show({
        type: "error",
        text1: "Out of Stock",
        text2: "This product is currently unavailable",
      });
      return;
    }

    try {
      const cartRef = doc(db, "users", user.uid, "cart", product.docId);
      const existing = await getDoc(cartRef);

      if (existing.exists()) {
        const newQty = existing.data().quantity + qty;

        if (newQty > currentStock) {
          Toast.show({
            type: "warning",
            text1: "Stock Limit Reached",
            text2: `Only ${currentStock} items available`,
          });
          return;
        }

        await updateDoc(cartRef, {
          quantity: newQty,
        });
      } else {
        await setDoc(cartRef, {
          docId: product.docId,
          sku: variant.sku,
          name: product.name,
          price: product.offerPrice,
          image: product.images?.[0],
          quantity: qty,
          createdAt: serverTimestamp(),
        });
      }

      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: `${product.name} added successfully`,
      });

      router.push("/(app)/cart");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Please try again",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      {/* 🔥 PREMIUM BACK BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <LinearGradient
          colors={["rgba(14,165,233,0.95)", "rgba(37,99,235,0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backGradient}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 ,  paddingTop: 70}}
        showsVerticalScrollIndicator={false}
      >
        {/* IMAGE */}
        <Image
          source={{ uri: product.images?.[activeImage] }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* TITLE */}
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.offerPrice}>₹{product.offerPrice}</Text>
          <Text style={styles.mrp}>₹{product.mrp}</Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* PRODUCT INFO TABLE STYLE */}
        <View style={styles.infoContainer}>
          {/* SKU */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>SKU</Text>

            <View style={styles.skuBox}>
              <Picker
                selectedValue={selectedVariantIndex}
                onValueChange={(value) => {
                  setSelectedVariantIndex(value);
                  setQty(1);
                }}
                dropdownIconColor="#0EA5E9"
                style={styles.picker}
              >
                {product.variants.map((v: any, index: number) => (
                  <Picker.Item
                    key={index}
                    label={v.sku}
                    value={index}
                    color="#000"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* MATERIAL */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Material</Text>
            <Text style={styles.blueValue}>{variant?.material}</Text>
          </View>

          {/* POSITION */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Position</Text>
            <Text style={styles.blueValue}>{variant?.position}</Text>
          </View>
        </View>
        {/* QUANTITY */}
        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={decreaseQty} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{qty}</Text>

          <TouchableOpacity onPress={increaseQty} style={styles.qtyBtn}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* STOCK */}
        <Text style={styles.stock}>
          {currentStock > 0 ? `${currentStock} Available` : "Out of Stock"}
        </Text>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          {/* Add To Cart */}
          <TouchableOpacity
            style={{ flex: 1, marginRight: 8 }}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0EA5E9", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCartButton}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.gradientCartText}>Add To Cart</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Buy Now */}
          <TouchableOpacity
            style={{ flex: 1, marginLeft: 8 }}
            activeOpacity={0.8}
            onPress={() => {
              const user = auth.currentUser;

              if (!user) {
                Toast.show({
                  type: "warning",
                  text1: "Login Required",
                  text2: "Please login to continue",
                });
                return;
              }

              if (currentStock === 0) {
                Toast.show({
                  type: "error",
                  text1: "Out of Stock",
                  text2: "This product is currently unavailable",
                });
                return;
              }

              router.push({
                pathname: "/(app)/checkout",
                params: {
                  isBuyNow: "true",
                  docId: product.docId,
                  name: product.name,
                  price: product.offerPrice,
                  image: product.images?.[0],
                  sku: variant.sku,
                  quantity: qty,
                },
              });
            }}
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBuyButton}
            >
              <Ionicons name="flash-outline" size={18} color="#fff" />
              <Text style={styles.gradientBuyText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },

  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 100,
  },

  backGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 25,

    shadowColor: "#0EA5E9",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },

  backText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  mainImage: {
    width: "100%",
    height: 300,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  brand: {
    color: "#9CA3AF",
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  pickerWrapper: {
    backgroundColor: "#071420",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    marginTop: 10,
  },
  offerPrice: {
    color: "#0EA5E9",
    fontSize: 22,
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 30,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  label: {
    color: "#9CA3AF",
    fontSize: 17,
  },

  blueValue: {
    color: "#0EA5E9",
    fontSize: 18,
    fontWeight: "600",
  },

  /* Quantity */
  qtyWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  circleText: {
    color: "#0EA5E9",
    fontSize: 18,
    fontWeight: "bold",
  },

  qtyValue: {
    color: "#0EA5E9",
    fontSize: 18,
    fontWeight: "bold",
  },

  /* SKU Box */
  skuBox: {
    width: 190,
    backgroundColor: "#071420",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0EA5E9",
  },

  picker: {
    color: "#0EA5E9",
  },
  mrp: {
    color: "#6B7280",
    textDecorationLine: "line-through",
  },

  detailsContainer: {
    marginTop: 20,
    gap: 18,
  },

  stockValue: {
    fontSize: 18,
    fontWeight: "600",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
  },
  description: {
    color: "#CBD5E1",
    marginTop: 8,
  },
  qtyBtn: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 50,
  },
  qtyText: {
    color: "#0EA5E9",
    fontSize: 18,
  },
  qtyNumber: {
    color: "white",
    marginHorizontal: 20,
    fontSize: 18,
  },
  stock: {
    marginTop: 10,
    color: "#22C55E",
  },
  addBtn: {
    backgroundColor: "#0EA5E9",
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  btnText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  buyBtn: {
    borderWidth: 1,
    borderColor: "#0EA5E9",
    padding: 15,
    borderRadius: 30,
    marginTop: 15,
  },
  buyText: {
    textAlign: "center",
    color: "#0EA5E9",
    fontWeight: "bold",
  },
  gradientCartButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  gradientBuyButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  gradientCartText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  gradientBuyText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
  },
});
