// import React, { useEffect, useState } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     TextInput,
//     TouchableOpacity,
//     ActivityIndicator,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, db } from "../../firebase";
// import { Ionicons } from "@expo/vector-icons";

// export default function ProfileSettings() {
//     const router = useRouter();

//     const [uid, setUid] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);

//     const [form, setForm] = useState({
//         username: "",
//         mobile: "",
//         email: "",
//         role: "",
//         active: false,
//         createdAt: null,
//     });

//     /* 🔹 GET AUTH USER */
//     useEffect(() => {
//         const unsub = onAuthStateChanged(auth, (user) => {
//             if (user) setUid(user.uid);
//         });
//         return unsub;
//     }, []);

//     /* 🔹 LOAD PROFILE */
//     useEffect(() => {
//         if (!uid) return;

//         const loadProfile = async () => {
//             try {
//                 const snap = await getDoc(doc(db, "users", uid));
//                 if (snap.exists()) {
//                     setForm(snap.data());
//                 }
//             } catch (err) {
//                 console.log("Profile load error", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadProfile();
//     }, [uid]);

//     /* 🔹 SAVE */
//     const handleSave = async () => {
//         if (!form.username.trim()) return;

//         setSaving(true);

//         try {
//             await updateDoc(doc(db, "users", uid), {
//                 username: form.username,
//                 mobile: form.mobile,
//                 updatedAt: new Date(),
//             });

//             alert("Profile updated");
//         } catch (err) {
//             console.log("Update error", err);
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) {
//         return (
//             <View style={styles.loader}>
//                 <ActivityIndicator size="large" color="#06b6d4" />
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {/* HEADER */}
//             <View style={styles.header}>
//                 <View style={styles.avatar}>
//                     <Text style={styles.avatarText}>
//                         {form.username?.charAt(0)?.toUpperCase()}
//                     </Text>
//                 </View>

//                 <Text style={styles.name}>{form.username || "User"}</Text>

//                 <View style={styles.badgeRow}>
//                     <View style={styles.roleBadge}>
//                         <Text style={styles.badgeText}>{form.role || "user"}</Text>
//                     </View>

//                     <View
//                         style={[
//                             styles.statusBadge,
//                             form.active ? styles.active : styles.inactive,
//                         ]}
//                     >
//                         <Text style={styles.badgeText}>
//                             {form.active ? "Active" : "Inactive"}
//                         </Text>
//                     </View>
//                 </View>
//             </View>

//             {/* USERNAME */}
//             <Text style={styles.label}>Username</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Enter your username"
//                 placeholderTextColor="#9ca3af"
//                 value={form.username}
//                 onChangeText={(t) => setForm({ ...form, username: t })}
//             />

//             {/* MOBILE */}
//             <Text style={styles.label}>Mobile Number</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Enter mobile number"
//                 placeholderTextColor="#9ca3af"
//                 keyboardType="phone-pad"
//                 value={form.mobile}
//                 onChangeText={(t) => setForm({ ...form, mobile: t })}
//             />

//             {/* EMAIL (READONLY) */}
//             <Text style={styles.label}>Email Address</Text>
//             <TextInput
//                 style={[styles.input, styles.disabled]}
//                 placeholder="Email address"
//                 placeholderTextColor="#9ca3af"
//                 value={form.email}
//                 editable={false}
//             />

//             {/* CREATED AT */}
//             <Text style={styles.label}>Account Created</Text>
//             <TextInput
//                 style={[styles.input, styles.disabled]}
//                 placeholder="Created date"
//                 placeholderTextColor="#9ca3af"
//                 editable={false}
//                 value={
//                     form.createdAt?.toDate
//                         ? form.createdAt.toDate().toLocaleString()
//                         : ""
//                 }
//             />

//             {/* SAVE BUTTON */}
//             <TouchableOpacity
//                 style={[styles.saveBtn, saving && { opacity: 0.6 }]}
//                 onPress={handleSave}
//                 disabled={saving}
//             >
//                 <Text style={styles.saveText}>
//                     {saving ? "Saving..." : "Save Changes"}
//                 </Text>
//             </TouchableOpacity>
//         </View>
//     );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//      // gray-900
//     padding: 16,
//   },

//   loader: {
//     flex: 1,
//     backgroundColor: "#0f172a",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   backBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: "#111827",
//     padding: 8,
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     marginBottom: 16,
//   },

//   header: { alignItems: "center", marginBottom: 20 },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#1f2933",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

//   name: {
//     color: "black",
//     fontSize: 18,
//     fontWeight: "600",
//     marginTop: 6,
//   },

//   badgeRow: { flexDirection: "row", gap: 8, marginTop: 6 },

//   roleBadge: {
//     backgroundColor: "#1e40af",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   active: { backgroundColor: "#065f46" },

//   inactive: { backgroundColor: "#7f1d1d" },

//   badgeText: { fontSize: 11, fontWeight: "600", color: "#fff" },

//   label: {
//     color: "#111827",
//     marginBottom: 6,
//     marginTop: 14,
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     color: "black",
//   },

//   disabled: {
//     backgroundColor: "#fff",
//     color: "black",
//   },

//   saveBtn: {
//     backgroundColor: "#2563eb",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 24,
//     alignItems: "center",
//   },

//   saveText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//   },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!userData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarBorder}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{userData?.name || "User"}</Text>

        <View style={styles.activeBadge}>
          <Text style={styles.activeText}>Active User</Text>
        </View>
      </View>

      {/* PERSONAL INFO */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <TouchableOpacity>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {renderRow(
          <Ionicons name="mail-outline" size={18} color="#9CA3AF" />,
          "Email",
          user?.email || "-"
        )}

        {renderRow(
          <Feather name="phone" size={18} color="#9CA3AF" />,
          "Phone",
          userData?.phone || "-"
        )}

        {renderRow(
          <Feather name="globe" size={18} color="#9CA3AF" />,
          "Website",
          userData?.website || "-"
        )}

        {renderRow(
          <Ionicons name="location-outline" size={18} color="#9CA3AF" />,
          "Location",
          userData?.location || "-",
          false
        )}
      </View>

      {/* UTILITIES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Utilities</Text>

        {renderUtility("download", "Downloads")}
        {renderUtility("bar-chart-2", "Usage Analytics")}
        {renderUtility("help-circle", "Ask Help-Desk", false)}

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* 🔹 ROW COMPONENT */
const renderRow = (icon, label, value, border = true) => (
  <View style={[styles.row, border && styles.rowBorder]}>
    <View style={styles.rowLeft}>
      {icon}
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Text style={styles.rowValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

/* 🔹 UTILITY ITEM */
const renderUtility = (iconName, label, border = true) => (
  <TouchableOpacity style={[styles.row, border && styles.rowBorder]}>
    <View style={styles.rowLeft}>
      <Feather name={iconName} size={18} color="#9CA3AF" />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  loader: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  /* AVATAR */
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 28,
  },

  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    backgroundColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },

  avatarInner: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  activeBadge: {
    marginTop: 6,
    backgroundColor: "rgba(56,189,248,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  activeText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600",
  },

  /* CARD */
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  editText: {
    color: "#38bdf8",
    fontWeight: "600",
  },

  /* ROW */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#0b3b6f",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rowLabel: {
    color: "#94a3b8",
    marginLeft: 8,
  },

  rowValue: {
    color: "#fff",
    maxWidth: "55%",
  },

  /* LOGOUT */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "rgba(239,68,68,0.08)",
    gap: 8,
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "700",
  },
});