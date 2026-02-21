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
import { auth } from "../../firebase";

export default function AccountScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const goToAdminDashboard = () => {
    router.push("/(adminTabs)/home"); 
    // 👆 change path if your folder name is different
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
                {user?.displayName || "Not set"}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
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
        return (
          <View>
            <Text style={styles.title}>My Orders</Text>
          </View>
        );

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
      <View style={styles.contentWrapper}>
        <View style={styles.contentCard}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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

  /* Content */
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
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
    backgroundColor: "#ef4444",
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