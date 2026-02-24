import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { Animated } from "react-native";
import { collection, onSnapshot, orderBy, query, where, doc, getDoc } from "firebase/firestore";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../firebase";
import { Dimensions } from "react-native";

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

const whyData = [
  {
    title: "Certified Mechanics",
    subtitle: "Experienced & verified professionals",
    icon: <FontAwesome5 name="tools" size={20} color="#0EA5E9" />,
  },
  {
    title: "Pickup & Drop",
    subtitle: "Doorstep vehicle collection",
    icon: <Ionicons name="car-sport-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "Genuine Parts",
    subtitle: "100% authentic spare parts",
    icon: <Ionicons name="shield-checkmark-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "Quick Service",
    subtitle: "Fast turnaround time",
    icon: <Ionicons name="flash-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "Affordable Pricing",
    subtitle: "Transparent pricing system",
    icon: <Ionicons name="cash-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "Service Warranty",
    subtitle: "Guaranteed workmanship",
    icon: <Ionicons name="ribbon-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "24/7 Support",
    subtitle: "Always available for help",
    icon: <Ionicons name="headset-outline" size={20} color="#0EA5E9" />,
  },
  {
    title: "Live Tracking",
    subtitle: "Track service progress",
    icon: <Ionicons name="location-outline" size={20} color="#0EA5E9" />,
  },
];

const { width } = Dimensions.get("window");

const HORIZONTAL_PADDING = 20; // same as ScrollView paddingHorizontal
const CARD_MARGIN = 12;

const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - CARD_MARGIN * 2) / 3;

const extendedWhyData = [...whyData, ...whyData];

export default function HomeScreen({ navigation }) {

  const router = useRouter();
  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  const carAnim = useRef(new Animated.Value(0)).current;

  const whyListRef = useRef(null);
  const scrollX = useRef(0);

  const getStatusColor = (status) => {
    switch (status) {
      case "BOOKED":
        return "#3B82F6";
      case "PROCESSING":
      case "SERVICE_GOING":
        return "#F59E0B";
      case "SERVICE_COMPLETED":
        return "#10B981";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#0EA5E9";
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(carAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Fetch current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        // 🔥 Fetch username from Firestore
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
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

  // why swiper auto-scroll
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (!whyListRef.current) return;

      index++;

      whyListRef.current.scrollToOffset({
        offset: index * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });

      // reset silently after half (no visible jump)
      if (index >= whyData.length) {
        index = 0;

        setTimeout(() => {
          whyListRef.current?.scrollToOffset({
            offset: 0,
            animated: false,
          });
        }, 400);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* PREMIUM WELCOME BANNER */}
      <LinearGradient
        colors={["#0EA5E9", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerContainer}
      >
        <Text style={styles.bannerWelcome}>
          Welcome Back
          {username ? (
            <Text style={styles.highlightName}>, {username}</Text>
          ) : null}
          {" 👋"}
        </Text>
        {/* Animated Car */}
        <Animated.View
          style={[
            styles.carTopWrapper,
            { transform: [{ translateX: carAnim }] },
          ]}
        >
          <FontAwesome5 name="car-side" size={60} color="#fff" />
        </Animated.View>



        <Text style={styles.bannerTitle}>
          Premium Car Care Service
        </Text>

        <Text style={styles.bannerSubtitle}>
          Book trusted mechanics at your doorstep
        </Text>

        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => router.push("/(tabs)/booking")}
        >
          <Ionicons name="car-outline" size={18} color="#0EA5E9" />
          <Text style={styles.bannerButtonText}>Book Now</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ACTIVE BOOKING */}
      {allBookings.length > 0 && (
        <>
          <View style={styles.premiumSectionHeader}>
            <View style={styles.premiumAccent} />
            <Text style={styles.premiumSectionTitle}>
              My Bookings
            </Text>
          </View>

          <View style={styles.bookingsContainer}>
            {allBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.premiumCard}
                onPress={() => setSelectedBooking(booking)}
                activeOpacity={0.85}
              >
                {/* Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.carIconBox}>
                    <FontAwesome5 name="car" size={18} color="#0EA5E9" />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.premiumCarName}>
                      {booking.brand} {booking.model}
                    </Text>
                    <Text style={styles.premiumService}>
                      {booking.issue}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.premiumStatus,
                      { backgroundColor: getStatusColor(booking.normalizedStatus) },
                    ]}
                  >
                    <Text style={styles.premiumStatusText}>
                      {STATUS_LABELS[booking.normalizedStatus]}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Bottom Row */}
                <View style={styles.cardBottomRow}>
                  <Text style={styles.bookingIdText}>
                    ID: {booking.bookingId}
                  </Text>

                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>
                      Tap to view details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
                  </View>
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

      {/* WHY CHOOSE US */}
      <View style={styles.premiumSectionHeader}>
        <View style={styles.premiumAccent} />
        <Text style={styles.premiumSectionTitle}>
          Why Choose Us
        </Text>
      </View>

      <Animated.FlatList
        ref={whyListRef}
        data={extendedWhyData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.whySwiperCard}>
            <View style={styles.whyIconBoxLarge}>
              {item.icon}
            </View>
            <Text style={styles.whySwiperTitle}>{item.title}</Text>
            <Text style={styles.whySwiperSubtitle}>{item.subtitle}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      />

    </ScrollView>
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

  bannerContainer: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 30,
    alignItems: "center",
  },

  carTopWrapper: {
    marginBottom: 1,
  },

  bannerWelcome: {
    color: "#E0F2FE",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    paddingBottom: 10,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },

  highlightName: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 17,
  },

  bannerSubtitle: {
    color: "#DBEAFE",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },

  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 18,
  },

  bannerButtonText: {
    color: "#0EA5E9",
    fontWeight: "700",
    marginLeft: 6,
  },

  contentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  premiumCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.15)",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  carIconBox: {
    backgroundColor: "rgba(14,165,233,0.1)",
    padding: 10,
    borderRadius: 12,
  },

  premiumCarName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  premiumService: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  premiumStatus: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  premiumStatusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 14,
  },

  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bookingIdText: {
    color: "#6B7280",
    fontSize: 12,
  },

  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewDetailsText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  // heading 
  premiumSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 18,
  },

  premiumAccent: {
    width: 2,
    height: 22,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    marginRight: 10,
  },

  premiumSectionTitle: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // why choose us 

  whyScrollContainer: {
    paddingRight: 20,
  },

  whySwiperCard: {
    width: CARD_WIDTH,
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.15)",
  },

  whyIconBoxLarge: {
    backgroundColor: "rgba(14,165,233,0.1)",
    padding: 14,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },

  whySwiperTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  whySwiperSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
  },
  // why choose us end




 
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
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