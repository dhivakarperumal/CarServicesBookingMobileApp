// import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Tabs, useRouter, useSegments } from "expo-router";
// import { signOut } from "firebase/auth";
// import {
//   collection,
//   onSnapshot,
//   query,
//   Timestamp,
//   where,
// } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import {
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { auth, db } from "../../firebase";

// /* ================= HEADER ================= */
// function AdminHeader({ title = "Admin" }) {
//   const router = useRouter();

//   const [menuVisible, setMenuVisible] = useState(false);
//   const [notifVisible, setNotifVisible] = useState(false);

//   const [todayBookings, setTodayBookings] = useState([]);
//   const [todayOrders, setTodayOrders] = useState([]);

//   const userName = auth.currentUser?.email || "Admin";
//   const firstLetter = userName.charAt(0).toUpperCase();

//   /* 🔹 TODAY RANGE */
//   useEffect(() => {
//     const start = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
//     const end = Timestamp.fromDate(
//       new Date(new Date().setHours(23, 59, 59, 999)),
//     );

//     const unsubBookings = onSnapshot(
//       query(
//         collection(db, "bookings"),
//         where("createdAt", ">=", start),
//         where("createdAt", "<=", end),
//       ),
//       (snap) => {
//         const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//         setTodayBookings(list);
//       },
//     );

//     const unsubOrders = onSnapshot(
//       query(
//         collection(db, "orders"),
//         where("createdAt", ">=", start),
//         where("createdAt", "<=", end),
//       ),
//       (snap) => {
//         const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//         setTodayOrders(list);
//       },
//     );

//     return () => {
//       unsubBookings();
//       unsubOrders();
//     };
//   }, []);

//   const totalNotifications = todayBookings.length + todayOrders.length;

//   const handleLogout = async () => {
//     setMenuVisible(false);
//     await signOut(auth);
//     router.replace("/(auth)/login");
//   };

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#0f172a"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={styles.header}
//     >
//       <Text style={styles.title}>{title}</Text>

//       <View style={styles.rightContainer}>
//         {/* 🔔 BELL */}
//         <TouchableOpacity
//           style={styles.iconWrapper}
//           onPress={() => setNotifVisible(true)}
//         >
//           <Ionicons name="notifications-outline" size={22} color="#fff" />

//           {totalNotifications > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{totalNotifications}</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* 👤 PROFILE */}
//         <TouchableOpacity
//           onPress={() => setMenuVisible(true)}
//           style={styles.profileCircle}
//         >
//           <Text style={styles.profileText}>{firstLetter}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 🔔 NOTIFICATION DROPDOWN */}
//       <Modal transparent visible={notifVisible} animationType="fade">
//         <Pressable
//           style={styles.overlay}
//           onPress={() => setNotifVisible(false)}
//         >
//           <View style={styles.dropdown}>
//             {/* HEADER */}
//             <View style={styles.notifHeader}>
//               <Text style={styles.notifTitle}>Notifications</Text>
//               <Text style={styles.notifCount}>{totalNotifications} New</Text>
//             </View>

//             <ScrollView
//               style={{ maxHeight: 300 }}
//               contentContainerStyle={{ paddingBottom: 8 }}
//             >
//               {/* BOOKINGS */}
//               {todayBookings.map((b) => (
//                 <TouchableOpacity
//                   key={b.id}
//                   style={styles.notifItem}
//                   onPress={() => {
//                     router.push("/(admin)/bookings");
//                     setNotifVisible(false);
//                   }}
//                 >
//                   <Text style={styles.notifName}>{b.name}</Text>
//                   <Text style={styles.notifSub}>Booking ID: {b.bookingId}</Text>
//                   <Text style={styles.notifSub}>{b.address || b.location}</Text>
//                 </TouchableOpacity>
//               ))}

//               {/* ORDERS */}
//               {todayOrders.map((o) => (
//                 <TouchableOpacity
//                   key={o.id}
//                   style={styles.notifItem}
//                   onPress={() => {
//                     router.push(`/(admin)/orders/${o.id}`);
//                     setNotifVisible(false);
//                   }}
//                 >
//                   <Text style={styles.notifName}>
//                     {o.shipping?.name || "Customer"}
//                   </Text>
//                   <Text style={styles.notifSub}>
//                     Order ID: {o.orderId || o.id}
//                   </Text>
//                   <Text style={styles.notifSub}>Total ₹ {o.total}</Text>
//                 </TouchableOpacity>
//               ))}

