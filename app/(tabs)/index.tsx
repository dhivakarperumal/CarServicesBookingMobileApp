import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* HEADER GRADIENT */}
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-8 pb-8 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-cyan-100 text-sm font-medium">Welcome Back! 👋</Text>
            <Text className="text-white text-3xl font-bold mt-1">Car Care Service</Text>
          </View>

          <TouchableOpacity className="bg-white bg-opacity-20 p-3.5 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View className="px-4 py-6">
        {/* QUICK STATS */}
        <View className="flex-row gap-3 mb-8">
          <LinearGradient
            colors={["#06b6d4", "#0891b2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-5 rounded-2xl shadow-lg"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-xs font-medium mb-1">Total Bookings</Text>
                <Text className="text-white text-3xl font-bold">12</Text>
              </View>
              <View className="bg-black bg-opacity-20 p-3 rounded-full">
                <FontAwesome5 name="calendar-alt" size={24} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-5 rounded-2xl shadow-lg"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-green-100 text-xs font-medium mb-1">Completed</Text>
                <Text className="text-red-500 text-3xl font-bold">20</Text>
              </View>
              <View className="bg-white bg-opacity-20 p-3 rounded-full">
                <FontAwesome5 name="check-circle" size={24} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* SERVICES SECTION */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Services")}>
              <Text className="text-cyan-500 text-sm font-semibold">View All →</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between gap-3">
            <ServiceCard
              icon={<FontAwesome5 name="car" size={28} color="#fff" />}
              title="General Service"
              color1="#f59e0b"
              color2="#d97706"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<MaterialIcons name="oil-barrel" size={28} color="#fff" />}
              title="Oil Change"
              color1="#ef4444"
              color2="#dc2626"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<Ionicons name="snow-outline" size={28} color="#fff" />}
              title="AC Service"
              color1="#3b82f6"
              color2="#1d4ed8"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<FontAwesome5 name="car-side" size={28} color="#fff" />}
              title="Full Service"
              color1="#8b5cf6"
              color2="#6d28d9"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ACTIVE BOOKING */}
        <View className="mb-8">
          <Text className="text-gray-900 text-lg font-bold mb-3">Active Booking</Text>

          <LinearGradient
            colors={["#fef3c7", "#fde68a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5 border border-amber-200 shadow-md"
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="text-amber-900 text-base font-bold mb-1">Swift - TN 00 AB 1234</Text>
                <Text className="text-amber-800 text-sm mb-2">General Service</Text>
              </View>
              <View className="bg-amber-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">Pending</Text>
              </View>
            </View>

            <View className="border-t border-amber-300 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-amber-700 text-xs">Est. Time: 2 hours</Text>
                <Text className="text-amber-700 text-xs">₹ 1,500</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* BOOK BUTTON */}
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-lg mb-6"
        >
          <TouchableOpacity
            className="py-4 px-6 flex-row items-center justify-center"
            onPress={() => navigation.navigate("Booking")}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Book New Service</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

function ServiceCard({ icon, title, color1, color2, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 min-w-[45%]">
      <LinearGradient
        colors={[color1, color2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-5 items-center justify-center min-h-32 shadow-md"
      >
        <View className="bg-black bg-opacity-10 p-3 rounded-full mb-3">
          {icon}
        </View>
        <Text className="text-white font-semibold text-center text-sm">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
