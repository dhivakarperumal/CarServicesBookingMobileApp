import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,

        tabBarActiveTintColor: "#0EA5E9",
        tabBarInactiveTintColor: "#64748B",

        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopWidth: 1,
          borderTopColor: "rgba(14,165,233,0.2)",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" color={color} size={20} />
          ),
        }}
      />

      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="wrench" color={color} size={20} />
          ),
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: "Booking",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar" color={color} size={20} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shopping-cart" color={color} size={20} />
          ),
        }}
      />

      <Tabs.Screen
        name="pricing"
        options={{
          title: "Pricing",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="tags" color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,   // 👈 hides from tab bar
        }}
      />
    </Tabs>
  );
}