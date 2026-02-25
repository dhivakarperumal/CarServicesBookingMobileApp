import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions, Image, Linking, Modal,
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
const REVIEW_CARD_WIDTH = width - 40;

const HORIZONTAL_PADDING = 20; // same as ScrollView paddingHorizontal
const CARD_MARGIN = 12;

const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - CARD_MARGIN) / 2;

const extendedWhyData = [...whyData, ...whyData];

export default function HomeScreen({ navigation }) {

  const router = useRouter();
  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  const [myVehicles, setMyVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [reviews, setReviews] = useState([]);
  const extendedReviews = [...reviews, ...reviews];

  const carAnim = useRef(new Animated.Value(0)).current;

  const whyListRef = useRef(null);
  const reviewListRef = useRef(null);
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

      // 🔥 Extract unique vehicles
      const vehiclesMap = {};

      data.forEach((item) => {
        if (item.vehicleNumber && item.vehicleType) {
          vehiclesMap[item.vehicleNumber] = {
            vehicleNumber: item.vehicleNumber,
            vehicleType: item.vehicleType,
            brand: item.brand,
            model: item.model,
          };
        }
      });

      setMyVehicles(Object.values(vehiclesMap));
    });

    return () => unsub();
  }, [user]);

  // Fetch My Vehicles from addServices
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "allServices"),
      where("uid", "==", user.uid),
      where("addVehicle", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMyVehicles(data);
    });

    return () => unsub();
  }, [user]);

  // Fetch reviews
  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("status", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(data);
    });

    return () => unsub();
  }, []);

  // auto scroll reviews
  useEffect(() => {
    if (!reviews.length) return;

    let index = 0;

    const interval = setInterval(() => {
      if (!reviewListRef.current) return;

      index++;

      reviewListRef.current.scrollToOffset({
        offset: index * REVIEW_CARD_WIDTH,
        animated: true,
      });

      if (index >= reviews.length) {
        index = 0;

        setTimeout(() => {
          reviewListRef.current?.scrollToOffset({
            offset: 0,
            animated: false,
          });
        }, 400);
      }
    }, 4000); // 🔥 4 seconds (different from why section)

    return () => clearInterval(interval);
  }, [reviews]);

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

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

      {/* MY VEHICLES */}
      {myVehicles.length > 0 && (
        <>
          <View style={styles.premiumSectionHeader}>
            <View style={styles.premiumAccent} />
            <Ionicons
              name="car-sport-outline"
              size={18}
              color="#0EA5E9"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.premiumSectionTitle}>
              My Vehicles
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            {myVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.premiumCard}
                activeOpacity={0.85}
                onPress={() => setSelectedVehicle(vehicle)}
              >

                {/* Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.carIconBox}>
                    <FontAwesome5 name="motorcycle" size={18} color="#0EA5E9" />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.premiumCarName}>
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <Text style={styles.premiumService}>
                      {vehicle.vehicleType} • {vehicle.vehicleNumber}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.premiumStatus,
                      { backgroundColor: "#F59E0B" },
                    ]}
                  >
                    <Text style={styles.premiumStatusText}>
                      {vehicle.addVehicleStatus}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Bottom Row */}
                <View style={styles.cardBottomRow}>
                  <Text style={styles.bookingIdText}>
                    ID: {vehicle.addVehicleId}
                  </Text>

                  <Text style={styles.viewDetailsText}>
                    {vehicle.serviceStatus}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {selectedVehicle && (
            <VehicleDetailModal
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
            />
          )}
        </>
      )}

      {/* ACTIVE BOOKING */}
      {allBookings
        .filter(
          (booking) =>
            !booking?.vehicleNumber ||
            !booking?.vehicleType
        )
        .length > 0 && (
          <>
            <View style={styles.premiumSectionHeader}>
              <View style={styles.premiumAccent} />
              <Text style={styles.premiumSectionTitle}>
                My Bookings
              </Text>
            </View>

            <View style={styles.bookingsContainer}>
              {allBookings
                .filter(
                  (booking) =>
                    !booking?.vehicleNumber ||
                    !booking?.vehicleType
                )
                .map((booking) => (
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
        contentContainerStyle={{}}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
      />

      {/* customer reviews */}
      <View style={styles.premiumSectionHeader}>
        <View style={styles.premiumAccent} />
        <Ionicons name="star-outline" size={18} color="#0EA5E9" style={{ marginRight: 6 }} />
        <Text style={styles.premiumSectionTitle}>
          Customer Reviews
        </Text>
      </View>

      <Animated.FlatList
        ref={reviewListRef}
        data={extendedReviews}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            {/* Profile Row */}
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.reviewImage}
                  />
                ) : (
                  <Ionicons name="person" size={20} color="#0EA5E9" />
                )}
              </View>

              <View style={{ marginLeft: 10 }}>
                <Text style={styles.reviewName}>{item.name}</Text>

                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={14}
                      color="#FBBF24"
                    />
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.reviewMessage}>
              "{item.message}"
            </Text>
          </View>
        )}
        contentContainerStyle={{}}
        decelerationRate="fast"
      />


      {/* CONTACT US */}
      <View style={styles.premiumSectionHeader}>
        <View style={styles.premiumAccent} />
        <Ionicons name="call-outline" size={18} color="#0EA5E9" style={{ marginRight: 6 }} />
        <Text style={styles.premiumSectionTitle}>
          Contact Us
        </Text>
      </View>

      <View style={styles.contactCard}>

        {/* Phone */}
        <View style={styles.contactRow}>
          <Ionicons name="call" size={18} color="#0EA5E9" />
          <Text style={styles.contactText}>+91 98765 43210</Text>
        </View>

        {/* Email */}
        <View style={styles.contactRow}>
          <Ionicons name="mail" size={18} color="#0EA5E9" />
          <Text style={styles.contactText}>support@carservice.com</Text>
        </View>

        {/* Address */}
        <View style={styles.contactRow}>
          <Ionicons name="location" size={18} color="#0EA5E9" />
          <Text style={styles.contactText}>
            No. 24, Anna Nagar, Chennai, Tamil Nadu
          </Text>
        </View>

      </View>

      {/* Map */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          Linking.openURL(
            "https://maps.app.goo.gl/kv7qjVpYMpcXuzx17"
          )
        }
      >
        <LinearGradient
          colors={["#0EA5E9", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientMapButton}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.gradientMapText}>
            Get Directions
          </Text>
        </LinearGradient>
      </TouchableOpacity>

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
            <View style={styles.trackerMainContainer}>
              {/* Line + Circles Row */}
              <View style={styles.lineContainer}>
                {STATUS_FLOW.map((status, index) => {
                  const currentIndex = STATUS_FLOW.indexOf(
                    booking.normalizedStatus
                  );
                  const isCompleted = index <= currentIndex;

                  return (
                    <View
                      key={status}
                      style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    >
                      <View
                        style={[
                          styles.trackerCircle,
                          isCompleted && styles.trackerActiveCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.trackerCircleText,
                            isCompleted && styles.trackerActiveText,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      {index !== STATUS_FLOW.length - 1 && (
                        <View
                          style={[
                            styles.trackerLine,
                            index < currentIndex && styles.trackerActiveLine,
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* CURRENT STATUS */}
              <View style={styles.currentStatusContainer}>
                <Text style={styles.currentStatusLabel}>
                  Current Status
                </Text>

                <Text style={styles.currentStatusValue}>
                  {STATUS_LABELS[booking.normalizedStatus]}
                </Text>
              </View>

              {/* LEGEND LIST */}
              <View style={styles.statusLegendContainer}>
                {STATUS_FLOW.map((status, index) => {
                  const currentIndex = STATUS_FLOW.indexOf(
                    booking.normalizedStatus
                  );
                  const isCurrent = index === currentIndex;

                  return (
                    <View key={status} style={styles.legendRow}>
                      <Text
                        style={[
                          styles.statusLegendText,
                          isCurrent && styles.statusLegendActiveText,
                        ]}
                      >
                        {index + 1} - {STATUS_LABELS[status]}
                      </Text>
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

function VehicleDetailModal({ vehicle, onClose }) {
  const normalizedStatus =
    STATUS_NORMALIZER[vehicle.serviceStatus] || vehicle.serviceStatus;
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Vehicle Details
            </Text>

            {/* Add Vehicle ID */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Vehicle ID</Text>
              <Text style={styles.detailValue}>
                {vehicle.addVehicleId}
              </Text>
            </View>

            {/* Name */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Customer Name</Text>
              <Text style={styles.detailValue}>
                {vehicle.name}
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>
                {vehicle.phone}
              </Text>
            </View>

            {/* Email */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>
                {vehicle.email}
              </Text>
            </View>

            {/* Brand */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>
                {vehicle.brand}
              </Text>
            </View>

            {/* Model */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Model</Text>
              <Text style={styles.detailValue}>
                {vehicle.model}
              </Text>
            </View>

            {/* Vehicle Type */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Vehicle Type</Text>
              <Text style={styles.detailValue}>
                {vehicle.vehicleType}
              </Text>
            </View>

            {/* Vehicle Number */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Vehicle Number</Text>
              <Text style={styles.detailValue}>
                {vehicle.vehicleNumber}
              </Text>
            </View>

            {/* Issue */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Issue</Text>
              <Text style={styles.detailValue}>
                {vehicle.issue}
              </Text>
            </View>

            {/* Address */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {vehicle.address}
              </Text>
            </View>

            {/* Created Date */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Created Date</Text>
              <Text style={styles.detailValue}>
                {vehicle.createdDate} • {vehicle.createdTime}
              </Text>
            </View>

            {/* Status */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Vehicle Status</Text>
              <Text style={[styles.detailValue, { color: "#F59E0B" }]}>
                {vehicle.addVehicleStatus}
              </Text>
            </View>

            {/* Service Status */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Service Status</Text>
              <Text style={[styles.detailValue, { color: "#38bdf8" }]}>
                {vehicle.serviceStatus}
              </Text>
            </View>

            {/* SERVICE TRACKER */}
            <View style={styles.trackerMainContainer}>

              {/* Line + Circles */}
              <View style={styles.lineContainer}>
                {STATUS_FLOW.map((status, index) => {
                  const currentIndex = STATUS_FLOW.indexOf(normalizedStatus);
                  const isCompleted = index <= currentIndex;

                  return (
                    <View
                      key={status}
                      style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    >
                      <View
                        style={[
                          styles.trackerCircle,
                          isCompleted && styles.trackerActiveCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.trackerCircleText,
                            isCompleted && styles.trackerActiveText,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      {index !== STATUS_FLOW.length - 1 && (
                        <View
                          style={[
                            styles.trackerLine,
                            index < currentIndex && styles.trackerActiveLine,
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* CURRENT STATUS */}
              <View style={styles.currentStatusContainer}>
                <Text style={styles.currentStatusLabel}>
                  Current Status
                </Text>

                <Text style={styles.currentStatusValue}>
                  {STATUS_LABELS[normalizedStatus]}
                </Text>
              </View>

              {/* LEGEND */}
              <View style={styles.statusLegendContainer}>
                {STATUS_FLOW.map((status, index) => {
                  const currentIndex = STATUS_FLOW.indexOf(normalizedStatus);
                  const isCurrent = index === currentIndex;

                  return (
                    <View key={status} style={styles.legendRow}>
                      <Text
                        style={[
                          styles.statusLegendText,
                          isCurrent && styles.statusLegendActiveText,
                        ]}
                      >
                        {index + 1} - {STATUS_LABELS[status]}
                      </Text>
                    </View>
                  );
                })}
              </View>

            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalButtonText}>
                Close
              </Text>
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

  // reviews
  reviewCard: {
    width: REVIEW_CARD_WIDTH,
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.15)",
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  reviewAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(14,165,233,0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  reviewImage: {
    width: "100%",
    height: "100%",
  },

  reviewName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  ratingRow: {
    flexDirection: "row",
    marginTop: 4,
  },

  reviewMessage: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },



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

  gradientMapButton: {
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    alignSelf: "center",
  },

  gradientMapText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
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

  // contact us
  contactCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.15)",
    marginBottom: 20,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  contactText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
  },

  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.15)",
  },

  mapButton: {
    flexDirection: "row",
    backgroundColor: "#0EA5E9",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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

  trackerMainContainer: {
    marginTop: 20,
    marginBottom: 30,
  },

  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  trackerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  trackerActiveCircle: {
    backgroundColor: "#38bdf8",
  },

  trackerCircleText: {
    color: "#9ca3af",
    fontWeight: "700",
    fontSize: 12,
  },

  trackerActiveText: {
    color: "#000",
  },

  trackerLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#374151",
  },

  trackerActiveLine: {
    backgroundColor: "#38bdf8",
  },

  currentStatusContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  currentStatusLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },

  currentStatusValue: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "700",
  },

  statusLegendContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(56, 189, 248, 0.2)",
    paddingTop: 15,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statusLegendText: {
    color: "#cbd5e1",
    fontSize: 13,
  },

  statusLegendActiveText: {
    color: "#38bdf8",
    fontWeight: "700",
  },

});