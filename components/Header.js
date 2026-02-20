import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MobileNavbar() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // 🔥 Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data());
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setDrawerOpen(false);
    router.replace("/(auth)/login");
  };

  const links = [
    { label: "Home", path: "/(tabs)/home" },
    { label: "Services", path: "/services" },
    { label: "Pricing", path: "/pricing" },
    { label: "Products", path: "/products" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          {/* LOGO */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Image
              source={require("../assets/images/logo_no_bg.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* RIGHT SIDE */}
          <View style={styles.rightSection}>
            {/* Cart */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={22} color="#0EA5E9" />
            </TouchableOpacity>

            {/* Avatar */}
            {userData ? (
              <TouchableOpacity
                onPress={() => router.push("/account")}
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

            {/* Hamburger */}
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              style={styles.iconButton}
            >
              <Ionicons name="menu" size={24} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* DRAWER */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setDrawerOpen(false)}
        />

        <View style={styles.drawer}>
          <Text style={styles.drawerTitle}>Menu</Text>

          {links.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                router.push(item.path);
                setDrawerOpen(false);
              }}
              style={styles.drawerItem}
            >
              <Text style={styles.drawerText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* Account */}
          {userData && (
            <TouchableOpacity
              onPress={() => {
                router.push("/account");
                setDrawerOpen(false);
              }}
              style={styles.drawerItem}
            >
              <Text style={styles.drawerText}>Account</Text>
            </TouchableOpacity>
          )}

          {/* Admin Panel */}
          {userData?.role === "admin" && (
            <TouchableOpacity
              onPress={() => {
                router.push("/admin");
                setDrawerOpen(false);
              }}
              style={styles.drawerItem}
            >
              <Text style={[styles.drawerText, { color: "#FACC15" }]}>
                Admin Panel
              </Text>
            </TouchableOpacity>
          )}

          {/* Logout */}
          {userData && (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.drawerItem}
            >
              <Text style={[styles.drawerText, { color: "#EF4444" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14,165,233,0.3)",
  },

  logo: {
    width: 120,
    height: 40,
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 15,
  },

  avatar: {
    marginLeft: 15,
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

  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 260,
    height: "100%",
    backgroundColor: "#0B1120",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  drawerTitle: {
    color: "#0EA5E9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  drawerItem: {
    paddingVertical: 12,
  },

  drawerText: {
    color: "#fff",
    fontSize: 15,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 15,
  },
});