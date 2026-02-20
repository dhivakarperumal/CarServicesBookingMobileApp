import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";

interface UserData {
  uid: string;
  username?: string;
  email: string;
  role?: string;
  mobile?: string;
}

export default function AccountScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data() as UserData);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  const initial = (
    (userData?.username || userData?.email)?.charAt(0) ?? "U"
  ).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== PROFILE HEADER ===== */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initial}
            </Text>
          </View>

          <Text style={styles.name}>
            {userData?.username || "User"}
          </Text>

          <Text style={styles.email}>{userData?.email}</Text>

          {userData?.role === "admin" && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>ADMIN</Text>
            </View>
          )}
        </View>

        {/* ===== INFO CARD ===== */}
        <View style={styles.card}>
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={userData?.email || ""}
          />

          {userData?.mobile && (
            <InfoRow
              icon="call-outline"
              label="Mobile"
              value={userData.mobile}
            />
          )}

          <InfoRow
            icon="shield-checkmark-outline"
            label="Role"
            value={userData?.role || "user"}
          />
        </View>

        {/* ===== ACTIONS ===== */}
        <View style={styles.card}>
          <ActionRow
            icon="settings-outline"
            label="Edit Profile"
            onPress={() => router.push("/edit-profile")}
          />

          {userData?.role === "admin" && (
            <ActionRow
              icon="analytics-outline"
              label="Admin Panel"
              onPress={() => router.push("/admin")}
            />
          )}

          <ActionRow
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= COMPONENTS ================= */

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color="#0EA5E9" />
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

interface ActionRowProps {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const ActionRow = ({ icon, label, onPress, danger }: ActionRowProps) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress}>
    <Ionicons
      name={icon}
      size={20}
      color={danger ? "#EF4444" : "#0EA5E9"}
    />
    <Text
      style={[
        styles.actionText,
        danger && { color: "#EF4444" },
      ]}
    >
      {label}
    </Text>
    <Feather name="chevron-right" size={18} color="#64748B" />
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },

  profileSection: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  email: {
    color: "#94A3B8",
    marginTop: 4,
  },

  adminBadge: {
    marginTop: 10,
    backgroundColor: "#FACC15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  adminText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});