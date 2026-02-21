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
import { orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function Home() {
  const router = useRouter();
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

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

  const start = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
  const end = Timestamp.fromDate(
    new Date(new Date().setHours(23, 59, 59, 999)),
  );

  useEffect(() => {
    /* TODAY BOOKINGS */
    const unsubTodayBookings = onSnapshot(
      query(
        collection(db, "bookings"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end),
      ),
      (snap) => setTopStats((p) => ({ ...p, todayBookings: snap.size })),
    );

    /* TODAY CUSTOMERS */
    const unsubTodayCustomers = onSnapshot(
      query(
        collection(db, "users"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end),
      ),
      (snap) =>
        setTopStats((p) => ({
          ...p,
          todayCustomers: snap.size,
        })),
    );

    /* TOTAL SERVICES */
    const unsubServices = onSnapshot(collection(db, "services"), (snap) =>
      setTopStats((p) => ({ ...p, totalServices: snap.size })),
    );

    /* TOTAL CUSTOMERS */
    const unsubCustomers = onSnapshot(collection(db, "users"), (snap) =>
      setTopStats((p) => ({ ...p, totalCustomers: snap.size })),
    );

    /* TOTAL EMPLOYEES */
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snap) =>
      setTopStats((p) => ({ ...p, totalEmployees: snap.size })),
    );

    /* TOTAL ORDERS */
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) =>
      setTopStats((p) => ({ ...p, totalOrders: snap.size })),
    );

    /* DELIVERY ORDERS */
    const unsubDelivery = onSnapshot(
      query(collection(db, "orders"), where("status", "==", "delivered")),
      (snap) =>
        setTopStats((p) => ({
          ...p,
          totalDeliveryOrders: snap.size,
        })),
    );

    /* TOTAL PRODUCTS */
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) =>
      setTopStats((p) => ({ ...p, totalProducts: snap.size })),
    );

    /* TOTAL EARNINGS */
    const unsubEarnings = onSnapshot(collection(db, "billings"), (snap) => {
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
    });

    /* RECENT BOOKINGS (5) */
    const unsubRecentBookings = onSnapshot(
      query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5)),
      (snap) => {
        setRecentBookings(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

    /* RECENT ORDERS (5) */
    const unsubRecentOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5)),
      (snap) => {
        setRecentOrders(
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
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
      unsubRecentBookings();
      unsubRecentOrders();
    };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* 🔹 STATS GRID */}
      <View style={styles.grid}>
        <StatCard
          title="Today Bookings"
          value={topStats.todayBookings}
          color="#3b82f6"
        />
        <StatCard
          title="Today Customers"
          value={topStats.todayCustomers}
          color="#6366f1"
        />
        <StatCard
          title="Total Services"
          value={topStats.totalServices}
          color="#8b5cf6"
        />
        <StatCard
          title="Total Customers"
          value={topStats.totalCustomers}
          color="#06b6d4"
        />
        <StatCard
          title="Total Employees"
          value={topStats.totalEmployees}
          color="#0ea5e9"
        />
        <StatCard
          title="Total Orders"
          value={topStats.totalOrders}
          color="#f97316"
        />
        <StatCard
          title="Delivery Orders"
          value={topStats.totalDeliveryOrders}
          color="#ec4899"
        />
        <StatCard
          title="Total Products"
          value={topStats.totalProducts}
          color="#ef4444"
        />
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>Total Earnings</Text>
          <Text style={styles.cardValue}>₹ {topStats.totalEarnings}</Text>
        </View>
      </View>

      {/* 🔹 QUICK ACCESS */}
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <View style={styles.quickGrid}>
        <QuickButton
          title="Add Product"
          icon="add-circle-outline"
          iconSet="Ionicons"
          onPress={() => router.push("/(Products)/addproducts")}
        />

        <QuickButton
          title="Price List"
          icon="pricetag-outline"
          iconSet="Ionicons"
          onPress={() => router.push("/(adminTabs)/priceList")}
        />

        <QuickButton
          title="Service List"
          icon="settings-outline"
          iconSet="Ionicons"
          onPress={() => router.push("/(adminTabs)/services")}
        />

        <QuickButton
          title="Add Booking"
          icon="calendar-outline"
          iconSet="Ionicons"
          onPress={() => router.push("/(adminTabs)/addBooking")}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Bookings</Text>

      {recentBookings.map((item) => (
        <View key={item.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{item.bookingId || "No ID"}</Text>
          <Text style={styles.listSub}>
            {item.name || item.email || "No Name"}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Recent Orders</Text>

      {recentOrders.map((item) => (
        <View key={item.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{item.orderId || "No ID"}</Text>
          <Text style={styles.listSub}>
            {item.name || item.email || "No Name"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* 🔹 QUICK BUTTON */
const QuickButton = ({ title, onPress, icon, iconSet = "Ionicons" }) => {
  const IconComponent =
    iconSet === "MaterialIcons"
      ? MaterialIcons
      : iconSet === "Feather"
        ? Feather
        : Ionicons;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: "45%", marginBottom: 20 }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#0f172a", "#0b3b6f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickBtn}
      >
        <IconComponent name={icon} size={22} color="#38bdf8" />
        <Text style={styles.quickText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

/* 🔹 STAT CARD */
const StatCard = ({ title, value }) => {
  return (
    <LinearGradient
      colors={["#0f172a", "#0b3b6f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </LinearGradient>
  );
};

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop:40 ,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 14,
  },

  sectionTitle: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  cardTitle: {
    color: "#94a3b8",
    fontSize: 12,
  },

  cardValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },

  earningsCard: {
    width: "100%",
    backgroundColor: "#0369a1",
    padding: 22,
    borderRadius: 15,
    marginVertical: 12,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

quickBtn: {
  height: 80,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#38bdf8",
  shadowOpacity: 0.4,
  shadowRadius: 10,
  elevation: 6,
},

  quickText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  listItem: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },

  listTitle: {
    color: "#fff",
    fontWeight: "600",
  },

  listSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
});
