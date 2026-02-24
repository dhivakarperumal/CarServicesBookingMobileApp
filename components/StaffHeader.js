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
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
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
            <Ionicons name="notifications-outline" size={22} color="#e5e7eb" />

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
                router.replace("/(EmployeesDash)/profile");
              }}
            >
              <Ionicons name="person-outline" size={18} color="#38bdf8" />
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
              <Ionicons name="home-outline" size={18} color="#38bdf8" />
              <Text style={styles.itemText}>Home</Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity style={styles.item} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
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
  backgroundColor: "#050b1f", // slightly lighter than page
  height: Platform.OS === "ios" ? 120 : 92, // more breathing space
  flexDirection: "row",
  alignItems: "flex-end", // push content toward bottom
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingBottom: 15, // space for profile bubble

  borderBottomWidth: 1,
  borderBottomColor: "rgba(56,189,248,0.18)",

  shadowColor: "#38bdf8",
  shadowOpacity: 0.25,
  shadowRadius: 14,
  elevation: 14,
},

  title: {
  fontSize: 18,
  fontWeight: "900",
  color: "#e5e7eb",
  letterSpacing: 0.3,
},

  right: { flexDirection: "row", alignItems: "center" },

profile: {
  width: 38,
  height: 38,
  borderRadius: 20,
  backgroundColor: "#0f172a",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(56,189,248,0.3)",

  shadowColor: "#38bdf8",
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
  profileText: {
  color: "#38bdf8",
  fontWeight: "900",
  fontSize: 16,
},

badge: {
  position: "absolute",
  top: -5,
  right: -6,
  backgroundColor: "#38bdf8",
  borderRadius: 20,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 5,

  shadowColor: "#38bdf8",
  shadowOpacity: 0.6,
  shadowRadius: 6,
},

  badgeText: {
  color: "#020617",
  fontSize: 11,
  fontWeight: "900",
},

  overlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    left: 0,
    right: 0,
    bottom: 0,
  },

notifDropdown: {
  position: "absolute",
  top: 6,
  right: 16,
  backgroundColor: "#0f172a",
  borderRadius: 16,
  padding: 14,
  width: 270,
  maxHeight: 320,

  borderWidth: 1,
  borderColor: "rgba(56,189,248,0.25)",

  shadowColor: "#38bdf8",
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 20,
},

  notifTitle: {
  fontWeight: "900",
  marginBottom: 10,
  color: "#e5e7eb",
},

notifCard: {
  backgroundColor: "#020617",
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "rgba(56,189,248,0.12)",
},

  notifCar: {
  fontWeight: "800",
  color: "#38bdf8",
},

  notifSub: {
  fontSize: 12,
  color: "#94a3b8",
},

notifStatus: {
  fontSize: 11,
  marginTop: 4,
  color: "#10b981",
  fontWeight: "700",
},

  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 10,
  },

dropdown: {
  position: "absolute",
  top: 6,
  right: 16,
  backgroundColor: "#0f172a",
  borderRadius: 16,
  paddingVertical: 6,
  width: 180,

  borderWidth: 1,
  borderColor: "rgba(56,189,248,0.25)",

  shadowColor: "#38bdf8",
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 20,
},

item: {
  flexDirection: "row",
  alignItems: "center",
  padding: 14,
  gap: 10,
},

  itemText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#e5e7eb",
},
});