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

          tabBarActiveTintColor: "#111",
          tabBarInactiveTintColor: "#9ca3af",

          tabBarStyle: {
            position: "absolute",
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
            borderTopWidth: 0,
            backgroundColor: "#ffffff",

            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -3 },
            elevation: 10,
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginBottom: Platform.OS === "android" ? 4 : 0,
          },

          sceneContainerStyle: {
            paddingTop: 60, // 🔥 pushes screens below header
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