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
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function EmployeeDashboard() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [employee, setEmployee] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  /* ================= LOAD EMPLOYEE ================= */
  const loadEmployee = async () => {
    const q = query(
      collection(db, "employees"),
      where("authUid", "==", user.uid)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      setEmployee({ id: snap.docs[0].id, ...snap.docs[0].data() });
    }
  };

  /* ================= LOAD TODAY SERVICES ================= */
  const loadServices = async () => {
    const q = query(
      collection(db, "assignedServices"),
      where("employeeAuthUid", "==", user.uid)
    );

    const snap = await getDocs(q);

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => {
        if (!s.assignedAt) return false;
        const date = s.assignedAt.toDate().toISOString().split("T")[0];
        return date === todayStr;
      });

    setServices(list);
  };

  const init = async () => {
    await loadEmployee();
    await loadServices();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  /* 🔄 AUTO REFRESH WHEN SCREEN FOCUS */
  useFocusEffect(
    useCallback(() => {
      loadEmployee();
      loadServices();
    }, [])
  );

  /* 🔄 PULL TO REFRESH */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployee();
    await loadServices();
    setRefreshing(false);
  };

  /* ================= TIME CALC ================= */
  const calculateHours = () => {
    if (!employee?.timeIn || !employee?.timeOut) return "0h";

    const [inH, inM] = employee.timeIn.split(":").map(Number);
    const [outH, outM] = employee.timeOut.split(":").map(Number);

    const diff = outH * 60 + outM - (inH * 60 + inM);
    if (diff <= 0) return "0h";

    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return `${h}h ${m}m`;
  };

  /* ================= MARK TIME ================= */
  const markTime = async (type) => {
    try {
      const now = new Date().toTimeString().slice(0, 5);

      await updateDoc(doc(db, "employees", employee.id), {
        [type]: now,
        updatedAt: serverTimestamp(),
      });

      loadEmployee();
    } catch {
      Alert.alert("Error", "Failed to update time");
    }
  };

  /* ================= UPDATE SERVICE STATUS ================= */
  const updateServiceStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "assignedServices", id), {
        serviceStatus: status,
        updatedAt: serverTimestamp(),
      });

      loadServices();
    } catch {
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

  /* ================= SUMMARY ================= */
  const assigned = services.filter(
    (s) => s.serviceStatus === "Assigned"
  ).length;

  const inprogress = services.filter(
    (s) => s.serviceStatus === "In Progress"
  ).length;

  const completed = services.filter(
    (s) => s.serviceStatus === "Completed"
  ).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f6f9" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* WELCOME CARD */}
        <View style={styles.card}>
          <Text style={styles.welcome}>Welcome 👋</Text>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.sub}>
            {employee.role} • {employee.department}
          </Text>

          <Text
            style={[
              styles.badge,
              employee.status === "Active"
                ? styles.active
                : styles.inactive,
            ]}
          >
            {employee.status || "Inactive"}
          </Text>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.summaryNumber}>{assigned}</Text>
            <Text style={styles.summaryLabel}>Assigned</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#e0f2fe" }]}>
            <Text style={styles.summaryNumber}>{inprogress}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.summaryNumber}>{completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        

        {/* TODAY SERVICES */}
        <View style={styles.card}>
          <Text style={styles.label}>Today Services</Text>

          {services.length === 0 && (
            <Text style={styles.sub}>No services assigned</Text>
          )}

          {services.map((s) => (
            <View key={s.id} style={styles.serviceItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>
                  {s.carBrand} - {s.carModel}
                </Text>
                <Text style={styles.sub}>{s.carIssue}</Text>
                <Text style={styles.small}>
                  Status: {s.serviceStatus}
                </Text>
              </View>

              {s.serviceStatus === "Assigned" && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() =>
                    updateServiceStatus(s.id, "In Progress")
                  }
                >
                  <Text style={styles.btnText}>Start</Text>
                </TouchableOpacity>
              )}

              {s.serviceStatus === "In Progress" && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() =>
                    updateServiceStatus(s.id, "Completed")
                  }
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 70,
  },

  welcome: { fontSize: 14, color: "#6b7280" },
  name: { fontSize: 20, fontWeight: "bold" },
  sub: { color: "#6b7280", marginTop: 2 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 6,
  },

  active: { backgroundColor: "#10b981" },
  inactive: { backgroundColor: "#ef4444" },

  label: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  small: { fontSize: 12, color: "#6b7280" },
  time: { fontSize: 16, fontWeight: "bold" },

  btnRow: { flexDirection: "row", gap: 10 },

  inBtn: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 10,
  },

  outBtn: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 10,
  },

  btnText: { color: "#fff", fontWeight: "bold" },

  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  serviceTitle: { fontWeight: "bold" },

  startBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  doneBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
});