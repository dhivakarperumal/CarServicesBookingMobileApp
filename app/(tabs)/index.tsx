import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../firebase";

const STATUS_FLOW = [
    "BOOKED",
    "CALL_VERIFIED",
    "APPROVED",
    "PROCESSING",
    "WAITING_SPARE",
    "SERVICE_GOING",
    "BILL_PENDING",
    "BILL_COMPLETED",
    "SERVICE_COMPLETED",
];

const STATUS_LABELS = {
  BOOKED: "Booked",
  CALL_VERIFIED: "Call Verified",
  APPROVED: "Approved",
  PROCESSING: "Processing",
  WAITING_SPARE: "Waiting for Spare",
  SERVICE_GOING: "Service Going On",
  BILL_PENDING: "Bill Pending",
  BILL_COMPLETED: "Bill Completed",
  SERVICE_COMPLETED: "Service Completed",
  CANCELLED: "Cancelled",
};

const STATUS_NORMALIZER = {
  Booked: "BOOKED",
  "Call Verified": "CALL_VERIFIED",
  Approved: "APPROVED",
  Processing: "PROCESSING",
  "Waiting for Spare": "WAITING_SPARE",
  "Service Going on": "SERVICE_GOING",
  "Bill Pending": "BILL_PENDING",
  "Bill Completed": "BILL_COMPLETED",
  "Service Completed": "SERVICE_COMPLETED",
  Cancelled: "CANCELLED",
};

export default function HomeScreen({ navigation }) {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Fetch services
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(data);
    });

    return () => unsub();
  }, []);

  // Fetch all bookings
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          ...raw,
          normalizedStatus: STATUS_NORMALIZER[raw.status] || raw.status,
        };
      });

      // Show all bookings (not filtered)
      setAllBookings(data);
    });

    return () => unsub();
  }, [user]);
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

          {/* ACTIVE BOOKING */}
        {allBookings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Bookings</Text>

           <View style={styles.bookingsContainer}>
              {allBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingCard}
                  onPress={() => setSelectedBooking(booking)}
                >
                  <View style={styles.bookingTop}>
                    <View>
                      <Text style={styles.carName}>{booking.brand} - {booking.model}</Text>
                      <Text style={styles.serviceName}>{booking.issue}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{STATUS_LABELS[booking.normalizedStatus]}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.smallText}>ID: {booking.bookingId}</Text>
                    <Text style={styles.smallText}>{booking.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {selectedBooking && (
              <BookingDetailModal
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
              />
            )}
          </>
        )}


      <View style={styles.contentWrapper}>

        {/* SERVICES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/services")}>
            <Text style={styles.linkText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              icon={<FontAwesome5 name="car" size={24} color="#0EA5E9" />}
              title={service.name}
            />
          ))}
        </View>

        {/* BOOK BUTTON */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push("/(tabs)/booking")}
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

/* ================= BOOKING DETAIL MODAL ================= */

function BookingDetailModal({ booking, onClose }) {
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>
              Booking Details
            </Text>

            {/* Booking ID */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{booking.bookingId}</Text>
            </View>

            {/* Name */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{booking.name}</Text>
            </View>

            {/* Phone */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{booking.phone}</Text>
            </View>

            {/* Car Brand */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Car Brand</Text>
              <Text style={styles.detailValue}>{booking.brand}</Text>
            </View>

            {/* Car Model */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Car Model</Text>
              <Text style={styles.detailValue}>{booking.model}</Text>
            </View>

            {/* Issue */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Issue</Text>
              <Text style={styles.detailValue}>{booking.issue}</Text>
            </View>

            {/* Location */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{booking.location}</Text>
            </View>

            {/* Address */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Service Address</Text>
              <Text style={styles.detailValue}>{booking.address}</Text>
            </View>

            {/* Status */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: "#0ea5e9" }]}>
                {STATUS_LABELS[booking.normalizedStatus] || booking.status}
              </Text>
            </View>

            {/* Service Tracker */}
            <View style={styles.trackerSection}>
              <Text style={styles.sectionTitle}>Service Progress</Text>
              <View style={styles.trackerContainer}>
                {STATUS_FLOW.map((status, index) => {
                  const isCompleted = index <= STATUS_FLOW.indexOf(booking.normalizedStatus || "");
                  return (
                    <View key={status} style={styles.stepWrapper}>
                      <View style={[styles.circle, isCompleted && styles.activeCircle]}>
                        <Text style={[styles.stepText, isCompleted && styles.activeText]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.stepLabel}>{status.replace(/_/g, " ")}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  contentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  gradientCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginRight: 10,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statLabelWhite: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  statLabelGreen: {
    color: "#D1FAE5",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  statNumberWhite: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },

  iconWrapperDark: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 50,
  },

  iconWrapperLight: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 50,
  },
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
    marginBottom: 12,
    marginTop: 4,
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
    paddingVertical: 24,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    width: "100%",
  },

  bookingsContainer: {
    marginBottom: 20,
  },

bookingCard: {
  backgroundColor: "#111827",
  borderRadius: 16,
  padding: 18,
  marginBottom: 16,
  width: "100%",   // 👈 full width
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
    paddingHorizontal: 12,
    paddingVertical: 0,   
    borderRadius: 14,     
    justifyContent: "center",
    alignItems: "center",
    minHeight: 10,
    maxHeight: 20,     
  },

  statusText: {
    color: "#fff",
    fontSize: 12,   
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },

  closeButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  modalTitle: {
    color: "#38bdf8",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: -8,
  },

  detailSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14, 165, 233, 0.1)",
  },

  detailLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  detailValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },

  closeModalButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  closeModalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* Tracker Styles */
  trackerSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(14, 165, 233, 0.1)",
  },

  sectionTitle: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },

  trackerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 16,
  },

  stepWrapper: {
    alignItems: "center",
    width: "48%",
    marginBottom: 24,
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },

  stepText: {
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 18,
  },

  activeText: {
    color: "#000",
  },

  stepLabel: {
    marginTop: 8,
    fontSize: 11,
    textAlign: "center",
    color: "#d1d5db",
    width: 110,
  },
});