import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../firebase";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-900">
      {/* PROFILE HEADER */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-8 pb-8 border-b border-slate-700"
      >
        <View className="items-center">
          <View className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg">
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          
          <Text className="text-white text-2xl font-bold">
            {user?.displayName || "User Profile"}
          </Text>
          <Text className="text-cyan-400 text-sm mt-1">Premium Member</Text>
        </View>
      </LinearGradient>

      <View className="px-4 py-8">
        {/* USER INFO CARD */}
        {user && (
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">User Information</Text>
            
            {/* NAME */}
            <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-3 flex-row items-center">
              <View className="bg-cyan-500 bg-opacity-20 p-3 rounded-full mr-4">
                <MaterialCommunityIcons name="account-outline" size={20} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Full Name</Text>
                <Text className="text-white font-semibold">{user.displayName || "Not set"}</Text>
              </View>
            </View>

            {/* EMAIL */}
            <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-3 flex-row items-center">
              <View className="bg-cyan-500 bg-opacity-20 p-3 rounded-full mr-4">
                <Ionicons name="mail-outline" size={20} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Email Address</Text>
                <Text className="text-white font-semibold text-sm">{user.email}</Text>
              </View>
            </View>

            {/* USER ID */}
            <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-8 flex-row items-center">
              <View className="bg-cyan-500 bg-opacity-20 p-3 rounded-full mr-4">
                <Ionicons name="shield-checkmark-outline" size={20} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">User ID</Text>
                <Text className="text-white font-semibold text-xs">{user.uid}</Text>
              </View>
            </View>
          </View>
        )}

        {/* QUICK STATS */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Statistics</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 items-center">
              <Ionicons name="calendar-outline" size={24} color="#06b6d4" />
              <Text className="text-gray-400 text-xs mt-2">Bookings</Text>
              <Text className="text-white font-bold text-lg mt-1">12</Text>
            </View>
            <View className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 items-center">
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text className="text-gray-400 text-xs mt-2">Completed</Text>
              <Text className="text-white font-bold text-lg mt-1">8</Text>
            </View>
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Settings</Text>
          
          <TouchableOpacity className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-2 flex-row items-center">
            <Ionicons name="settings-outline" size={20} color="#06b6d4" />
            <Text className="text-white font-semibold ml-4 flex-1">Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-2 flex-row items-center">
            <Ionicons name="help-circle-outline" size={20} color="#06b6d4" />
            <Text className="text-white font-semibold ml-4 flex-1">Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex-row items-center">
            <Ionicons name="document-text-outline" size={20} color="#06b6d4" />
            <Text className="text-white font-semibold ml-4 flex-1">Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        <LinearGradient
          colors={["#ef4444", "#991b1b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-lg mb-6"
        >
          <TouchableOpacity
            className="py-4 px-6 flex-row items-center justify-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">Logout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}
