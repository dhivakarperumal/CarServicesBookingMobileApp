import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ITEMS_PER_PAGE = 10;

export default function StaffsScreen() {
    const router = useRouter();

    const [staff, setStaff] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const loadStaff = async () => {
        const snap = await getDocs(collection(db, "employees"));
        setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => {
        loadStaff();
    }, []);

    // ===== FILTER =====
    const filteredStaff = useMemo(() => {
        return staff.filter((s) => {
            const matchesSearch =
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.email?.toLowerCase().includes(search.toLowerCase()) ||
                s.phone?.includes(search);

            const matchesStatus =
                statusFilter === "all" || s.status === statusFilter;

            const matchesDepartment =
                departmentFilter === "all" || s.department === departmentFilter;

            return matchesSearch && matchesStatus && matchesDepartment;
        });
    }, [staff, search, statusFilter, departmentFilter]);

    const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);

    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ===== DELETE =====
    const handleDelete = (id) => {
        Alert.alert("Delete", "Delete this staff member?", [
            { text: "Cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    await deleteDoc(doc(db, "employees", id));
                    loadStaff();
                },
            },
        ]);
    };

    // ===== STATS =====
    const totalStaff = staff.length;
    const activeStaff = staff.filter((s) => s.status === "active").length;
    const inactiveStaff = staff.filter((s) => s.status !== "active").length;
    const departments = new Set(staff.map((s) => s.department)).size;

    const Card = ({ title, value, icon, color }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardValue}>{value}</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={icon} size={22} color="#fff" />
            </View>
        </View>
    );

    const renderItem = ({ item, index }) => (
        <View style={styles.staffCard}>
            <Text style={styles.name}>
                {index + 1}. {item.name}
            </Text>
            <Text style={styles.sub}>{item.email}</Text>
            <Text style={styles.sub}>{item.phone}</Text>

            <View style={styles.rowWrap}>
                <Text style={styles.badge}>{item.role}</Text>
                <Text style={styles.badge}>{item.department}</Text>
                <Text
                    style={[
                        styles.status,
                        item.status === "active" ? styles.active : styles.inactive,
                    ]}
                >
                    {item.status}
                </Text>
            </View>

            <View style={styles.actions}>


                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/addstaff",
                            params: { id: item.id },
                        })
                    }
                    style={styles.actionBtn}
                >
                    <MaterialCommunityIcons name="pencil" size={18} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionBtn}
                >
                    <MaterialCommunityIcons name="delete" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* FLOATING ADD BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push("/(Employees)/addstaff")}
            >
                <MaterialCommunityIcons name="plus" color="#fff" size={26} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ===== STATS ===== */}
                <View style={styles.stats}>
                    <Card title="Total Staff" value={totalStaff} icon="account-group" color="#3b82f6" />
                    <Card title="Active" value={activeStaff} icon="account-check" color="#10b981" />
                    <Card title="Inactive" value={inactiveStaff} icon="account-remove" color="#ef4444" />
                    <Card title="Departments" value={departments} icon="office-building" color="#8b5cf6" />
                </View>

                {/* ===== SEARCH ===== */}
                <TextInput
                    placeholder="Search name, email, phone"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.search}
                />

                {/* ===== STATUS FILTER ===== */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filters}>
                        {["all", "active", "inactive"].map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setStatusFilter(s)}
                                style={[
                                    styles.filterBtn,
                                    statusFilter === s && styles.filterActive,
                                ]}
                            >
                                <Text
                                    style={{
                                        color: statusFilter === s ? "#fff" : "#111",
                                        fontSize: 12,
                                    }}
                                >
                                    {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* ===== LIST ===== */}
                <FlatList
                    data={paginatedStaff}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                />

                {/* ===== PAGINATION ===== */}
                {totalPages > 1 && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            disabled={currentPage === 1}
                            onPress={() => setCurrentPage((p) => p - 1)}
                        >
                            <Text style={styles.pageBtn}>Prev</Text>
                        </TouchableOpacity>

                        <Text style={styles.pageText}>
                            {currentPage} / {totalPages}
                        </Text>

                        <TouchableOpacity
                            disabled={currentPage === totalPages}
                            onPress={() => setCurrentPage((p) => p + 1)}
                        >
                            <Text style={styles.pageBtn}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f9", padding: 14 },

    stats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

    card: {
        backgroundColor: "#fff",
        width: "48%",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    cardTitle: { color: "#6b7280", fontSize: 12 },
    cardValue: { fontSize: 22, fontWeight: "bold", color: "#111" },

    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    search: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginVertical: 10,
    },

    filters: { flexDirection: "row", gap: 10, marginBottom: 10 },

    filterBtn: {
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    filterActive: { backgroundColor: "#111" },

    staffCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },

    name: { fontWeight: "bold", fontSize: 15 },
    sub: { color: "#6b7280", fontSize: 12 },

    rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },

    badge: {
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        fontSize: 11,
    },

    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        fontSize: 11,
        color: "#fff",
    },

    active: { backgroundColor: "#10b981" },
    inactive: { backgroundColor: "#ef4444" },

    actions: { flexDirection: "row", gap: 12, marginTop: 10 },

    actionBtn: {
        backgroundColor: "#f3f4f6",
        padding: 8,
        borderRadius: 8,
    },

    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    pageBtn: { color: "#2563eb", fontWeight: "bold" },
    pageText: { fontWeight: "bold" },

    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#111",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
    },
});
