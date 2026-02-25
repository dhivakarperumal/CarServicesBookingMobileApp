import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
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

  /* LOAD EMPLOYEE NAME */
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

  /* LOAD NOTIFICATIONS */
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
      if (!item.assignedAt?.toDate) return false;
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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          {/* LEFT */}
          <View style={styles.left}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/logo_no_bg.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {getTitle()}
            </Text>
          </View>

          {/* RIGHT */}
          <View style={styles.right}>
            {/* 🔔 NOTIFICATIONS */}
            <TouchableOpacity
              style={styles.iconWrapper}
              onPress={() => {
                setNotifOpen(!notifOpen);
                setOpen(false);
                loadNotifications();
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#e5e7eb"
              />

              {todayCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todayCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 👤 PROFILE */}
            <TouchableOpacity
              style={styles.profile}
              onPress={() => {
                setOpen(!open);
                setNotifOpen(false);
              }}
            >
              <Text style={styles.profileText}>{firstLetter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 🔔 NOTIFICATION DROPDOWN */}
      {notifOpen && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setNotifOpen(false)}
          />

          <View style={styles.notifDropdown}>
            <Text style={styles.notifTitle}>Assigned Jobs</Text>

            {loadingNotif ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : notifications.length === 0 ? (
              <Text style={styles.empty}>No jobs</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(i) => i.id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
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
        </View>
      )}

      {/* 👤 PROFILE DROPDOWN */}
      {open && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
          />

          <View style={styles.dropdown}>
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

            <TouchableOpacity style={styles.item} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={styles.itemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    elevation: 999,
  },

  header: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 18,
    paddingBottom: 16,
    zIndex: 10,
    elevation: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
    elevation: 12,
  },

  logo: {
    width: 26,
    height: 26,
  },

  title: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 4,
    maxWidth: 160,
  },

  iconWrapper: {
    position: "relative",
    marginRight: 14,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  profile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  profileText: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  notifDropdown: {
    position: "absolute",
    top: 70,
    right: 16,
    width: 300,
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    overflow: "hidden",
    zIndex: 1001,
    elevation: 1001,
  },

  dropdown: {
    position: "absolute",
    top: 70,
    right: 16,
    width: 260,
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    overflow: "hidden",
    zIndex: 1001,
    elevation: 1001,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  itemText: {
    fontSize: 14,
    color: "#e5e7eb",
    marginLeft: 12,
    fontWeight: "700",
  },

  notifTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  notifCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  notifCar: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f8fafc",
  },

  notifSub: {
    fontSize: 12,
    color: "#94a3b8",
  },

  notifStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "#38bdf8",
    marginTop: 2,
  },

  empty: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 20,
    fontSize: 13,
  },
});