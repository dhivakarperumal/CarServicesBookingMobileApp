import { useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    runTransaction,
    setDoc,
    Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";
import { reduceStockAfterPurchase } from "../utils/reduceStockAfterPurchase";
import { saveUserAddress } from "../utils/saveUserAddress";

// ================= ORDER COUNTER =================
const generateOrderNumber = async () => {
    const ref = doc(db, "counters", "current");

    return await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const next = (snap.exists() ? snap.data().current : 0) + 1;
        tx.set(ref, { current: next }, { merge: true });
        return `ORD${String(next).padStart(3, "0")}`;
    });
};

export default function Checkout() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const [uid, setUid] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [placing, setPlacing] = useState(false);

    const isBuyNow = params?.isBuyNow === "true";

    // ================= AUTH =================
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUid(u ? u.uid : null);
        });
        return unsub;
    }, []);

    // ================= CART / BUY NOW =================
    useEffect(() => {
        if (!uid) return;

        const loadCart = async () => {
            const snap = await getDocs(collection(db, "users", uid, "cart"));
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        };

        loadCart();
    }, [uid]);

    useEffect(() => {
    if (!uid) return;

    const loadAddresses = async () => {
        const snap = await getDocs(
            collection(db, "users", uid, "addresses")
        );

        const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));

        setSavedAddresses(list);

        // ✅ Auto select first address (optional)
        if (list.length > 0) {
            selectAddress(list[0]);
        }
    };

    loadAddresses();
}, [uid]);

const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);

    setShipping({
        name: addr.fullName,
        email: addr.email || "",
        phone: addr.phone,
        address: addr.street,
        city: addr.city,
        state: addr.state,
        zip: addr.pinCode,
        country: addr.country || "India",
    });
};

    // ================= SHIPPING =================
    const [shipping, setShipping] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
    });

    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const subtotal = items.reduce(
        (a, c) => a + c.price * c.quantity,
        0
    );

    const total = subtotal;

    const handleBack = () => {
        if (typeof router.canGoBack === "function") {
            if (router.canGoBack()) return router.back();
            return router.replace("/(tabs)/index");
        }

        try {
            router.back();
        } catch (e) {
            router.replace("/(tabs)/index");
        }
    };

    // ================= CLEAR CART =================
    const clearCart = async () => {
        const snap = await getDocs(collection(db, "users", uid!, "cart"));
        await Promise.all(
            snap.docs.map((d) =>
                deleteDoc(doc(db, "users", uid!, "cart", d.id))
            )
        );
    };

    // ================= SAVE ORDER =================
    const saveOrder = async () => {
        if (!uid) throw new Error("User not logged in");

        await reduceStockAfterPurchase(items);

       try {
    await saveUserAddress(uid, {
        fullName: shipping.name,
        email: shipping.email,
        phone: shipping.phone,
        street: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pinCode: shipping.zip,
    });
} catch (err: any) {
    if (err.message !== "DUPLICATE_ADDRESS") {
        throw err; // real error
    }
    // duplicate address → ignore and continue order
}

        const orderNumber = await generateOrderNumber();

        const orderRef = doc(collection(db, "orders"));
        const userOrderRef = doc(
            db,
            "users",
            uid,
            "orders",
            orderRef.id
        );

        const orderData = {
            docId: orderRef.id,
            orderId: orderNumber,
            uid,
            items,
            shipping,
            subtotal,
            total,
            paymentMethod: "CASH",
            paymentStatus: "Pending",
            status: "orderplaced",
            createdAt: Timestamp.now(),
        };

        await Promise.all([
            setDoc(orderRef, orderData),
            setDoc(userOrderRef, orderData),
        ]);

        await clearCart();

        Alert.alert("Success", `Order ${orderNumber} placed`);
        router.push({
            pathname: "/(tabs)/profile",
            params: { tab: "orders" },
        });
    };

    // ================= PLACE ORDER =================
   const placeOrder = async () => {
    if (!items.length) {
        Alert.alert("Cart is empty");
        return;
    }

    if (!shipping.name || !shipping.phone || !shipping.address) {
        Alert.alert("Fill delivery details");
        return;
    }

    setPlacing(true);

    try {
        // 🟢 CASH FLOW
        if (paymentMethod === "CASH") {
            await saveOrder();
        }

        // 🔵 ONLINE FLOW
        if (paymentMethod === "ONLINE") {
            const options = {
                key: "rzp_test_SGj8n5SyKSE10b", // replace later with live key
                amount: total * 100,
                currency: "INR",
                name: "Car Service Booking",
                description: "Order Payment",
                prefill: {
                    name: shipping.name,
                    email: shipping.email,
                    contact: shipping.phone,
                },
                theme: { color: "#0EA5E9" },
            };

            const data = await RazorpayCheckout.open(options);

            // Payment success → save order
            await saveOrder();
        }
    } catch (err: any) {
        Alert.alert("Payment Failed", err?.description || err?.message);
    } finally {
        setPlacing(false);
    }
};

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
           <KeyboardAwareScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
  enableOnAndroid={true}
  extraScrollHeight={20}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