//               {/* EMPTY */}
//               {totalNotifications === 0 && (
//                 <View style={styles.emptyBox}>
//                   <Ionicons
//                     name="notifications-off-outline"
//                     size={36}
//                     color="#9ca3af"
//                   />
//                   <Text style={styles.emptyText}>You're all caught up</Text>
//                   <Text style={styles.emptySub}>
//                     No new notifications right now
//                   </Text>
//                 </View>
//               )}
//             </ScrollView>
//           </View>
//         </Pressable>
//       </Modal>

//       {/* 👤 PROFILE DROPDOWN */}
//       <Modal transparent visible={menuVisible} animationType="fade">
//         <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
//           <View style={styles.dropdown}>
//             <MenuItem
//               icon="person-outline"
//               label="Profile"
//               onPress={() => {
//                 setMenuVisible(false);
//                 router.push("/(admin-settings)/profile");
//               }}
//             />

//             <MenuItem
//               icon="settings-outline"
//               label="Settings"
//               onPress={() => {
//                 setMenuVisible(false);
//                 router.push("/(adminTabs)/settings");
//               }}
//             />

//             <MenuItem
//               icon="home-outline"
//               label="Home"
//               onPress={() => {
//                 setMenuVisible(false);
//                 // navigate to the regular user home (tabs group)
//                 // pushing "/" was triggering the root layout logic which
//                 // immediately redirected admins back to the admin stack.
//                 // Use the explicit tabs path so the router stays on the
//                 // public home screen.
//                 router.replace("/(tabs)");
//               }}
//             />

//             <MenuItem
//               icon="log-out-outline"
//               label="Logout"
//               danger
//               onPress={handleLogout}
//             />
//           </View>
//         </Pressable>
//       </Modal>
//     </LinearGradient>
//   );
// }

// /* ================= MENU ITEM ================= */
// function MenuItem({ icon, label, onPress, danger }) {
//   return (
//     <TouchableOpacity style={styles.menuItem} onPress={onPress}>
//       <Ionicons name={icon} size={18} color={danger ? "#ef4444" : "#38bdf8"} />
//       <Text
//         style={[
//           styles.menuText,
//           danger && { color: "#ef4444", fontWeight: "600" },
//         ]}
//       >
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// /* ================= TABS ================= */
// export default function AdminTabsLayout() {
//   const segments = useSegments();
//   const current = segments[segments.length - 1];

//   const getHeaderTitle = (route) => {
//     switch (route) {
//       case "home":
//         return "Home";
//       case "bookings":
//         return "Bookings";
//       case "services":
//         return "Services";
//       case "products":
//         return "Products";
//       case "profile":
//         return "Profile";
//       default:
//         return "Admin Panel";
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <Tabs
//         screenOptions={{
//           header: () => <AdminHeader title={getHeaderTitle(current)} />,
//           tabBarActiveTintColor: "#06b6d4",
//           tabBarInactiveTintColor: "#9ca3af",
//           sceneContainerStyle: { backgroundColor: "#0f172a" },
//           tabBarStyle: styles.tabBar,
//           tabBarItemStyle: styles.tabItem,
//           tabBarLabelStyle: styles.tabLabel,
//           tabBarActiveBackgroundColor: "#1e293b",
//         }}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             tabBarLabel: "Home",
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="home" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="bookings"
//           options={{
//             tabBarLabel: "Bookings",
//             tabBarIcon: ({ color, size }) => (
//               <FontAwesome5 name="clipboard-list" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="services"
//           options={{
//             tabBarLabel: "Services",
//             tabBarIcon: ({ color, size }) => (
//               <MaterialIcons
//                 name="miscellaneous-services"
//                 size={size}
//                 color={color}
//               />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="products"
//           options={{
//             tabBarLabel: "Products",
//             tabBarIcon: ({ color, size }) => (
//               <MaterialIcons name="inventory" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="settings"
//           options={{
//             tabBarLabel: "Settings",
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="settings-outline" size={size} color={color} />
//             ),
//           }}
//         />
//       </Tabs>
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0f172a" },

//   header: {
//     backgroundColor: "#0f172a",
//     paddingHorizontal: 18,
//     paddingTop: 14,
//     paddingBottom: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     shadowColor: "#000",
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 8,
//   },

