import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase";

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

export default function BookedService() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

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

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return { backgroundColor: "#082f49", textColor: "#38bdf8" };
      case "CANCELLED":
        return { backgroundColor: "#3f1d1d", textColor: "#f87171" };
      default:
        return { backgroundColor: "#3f3f1d", textColor: "#facc15" };
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
        <Text style={styles.emptyText}>No bookings found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Service Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.normalizedStatus);

          return (
            <TouchableOpacity style={styles.bookingRow}>
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
                  { backgroundColor: statusStyle.backgroundColor },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusStyle.textColor },
                  ]}
                >
                  {STATUS_LABELS[item.normalizedStatus]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 20,
  },

bookingRow: {
  backgroundColor: "#111827",
  paddingVertical: 18,
  paddingHorizontal: 16,
  borderRadius: 16,
  marginBottom: 16,

  // Sky blue border
  borderWidth: 1,
  borderColor: "#0ea5e9",

  // Soft shadow
  shadowColor: "#0ea5e9",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 3,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

  bookingId: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  subText: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 13,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  center: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
});