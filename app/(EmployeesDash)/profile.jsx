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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ScrollView, Switch } from "react-native";

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
          setEmployee({
            id: snap.docs[0].id,
            ...snap.docs[0].data(),
          });
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

  const toggleWorkStatus = async (value) => {
    const newStatus = value ? "busy" : "free";

    try {
      await updateDoc(doc(db, "employees", employee.id), {
        workStatus: newStatus,
      });

      setEmployee((prev) => ({
        ...prev,
        workStatus: newStatus,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {employee?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <Text style={styles.userName}>{employee?.name || "User"}</Text>

          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active User</Text>
          </View>
        </View>

        {/* PERSONAL INFO CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{employee?.phone || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{employee?.department || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Shift</Text>
            <Text style={styles.infoValue}>{employee?.shift || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Salary</Text>
            <Text style={styles.salary}>₹{employee?.salary || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee ID</Text>
            <Text style={styles.infoValue}>{employee?.employeeId || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{employee?.email || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Joining Date</Text>
            <Text style={styles.infoValue}>{employee?.joiningDate || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{employee?.role || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Status</Text>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  color:
                    employee?.workStatus === "busy" ? "#ef4444" : "#10b981",
                  fontWeight: "700",
                }}
              >
                {employee?.workStatus === "busy" ? "Busy" : "Free"}
              </Text>

              <Switch
                value={employee?.workStatus === "busy"}
                onValueChange={toggleWorkStatus}
                trackColor={{ false: "#10b981", true: "#ef4444" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time In</Text>
            <Text style={styles.infoValue}>{employee?.timeIn || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time Out</Text>
            <Text style={styles.infoValue}>{employee?.timeOut || "-"}</Text>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: "#020617",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  /* HEADER */
  header: {
    fontSize: 20,
    fontWeight: "800",
    color: "#e5e7eb",
    marginBottom: 20,
  },

  /* AVATAR SECTION */
  avatarWrap: {
    alignItems: "center",
    marginBottom: 28,
  },

  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#38bdf8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },

  avatarText: {
    fontSize: 50,
    fontWeight: "900",
    color: "#ffffff",
  },

  userName: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },

  activeBadge: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#38bdf8",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
  },

  activeText: {
    color: "#38bdf8",
    fontWeight: "700",
    fontSize: 12,
  },

  /* SECTION CARD */
  sectionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e5e7eb",
    marginBottom: 14,
  },

  /* INFO ROW */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0b3b6f",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },

  infoValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  salary: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "800",
  },

  /* LOGOUT BUTTON */
  logout: {
    borderWidth: 1.5,
    borderColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",

    shadowColor: "#ef4444",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 15,
  },
});
