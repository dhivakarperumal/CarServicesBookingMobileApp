import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="text-2xl font-bold mb-4">Admin Home</Text>

      <View className="bg-white p-5 rounded-2xl shadow">
        <Text className="text-gray-600">
          Welcome Admin 👋 Manage bookings, products, and drivers from here.
        </Text>
      </View>
    </View>
  );
}