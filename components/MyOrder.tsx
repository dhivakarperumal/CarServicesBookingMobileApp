import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebase";

const STATUS_STEPS = [
    "Order Placed",
    "Processing",
    "Packing",
    "Out for Delivery",
    "Delivered",
];

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setOrders([]);
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, "orders"),
                where("uid", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const snap = await getDocs(q);
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setOrders(data);
            setLoading(false);
        });

        return unsub;
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#94a3b8" }}>No orders found.</Text>
            </View>
        );
    }



    return (
        <>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => setSelectedOrder(item)}
                    >
                        <View style={styles.rowBetween}>

                            {/* LEFT SIDE */}
                            <View>
                                <Text style={styles.orderId}>
                                    Order ID: {item.orderId}
                                </Text>

                                <Text style={styles.date}>
                                    {item.createdAt?.toDate().toLocaleString()}
                                </Text>
                            </View>

                            {/* RIGHT SIDE */}
                            <View style={styles.rightSection}>
                                <Text style={styles.status}>
                                    {item.status}
                                </Text>

                                <Text style={styles.totalLine}>
                                    Total: ₹{item.total}
                                </Text>
                            </View>

                        </View>
                    </TouchableOpacity>
                )}
            />

            {selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </>
    );
}

function OrderModal({ order, onClose }) {
    const currentStepIndex = STATUS_STEPS.findIndex(
        (s) => s.toLowerCase().replace(/\s/g, "") === order.status
    );

    return (
        <Modal visible transparent animationType="slide">
            <View style={styles.modalBg}>
                <View style={styles.modalCard}>

                    {/* Sticky Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            Order ID: {order.orderId}
                        </Text>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                        {/* Items */}
                        {order.items?.map((item, i) => (
                            <View key={i} style={styles.itemRow}>
                                {item.image && (
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.image}
                                    />
                                )}

                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "#fff" }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ color: "#94a3b8" }}>
                                        Qty: {item.quantity} × ₹{item.price}
                                    </Text>
                                </View>

                                <Text style={{ color: "#0ea5e9" }}>
                                    ₹{item.price * item.quantity}
                                </Text>
                            </View>
                        ))}

                        {/* Total */}
                        <Text style={styles.totalBig}>
                            Total: ₹{order.total}
                        </Text>

                        <Text style={styles.sectionTitle}>
                            Shipping Details
                        </Text>

                        <Text style={styles.shippingText}>
                            {order.shipping?.name}
                        </Text>
                        <Text style={styles.shippingText}>
                            {order.shipping?.phone}
                        </Text>
                        <Text style={styles.shippingText}>
                            {order.shipping?.address}
                        </Text>

                        {/* Tracking */}
                        <Text style={styles.sectionTitle}>Order Status</Text>

                        {order.status === "cancelled" ? (
                            <Text
                                style={{
                                    color: "red",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    marginVertical: 12,
                                }}
                            >
                                ❌ Order Cancelled
                            </Text>
                        ) : (
                            <View style={styles.trackerMainContainer}>

                                {/* Line + Circles Row */}
                                <View style={styles.lineContainer}>
                                    {STATUS_STEPS.map((_, index) => (
                                        <>

                                            {/* Circle */}
                                            <View
                                                style={[
                                                    styles.circle,
                                                    index <= currentStepIndex && styles.activeCircle,
                                                ]}
                                            >
                                                <Text style={styles.circleText}>{index + 1}</Text>
                                            </View>

                                            {/* Line */}
                                            {index !== STATUS_STEPS.length - 1 && (
                                                <View
                                                    style={[
                                                        styles.line,
                                                        index < currentStepIndex && styles.activeLine,
                                                    ]}
                                                />
                                            )}
                                        </>
                                    ))}
                                </View>

                                {/* Labels Row (Separate from line) */}
                                <View style={styles.labelRow}>
                                    {STATUS_STEPS.map((step, index) => (
                                        <Text
                                            key={index}
                                            style={[
                                                styles.stepLabel,
                                                index <= currentStepIndex && styles.activeStepLabel,
                                            ]}
                                        >
                                            {step}
                                        </Text>
                                    ))}
                                </View>

                            </View>
                        )}

                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <Text style={{ color: "#fff" }}>Close</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#0f172a",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.12)",
    },
    orderId: {
        color: "#fff",
        fontWeight: "700",
        marginBottom: 6,
    },
    date: {
        color: "#94a3b8",
        fontSize: 12,
        marginBottom: 8,
    },
    total: {
        color: "#0ea5e9",
        fontWeight: "700",
        marginBottom: 6,
    },
    status: {
        color: "#f59e0b",
        fontWeight: "600",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rightSection: {
        alignItems: "flex-end",
    },

    totalLabel: {
        color: "#94a3b8",
        fontSize: 12,
        marginTop: 4,
    },

    trackerMainContainer: {
  marginVertical: 16,
  paddingVertical: 1,
},

    totalAmount: {
        color: "#0ea5e9",
        fontWeight: "700",
        fontSize: 16,
    },
    totalLine: {
        color: "#0ea5e9",
        fontWeight: "700",
        fontSize: 15,
        marginTop: 4,
    },

    /* Modal */
    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalCard: {
        width: "100%",
        maxHeight: "90%",
        backgroundColor: "#0b1220",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.12)",
    },
    modalTitle: {
        color: "#38bdf8",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 12,
    },
    totalBig: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    sectionTitle: {
        color: "#38bdf8",
        fontWeight: "700",
        marginTop: 12,
        marginBottom: 6,
    },
    shippingText: {
        color: "#fff",
        marginBottom: 4,
    },

    activeCircle: {
        backgroundColor: "#0ea5e9",
    },

    activeStepLabel: {
        color: "#0ea5e9",
        fontWeight: "600",
    },

    closeBtn: {
        marginTop: 16,
        backgroundColor: "#0ea5e9",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 5,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    closeIcon: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "bold",
    },

    lineContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },


    circleText: {
        color: "#fff",
        fontWeight: "bold",
    },

    line: {
        flex: 1,
        height: 3,
        backgroundColor: "#ccc",
    },

    activeLine: {
        backgroundColor:  "#0ea5e9",
    },

    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },

    stepLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8", // light gray instead of black
    },
});