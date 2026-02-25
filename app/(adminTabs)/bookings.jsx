import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  addDoc,
  getDocs,
  where,
  setDoc,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

const BOOKING_STATUS = [
  "All",
  "Booked",
  "Call Verified",
  "Approved",
  "Cancelled",
];

const DATE_FILTERS = ["All", "Today", "This Week", "This Month", "Last Month"];

export default function ShowAllBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Booked");
  const [dateFilter, setDateFilter] = useState("All");

  const [popup, setPopup] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  /* 🔥 AUTO TRACK NUMBER */
 const generateTrackNumber = async () => {
  const now = new Date();

  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  // 🔥 Query today's services
  const q = query(
    collection(db, "allServices"),
    where("createdAt", ">=", todayStart),
    where("createdAt", "<=", todayEnd)
  );

  const snapshot = await getDocs(q);

  const count = snapshot.size + 1;

  const runningNumber = String(count).padStart(3, "0");

  return `TRK-${yy}-${mm}-${dd}-${runningNumber}`;
};

  /* 🔥 FETCH BOOKINGS */
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setBookings(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  /* 📅 DATE FILTER */
  const isInDateFilter = (createdAt) => {
    if (!createdAt?.toDate) return true;

    const date = createdAt.toDate();
    const now = new Date();

    if (dateFilter === "Today") {
      return date.toDateString() === now.toDateString();
    }

    if (dateFilter === "This Week") {
      const firstDay = new Date();
      firstDay.setDate(now.getDate() - now.getDay());
      return date >= firstDay;
    }

    if (dateFilter === "This Month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "Last Month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear()
      );
    }

    return true;
  };

  /* 🔎 FILTER */
  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.trackNumber?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchDate = isInDateFilter(b.createdAt);

    return matchSearch && matchStatus && matchDate;
  });

  /* 🔄 UPDATE STATUS */
  const updateStatus = async (booking, newStatus, extraData = {}) => {
    try {
      const bookingRef = doc(db, "bookings", booking.id);

      const updateData = {
        status: newStatus,
        ...extraData,
      };

      /* 🔥 UPDATE MAIN BOOKING */
      await updateDoc(bookingRef, updateData);

      /* 🔥 SAFE USER BOOKING SYNC (AUTO CREATE IF MISSING) */
      if (booking.uid) {
        const userBookingRef = doc(
          db,
          "users",
          booking.uid,
          "bookings",
          booking.id,
        );

        try {
          await updateDoc(userBookingRef, updateData);
        } catch {
          await setDoc(userBookingRef, {
            ...booking,
            ...updateData,
          });
        }
      }

      /* 🚀 MOVE TO allServices WHEN APPROVED */
      if (newStatus === "Approved" && !booking.serviceCreated) {
        const q = query(
          collection(db, "allServices"),
          where("bookingDocId", "==", booking.id),
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          await addDoc(collection(db, "allServices"), {
            bookingId: booking.bookingId,
            bookingDocId: booking.id,
            uid: booking.uid || null,
            name: booking.name || "",
            phone: booking.phone || "",
            brand: booking.brand || "",
            model: booking.model || "",
            issue: booking.issue || "",
            location: booking.location || "",
            address: booking.address || "",
            trackNumber: extraData.trackNumber || "",
            serviceStatus: "Pending",
            createdAt: booking.createdAt || new Date(),
          });
        }

        await updateDoc(bookingRef, { serviceCreated: true });
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update status");
    }
  };

  /* 🔄 STATUS CHANGE HANDLER */
  const handleStatusChange = async (booking, newStatus) => {
    if (newStatus === "Approved") {
      if (booking.status === "Approved") return;

      const trackNumber = await generateTrackNumber(); 

      updateStatus(booking, "Approved", {
        trackNumber: trackNumber,
        approvedAt: new Date(),
      });

      return;
    }

    if (newStatus === "Cancelled") {
      setPopup({ type: "cancel", booking });
      return;
    }

    updateStatus(booking, newStatus);
  };

  const formatDate = (ts) => {
    try {
      return ts?.toDate?.().toLocaleString() || "-";
    } catch {
      return "-";
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#6366f1";
      case "Call Verified":
        return "#f59e0b";
      case "Booked":
        return "#64748b";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  /* 🧾 CARD */
  const renderCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={{ fontWeight: "700", color: "#38bdf8" }}>
          {item.bookingId}
        </Text>

        <Text style={{ color: "#fff", marginTop: 18 }}>{item.name}</Text>
        <Text style={{ color: "#94a3b8" }}>{item.phone}</Text>
        <Text style={{ color: "#94a3b8" }}>
          {item.brand} {item.model}
        </Text>

        {item.trackNumber && (
          <Text style={{ color: "#22c55e", marginTop: 4 }}>
            Track: {item.trackNumber}
          </Text>
        )}

        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: getBookingStatusColor(item.status),
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
            {item.status}
          </Text>
        </View>

        <Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
          {formatDate(item.createdAt)}
        </Text>

        <View style={styles.dropdown}>
          <Picker
            selectedValue={item.status}
            onValueChange={(val) => handleStatusChange(item, val)}
            dropdownIconColor="#38bdf8"
            style={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          >
            {BOOKING_STATUS.slice(1).map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search booking, name, phone, track..."
        style={styles.search}
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterRow}>
        <Picker
          selectedValue={statusFilter}
          style={styles.picker}
          dropdownIconColor="#38bdf8"
          itemStyle={{ color: "#fff" }}
          onValueChange={(v) => setStatusFilter(v)}
        >
          {BOOKING_STATUS.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>

        <Picker
          selectedValue={dateFilter}
          style={styles.picker}
          dropdownIconColor="#38bdf8"
          itemStyle={{ color: "#fff" }}
          onValueChange={(v) => setDateFilter(v)}
        >
          {DATE_FILTERS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No bookings found</Text>}
      />

      {/* CANCEL MODAL */}
      <Modal visible={!!popup} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Reason</Text>

            <TextInput
              style={styles.input}
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={async () => {
                if (!cancelReason.trim()) {
                  Alert.alert("Error", "Cancel reason required");
                  return;
                }

                await updateStatus(popup.booking, "Cancelled", {
                  cancelReason: cancelReason.trim(),
                });

                setPopup(null);
                setCancelReason("");
              }}
            >
              <Text style={styles.saveText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPopup(null)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#020617" },

  search: {
    borderWidth: 1,
    borderColor: "#0b3b6f",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#020617",
    color: "#fff",
  },

  filterRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 10,
    color: "#fff",
    backgroundColor: "#0f172a",
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    position: "relative",
  },

  dropdown: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 14,
    marginTop: 12,
    paddingHorizontal: 4,
    overflow: "hidden",
  },

  empty: { textAlign: "center", marginTop: 40, color: "#64748b" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 18,
    width: "85%",
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  modalTitle: { fontWeight: "700", marginBottom: 10, color: "#fff" },

  input: {
    borderWidth: 1,
    borderColor: "#0b3b6f",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    color: "#fff",
    backgroundColor: "#020617",
  },

  cancelBtn: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  saveText: { color: "#fff", fontWeight: "600" },

  close: { textAlign: "center", color: "#94a3b8" },
});