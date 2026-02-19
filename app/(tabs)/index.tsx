import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome 👋</Text>
          <Text style={styles.title}>Car Care Service</Text>
        </View>

        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* QUICK STATS */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.totalCard]}>
          <Text style={styles.statLabel}>Total Bookings</Text>
          <Text style={[styles.statValue, { color: "#06b6d4" }]}>12</Text>
        </View>

        <View style={[styles.statCard, styles.completedCard]}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: "#16a34a" }]}>8</Text>
        </View>
      </View>

      {/* SERVICES */}
      <Text style={styles.sectionTitle}>Services</Text>

      <View style={styles.serviceGrid}>
        <ServiceCard
          icon={<FontAwesome5 name="car" size={22} color="#06b6d4" />}
          title="General Service"
        />
        <ServiceCard
          icon={<MaterialIcons name="oil-barrel" size={22} color="#06b6d4" />}
          title="Oil Change"
        />
        <ServiceCard
          icon={<Ionicons name="snow-outline" size={22} color="#06b6d4" />}
          title="AC Service"
        />
        <ServiceCard
          icon={<FontAwesome5 name="car-side" size={22} color="#06b6d4" />}
          title="Full Service"
        />
      </View>

      {/* ACTIVE BOOKING */}
      <Text style={styles.sectionTitle}>Active Booking</Text>

      <View style={styles.activeCard}>
        <Text style={styles.activeTitle}>Swift - TN 00 AB 1234</Text>
        <Text style={styles.activeText}>General Service</Text>
        <Text style={styles.activeStatus}>Status: Pending</Text>
      </View>

      {/* BOOK BUTTON */}
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => navigation.navigate("Booking")}
      >
        <Text style={styles.bookBtnText}>+ Book New Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ServiceCard({ icon, title }) {
  return (
    <TouchableOpacity style={styles.serviceCard}>
      {icon}
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  welcome: {
    color: "#6b7280",
    fontSize: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  notificationBtn: {
    backgroundColor: "#06b6d4",
    padding: 12,
    borderRadius: 50,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
  },

  totalCard: {
    backgroundColor: "#cffafe",
  },

  completedCard: {
    backgroundColor: "#dcfce7",
  },

  statLabel: {
    color: "#6b7280",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "48%",
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  serviceText: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },

  activeCard: {
    backgroundColor: "#fef9c3",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },

  activeTitle: {
    fontWeight: "bold",
    color: "#854d0e",
  },

  activeText: {
    color: "#374151",
  },

  activeStatus: {
    color: "#6b7280",
  },

  bookBtn: {
    backgroundColor: "#06b6d4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },

  bookBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
