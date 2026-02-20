import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebase";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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

  const goToAdminDashboard = () => {
    router.push("/(adminTabs)/dashboard"); 
    // 👆 change path if your folder name is different
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 justify-center px-5">
      <View className="bg-white p-6 rounded-4xl shadow-lg">
        <Text className="text-2xl font-bold text-center mb-5 text-gray-900">
          My Profile
        </Text>

        {user && (
          <>
            <View className="mb-3.5">
              <Text className="text-xs text-gray-500">Name</Text>
              <Text className="text-base font-semibold text-gray-900">
                {user.displayName || "Not set"}
              </Text>
            </View>

            <View className="mb-3.5">
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="text-base font-semibold text-gray-900">
                {user.email}
              </Text>
            </View>

            <View className="mb-3.5">
              <Text className="text-xs text-gray-500">User ID</Text>
              <Text className="text-xs text-gray-400">{user.uid}</Text>
            </View>
          </>
        )}

        {/* 🔥 Admin Dashboard Button */}
        <TouchableOpacity
          className="bg-cyan-500 py-3.5 rounded-3xl mt-3"
          onPress={goToAdminDashboard}
        >
          <Text className="text-white text-center font-bold text-base">
            Go to Admin Dashboard
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-red-500 py-3.5 rounded-3xl mt-4"
          onPress={handleLogout}
        >
          <Text className="text-white text-center font-bold text-base">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}