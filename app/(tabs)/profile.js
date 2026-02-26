import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BookedService from "../../components/BookedService";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import MyOrder from "../../components/MyOrder";
import ManageAddress from "../../components/ManageAddress";
import ChangePassword from "../../components/ChangePassword";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("servicestatus");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (params?.tab) {
      setActiveTab(String(params.tab));
      router.setParams({ tab: undefined });
    }
  }, [params?.tab]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setProfile(snap.data());
          }
        } catch (err) {
          console.log("Profile fetch error:", err);
        }
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const goToAdminDashboard = () => {
    router.push("/(adminTabs)/home");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  /* ===== TAB CONTENT ===== */
  const renderContent = () => {
    switch (activeTab) {
      case "servicestatus":
        return <BookedService />;
      case "personal":
        return (
          <View>
            <Text style={styles.title}>Personal Information</Text>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{profile?.username || "Not set"}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email || user?.email}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{profile?.mobile || "Not set"}</Text>
            </View>

            <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
              <LinearGradient
                colors={["#0EA5E9", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientLogout}
              >
                <Text style={styles.gradientLogoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      case "changepassword":
        return <ChangePassword />;

      case "orders":
        return <MyOrder />;

      case "address":
        return <ManageAddress />;

      default:
        return (
          <View>
            <Text style={styles.title}>Personal Information</Text>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.displayName || "Not set"}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== FILTER DROPDOWN ===== */}
{/* ===== FILTER DROPDOWN ===== */}
<View style={styles.filterWrapper}>
  <TouchableOpacity
    onPress={() => setShowDropdown(!showDropdown)}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={["#0EA5E9", "#2563EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientFilterBtn}
    >
      <Ionicons name="funnel-outline" size={18} color="#fff" />
      <Text style={styles.filterLabel}>Filter</Text>
    </LinearGradient>
  </TouchableOpacity>

  {showDropdown && (
    <View style={styles.dropdown}>
      {[
        ["servicestatus", "Service"],
        ["personal", "Profile"],
        ["changepassword", "Change Password"],
        ["orders", "Orders"],
        ["address", "Address"],
      ].map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={styles.dropdownItem}
          onPress={() => {
            setActiveTab(key);
            setShowDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

      {/* ===== CONTENT CARD ===== */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}>
        {renderContent()}
      </View>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Tabs */
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: "center",
  },
  tabButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 38,
  },
  activeTab: {
    backgroundColor: "#0ea5e9",
  },
  tabText: {
    color: "#fff",
    fontWeight: "600",
    lineHeight: 16, // 👈 important
    includeFontPadding: false,
  },
  activeTabText: {
    color: "#000",
  },

  /* Personal Tab */
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#38bdf8",
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: "#38bdf8",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },
  gradientLogout: {
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 25,
    alignSelf: "center",   // ⭐ centered pill (NOT full width)
  },

  gradientLogoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  /* Filter Dropdown */
/* Filter Wrapper */
filterWrapper: {
  alignItems: "flex-start",   // 👈 LEFT SIDE
  paddingHorizontal: 16,
  paddingTop: 16,
  zIndex: 100,
},

gradientFilterBtn: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 50,           // pill style
  gap: 6,
},

filterLabel: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 14,
},

dropdown: {
  position: "absolute",
  top: 55,
  left: 16,                   // 👈 dropdown aligned left
  backgroundColor: "#1e293b",
  borderRadius: 12,
  paddingVertical: 8,
  width: 180,
  elevation: 5,
},

dropdownItem: {
  paddingVertical: 12,
  paddingHorizontal: 16,
},

dropdownText: {
  color: "#fff",
  fontWeight: "600",
},
});