//   title: { color: "#fff", fontSize: 20, fontWeight: "bold" },

//   rightContainer: { flexDirection: "row", alignItems: "center" },

//   iconWrapper: { position: "relative", marginRight: 14 },

//   badge: {
//     position: "absolute",
//     top: -4,
//     right: -6,
//     backgroundColor: "#ef4444",
//     borderRadius: 10,
//     paddingHorizontal: 4,
//     minWidth: 16,
//     alignItems: "center",
//   },

//   badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

//   profileCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#1e3a8a",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#38bdf8",
//   },

//   profileText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.65)",
//     alignItems: "flex-end",
//     paddingTop: 70,
//     paddingRight: 16,
//   },

//   dropdown: {
//     width: 260,
//     backgroundColor: "#020617",
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(56,189,248,0.3)",
//     overflow: "hidden",
//     shadowColor: "#38bdf8",
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 18,
//   },

//   notifHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#1e293b",
//     backgroundColor: "#020617",
//   },

//   notifTitle: {
//     fontWeight: "700",
//     fontSize: 16,
//     color: "#e5e7eb",
//   },

//   notifCount: {
//     fontSize: 13,
//     color: "#38bdf8",
//   },

//   notifItem: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#1e293b",
//   },

//   notifName: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#f8fafc",
//   },

//   notifSub: {
//     fontSize: 12,
//     color: "#94a3b8",
//   },

//   emptyBox: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 30,
//   },

//   emptyText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#e5e7eb",
//   },

//   emptySub: {
//     fontSize: 12,
//     color: "#94a3b8",
//   },

//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//   },

//   menuText: {
//     fontSize: 14,
//     color: "#e5e7eb",
//     marginLeft: 12,
//     fontWeight: "700",
//   },

//   tabBar: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 70,
//     backgroundColor: "#0f172a",
//     borderTopWidth: 0,
//     paddingBottom: 10,
//     paddingTop: 10,
//   },

//   tabItem: { borderRadius: 12, marginHorizontal: 6 },

//   tabLabel: { fontSize: 12, marginBottom: 4 },
// });


import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter, useSegments } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";
import logoImg from "../../assets/images/logo_no_bg.png";

/* ================= HEADER ================= */
export function AdminHeader({ title = "Admin", showBack = false }) {
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const [todayBookings, setTodayBookings] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [notifType, setNotifType] = useState("bookings");


  const userName = auth.currentUser?.email || "Admin";
  const firstLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const start = Timestamp.fromDate(
      new Date(new Date().setHours(0, 0, 0, 0))
    );
    const end = Timestamp.fromDate(
      new Date(new Date().setHours(23, 59, 59, 999))
    );

    const unsubBookings = onSnapshot(
      query(
        collection(db, "bookings"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) => {
        setTodayBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubOrders = onSnapshot(
      query(
        collection(db, "orders"),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      ),
      (snap) => {
        setTodayOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubBookings();
      unsubOrders();
    };
  }, []);

  const totalNotifications = todayBookings.length + todayOrders.length;

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  return (
    <LinearGradient colors={["#0f172a", "#0f172a"]} style={styles.header}>
      {/* 🔹 TOP ROW */}
      <View style={styles.topRow}>
        {/* LEFT */}
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.logoWrapper}>
            <Image source={logoImg} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>{title}</Text>
        </View>

        {/* RIGHT */}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => setNotifVisible(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {totalNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.profileCircle}
          >
            <Text style={styles.profileText}>{firstLetter}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔔 NOTIFICATION MODAL */}
      <Modal transparent visible={notifVisible} animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setNotifVisible(false)}
        >
          <View style={styles.dropdown}>
            {/* 🔔 HEADER ROW */}
            <Text style={styles.notifTitle}>
                Notifications ({totalNotifications})
              </Text>
            <View style={styles.notifHeaderRow}>
              

              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    notifType === "bookings" && styles.filterBtnActive,
                  ]}
                  onPress={() => setNotifType("bookings")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      notifType === "bookings" && styles.filterTextActive,
                    ]}
                  >
                    Bookings ({todayBookings.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    notifType === "orders" && styles.filterBtnActive,
                  ]}
                  onPress={() => setNotifType("orders")}
                >
                  <Text
                    style={[
                      styles.filterText,
                      notifType === "orders" && styles.filterTextActive,
                    ]}
                  >
                    Orders ({todayOrders.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🔽 LIST */}
            <ScrollView style={{ maxHeight: 300 }}>
              {/* BOOKINGS */}
              {notifType === "bookings" &&
                todayBookings.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.notifItem}
                    onPress={() => {
                      router.push("/(admin)/bookings");
                      setNotifVisible(false);
                    }}
                  >
                    <Text style={styles.notifName}>{b.name}</Text>
                    <Text style={styles.notifSub}>
                      Booking ID: {b.bookingId}
                    </Text>
                  </TouchableOpacity>
                ))}

              {/* ORDERS */}
              {notifType === "orders" &&
                todayOrders.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={styles.notifItem}
                    onPress={() => {
                      router.push(`/(admin)/orders/${o.id}`);
                      setNotifVisible(false);
                    }}
                  >
                    <Text style={styles.notifName}>
                      {o.shipping?.name || "Customer"}
                    </Text>
                    <Text style={styles.notifSub}>
                      Order ID: {o.orderId || o.id}
                    </Text>
                  </TouchableOpacity>
                ))}

              {/* EMPTY STATE */}
              {((notifType === "bookings" && todayBookings.length === 0) ||
                (notifType === "orders" && todayOrders.length === 0)) && (
                  <View style={styles.emptyBox}>
                    <Ionicons
                      name="notifications-off-outline"
                      size={36}
                      color="#9ca3af"
                    />
                    <Text style={styles.emptyText}>No notifications</Text>
                  </View>
                )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* 👤 PROFILE MODAL */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdown}>
            <MenuItem
              icon="person-outline"
              label="Profile"
              onPress={() => router.push("/(admin-settings)/profile")}
            />
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push("/(adminTabs)/settings")}
            />
            <MenuItem
              icon="home-outline"
              label="Home"
              onPress={() => router.replace("/(tabs)")}
            />
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

