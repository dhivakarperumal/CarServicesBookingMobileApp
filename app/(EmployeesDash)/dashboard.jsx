import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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

export default function EmployeeDashboard() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [employee, setEmployee] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

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

  /* ================= LOAD SERVICES ================= */
  const loadServices = async () => {
    const q = query(
      collection(db, "services"),
      where("assignedUid", "==", user.uid)
    );

    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setServices(list);
  };

  useEffect(() => {
    loadEmployee();
    loadServices();
    setLoading(false);
  }, []);

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
      await updateDoc(doc(db, "services", id), {
        status,
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
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  /* ================= SUMMARY ================= */
  const completed = services.filter((s) => s.status === "completed").length;
  const pending = services.filter((s) => s.status === "pending").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f6f9" }}>
      <ScrollView style={{ padding: 14 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <MaterialCommunityIcons name="bell-outline" size={22} />
        </View>

        {/* WELCOME CARD */}
        <View style={styles.card}>
          <Text style={styles.welcome}>Welcome 👋</Text>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.sub}>
            {employee.role} • {employee.department}
          </Text>
        </View>

        {/* STATUS + SHIFT */}
        <View style={styles.row}>
          <View style={styles.smallCard}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.badge,
                employee.status === "active"
                  ? styles.active
                  : styles.inactive,
              ]}
            >
              {employee.status}
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{employee.employeeId}</Text>
          </View>
        </View>

        {/* ATTENDANCE */}
        <View style={styles.card}>
          <Text style={styles.label}>Today Attendance</Text>

          <View style={styles.timeRow}>
            <View>
              <Text style={styles.small}>Time In</Text>
              <Text style={styles.time}>{employee.timeIn || "--:--"}</Text>
            </View>

            <View>
              <Text style={styles.small}>Time Out</Text>
              <Text style={styles.time}>{employee.timeOut || "--:--"}</Text>
            </View>

            <View>
              <Text style={styles.small}>Working</Text>
              <Text style={styles.time}>{calculateHours()}</Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            {!employee.timeIn && (
              <TouchableOpacity
                style={styles.inBtn}
                onPress={() => markTime("timeIn")}
              >
                <MaterialCommunityIcons name="login" size={18} color="#fff" />
                <Text style={styles.btnText}>Mark In</Text>
              </TouchableOpacity>
            )}

            {employee.timeIn && !employee.timeOut && (
              <TouchableOpacity
                style={styles.outBtn}
                onPress={() => markTime("timeOut")}
              >
                <MaterialCommunityIcons name="logout" size={18} color="#fff" />
                <Text style={styles.btnText}>Mark Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ASSIGNED SERVICES */}
        <View style={styles.card}>
          <Text style={styles.label}>Assigned Services</Text>

          {services.length === 0 && (
            <Text style={styles.sub}>No services assigned</Text>
          )}

          {services.map((s) => (
            <View key={s.id} style={styles.serviceItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{s.serviceName}</Text>
                <Text style={styles.sub}>{s.vehicle}</Text>
                <Text style={styles.small}>Status: {s.status}</Text>
              </View>

              {s.status === "pending" && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() =>
                    updateServiceStatus(s.id, "inprogress")
                  }
                >
                  <Text style={styles.btnText}>Start</Text>
                </TouchableOpacity>
              )}

              {s.status === "inprogress" && (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() =>
                    updateServiceStatus(s.id, "completed")
                  }
                >
                  <Text style={styles.btnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* SUMMARY */}
        <View style={styles.card}>
          <Text style={styles.label}>Today Summary</Text>
          <Text style={styles.sub}>Total: {services.length}</Text>
          <Text style={styles.sub}>Completed: {completed}</Text>
          <Text style={styles.sub}>Pending: {pending}</Text>
        </View>

        {/* PROFILE */}
        <View style={styles.card}>
          <Text style={styles.label}>Profile</Text>
          <Text style={styles.sub}>Email: {employee.email}</Text>
          <Text style={styles.sub}>Phone: {employee.phone}</Text>
          <Text style={styles.sub}>
            Joining: {employee.joiningDate || "N/A"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  headerTitle: { fontSize: 18, fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  welcome: { fontSize: 14, color: "#6b7280" },
  name: { fontSize: 20, fontWeight: "bold" },
  sub: { color: "#6b7280", marginTop: 2 },

  row: { flexDirection: "row", gap: 10, marginBottom: 12 },

  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  label: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  value: { fontWeight: "bold" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },

  active: { backgroundColor: "#10b981" },
  inactive: { backgroundColor: "#ef4444" },

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
});