import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back 👋</Text>
          <Text style={styles.title}>Car Care Service</Text>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="notifications-outline" size={22} color="#0EA5E9" />
        </TouchableOpacity>
      </View>
      

      <View className="px-4 py-6">
        {/* QUICK STATS */}
        <View className="flex-row gap-3 mb-8">
          <LinearGradient
            colors={["#06b6d4", "#0891b2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-5 rounded-2xl shadow-lg"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-xs font-medium mb-1">Total Bookings</Text>
                <Text className="text-white text-3xl font-bold">12</Text>
              </View>
              <View className="bg-black bg-opacity-20 p-3 rounded-full">
                <FontAwesome5 name="calendar-alt" size={24} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-5 rounded-2xl shadow-lg"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-green-100 text-xs font-medium mb-1">Completed</Text>
                <Text className="text-red-500 text-3xl font-bold">20</Text>
              </View>
              <View className="bg-white bg-opacity-20 p-3 rounded-full">
                <FontAwesome5 name="check-circle" size={24} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </View>

      {/* SERVICES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Services")}>
          <Text style={styles.linkText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.servicesGrid}>
        <ServiceCard
          icon={<FontAwesome5 name="car" size={24} color="#0EA5E9" />}
          title="General Service"
        />
        <ServiceCard
          icon={<MaterialIcons name="oil-barrel" size={24} color="#0EA5E9" />}
          title="Oil Change"
        />
        <ServiceCard
          icon={<Ionicons name="snow-outline" size={24} color="#0EA5E9" />}
          title="AC Service"
        />
        <ServiceCard
          icon={<FontAwesome5 name="car-side" size={24} color="#0EA5E9" />}
          title="Full Service"
        />
      </View>

      {/* ACTIVE BOOKING */}
      <Text style={styles.sectionTitle}>Active Booking</Text>

      <View style={styles.bookingCard}>
        <View style={styles.bookingTop}>
          <View>
            <Text style={styles.carName}>Swift - TN 00 AB 1234</Text>
            <Text style={styles.serviceName}>General Service</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.smallText}>Est. Time: 2 hours</Text>
          <Text style={styles.smallText}>₹ 1,500</Text>
        </View>
      </View>

      {/* BOOK BUTTON */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate("Booking")}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.bookButtonText}>Book New Service</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

/* ================= SERVICE CARD COMPONENT ================= */

function ServiceCard({ icon, title }) {
  return (
    <TouchableOpacity style={styles.serviceCard}>
      <View style={styles.serviceIcon}>{icon}</View>
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  welcome: {
    color: "#94A3B8",
    fontSize: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },

  iconCircle: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 50,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  linkText: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "600",
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  serviceCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
  },

  serviceIcon: {
    backgroundColor: "#0B1120",
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },

  serviceText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  bookingCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
  },

  bookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  carName: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  serviceName: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallText: {
    color: "#94A3B8",
    fontSize: 12,
  },

  bookButton: {
    flexDirection: "row",
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  bookButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
});