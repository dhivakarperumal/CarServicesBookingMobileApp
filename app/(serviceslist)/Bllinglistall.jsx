import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
    const colors = {
        paid: "#16a34a",
        partial: "#fb923c",
        pending: "#facc15",
    };

    return (
        <View style={[styles.badge, { backgroundColor: colors[status] || "#9ca3af" }]}>
            <Text style={styles.badgeText}>{status}</Text>
        </View>
    );
};

export default function BillingsScreen() {
    const router = useRouter();

    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [amountSort, setAmountSort] = useState("none");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    /* 🔥 LIVE FIRESTORE */
    useEffect(() => {
        const q = query(collection(db, "billings"), orderBy("createdAt", "desc"));

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                invoiceNo: d.data().invoiceNo || "INV---",
                customerName: d.data().customerName || "Unknown",
                carNumber: d.data().carNumber || "-",
                paymentStatus: d.data().paymentStatus?.toLowerCase() || "pending",
            }));

            setBills(data);
        });

        return () => unsub();
    }, []);

    /* 💰 STATS */
    const totalRevenue = bills.reduce(
        (sum, b) => sum + Number(b.grandTotal || 0),
        0
    );

    const pendingCount = bills.filter((b) => b.paymentStatus !== "paid").length;

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    /* 🔎 FILTER */
    const filtered = useMemo(() => {
        let data = bills.filter((b) => {
            const text = `${b.invoiceNo} ${b.customerName} ${b.carNumber}`.toLowerCase();
            return (
                text.includes(search.toLowerCase()) &&
                (statusFilter === "all" || b.paymentStatus === statusFilter)
            );
        });

        if (amountSort === "low") data.sort((a, b) => a.grandTotal - b.grandTotal);
        if (amountSort === "high") data.sort((a, b) => b.grandTotal - a.grandTotal);

        return data;
    }, [bills, search, statusFilter, amountSort]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const paginatedBills = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, amountSort]);

    /* ❌ DELETE */
    const deleteInvoice = async (id) => {
        Alert.alert("Delete", "Delete this invoice?", [
            { text: "Cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    await deleteDoc(doc(db, "billings", id));
                },
            },
        ]);
    };

    /* UI */
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#15173D" }}>
            {/* 🔝 HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Service Billings</Text>

                <TouchableOpacity
                    onPress={() => router.push("/(serviceslist)/AddBillingsScreen")}
                >
                    <Ionicons name="add" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* 🔽 BODY */}
            <View style={styles.container}>
                {/* STATS */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Revenue</Text>
                        <Text style={styles.statValue}>
                            {formatCurrency(totalRevenue)}
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Pending</Text>
                        <Text style={styles.statValue}>{pendingCount}</Text>
                    </View>
                </View>

                {/* SEARCH */}
                <TextInput
                    placeholder="Search invoice / customer / car"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.input}
                />

                {/* FILTERS */}
                <View style={styles.row}>
                    <Picker
                        selectedValue={statusFilter}
                        style={styles.picker}
                        onValueChange={(v) => setStatusFilter(v)}
                    >
                        <Picker.Item label="All Status" value="all" />
                        <Picker.Item label="Paid" value="paid" />
                        <Picker.Item label="Partial" value="partial" />
                        <Picker.Item label="Pending" value="pending" />
                    </Picker>

                    <Picker
                        selectedValue={amountSort}
                        style={styles.picker}
                        onValueChange={(v) => setAmountSort(v)}
                    >
                        <Picker.Item label="Amount Sort" value="none" />
                        <Picker.Item label="Low → High" value="low" />
                        <Picker.Item label="High → Low" value="high" />
                    </Picker>
                </View>

                {/* LIST */}
                <FlatList
                    data={paginatedBills}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.invoice}>{item.invoiceNo}</Text>
                            <Text>{item.customerName}</Text>
                            <Text>{item.carNumber}</Text>
                            <Text style={styles.amount}>
                                {formatCurrency(item.grandTotal)}
                            </Text>

                            <StatusBadge status={item.paymentStatus} />

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteInvoice(item.id)}
                                >
                                    <Ionicons name="trash" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />

                {/* PAGINATION */}
                <View style={styles.pagination}>
                    <TouchableOpacity
                        disabled={currentPage === 1}
                        onPress={() => setCurrentPage((p) => p - 1)}
                    >
                        <Text>Prev</Text>
                    </TouchableOpacity>

                    <Text>
                        {currentPage} / {totalPages || 1}
                    </Text>

                    <TouchableOpacity
                        disabled={currentPage === totalPages}
                        onPress={() => setCurrentPage((p) => p + 1)}
                    >
                        <Text>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

/* STYLES */
const styles = StyleSheet.create({
    header: {
        backgroundColor: "#15173D",
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },

    container: { flex: 1, backgroundColor: "#f1f5f9", padding: 16 },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
    },

    statLabel: { color: "#6b7280" },
    statValue: { fontWeight: "bold", fontSize: 16 },

    input: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },

    row: { flexDirection: "row", gap: 10, marginBottom: 10 },

    picker: { flex: 1, backgroundColor: "#fff" },

    card: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },

    invoice: { fontWeight: "bold" },

    amount: { fontWeight: "bold", marginVertical: 4 },

    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginTop: 4,
    },

    badgeText: { color: "#fff", fontSize: 12 },

    actions: { flexDirection: "row", marginTop: 8 },

    deleteBtn: {
        backgroundColor: "red",
        padding: 6,
        borderRadius: 6,
    },

    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
});