/* ================= TABS LAYOUT ================= */
export default function AdminTabsLayout() {
  const segments = useSegments();
  const current = segments[segments.length - 1];

  const getHeaderTitle = (route) => {
    switch (route) {
      case "home":
        return "Home";
      case "bookings":
        return "Bookings";
      case "services":
        return "Services";
      case "products":
        return "Products";
      case "settings":
        return "Settings";
      default:
        return "Admin Panel";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Tabs
        screenOptions={{
          header: () => <AdminHeader title={getHeaderTitle(current)} />,
          tabBarActiveTintColor: "#06b6d4",
          tabBarInactiveTintColor: "#9ca3af",
          sceneContainerStyle: { backgroundColor: "#0f172a" },
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="clipboard-list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons
                name="miscellaneous-services"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="inventory" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={18} color={danger ? "#ef4444" : "#38bdf8"} />
      <Text
        style={[
          styles.menuText,
          danger && { color: "#ef4444", fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* SAFE AREA */
  safe: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  /* ================= HEADER ================= */
  header: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /* LEFT SIDE (BACK + LOGO + TITLE) */
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.4)",
  },

  logoWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  logo: {
    width: 26,
    height: 26,
  },

  title: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },

  subtitle: {
    color: "#38bdf8",
    fontSize: 11,
    marginTop: -2,
  },

  /* RIGHT SIDE (NOTIFICATION + PROFILE) */
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    position: "relative",
    marginRight: 14,
    backgroundColor: "#020617",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },

  profileText: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
  },

  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    borderWidth: 1,
    borderColor: "#020617",
  },

  /* ================= MODAL OVERLAY ================= */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },

  dropdown: {
    width: 260,
    backgroundColor: "#020617",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    overflow: "hidden",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 18,
  },

  /* ================= NOTIFICATIONS ================= */
  notifTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  notifItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  notifName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f8fafc",
  },

  notifSub: {
    fontSize: 12,
    color: "#94a3b8",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb",
    marginTop: 6,
  },

  /* ================= MENU ITEMS ================= */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  menuText: {
    fontSize: 14,
    color: "#e5e7eb",
    marginLeft: 12,
    fontWeight: "700",
  },

  /* ================= TAB BAR ================= */
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#0f172a",
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },

  tabItem: {
    borderRadius: 12,
    marginHorizontal: 6,
  },

  tabLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  notifHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  filterContainer: {
    flexDirection: "row",
  },

  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginLeft: 6,
  },

  filterBtnActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },

  filterText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#020617",
  },
});