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

export default function AccountScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("servicestatus");

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
              <Text style={styles.value}>
                {profile?.username || "Not set"}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>
                {profile?.email || user?.email}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>
                {profile?.mobile || "Not set"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );

      case "orders":
  return <MyOrder />;

      case "address":
        return (
          <View>
            <Text style={styles.title}>Manage Address</Text>
          </View>
        );

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
      {/* ===== TOP TABS ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
        style={{ flexGrow: 0 }}
      >
        {[
          ["servicestatus", "Service"],
          ["personal", "Profile"],
          ["orders", "Orders"],
          ["address", "Address"],
        ].map(([key, label]) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={[
                styles.tabButton,
                active && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  active && styles.activeTabText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
    lineHeight: 16,        // 👈 important
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
});