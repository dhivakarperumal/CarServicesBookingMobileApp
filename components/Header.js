import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebase";

export default function MobileNavbar() {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const [cartCount, setCartCount] = useState(0);

  // notification
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);


  /* ================= AUTH ================= */
  useEffect(() => {
    let unsubCart = null;
    let unsubBookings = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        setCartCount(0);
        setNotifications([]);
        return;
      }

      // Get user data
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data());
      }

      // 🔥 CART LISTENER
      const cartRef = collection(db, "users", user.uid, "cart");
      unsubCart = onSnapshot(cartRef, (snapshot) => {
        setCartCount(snapshot.size);
      });

      // 🔔 BOOKINGS LISTENER
      const bookingRef = collection(db, "bookings");
      unsubBookings = onSnapshot(bookingRef, (snapshot) => {
        const updated = [];

        snapshot.forEach((docItem) => {
          const data = docItem.data();

          if (
            data.uid === user.uid &&
            data.status &&
            data.status !== "Pending"
          ) {
            updated.push({
              id: docItem.id,
              bookingId: data.bookingId,
              status: data.status,
              trackNumber: data.trackNumber,
              createdAt: data.createdAt,
            });
          }
        });

        setNotifications(updated);
      });
    });

    return () => {
      unsubAuth();
      if (unsubCart) unsubCart();
      if (unsubBookings) unsubBookings();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setAvatarMenuOpen(false);
    setDrawerOpen(false);
    router.replace("/(auth)/login");
  };


  /* ================= RENDER ================= */
  return (

    <>
      {/* ================= HEADER ================= */}
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          {/* LOGO */}
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Image
              source={require("../assets/images/logo_no_bg.png")}
              style={styles.logo}
            />
          </TouchableOpacity>

          {/* RIGHT ICONS */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={() => router.push("/(app)/cart")}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={22} color="#0EA5E9" />

              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 🔔 NOTIFICATION */}
            <TouchableOpacity
              onPress={() => setNotificationOpen(true)}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={22} color="#0EA5E9" />

              {notifications.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* AVATAR */}
            {userData ? (
              <TouchableOpacity
                onPress={() => setAvatarMenuOpen(true)}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {(userData.username || userData.email)
                    ?.charAt(0)
                    .toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={styles.iconButton}
              >
                <Feather name="user" size={20} color="#0EA5E9" />
              </TouchableOpacity>
            )}

            {/* HAMBURGER */}
            {/* <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              style={styles.iconButton}
            >
              <Ionicons name="menu" size={24} color="#0EA5E9" />
            </TouchableOpacity> */}
          </View>
        </View>
      </SafeAreaView>

      {/* ================= AVATAR DROPDOWN ================= */}
      <Modal visible={avatarMenuOpen} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setAvatarMenuOpen(false)}
        />

        <View style={styles.avatarMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setAvatarMenuOpen(false);
              router.push("/(tabs)/profile");
            }}
          >
            <Text style={styles.menuText}>My Profile</Text>
          </TouchableOpacity>

          {userData?.role === "admin" && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setAvatarMenuOpen(false);
                router.push("/(adminTabs)/home");
              }}
            >
              <Text style={[styles.menuText, { color: "#FACC15" }]}>
                Admin Panel
              </Text>
            </TouchableOpacity>
          )}

          {userData?.role === "mechanic" && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setAvatarMenuOpen(false);
                router.push("/(EmployeesDash)/dashboard");
              }}
            >
              <Text style={[styles.menuText, { color: "#22C55E" }]}>
                Employee Dashboard
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Text style={[styles.menuText, { color: "#EF4444" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ================= NOTIFICATION DROPDOWN ================= */}
      <Modal visible={notificationOpen} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setNotificationOpen(false)}
        />

        <View style={styles.avatarMenu}>
          {notifications.length === 0 ? (
            <View style={styles.menuItem}>
              <Text style={styles.menuText}>No Notifications</Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  setNotificationOpen(false);
                  router.push("/(tabs)/profile");
                }}
              >
                <Text style={styles.menuText}>
                  Booking {item.bookingId}
                </Text>
                <Text style={{ color: "#22C55E", fontSize: 12 }}>
                  Status: {item.status}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Modal>

      {/* ================= DRAWER ================= */}
      {/* <Modal visible={drawerOpen} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setDrawerOpen(false)}
        />

        <View style={styles.drawer}>
          {[
            ["Home", "/(tabs)/home"],
            ["Services", "/services"],
            ["Pricing", "/pricing"],
            ["Products", "/products"],
            ["About", "/about"],
            ["Contact", "/contact"],
          ].map(([label, path]) => (
            <TouchableOpacity
              key={label}
              style={styles.drawerItem}
              onPress={() => {
                setDrawerOpen(false);
                router.push(path);
              }}
            >
              <Text style={styles.drawerText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal> */}

    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000",
  },

  header: {
    height: 60,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14,165,233,0.3)",
  },

  logo: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 14,
  },

  avatar: {
    marginLeft: 14,
    backgroundColor: "#0EA5E9",
    width: 34,
    height: 34,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#000",
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  /* ===== AVATAR MENU ===== */
  avatarMenu: {
    position: "absolute",
    top: 90,
    right: 16,
    width: 180,
    backgroundColor: "#0B1120",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.4)",
    paddingVertical: 8,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  menuText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  /* ===== DRAWER ===== */
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 260,
    height: "100%",
    backgroundColor: "#0B1120",
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  drawerItem: {
    paddingVertical: 14,
  },

  drawerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});