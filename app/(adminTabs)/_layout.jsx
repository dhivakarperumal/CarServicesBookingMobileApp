import React, { useState, useEffect } from "react";
import { Tabs, useSegments, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/* ================= HEADER ================= */
function AdminHeader({ title = "Admin" }) {
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const [todayBookings, setTodayBookings] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);

  const userName = auth.currentUser?.email || "Admin";
  const firstLetter = userName.charAt(0).toUpperCase();

  /* 🔹 TODAY RANGE */
  useEffect(() => {
    const start = Timestamp.fromDate(
      new Date(new Date().setHours(0, 0, 0, 0))
    );
    const end = Timestamp.fromDate(
      new Date(new Date().setHours(23, 59, 59, 999))
    );

    const unsubBookings = onSnapshot(
      query(
        collection(db, "bookings"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTodayBookings(list);
      }
    );

    const unsubOrders = onSnapshot(
      query(
        collection(db, "orders"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTodayOrders(list);
      }
    );

    return () => {
      unsubBookings();
      unsubOrders();
    };
  }, []);

  const totalNotifications = todayBookings.length + todayOrders.length;

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  return (
   <LinearGradient
  colors={["#0f172a", "#0f172a"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.header}
>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightContainer}>
        {/* 🔔 BELL */}
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => setNotifVisible(true)}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" />

          {totalNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 👤 PROFILE */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.profileCircle}
        >
          <Text style={styles.profileText}>{firstLetter}</Text>
        </TouchableOpacity>
      </View>

      {/* 🔔 NOTIFICATION DROPDOWN */}
      <Modal transparent visible={notifVisible} animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setNotifVisible(false)}
        >
          <View style={styles.dropdown}>
            {/* HEADER */}
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifications</Text>
              <Text style={styles.notifCount}>
                {totalNotifications} New
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {/* BOOKINGS */}
              {todayBookings.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.notifItem}
                  onPress={() => {
                    router.push("/(admin)/bookings");
                    setNotifVisible(false);
                  }}
                >
                  <Text style={styles.notifName}>{b.name}</Text>
                  <Text style={styles.notifSub}>
                    Booking ID: {b.bookingId}
                  </Text>
                  <Text style={styles.notifSub}>
                    {b.address || b.location}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* ORDERS */}
              {todayOrders.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={styles.notifItem}
                  onPress={() => {
                    router.push(`/(admin)/orders/${o.id}`);
                    setNotifVisible(false);
                  }}
                >
                  <Text style={styles.notifName}>
                    {o.shipping?.name || "Customer"}
                  </Text>
                  <Text style={styles.notifSub}>
                    Order ID: {o.orderId || o.id}
                  </Text>
                  <Text style={styles.notifSub}>
                    Total ₹ {o.total}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* EMPTY */}
              {totalNotifications === 0 && (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={36}
                    color="#9ca3af"
                  />
                  <Text style={styles.emptyText}>
                    You're all caught up
                  </Text>
                  <Text style={styles.emptySub}>
                    No new notifications right now
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* 👤 PROFILE DROPDOWN */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdown}>
            <MenuItem
              icon="person-outline"
              label="Profile"
              onPress={() => {
                setMenuVisible(false);
                router.push("/(admin-settings)/profile");
              }}
            />

            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => {
                setMenuVisible(false);
                router.push("/(admin-settings)/settings");
              }}
            />

            <MenuItem
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? "#ef4444" : "#374151"}
      />
      <Text
        style={[
          styles.menuText,
          danger && { color: "#ef4444", fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= TABS ================= */
export default function AdminTabsLayout() {
  const segments = useSegments();
  const current = segments[segments.length - 1];

  const getHeaderTitle = (route) => {
    switch (route) {
      case "home":
        return "Home";
      case "bookings":
        return "Bookings";
      case "services":
        return "Services";
      case "products":
        return "Products";
      case "profile":
        return "Profile";
      default:
        return "Admin Panel";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Tabs
        screenOptions={{
          header: () => (
            <AdminHeader title={getHeaderTitle(current)} />
          ),
          tabBarActiveTintColor: "#06b6d4",
          tabBarInactiveTintColor: "#9ca3af",
          sceneContainerStyle: { backgroundColor: "#0f172a" },
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveBackgroundColor: "#1e293b",
        }}
      >
        <Tabs.Screen name="home" options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
        <Tabs.Screen name="bookings" options={{ tabBarIcon: ({ color, size }) => <FontAwesome5 name="clipboard-list" size={size} color={color} /> }} />
        <Tabs.Screen name="services" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="miscellaneous-services" size={size} color={color} /> }} />
        <Tabs.Screen name="products" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="inventory" size={size} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
      </Tabs>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f172a" },

header: {
  backgroundColor: "#0f172a",
  paddingHorizontal: 18,
  paddingTop: 14,
  paddingBottom: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
},

  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  rightContainer: { flexDirection: "row", alignItems: "center" },

  iconWrapper: { position: "relative", marginRight: 14 },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: "center",
  },

  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

profileCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#1e3a8a",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#38bdf8",
},

  profileText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },

  dropdown: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 8,
  },

  notifHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  borderColor: "#e5e7eb",
  paddingBottom: 8,
  marginBottom: 6,
  backgroundColor: "#f9fafb", // 👈 add this
  padding: 10,                // 👈 optional for spacing inside bg
  borderTopLeftRadius: 8,     // 👈 optional nice UI
  borderTopRightRadius: 8,
},

  notifTitle: { fontWeight: "bold", fontSize: 14, color: "#11182" },

  notifCount: { fontSize: 12, color: "#6b7280" },

  notifItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },

  notifName: { fontSize: 14, fontWeight: "600", color: "#111827" },

  notifSub: { fontSize: 12, color: "#6b7280" },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  emptyText: { fontSize: 14, fontWeight: "600", color: "#374151" },

  emptySub: { fontSize: 12, color: "#9ca3af" },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  menuText: { fontSize: 14, color: "#374151", marginLeft: 10 },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#0f172a",
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },

  tabItem: { borderRadius: 12, marginHorizontal: 6 },

  tabLabel: { fontSize: 12, marginBottom: 4 },
});