import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = userCred.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert("Error", "User profile not found");
        return;
      }

      const role = userSnap.data().role?.toLowerCase();

      if (role === "admin") router.replace("/(adminTabs)/dashboard");
      else if (role === "driver") router.replace("/(driverTabs)/home");
      else if (role === "user") router.replace("/(tabs)/home");
      else Alert.alert("Error", "Invalid user role");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-100 justify-center px-6">
      {/* Card */}
      <View className="bg-white p-7 rounded-3xl shadow-xl">
        {/* Title */}
        <Text className="text-3xl font-extrabold text-center text-gray-900">
          Welcome Back 👋
        </Text>
        <Text className="text-center text-gray-500 mt-1 mb-8">
          Login to your account
        </Text>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            className="border border-gray-200 bg-gray-50 px-4 py-4 rounded-2xl text-gray-900"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-gray-200 bg-gray-50 px-4 py-4 rounded-2xl text-gray-900"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`p-4 rounded-2xl items-center ${
            loading ? "bg-cyan-300" : "bg-cyan-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Login</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-3 text-gray-400 text-sm">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Register */}
        <Text
          onPress={() => router.push("/(auth)/register")}
          className="text-center text-cyan-600 font-semibold"
        >
          Don’t have an account? Register
        </Text>
      </View>

      {/* Footer */}
      <Text className="text-center text-gray-400 mt-6 text-xs">
        Car Care App • Secure Login
      </Text>
    </View>
  );
}
