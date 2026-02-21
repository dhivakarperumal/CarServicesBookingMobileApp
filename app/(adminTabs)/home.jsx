import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const [topStats, setTopStats] = useState({
    todayBookings: 0,
    todayCustomers: 0,
    totalServices: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalDeliveryOrders: 0,
    totalProducts: 0,
    totalEarnings: 0,
  });

  const start = Timestamp.fromDate(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const end = Timestamp.fromDate(
    new Date(new Date().setHours(23, 59, 59, 999))
  );

  useEffect(() => {
    /* TODAY BOOKINGS */
    const unsubTodayBookings = onSnapshot(
      query(
        collection(db, "bookings"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) =>
        setTopStats((p) => ({ ...p, todayBookings: snap.size }))
    );

    /* TODAY CUSTOMERS */
    const unsubTodayCustomers = onSnapshot(
      query(
        collection(db, "users"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) =>
        setTopStats((p) => ({
          ...p,
          todayCustomers: snap.size,
        }))
    );

    /* TOTAL SERVICES */
    const unsubServices = onSnapshot(
      collection(db, "services"),
      (snap) =>
        setTopStats((p) => ({ ...p, totalServices: snap.size }))
    );

    /* TOTAL CUSTOMERS */
    const unsubCustomers = onSnapshot(
      collection(db, "users"),
      (snap) =>
        setTopStats((p) => ({ ...p, totalCustomers: snap.size }))
    );

    /* TOTAL EMPLOYEES */
    const unsubEmployees = onSnapshot(
      collection(db, "employees"),
      (snap) =>
        setTopStats((p) => ({ ...p, totalEmployees: snap.size }))
    );

    /* TOTAL ORDERS */
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snap) =>
        setTopStats((p) => ({ ...p, totalOrders: snap.size }))
    );

    /* DELIVERY ORDERS */
    const unsubDelivery = onSnapshot(
      query(collection(db, "orders"), where("status", "==", "delivered")),
      (snap) =>
        setTopStats((p) => ({
          ...p,
          totalDeliveryOrders: snap.size,
        }))
    );

    /* TOTAL PRODUCTS */
    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snap) =>
        setTopStats((p) => ({ ...p, totalProducts: snap.size }))
    );

    /* TOTAL EARNINGS */
    const unsubEarnings = onSnapshot(
      collection(db, "billings"),
      (snap) => {
        let total = 0;

        snap.forEach((doc) => {
          const data = doc.data();
          const status = (data.paymentStatus || "").toLowerCase();

          if (status === "paid") {
            total += Number(data.grandTotal || 0);
          }

          if (status === "partial") {
            total += Number(data.paidAmount || 0);
          }
        });

        setTopStats((p) => ({ ...p, totalEarnings: total }));
      }
    );

    return () => {
      unsubTodayBookings();
      unsubTodayCustomers();
      unsubServices();
      unsubCustomers();
      unsubEmployees();
      unsubOrders();
      unsubDelivery();
      unsubProducts();
      unsubEarnings();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

    

      {/* 🔹 STATS GRID */}
      <View style={styles.grid}>
        <StatCard title="Today Bookings" value={topStats.todayBookings} color="#3b82f6" />
        <StatCard title="Today Customers" value={topStats.todayCustomers} color="#6366f1" />
        <StatCard title="Total Services" value={topStats.totalServices} color="#8b5cf6" />
        <StatCard title="Total Customers" value={topStats.totalCustomers} color="#06b6d4" />
        <StatCard title="Total Employees" value={topStats.totalEmployees} color="#0ea5e9" />
        <StatCard title="Total Orders" value={topStats.totalOrders} color="#f97316" />
        <StatCard title="Delivery Orders" value={topStats.totalDeliveryOrders} color="#ec4899" />
        <StatCard title="Total Products" value={topStats.totalProducts} color="#ef4444" />
        <StatCard
          title="Total Earnings"
          value={`₹ ${topStats.totalEarnings}`}
          color="#22c55e"
          full
        />
      </View>

        {/* 🔹 QUICK ACCESS */}
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <View style={styles.quickGrid}>
        <QuickButton
          title="Add Product"
          color="#3b82f6"
          onPress={() => router.push("/(adminTabs)/addProduct")}
        />

        <QuickButton
          title="Price List"
          color="#6366f1"
          onPress={() => router.push("/(adminTabs)/priceList")}
        />

        <QuickButton
          title="Service List"
          color="#8b5cf6"
          onPress={() => router.push("/(adminTabs)/services")}
        />

        <QuickButton
          title="Add Booking"
          color="#06b6d4"
          onPress={() => router.push("/(adminTabs)/addBooking")}
        />
      </View>
    </ScrollView>
  );
}

/* 🔹 QUICK BUTTON */
const QuickButton = ({ title, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.quickBtn, { backgroundColor: color }]}
  >
    <Text style={styles.quickText}>{title}</Text>
  </TouchableOpacity>
);

/* 🔹 STAT CARD */
const StatCard = ({ title, value, color, full }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: color },
      full && { width: "100%" },
    ]}
  >
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickBtn: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  quickText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 12,
  },
  cardValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
});