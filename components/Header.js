import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());
    });

    return () => unsub();
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
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <Image
              source={require("../assets/images/logo_no_bg.png")}
              style={styles.logo}
            />
          </TouchableOpacity>

          {/* RIGHT ICONS */}
          <View style={styles.rightSection}>
            {/* CART */}
            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={22} color="#0EA5E9" />
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
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              style={styles.iconButton}
            >
              <Ionicons name="menu" size={24} color="#0EA5E9" />
            </TouchableOpacity>
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

      {/* ================= DRAWER ================= */}
      <Modal visible={drawerOpen} transparent animationType="slide">
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
    backgroundColor: "#000",
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