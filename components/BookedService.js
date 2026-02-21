import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebase";

const STATUS_FLOW = [
    "BOOKED",
    "CALL_VERIFIED",
    "APPROVED",
    "PROCESSING",
    "WAITING_SPARE",
    "SERVICE_GOING",
    "BILL_PENDING",
    "BILL_COMPLETED",
    "SERVICE_COMPLETED",
];

const STATUS_LABELS = {
    BOOKED: "Booked",
    CALL_VERIFIED: "Call Verified",
    APPROVED: "Approved",
    PROCESSING: "Processing",
    WAITING_SPARE: "Waiting for Spare",
    SERVICE_GOING: "Service Going On",
    BILL_PENDING: "Bill Pending",
    BILL_COMPLETED: "Bill Completed",
    SERVICE_COMPLETED: "Service Completed",
    CANCELLED: "Cancelled",
};

const STATUS_NORMALIZER = {
    Booked: "BOOKED",
    "Call Verified": "CALL_VERIFIED",
    Approved: "APPROVED",
    Processing: "PROCESSING",
    "Waiting for Spare": "WAITING_SPARE",
    "Service Going on": "SERVICE_GOING",
    "Bill Pending": "BILL_PENDING",
    "Bill Completed": "BILL_COMPLETED",
    "Service Completed": "SERVICE_COMPLETED",
    Cancelled: "CANCELLED",
};

export default function BookedService() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchBookings = async () => {
            try {
                setLoading(true);

                const q = query(
                    collection(db, "bookings"),
                    where("uid", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);

                const data = snapshot.docs.map((doc) => {
                    const raw = doc.data();
                    return {
                        id: doc.id,
                        ...raw,
                        normalizedStatus:
                            STATUS_NORMALIZER[raw.status] || raw.status,
                    };
                });

                setBookings(data);
            } catch (err) {
                console.log("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "APPROVED":
                return { backgroundColor: "#082f49", textColor: "#38bdf8" };
            case "CANCELLED":
                return { backgroundColor: "#3f1d1d", textColor: "#f87171" };
            default:
                return { backgroundColor: "#3f3f1d", textColor: "#facc15" };
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
        );
    }

    if (!bookings.length) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>No bookings found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Service Bookings</Text>

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                    const statusStyle = getStatusStyle(item.normalizedStatus);

                    return (
                        <TouchableOpacity
                            style={styles.bookingRow}
                            onPress={() => setSelectedBooking(item)}
                        >
                            <View>
                                <Text style={styles.bookingId}>
                                    {item.bookingId}
                                </Text>
                                <Text style={styles.subText}>
                                    {item.name} • {item.phone}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: statusStyle.backgroundColor },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: statusStyle.textColor },
                                    ]}
                                >
                                    {STATUS_LABELS[item.normalizedStatus]}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </View>
    );
}

function BookingDetailModal({ booking, onClose }) {
    return (
        <Modal visible transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>

                        {/* Title */}
                        <Text style={styles.modalTitle}>
                            Booking Details
                        </Text>

                        {/* Booking ID */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Booking ID</Text>
                            <Text style={styles.detailValue}>{booking.bookingId}</Text>
                        </View>

                        {/* Name */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Name</Text>
                            <Text style={styles.detailValue}>{booking.name}</Text>
                        </View>

                        {/* Phone */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{booking.phone}</Text>
                        </View>

                        {/* Email */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{booking.email || "N/A"}</Text>
                        </View>

                        {/* Car Brand */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Car Brand</Text>
                            <Text style={styles.detailValue}>{booking.brand}</Text>
                        </View>

                        {/* Car Model */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Car Model</Text>
                            <Text style={styles.detailValue}>{booking.model}</Text>
                        </View>

                        {/* Issue */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Issue</Text>
                            <Text style={styles.detailValue}>{booking.issue}</Text>
                        </View>

                        {/* Location */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>{booking.location}</Text>
                        </View>

                        {/* Address */}
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Service Address</Text>
                            <Text style={styles.detailValue}>{booking.address}</Text>
                        </View>

                        {/* Service Tracker */}
                        <View style={styles.trackerSection}>
                            <Text style={styles.detailLabel}>Service Status</Text>
                            {booking.normalizedStatus !== "CANCELLED" ? (
                                <View style={styles.trackerContainer}>
                                    {STATUS_FLOW.map((status, index) => {
                                        const isCompleted =
                                            index <= STATUS_FLOW.indexOf(booking.normalizedStatus);

                                        return (
                                            <View key={status} style={styles.stepWrapper}>
                                                {/* Circle */}
                                                <View
                                                    style={[
                                                        styles.circle,
                                                        isCompleted && styles.activeCircle,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.stepText,
                                                            isCompleted && styles.activeText,
                                                        ]}
                                                    >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                {/* Label */}
                                                <Text style={styles.stepLabel}>
                                                    {status.replace(/_/g, " ")}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.cancelledText}>❌ Service Cancelled</Text>
                            )}
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1120",
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#38bdf8",
        marginBottom: 20,
    },

    bookingRow: {
        backgroundColor: "#111827",
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 16,

        // Sky blue border
        borderWidth: 1,
        borderColor: "#0ea5e9",

        // Soft shadow
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    bookingId: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },

    subText: {
        color: "#9ca3af",
        marginTop: 6,
        fontSize: 13,
    },

    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: {
        fontWeight: "600",
        fontSize: 12,
    },

    emptyText: {
        color: "#9ca3af",
        fontSize: 14,
    },

    center: {
        flex: 1,
        backgroundColor: "#0B1120",
        justifyContent: "center",
        alignItems: "center",
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },

    modalCard: {
        width: "100%",
        maxHeight: "85%",
        backgroundColor: "#0f172a",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#0ea5e9",
    },

    closeButton: {
        alignSelf: "flex-end",
        paddingVertical: 8,
        paddingHorizontal: 8,
    },

    modalTitle: {
        color: "#38bdf8",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        marginTop: -8,
    },

    detailSection: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(14, 165, 233, 0.1)",
    },

    detailLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },

    detailValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
    },

    closeModalButton: {
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },

    closeModalButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    /* Service Tracker Styles */
    trackerSection: {
        marginTop: 24,
        marginBottom: 16,
    },

    trackerContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingVertical: 16,
    },

    stepWrapper: {
        alignItems: "center",
        width: "48%",
        marginBottom: 24,
    },

    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#4b5563",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },

    activeCircle: {
        backgroundColor: "#38bdf8",
        borderColor: "#38bdf8",
    },

    stepText: {
        color: "#9ca3af",
        fontWeight: "700",
        fontSize: 18,
    },

    activeText: {
        color: "#000",
    },

    stepLabel: {
        marginTop: 8,
        fontSize: 11,
        textAlign: "center",
        color: "#d1d5db",
        width: 110,
    },

    line: {
        display: "none",
    },

    activeLine: {
        display: "none",
    },

    cancelledText: {
        color: "#ef4444",
        fontWeight: "600",
        textAlign: "center",
        fontSize: 16,
        marginVertical: 12,
    },
});