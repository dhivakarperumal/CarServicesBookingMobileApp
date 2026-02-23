import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";

export default function Cart() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const user = auth.currentUser;

    const handleBack = () => {
        // prefer router.canGoBack if available
        if (typeof router.canGoBack === "function") {
            if (router.canGoBack()) return router.back();
            return router.replace("/(tabs)/index");
        }

        // fallback: try back then replace to home
        try {
            router.back();
            // no reliable way to detect failure synchronously, so also ensure safe fallback
        } catch (e) {
            router.replace("/(tabs)/index");
        }
    };

    useEffect(() => {
        if (!user) return;

        const unsub = onSnapshot(
            collection(db, "users", user.uid, "cart"),
            (snap) => {
                const data = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setItems(data);
                setLoading(false);
            }
        );

        return unsub;
    }, [user]);

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <Text style={styles.emptyText}>Please login to view cart</Text>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#0EA5E9" />
            </SafeAreaView>
        );
    }

    const increase = async (item: any) => {
        await updateDoc(doc(db, "users", user.uid, "cart", item.id), {
            quantity: item.quantity + 1,
        });
    };

    const decrease = async (item: any) => {
        if (item.quantity <= 1) return;
        await updateDoc(doc(db, "users", user.uid, "cart", item.id), {
            quantity: item.quantity - 1,
        });
    };

    const remove = async (item: any) => {
        await deleteDoc(doc(db, "users", user.uid, "cart", item.id));
    };

    const subtotal = items.reduce(
        (t, i) => t + i.price * i.quantity,
        0
    );

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹ {item.price}</Text>

                <View style={styles.qtyRow}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => decrease(item)}
                    >
                        <Text style={styles.qtyText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyNumber}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => increase(item)}
                    >
                        <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={() => remove(item)}>
                <FontAwesome name="trash" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {items.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>Your cart is empty</Text>

                    <TouchableOpacity
                        style={styles.shopBtn}
                        onPress={() => router.push("/(tabs)/products")}
                    >
                        <Text style={styles.shopText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <Text style={styles.heading}>My Cart</Text>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />

                    {/* ORDER SUMMARY */}
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹ {subtotal}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={{ color: "#22C55E" }}>Free</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.totalText}>Total</Text>
                            <Text style={styles.totalPrice}>₹ {subtotal}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => router.push("/(app)/checkout")}
                        >
                            <Text style={styles.checkoutText}>
                                Proceed To Checkout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                {/* <Ionicons name="arrow-back" size={18} color="#0EA5E9" /> */}
                {/* <Text style={styles.backText}></Text> */}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1120",
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        gap: 6,
    },

    backText: {
        color: "#0EA5E9",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        marginLeft: 6,
    },
    heading: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 15,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
        marginBottom: 20,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#111827",
        borderRadius: 16,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.2)",
        alignItems: "center",
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 12,
    },
    name: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    price: {
        color: "#0EA5E9",
        fontWeight: "700",
        marginTop: 4,
    },
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    qtyBtn: {
        backgroundColor: "#1F2937",
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    qtyText: {
        color: "#0EA5E9",
        fontSize: 16,
        fontWeight: "bold",
    },
    qtyNumber: {
        color: "#FFFFFF",
        marginHorizontal: 10,
        fontWeight: "700",
    },
    summary: {
        backgroundColor: "#050B14",
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.3)",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    summaryLabel: {
        color: "#94A3B8",
    },
    summaryValue: {
        color: "#FFFFFF",
    },
    divider: {
        height: 1,
        backgroundColor: "#1F2937",
        marginVertical: 10,
    },
    totalText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    totalPrice: {
        color: "#0EA5E9",
        fontWeight: "bold",
        fontSize: 18,
    },
    checkoutBtn: {
        marginTop: 20,
        backgroundColor: "#0EA5E9",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    checkoutText: {
        color: "#000",
        fontWeight: "700",
    },
    shopBtn: {
        backgroundColor: "#0EA5E9",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    shopText: {
        color: "#000",
        fontWeight: "700",
    },
});
