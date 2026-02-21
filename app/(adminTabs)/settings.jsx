// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { Ionicons, Feather } from "@expo/vector-icons";
// import { auth, db } from "../../firebase";
// import { doc, getDoc } from "firebase/firestore";
// import { signOut } from "firebase/auth";

// export default function Profile() {
//   const [userData, setUserData] = useState(null);
//   const user = auth.currentUser;

//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!user) return;

//       try {
//         const snap = await getDoc(doc(db, "users", user.uid));
//         if (snap.exists()) setUserData(snap.data());
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     fetchUser();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//   };

//   if (!userData) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#ec4899" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
//       {/* AVATAR */}
//       <View style={styles.avatarWrapper}>
//         <View style={styles.avatarBorder}>
//           <View style={styles.avatarInner}>
//             <Text style={styles.avatarText}>
//               {userData?.name?.charAt(0)?.toUpperCase() || "U"}
//             </Text>
//           </View>
//         </View>

//         <Text style={styles.name}>{userData?.name || "User"}</Text>

//         <View style={styles.activeBadge}>
//           <Text style={styles.activeText}>Active User</Text>
//         </View>
//       </View>

//       {/* PERSONAL INFO */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Personal Information</Text>
//           <TouchableOpacity>
//             <Text style={styles.editText}>Edit</Text>
//           </TouchableOpacity>
//         </View>

//         {renderRow(
//           <Ionicons name="mail-outline" size={18} color="#9CA3AF" />,
//           "Email",
//           user?.email || "-"
//         )}

//         {renderRow(
//           <Feather name="phone" size={18} color="#9CA3AF" />,
//           "Phone",
//           userData?.phone || "-"
//         )}

//         {renderRow(
//           <Feather name="globe" size={18} color="#9CA3AF" />,
//           "Website",
//           userData?.website || "-"
//         )}

//         {renderRow(
//           <Ionicons name="location-outline" size={18} color="#9CA3AF" />,
//           "Location",
//           userData?.location || "-",
//           false
//         )}
//       </View>

//       {/* UTILITIES */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Utilities</Text>

//         {renderUtility("download", "Downloads")}
//         {renderUtility("bar-chart-2", "Usage Analytics")}
//         {renderUtility("help-circle", "Ask Help-Desk", false)}

//         {/* LOGOUT */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Feather name="log-out" size={18} color="#ef4444" />
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// /* 🔹 ROW COMPONENT */
// const renderRow = (icon, label, value, border = true) => (
//   <View style={[styles.row, border && styles.rowBorder]}>
//     <View style={styles.rowLeft}>
//       {icon}
//       <Text style={styles.rowLabel}>{label}</Text>
//     </View>
//     <Text style={styles.rowValue} numberOfLines={1}>
//       {value}
//     </Text>
//   </View>
// );

// /* 🔹 UTILITY ITEM */
// const renderUtility = (iconName, label, border = true) => (
//   <TouchableOpacity style={[styles.row, border && styles.rowBorder]}>
//     <View style={styles.rowLeft}>
//       <Feather name={iconName} size={18} color="#9CA3AF" />
//       <Text style={styles.rowLabel}>{label}</Text>
//     </View>
//     <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: "#020617",
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },

//   loader: {
//     flex: 1,
//     backgroundColor: "#020617",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   /* AVATAR */
//   avatarWrapper: {
//     alignItems: "center",
//     marginBottom: 24,
//   },

//   avatarBorder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     padding: 3,
//     backgroundColor: "#ec4899",
//   },

//   avatarInner: {
//     flex: 1,
//     backgroundColor: "#0F172A",
//     borderRadius: 60,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   avatarText: {
//     color: "#fff",
//     fontSize: 42,
//     fontWeight: "bold",
//   },

//   name: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 12,
//   },

//   activeBadge: {
//     marginTop: 6,
//     backgroundColor: "rgba(34,197,94,0.15)",
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },

//   activeText: {
//     color: "#22c55e",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   /* CARD */
//   card: {
//     backgroundColor: "#0F172A",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 4,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },

//   cardTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   editText: {
//     color: "#ec4899",
//     fontWeight: "500",
//   },

//   /* ROW */
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//   },

//   rowBorder: {
//     borderBottomWidth: 1,
//     borderBottomColor: "#1f2937",
//   },

//   rowLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   rowLabel: {
//     color: "#9CA3AF",
//     marginLeft: 8,
//   },

//   rowValue: {
//     color: "#fff",
//     maxWidth: "55%",
//   },

//   /* LOGOUT */
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#ef4444",
//     backgroundColor: "rgba(239,68,68,0.1)",
//     gap: 8,
//   },

//   logoutText: {
//     color: "#ef4444",
//     fontWeight: "600",
//   },
// });


import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

/* ================= CARD COMPONENT ================= */
const SettingCard = ({ icon, title, desc, path }) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>{icon}</View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{desc}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(path)}
      >
        <Text style={styles.buttonText}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ================= SCREEN ================= */
export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <SettingCard
        icon={<Ionicons name="person-outline" size={22} color="#38bdf8" />}
        title="Profile Settings"
        desc="Update personal information and change password."
        path="/(admin-settings)/profile"
      />

      <SettingCard
        icon={<Ionicons name="people-outline" size={22} color="#38bdf8" />}
        title="User Management"
        desc="Manage user roles, permissions, and accounts."
        path="/(admin-settings)/users"
      />

      <SettingCard
        icon={<FontAwesome5 name="star" size={20} color="#38bdf8" />}
        title="Customer Reviews & Ratings"
        desc="View and manage customer feedback and service ratings."
        path="/(admin-settings)/review"
      />
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  iconBox: {
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  desc: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  button: {
    backgroundColor: "#2563eb",
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