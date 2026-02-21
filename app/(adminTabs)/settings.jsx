import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

/* ================= CARD COMPONENT ================= */
const SettingCard = ({ icon, title, desc, path }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(path)}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>{icon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.buttonText}>Manage</Text>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

/* ================= SCREEN ================= */
export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SettingCard
        icon={<Ionicons name="person-outline" size={22} color="#38bdf8" />}
        title="Profile Settings"
        desc="Update personal information and password."
        path="/(admin-settings)/profile"
      />

      <SettingCard
        icon={<Ionicons name="people-outline" size={22} color="#38bdf8" />}
        title="User Management"
        desc="Manage user roles and accounts."
        path="/(admin-settings)/users"
      />

      <SettingCard
        icon={<Ionicons name="construct-outline" size={22} color="#7c3aed" />}
        title="Service List"
        desc="View and manage all service bookings."
        path="/(admin-settings)/servicesListAll"
      />

      <SettingCard
        icon={<MaterialIcons name="price-change" size={22} color="#059669" />}
        title="Price List"
        desc="Update service pricing and labour charges."
        path="/(admin-settings)/priceList"
      />

      <SettingCard
        icon={<Ionicons name="cart-outline" size={22} color="#2563eb" />}
        title="Product Billing"
        desc="Create product invoices and manage sales."
        path="/(Products)/ProductBillingScreen"
      />

      <SettingCard
        icon={<Ionicons name="build-outline" size={22} color="#f59e0b" />}
        title="Service Billing"
        desc="Generate service bills and manage payments."
        path="/(serviceslist)/Bllinglistall"
      />

      <SettingCard
        icon={<Ionicons name="bar-chart-outline" size={22} color="#7c3aed" />}
        title="Reports"
        desc="View sales, service and stock reports."
        path="/(admin-settings)/Report"
      />

      <SettingCard
        icon={<Ionicons name="cube-outline" size={22} color="#059669" />}
        title="Product Stock Details"
        desc="View and manage product stock."
        path="/(admin-settings)/stockDetails"
      />

      <SettingCard
        icon={<Ionicons name="add-circle-outline" size={22} color="#0ea5e9" />}
        title="Add Stock"
        desc="Increase stock for product variants."
        path="/(admin-settings)/addStock"
      />

      <SettingCard
        icon={<FontAwesome5 name="star" size={20} color="#f59e0b" />}
        title="Customer Reviews & Ratings"
        desc="View and manage customer feedback."
        path="/(admin-settings)/review"
      />
    </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617", 
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    paddingBottom: 120, 
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#38bdf8",
    marginRight: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  desc: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  buttonText: {
    color: "#38bdf8", // FIXED (blue instead of dark)
    fontSize: 12,
    fontWeight: "600",
    marginRight: 6,
  },
});