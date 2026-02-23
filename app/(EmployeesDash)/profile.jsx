import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StaffProfile() {
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 FETCH EMPLOYEE USING authUid */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const uid = auth.currentUser?.uid;

        if (!uid) return;

        const q = query(
          collection(db, "employees"),
          where("authUid", "==", uid),
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setEmployee(snap.docs[0].data());
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  /* 🔥 LOGOUT */
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* PROFILE CARD */}
      <View style={styles.card}>
        {/* ROLE BADGE */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{employee?.role || "Mechanic"}</Text>
        </View>

        <Text style={styles.name}>{employee?.name || "Staff"}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{employee?.phone || "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Department</Text>
          <Text style={styles.value}>{employee?.department || "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Shift</Text>
          <Text style={styles.value}>{employee?.shift || "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Salary</Text>
          <Text style={styles.salary}>₹{employee?.salary || "-"}</Text>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
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

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },

  roleBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,

    shadowColor: "#38bdf8",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },

  roleText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 11,
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0b3b6f",
    paddingBottom: 6,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  salary: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "800",
  },

  logout: {
    marginTop: 24,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",

    shadowColor: "#ef4444",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
