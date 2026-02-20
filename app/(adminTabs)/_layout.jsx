import { Tabs } from "expo-router";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "expo-router";

function AdminHeader({ title }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#15173D" }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingTop: 30,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function AdminTabsLayout() {
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          header: ({ options }) => (
            <AdminHeader title={options.title} />
          ),

          tabBarActiveTintColor: "#06b6d4",
          tabBarInactiveTintColor: "#6b7280",

          tabBarStyle: {
            position: "absolute",

            height: 65,
            paddingBottom: 2,

            backgroundColor: "#ffffff",
           
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            
            elevation: 1, // Android shadow
          },

          tabBarHideOnKeyboard: true,

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
          }}
        />

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
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="inventory" size={size} color={color} />
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
    </SafeAreaView>
  );
}