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
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

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
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [popup, setPopup] = useState(null);
  const [trackNumber, setTrackNumber] = useState("");
  const [cancelReason, setCancelReason] = useState("");

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

  /* 📅 DATE FILTER LOGIC */
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
      b.phone?.includes(search);

    const matchStatus = statusFilter === "All" || b.status === statusFilter;

    const matchDate = isInDateFilter(b.createdAt);

    return matchSearch && matchStatus && matchDate;
  });

  /* 🎨 STATUS CARD STYLE */
  const getStatusCardStyle = (status) => {
    switch (status) {
      case "Approved":
        return { backgroundColor: "#ecfdf5", borderColor: "#10b981" };
      case "Cancelled":
        return { backgroundColor: "#fef2f2", borderColor: "#ef4444" };
      case "Call Verified":
        return { backgroundColor: "#fffbeb", borderColor: "#f59e0b" };
      case "Booked":
        return { backgroundColor: "#f3f4f6", borderColor: "#9ca3af" };
      default:
        return { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" };
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Approved":
        return "#22c55e";
      case "Cancelled":
        return "#ef4444";
      case "Call Verified":
        return "#f59e0b";
      case "Booked":
        return "#64748b";
      default:
        return "#3b82f6";
    }
  };

  /* 🔄 UPDATE STATUS CORE */
  const updateStatus = async (booking, newStatus, extraData = {}) => {
    try {
      const bookingRef = doc(db, "bookings", booking.id);

      const updateData = {
        status: newStatus,
        ...extraData,
      };

      await updateDoc(bookingRef, updateData);

      if (booking.uid) {
        await updateDoc(
          doc(db, "users", booking.uid, "bookings", booking.id),
          updateData,
        );
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
  const handleStatusChange = (booking, newStatus) => {
    if (newStatus === "Approved") {
      setPopup({ type: "approved", booking });
      return;
    }

    if (newStatus === "Cancelled") {
      setPopup({ type: "cancel", booking });
      return;
    }

    updateStatus(booking, newStatus);
  };

  /* 📅 FORMAT DATE */
  const formatDate = (ts) => {
    try {
      return ts?.toDate?.().toLocaleString() || "-";
    } catch {
      return "-";
    }
  };

  /* 🧾 CARD ITEM */
  const renderCard = ({ item }) => {
    const statusStyle = getStatusCardStyle(item.status);

    return (
      <LinearGradient
        colors={["#0f172a", "#0b3b6f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card]}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.bookingId}>{item.bookingId}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusTextColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.text}>
          {item.brand} • {item.model}
        </Text>
        <Text style={styles.text}>{item.name}</Text>
        <Text style={styles.text}>{item.phone}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

        <Picker
          selectedValue={item.status}
          style={styles.cardPicker}
          dropdownIconColor="#38bdf8"
          onValueChange={(val) => handleStatusChange(item, val)}
        >
          {BOOKING_STATUS.slice(1).map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search booking, name, phone..."
        style={styles.search}
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
      />

      {/* 🔘 FILTER ROW */}
      <View style={styles.filterRow}>
        <Picker
          selectedValue={statusFilter}
          style={styles.picker}
          dropdownIconColor="#38bdf8"
          itemStyle={{ color: "#fff" }} // 👈 ADD THIS
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
          itemStyle={{ color: "#fff" }} // 👈 ADD THIS
          onValueChange={(v) => setDateFilter(v)}
        >
          {DATE_FILTERS.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>
      </View>

      {/* 📋 LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{
          paddingHorizontal: 4, // 👈 left + right gap
          paddingBottom: 120, // 👈 bottom tab space
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No bookings found</Text>}
      />

      {/* 🔴 POPUP MODAL */}
      <Modal visible={!!popup} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {popup?.type === "approved" && (
              <>
                <Text style={styles.modalTitle}>Enter Track Number</Text>
                <TextInput
                  style={styles.input}
                  value={trackNumber}
                  onChangeText={setTrackNumber}
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={async () => {
                    if (!trackNumber.trim()) {
                      Alert.alert("Error", "Track number required");
                      return;
                    }

                    await updateStatus(popup.booking, "Approved", {
                      trackNumber: trackNumber.trim(),
                      approvedAt: new Date(),
                    });

                    setPopup(null);
                    setTrackNumber("");
                  }}
                >
                  <Text style={styles.saveText}>Submit</Text>
                </TouchableOpacity>
              </>
            )}

            {popup?.type === "cancel" && (
              <>
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
              </>
            )}

            <TouchableOpacity onPress={() => setPopup(null)}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#020617",
  },

  search: {
    borderWidth: 1,
    borderColor: "#0b3b6f",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#020617",
    color: "#fff",
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 10,
    color: "#fff",
    backgroundColor: "#0f172a", // 👈 dark blue card tone
  },

  cardPicker: {
    color: "#fff",
    borderWidth: 1,
    borderColor: "#38bdf8", // bright blue border
    borderRadius: 10,
    marginTop: 6,
  },

  card: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  bookingId: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
  },

  status: {
    fontSize: 12,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  text: {
    fontSize: 13,
    marginTop: 2,
    color: "#cbd5f5",
  },

  date: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748b",
  },

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

  modalTitle: {
    fontWeight: "700",
    marginBottom: 10,
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#0b3b6f",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    color: "#fff",
    backgroundColor: "#020617",
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  cancelBtn: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  close: {
    textAlign: "center",
    color: "#94a3b8",
  },
});
