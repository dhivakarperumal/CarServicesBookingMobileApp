import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

/* ===== STATUS LABELS ===== */
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

/* ===== STATUS NORMALIZER ===== */
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

export default function BookedService() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== AUTH ===== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ===== FETCH BOOKINGS ===== */
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "bookings"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
          const raw = doc.data();
          return {
            id: doc.id,
            ...raw,
            normalizedStatus:
              STATUS_NORMALIZER[raw.status] || raw.status,
          };
        });

        setBookings(data);
      } catch (err) {
        console.log("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  /* ===== STATUS COLOR ===== */
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          backgroundColor: "#082f49",
          borderColor: "#0ea5e9",
          textColor: "#38bdf8",
        };
      case "CANCELLED":
        return {
          backgroundColor: "#3f1d1d",
          borderColor: "#ef4444",
          textColor: "#f87171",
        };
      default:
        return {
          backgroundColor: "#3f3f1d",
          borderColor: "#eab308",
          textColor: "#facc15",
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#9ca3af" }}>No bookings found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.outerCard}>
        <Text style={styles.title}>My Service Bookings</Text>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.normalizedStatus);

            return (
              <TouchableOpacity style={styles.bookingCard}>
                <View>
                  <Text style={styles.bookingId}>
                    {item.bookingId}
                  </Text>

                  <Text style={styles.subText}>
                    {item.name} • {item.phone}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusStyle.backgroundColor,
                      borderColor: statusStyle.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: statusStyle.textColor,
                      fontWeight: "600",
                    }}
                  >
                    {STATUS_LABELS[item.normalizedStatus]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    paddingTop: 20,
  },
  outerCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 20,
  },
  bookingCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingId: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    color: "#9ca3af",
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});