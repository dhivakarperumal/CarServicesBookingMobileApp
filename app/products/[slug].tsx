import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

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
            const q = query(
                collection(db, "products"),
                where("slug", "==", slug)
            );

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
        if (qty < currentStock) setQty(qty + 1);
    };

    const decreaseQty = () => {
        if (qty > 1) setQty(qty - 1);
    };

    const handleAddToCart = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Login Required", "Please login first");
            return;
        }

        const cartRef = doc(db, "users", user.uid, "cart", product.docId);
        const existing = await getDoc(cartRef);

        if (existing.exists()) {
            await updateDoc(cartRef, {
                quantity: existing.data().quantity + qty,
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

        router.push("/cart");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
                    {currentStock > 0
                        ? `${currentStock} Available`
                        : "Out of Stock"}
                </Text>

                {/* BUTTONS */}
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleAddToCart}
                >
                    <Text style={styles.btnText}>Add To Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() => router.push("/checkout")}
                >
                    <Text style={styles.buyText}>Buy Now</Text>
                </TouchableOpacity>

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

    detailsContainer: {
        marginTop: 25,
    },

    pickerWrapper: {
        width: 170,
        backgroundColor: "#071420",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#0EA5E9",
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

    stockValue: {
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
    pickerWrapper: {
        backgroundColor: "#111827",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.3)",
        marginTop: 10,
    },

    picker: {
        color: "#FFFFFF",   // selected value color
    },
    detailsContainer: {
        marginTop: 20,
        gap: 18,
    },

    label: {
        color: "#9CA3AF",
        fontSize: 16,
    },

    stockValue: {
        fontSize: 18,
        fontWeight: "600",
    },

    blueValue: {
        color: "#0EA5E9",
        fontSize: 18,
        fontWeight: "600",
    },

    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },

    circleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
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

    pickerWrapper: {
        backgroundColor: "#071420",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#0EA5E9",
    },

    picker: {
        color: "#0EA5E9",
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
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
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
});