>
                <Text style={styles.heading}>Checkout</Text>

                {/* SAVED ADDRESSES */}
{savedAddresses.length > 0 && (
    <>
        <Text style={styles.section}>Saved Addresses</Text>

        {savedAddresses.map((addr) => (
            <TouchableOpacity
                key={addr.id}
                onPress={() => selectAddress(addr)}
                style={[
                    styles.addressCard,
                    selectedAddressId === addr.id && {
                        borderColor: "#0EA5E9",
                        borderWidth: 2,
                    },
                ]}
            >
                <Text style={styles.itemText}>{addr.fullName}</Text>
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                    {addr.street}, {addr.city}
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                    {addr.state} - {addr.pinCode}
                </Text>
                <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                    {addr.phone}
                </Text>
            </TouchableOpacity>
        ))}
    </>
)}

                {/* SHIPPING */}
                <Text style={styles.section}>Shipping</Text>

                <TextInput
                    placeholder="FULL NAME"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    value={shipping.name}
                    onChangeText={(v) => setShipping({ ...shipping, name: v })}
                />

                <TextInput
                    placeholder="EMAIL"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    value={shipping.email}
                    onChangeText={(v) => setShipping({ ...shipping, email: v })}
                />

                <TextInput
                    placeholder="PHONE"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={shipping.phone}
                    onChangeText={(v) => setShipping({ ...shipping, phone: v })}
                />


                <TextInput
                    placeholder="CITY"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    value={shipping.city}
                    onChangeText={(v) => setShipping({ ...shipping, city: v })}
                />

                <TextInput
                    placeholder="STATE"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    value={shipping.state}
                    onChangeText={(v) => setShipping({ ...shipping, state: v })}
                />

                <TextInput
                    placeholder="PIN CODE"
                    placeholderTextColor="#64748B"
                    style={styles.input}
                    keyboardType="number-pad"
                    value={shipping.zip}
                    onChangeText={(v) => setShipping({ ...shipping, zip: v })}
                />


                <TextInput
                    placeholder="ADDRESS"
                    placeholderTextColor="#64748B"
                    style={[styles.input, { height: 80 }]}
                    multiline
                    value={shipping.address}
                    onChangeText={(v) => setShipping({ ...shipping, address: v })}
                />

                {/* SUMMARY */}
                <Text style={styles.section}>Summary</Text>

                {items.map((i) => (
                    <View key={i.id} style={styles.row}>
                        <Text style={styles.itemText}>
                            {i.name} × {i.quantity}
                        </Text>
                        <Text style={styles.itemText}>
                            ₹{i.price * i.quantity}
                        </Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalAmount}>₹{total}</Text>
                </View>

                <Text style={styles.section}>Payment Method</Text>

                <TouchableOpacity
                    onPress={() => setPaymentMethod("CASH")}
                    style={styles.paymentRow}
                >
                    <Text style={styles.itemText}>
                        {paymentMethod === "CASH" ? "🔘" : "⚪"} Cash on Delivery
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setPaymentMethod("ONLINE")}
                    style={styles.paymentRow}
                >
                    <Text style={styles.itemText}>
                        {paymentMethod === "ONLINE" ? "🔘" : "⚪"} Online Payment
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.placeBtn}
                    onPress={placeOrder}
                    disabled={placing}
                >
                    {placing ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.btnText}>PLACE ORDER</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20,
    },
    heading: {
        color: "#0EA5E9",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    section: {
        color: "#0EA5E9",
        fontSize: 16,
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#111827",
        color: "#FFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    itemText: {
        color: "#FFF",
    },
    addressCard: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
},
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
        borderTopWidth: 1,
        borderColor: "#1F2937",
        paddingTop: 10,
    },
    totalText: {
        color: "#FFF",
        fontSize: 16,
    },
    totalAmount: {
        color: "#0EA5E9",
        fontSize: 18,
        fontWeight: "bold",
    },
    placeBtn: {
        marginTop: 30,
        backgroundColor: "#0EA5E9",
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
    },
    btnText: {
        color: "#000",
        fontWeight: "bold",
    },
    paymentRow: {
        marginBottom: 10,
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
});  