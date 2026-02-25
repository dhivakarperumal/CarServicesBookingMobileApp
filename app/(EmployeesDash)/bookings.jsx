import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collectionGroup,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function AssignedBookings() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let unsub = () => {};

    const currentUid = auth.currentUser?.uid;

    if (!currentUid) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collectionGroup(db, "assignedServices"),
        where("employeeAuthUid", "==", currentUid),
        orderBy("assignedAt", "desc")
      );

      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          setServices(list);
          setLoading(false);
        },
        (error) => {
          console.log("AssignedServices listener error:", error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.log("Query error:", err);
      setLoading(false);
    }

    return () => unsub();
  }, []);
  
  /* 🔍 SEARCH + FILTER LOGIC */
  const filteredServices = useMemo(() => {
    return services
      .filter((item) => {
        if (filter === "all") return true;
        return item.serviceStatus === filter;
      })
      .filter((item) => {
        const text = search.toLowerCase();

        return (
          item.bookingDocId?.toLowerCase().includes(text) ||
          item.serviceId?.toLowerCase().includes(text) ||
          item.customerName?.toLowerCase().includes(text) ||
          item.carBrand?.toLowerCase().includes(text) ||
          item.carModel?.toLowerCase().includes(text)
        );
      });
  }, [services, search, filter]);

  /* 🎨 STATUS COLOR */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return { bg: "#10b981", text: "#fff" };
      case "In Progress":
        return { bg: "#38bdf8", text: "#020617" };
      case "Parts Added":
        return { bg: "#8b5cf6", text: "#fff" };
      default:
        return { bg: "#f59e0b", text: "#020617" };
    }
  };

  /* 🔥 CARD */
  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.serviceStatus);

    return (
      <View style={styles.card}>
        <Text style={styles.idText}>
          Booking ID: {item.bookingId || "N/A"}
        </Text>

        <Text style={styles.idText}>Service ID: {item.serviceId || "N/A"}</Text>

        <Text style={styles.car}>
          {item.carBrand} - {item.carModel}
        </Text>

        <Text style={styles.issue}>Issue: {item.carIssue}</Text>

        {/* CUSTOMER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.subText}>
            {item.customerName} • {item.customerPhone}
          </Text>
          <Text style={styles.subText}>{item.customerEmail}</Text>
        </View>

        {/* MECHANIC */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mechanic</Text>
          <Text style={styles.subText}>{item.employeeName}</Text>
        </View>

        {item.partsTotalCost ? (
          <Text style={styles.parts}>Parts Cost: ₹{item.partsTotalCost}</Text>
        ) : null}

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.serviceStatus || "Assigned"}
          </Text>
        </View>
      </View>
    );
  };

  /* 🔄 LOADER */
  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* 🔎 SEARCH */}
        <TextInput
          placeholder="Search booking, service, customer, car..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* 🎛 FILTER TABS */}
        <View style={styles.filterRow}>
          {["all", "Assigned", "In Progress", "Parts Added", "Completed"].map(
            (f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filter === f && styles.activeFilter]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[styles.filterText, filter === f && { color: "#fff" }]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {/* 📋 LIST */}
        {filteredServices.length === 0 ? (
          <Text style={styles.empty}>No Assigned Services</Text>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 250,
              flexGrow: 1,
            }}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  search: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
    fontSize: 15,
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  activeFilter: {
    backgroundColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
  },

  /* 🔥 HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  back: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  /* 🔥 CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  idText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },

  car: {
    fontWeight: "800",
    fontSize: 18,
    color: "#38bdf8",
  },
  issue: {
    marginTop: 8,
    fontSize: 15,
    color: "#fff",
    lineHeight: 20,
  },

  section: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(229,231,235,0.25)",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#e5e7eb",
  },

  parts: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#10b981",
  },
  service: {
    marginTop: 6,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "600",
  },

  subText: {
    marginTop: 6,
    fontSize: 14,
    color: "#cbd5f5",
  },
  /* 🔥 STATUS BADGE */
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowOpacity: 0.4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
