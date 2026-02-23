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
import { LinearGradient } from "expo-linear-gradient";

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
      where("authUid", "==", user.uid),
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
      where("employeeAuthUid", "==", user.uid),
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
    }, []),
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
    (s) => s.serviceStatus === "Assigned",
  ).length;

  const inprogress = services.filter(
    (s) => s.serviceStatus === "In Progress",
  ).length;

  const completed = services.filter(
    (s) => s.serviceStatus === "Completed",
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
        {/* WELCOME CARD */}
        <View style={styles.card}>
          {/* STATUS BADGE - TOP RIGHT */}
          <View
            style={[
              styles.statusBadge,
              employee.status === "Active"
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <Text style={styles.statusText}>
              {employee.status || "Inactive"}
            </Text>
          </View>
          <Text style={styles.welcome}>Welcome 👋</Text>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.sub}>
            {employee.role} • {employee.department}
          </Text>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <LinearGradient
            colors={["#2563eb", "#020617"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{assigned}</Text>
            <Text style={styles.summaryLabel}>Assigned</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#38bdf8", "#020617"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{inprogress}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#10b981", "#020617"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <Text style={styles.summaryNumber}>{completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </LinearGradient>
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
                <Text style={styles.small}>Status: {s.serviceStatus}</Text>
              </View>

              {s.serviceStatus === "Assigned" && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => updateServiceStatus(s.id, "In Progress")}
                >
                  <Text style={styles.btnText}>Start</Text>
                </TouchableOpacity>
              )}

              {s.serviceStatus === "In Progress" && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => updateServiceStatus(s.id, "Completed")}
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

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
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
