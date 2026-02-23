import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { signOut, getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StaffHeader() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const user = auth.currentUser;

  const firstLetter = userName?.charAt(0)?.toUpperCase() || "U";

  /* ================= LOAD EMPLOYEE NAME ================= */
  const loadEmployee = async () => {
    if (!user) return;

    const q = query(
      collection(db, "employees"),
      where("authUid", "==", user.uid)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      setUserName(snap.docs[0].data().name || "Staff");
    }
  };

  /* ================= LOAD NOTIFICATIONS ================= */
  const loadNotifications = async () => {
    if (!user) return;

    setLoadingNotif(true);

    const q = query(
      collection(db, "assignedServices"),
      where("employeeAuthUid", "==", user.uid)
    );

    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const todayStr = new Date().toISOString().split("T")[0];

    const todayJobs = list.filter((item) => {
      if (!item.assignedAt) return false;
      const date = item.assignedAt.toDate().toISOString().split("T")[0];
      return date === todayStr;
    });

    setTodayCount(todayJobs.length);
    setNotifications(list);
    setLoadingNotif(false);
  };

  useEffect(() => {
    loadEmployee();
    loadNotifications();
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await signOut(auth);
    router.replace("/login");
  };

  /* 🔥 Dynamic title */
  const getTitle = () => {
    const current = segments[segments.length - 1];

    switch (current) {
      case "dashboard":
        return "Dashboard";
      case "bookings":
        return "Assigned Jobs";
      case "cars":
        return "Cars";
      case "profile":
        return "My Profile";
      default:
        return "Staff Panel";
    }
  };

  return (
    <View style={{ zIndex: 999 }}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title}>{getTitle()}</Text>

        <View style={styles.right}>
          {/* 🔔 NOTIFICATIONS */}
          <TouchableOpacity
            onPress={() => {
              setNotifOpen(!notifOpen);
              loadNotifications();
            }}
            style={{ marginRight: 14 }}
          >
            <Ionicons name="notifications-outline" size={22} />

            {todayCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{todayCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* PROFILE */}
          <TouchableOpacity
            style={styles.profile}
            onPress={() => setOpen(!open)}
          >
            <Text style={styles.profileText}>{firstLetter}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔔 NOTIFICATION DROPDOWN */}
      {notifOpen && (
        <Pressable style={styles.overlay} onPress={() => setNotifOpen(false)}>
          <View style={styles.notifDropdown}>
            <Text style={styles.notifTitle}>Assigned Jobs</Text>

            {loadingNotif ? (
              <ActivityIndicator />
            ) : notifications.length === 0 ? (
              <Text style={styles.empty}>No jobs</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <View style={styles.notifCard}>
                    <Text style={styles.notifCar}>
                      {item.carBrand} - {item.carModel}
                    </Text>
                    <Text style={styles.notifSub}>{item.carIssue}</Text>
                    <Text style={styles.notifStatus}>
                      {item.serviceStatus}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </Pressable>
      )}

      {/* PROFILE DROPDOWN */}
      {open && (
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            {/* PROFILE */}
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setOpen(false);
                router.replace("/(staff)/profile");
              }}
            >
              <Ionicons name="person-outline" size={18} />
              <Text style={styles.itemText}>Profile</Text>
            </TouchableOpacity>
            {/* HOME */}
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setOpen(false);
                router.replace("/(tabs)");
              }}
            >
              <Ionicons name="home-outline" size={18} color="#111" />
              <Text style={styles.itemText}>Home</Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity style={styles.item} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} />
              <Text style={styles.itemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    height: Platform.OS === "ios" ? 100 : 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  title: { fontSize: 18, fontWeight: "bold" },

  right: { flexDirection: "row", alignItems: "center" },

  profile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

  overlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    left: 0,
    right: 0,
    bottom: 0,
  },

  notifDropdown: {
    position: "absolute",
    top: 0,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: 260,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },

  notifTitle: { fontWeight: "bold", marginBottom: 8 },

  notifCard: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  notifCar: { fontWeight: "bold" },

  notifSub: { fontSize: 12, color: "#6b7280" },

  notifStatus: {
    fontSize: 11,
    marginTop: 2,
    color: "#2563eb",
  },

  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 10,
  },

  dropdown: {
    position: "absolute",
    top: 0,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    width: 170,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },

  itemText: { fontSize: 14, fontWeight: "500" },
});