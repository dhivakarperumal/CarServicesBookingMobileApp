import { FontAwesome, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-slate-900">
      {/* HERO SECTION */}
      <View className="relative bg-gradient-to-b from-slate-800 to-slate-900 px-4 pt-8 pb-12 rounded-b-3xl">
        <LinearGradient
          colors={["rgba(8, 145, 178, 0.1)", "rgba(6, 182, 212, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-b-3xl"
        />
        
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-cyan-400 text-sm font-medium">Welcome Back! 👋</Text>
            <Text className="text-white text-3xl font-bold mt-2">Car Care Service</Text>
          </View>

          <TouchableOpacity className="bg-cyan-500 bg-opacity-20 border border-cyan-500 p-3.5 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-300 text-sm mb-6">Professional car maintenance services</Text>

        {/* CTA BUTTON */}
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-xl overflow-hidden"
        >
          <TouchableOpacity className="py-3 px-6 flex-row items-center justify-center">
            <Ionicons name="play" size={18} color="#fff" />
            <Text className="text-white font-bold text-sm ml-2">Book Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View className="px-4 py-8">
        {/* QUICK STATS */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Your Dashboard</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-cyan-400 text-xs font-medium mb-1">Total Bookings</Text>
                  <Text className="text-white text-3xl font-bold">12</Text>
                </View>
                <View className="bg-cyan-500 bg-opacity-20 p-3 rounded-full">
                  <FontAwesome5 name="calendar-alt" size={20} color="#06b6d4" />
                </View>
              </View>
            </View>

            <View className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-green-400 text-xs font-medium mb-1">Completed</Text>
                  <Text className="text-white text-3xl font-bold">8</Text>
                </View>
                <View className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                  <FontAwesome5 name="check-circle" size={20} color="#10b981" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* FEATURED SERVICE */}
        <View className="mb-8">
          <LinearGradient
            colors={["#1e293b", "#0f172a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden border border-slate-700 p-6"
          >
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-cyan-400 text-xs font-semibold mb-2 uppercase">Premium Package</Text>
                <Text className="text-white text-2xl font-bold">Full Service</Text>
              </View>
              <View className="bg-cyan-500 bg-opacity-20 p-2.5 rounded-full">
                <FontAwesome5 name="star" size={18} color="#06b6d4" />
              </View>
            </View>
            <Text className="text-gray-300 text-sm mb-5">Complete car maintenance with engine checkup, oil change and detailing</Text>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-2xl font-bold">₹ 2,999</Text>
              <TouchableOpacity>
                <Text className="text-cyan-400 font-semibold text-sm">Learn More →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* SERVICES SECTION */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">Our Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Services")}>
              <Text className="text-cyan-400 text-xs font-semibold">View All →</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between gap-3">
            <ServiceCard
              icon={<FontAwesome5 name="car" size={24} color="#fff" />}
              title="General Service"
              color1="#f59e0b"
              color2="#b45309"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<MaterialIcons name="oil-barrel" size={24} color="#fff" />}
              title="Oil Change"
              color1="#ef4444"
              color2="#991b1b"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<Ionicons name="snow-outline" size={24} color="#fff" />}
              title="AC Service"
              color1="#3b82f6"
              color2="#1e40af"
              onPress={() => {}}
            />
            <ServiceCard
              icon={<FontAwesome5 name="car-side" size={24} color="#fff" />}
              title="Full Service"
              color1="#8b5cf6"
              color2="#5b21b6"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ACTIVE BOOKING */}
        <View className="mb-10">
          <Text className="text-white text-lg font-bold mb-3">Active Booking</Text>

          <View className="bg-slate-800 border border-amber-500 border-opacity-30 rounded-2xl p-5 bg-gradient-to-br from-amber-500 from-opacity-5 to-transparent to-opacity-0">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-white text-base font-bold mb-1">Swift - TN 00 AB 1234</Text>
                <Text className="text-gray-300 text-sm mb-2">General Service</Text>
              </View>
              <View className="bg-amber-500 bg-opacity-30 border border-amber-500 px-3 py-1 rounded-full">
                <Text className="text-amber-300 text-xs font-bold">Pending</Text>
              </View>
            </View>

            <View className="border-t border-slate-700 pt-3">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-gray-400 text-xs mb-1">Est. Time</Text>
                  <Text className="text-white font-semibold text-sm">2 hours</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-xs mb-1">Total Cost</Text>
                  <Text className="text-cyan-400 font-bold text-lg">₹ 1,500</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* TESTIMONIAL PREVIEW */}
        <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center mb-3">
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <Text className="text-gray-300 text-xs ml-2">(2000+ reviews)</Text>
          </View>
          <Text className="text-gray-300 text-sm mb-3">"Best car service experience I've ever had. Highly professional team!"</Text>
          <Text className="text-cyan-400 font-semibold text-xs">- Rahul M.</Text>
        </View>
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
        <View className="bg-black bg-opacity-20 p-3 rounded-full mb-3">
          {icon}
        </View>
        <Text className="text-white font-semibold text-center text-xs">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
