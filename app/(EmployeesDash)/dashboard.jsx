import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

/* 🔁 STATUS FLOW */
const STATUS_FLOW = [
  "Processing",
  "Service Going on",
  "Bill Pending",
  "Bill Completed",
  "Service Completed",
];

export default function EmployeeDashboard() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [employee, setEmployee] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [todayServices, setTodayServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  /* ================= LOAD EMPLOYEE ================= */
  const loadEmployee = async () => {
    const q = query(
      collection(db, "employees"),
      where("authUid", "==", user.uid),
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      setEmployee({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  };

  /* ================= LOAD SERVICES ================= */
  const loadAllServices = async () => {
    const q = query(
      collection(db, "assignedServices"),
      where("employeeAuthUid", "==", user.uid),
    );

    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAllServices(list);

    /* 🔥 TODAY FILTER */
    const todayList = list.filter((s) => {
      if (!s.assignedAt) return false;
      const date = s.assignedAt.toDate().toISOString().split("T")[0];
      return date === todayStr;
    });

    setTodayServices(todayList);
  };

  const init = async () => {
    await loadEmployee();
    await loadAllServices();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEmployee();
      loadAllServices();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployee();
    await loadAllServices();
    setRefreshing(false);
  };

  /* ================= UPDATE STATUS ================= */
  const updateServiceStatus = async (service, newStatus) => {
    try {
      const updateData = {
        serviceStatus: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === "Service Going on") {
        updateData.startedAt = serverTimestamp();
      }

      if (newStatus === "Service Completed") {
        updateData.completedAt = serverTimestamp();
      }

      /* 🔥 1️⃣ assignedServices */
      await updateDoc(doc(db, "assignedServices", service.id), updateData);

      /* 🔥 2️⃣ allServices */
      if (service.bookingDocId) {
        await updateDoc(
          doc(db, "allServices", service.bookingDocId),
          updateData,
        );
      }

      /* 🔥 3️⃣ FREE EMPLOYEE */
      if (newStatus === "Service Completed" && employee?.id) {
        await updateDoc(doc(db, "employees", employee.id), {
          assigned: false,
          workStatus: "idle",
          currentServiceId: null,
          currentServiceCode: null,
        });
      }

      loadAllServices();
    } catch (error) {
      console.log("Status update error:", error);
      Alert.alert("Error", "Failed to update service");
    }
  };

  if (loading || !employee) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  /* ================= SUMMARY COUNTS ================= */
  const assigned = allServices.filter(
    (s) => s.serviceStatus === "Processing",
  ).length;

  const inprogress = allServices.filter(
    (s) =>
      s.serviceStatus === "Service Going on" ||
      s.serviceStatus === "Bill Pending" ||
      s.serviceStatus === "Bill Completed",
  ).length;

  const completed = allServices.filter(
    (s) => s.serviceStatus === "Service Completed",
  ).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#38bdf8", "#38bdf8"]}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.welcomeName}>{employee?.name}</Text>
          <Text style={styles.welcomeSub}>
            {employee?.department || "Employee"}
          </Text>
        </LinearGradient>
        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <LinearGradient
            colors={["#2563eb", "#020617"]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{assigned}</Text>
            <Text style={styles.summaryLabel}>Assigned</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#38bdf8", "#020617"]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{inprogress}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#10b981", "#020617"]}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </LinearGradient>
        </View>

        {/* TODAY SERVICES */}
        <View style={styles.card}>
          <Text style={styles.label}>Today Services</Text>

          {todayServices.length === 0 && (
            <Text style={styles.sub}>No services assigned</Text>
          )}

          {todayServices.map((s) => (
            <View key={s.id} style={styles.serviceItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>
                  {s.carBrand} - {s.carModel}
                </Text>
                <Text style={styles.sub}>{s.carIssue}</Text>
                <Text style={styles.small}>Status: {s.serviceStatus}</Text>
              </View>

              {s.serviceStatus === "Processing" && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => updateServiceStatus(s, "Service Going on")}
                >
                  <Text style={styles.btnText}>Start</Text>
                </TouchableOpacity>
              )}

              {s.serviceStatus === "Service Going on" && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => updateServiceStatus(s, "Service Completed")}
                >
                  <Text style={styles.btnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },

  welcomeCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  welcomeText: {
    color: "#020617",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },

  welcomeName: {
    marginTop: 4,
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  welcomeSub: {
    marginTop: 2,
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 74,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  welcome: {
    color: "#94a3b8",
    fontSize: 13,
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  sub: {
    color: "#94a3b8",
    marginTop: 2,
    fontSize: 12,
  },

  statusBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 6,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  statusActive: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  statusInactive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    color: "#fff",
    fontWeight: "700",
    alignSelf: "flex-start",
    marginTop: 8,
    fontSize: 11,
  },

  label: {
    color: "#38bdf8",
    fontWeight: "800",
    marginBottom: 10,
  },

  small: {
    fontSize: 11,
    color: "#94a3b8",
  },

  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  serviceTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  startBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  doneBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 5,
    alignItems: "center",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,

    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  summaryNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  summaryLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
});
