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
          where("authUid", "==", uid)
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
      {/* 🔥 PROFILE CARD */}
      <View style={styles.card}>
        <Text style={styles.name}>{employee?.name || "Staff"}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {employee?.role || "Mechanic"}
          </Text>
        </View>

        <Text style={styles.info}>📞 {employee?.phone || "-"}</Text>
        <Text style={styles.info}>🏢 {employee?.department || "-"}</Text>
        <Text style={styles.info}>⏰ {employee?.shift || "-"}</Text>
        <Text style={styles.info}>💰 Salary: ₹{employee?.salary || "-"}</Text>
      </View>

      {/* 🔥 LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f9" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* 🔥 CARD */
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },

  badgeText: {
    color: "#075985",
    fontWeight: "700",
    fontSize: 12,
  },

  info: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 6,
  },

  logout: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});