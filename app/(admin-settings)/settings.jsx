import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

/* ================= CARD COMPONENT ================= */
const SettingCard = ({ icon, title, desc, path }) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>{icon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(path)}
      >
        <Text style={styles.buttonText}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ================= SCREEN ================= */
export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <SettingCard
        icon={<Ionicons name="person-outline" size={22} color="#2563eb" />}
        title="Profile Settings"
        desc="Update personal information and change password."
        path="/(admin-settings)/profile"
      />

      <SettingCard
        icon={<Ionicons name="people-outline" size={22} color="#2563eb" />}
        title="User Management"
        desc="Manage user roles, permissions, and accounts."
        path="/(admin-settings)/users"
      />

      <SettingCard
        icon={<FontAwesome5 name="star" size={20} color="#2563eb" />}
        title="Customer Reviews & Ratings"
        desc="View and manage customer feedback and service ratings."
        path="/(admin-settings)/review"
      />
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    padding: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  iconBox: {
    backgroundColor: "#dbeafe",
    padding: 10,
    borderRadius: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  desc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  button: {
    backgroundColor: "#15173D",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});