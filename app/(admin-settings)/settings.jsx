// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

// /* ================= CARD COMPONENT ================= */
// const SettingCard = ({ icon, title, desc, path }) => {
//   const router = useRouter();

//   return (
//     <View style={styles.card}>
//       <View style={styles.left}>
//         <View style={styles.iconBox}>{icon}</View>

//         <View style={{ flex: 1 }}>
//           <Text style={styles.title}>{title}</Text>
//           <Text style={styles.desc}>{desc}</Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => router.push(path)}
//       >
//         <Text style={styles.buttonText}>Manage</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// /* ================= SCREEN ================= */
// export default function Settings() {
//   return (
//     <ScrollView style={styles.container}>
//       <SettingCard
//         icon={<Ionicons name="person-outline" size={22} color="#2563eb" />}
//         title="Profile Settings"
//         desc="Update personal information and change password."
//         path="/(admin-settings)/profile"
//       />

//       <SettingCard
//         icon={<Ionicons name="people-outline" size={22} color="#2563eb" />}
//         title="User Management"
//         desc="Manage user roles, permissions, and accounts."
//         path="/(admin-settings)/users"
//       />

//       <SettingCard
//         icon={<Ionicons name="cube-outline" size={22} color="#059669" />}
//         title="Product Settings"
//         desc="Manage products and stock rules."
//         path="/(admin-settings)/products"
//       />

//       <SettingCard
//         icon={<FontAwesome5 name="star" size={20} color="#2563eb" />}
//         title="Customer Reviews & Ratings"
//         desc="View and manage customer feedback and service ratings."
//         path="/(admin-settings)/review"
//       />
//     </ScrollView>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,

//     padding: 16,
//   },

//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     elevation: 3,
//   },

//   left: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     gap: 12,
//   },

//   iconBox: {
//     backgroundColor: "#dbeafe",
//     padding: 10,
//     borderRadius: 10,
//   },

//   title: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//   },

//   desc: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 2,
//   },

//   button: {
//     backgroundColor: "#15173D",
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },
// });


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Settings</Text>

      {/* PROFILE */}
      <SettingCard
        icon={<Ionicons name="person-outline" size={22} color="#2563eb" />}
        title="Profile Settings"
        desc="Update personal information and password."
        path="/(admin-settings)/profile"
      />

      {/* USERS */}
      <SettingCard
        icon={<Ionicons name="people-outline" size={22} color="#2563eb" />}
        title="User Management"
        desc="Manage user roles and accounts."
        path="/(admin-settings)/users"
      />

      {/* SERVICE LIST */}
      <SettingCard
        icon={<Ionicons name="construct-outline" size={22} color="#7c3aed" />}
        title="Service List"
        desc="View and manage all service bookings."
        path="/(admin-settings)/servicesListAll"
      />

      {/* PRICE LIST */}
      <SettingCard
        icon={<MaterialIcons name="price-change" size={22} color="#059669" />}
        title="Price List"
        desc="Update service pricing and labour charges."
        path="/(admin-settings)/priceList"
      />

      {/* PRODUCT STOCK DETAILS */}
      <SettingCard
        icon={<Ionicons name="cube-outline" size={22} color="#059669" />}
        title="Product Stock Details"
        desc="View and manage product stock."
        path="/(admin-settings)/stockDetails"
      />

      {/* ADD STOCK */}
      <SettingCard
        icon={<Ionicons name="add-circle-outline" size={22} color="#0ea5e9" />}
        title="Add Stock"
        desc="Increase stock for product variants."
        path="/(admin-settings)/addStock"
      />

      {/* REVIEWS */}
      <SettingCard
        icon={<FontAwesome5 name="star" size={20} color="#f59e0b" />}
        title="Customer Reviews & Ratings"
        desc="View and manage customer feedback."
        path="/(admin-settings)/review"
      />
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    padding: 16,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  iconBox: {
    backgroundColor: "#dbeafe",
    padding: 10,
    borderRadius: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  desc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  button: {
    backgroundColor: "#15173D",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});