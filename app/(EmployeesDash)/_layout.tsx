import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StaffHeader from "../../components/StaffHeader";

export default function StaffTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* GLOBAL HEADER */}
      <StaffHeader title="Staff Panel" userName="Kumar" />

      {/* TABS */}
      <Tabs
  screenOptions={{
    headerShown: false,

    tabBarActiveTintColor: "#38bdf8",
    tabBarInactiveTintColor: "#64748b",

    tabBarStyle: {
      position: "absolute",
      height: 70 + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: 8,

      backgroundColor: "#050b1f",
      borderTopWidth: 1,
      borderTopColor: "rgba(56,189,248,0.15)",

      shadowColor: "#38bdf8",
      shadowOpacity: 0.25,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: -4 },
      elevation: 20,
    },

    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "700",
      marginBottom: Platform.OS === "android" ? 6 : 0,
    },

    sceneContainerStyle: {
      paddingTop: 110, // match your new header height
      backgroundColor: "#020617",
    },
  }}
>
        <Tabs.Screen
          name="dashboard"
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
            title: "Assigned",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clipboard-list"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="cars"
          options={{
            title: "Cars",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="car" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}