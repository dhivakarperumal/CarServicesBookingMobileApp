<<<<<<< Updated upstream
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
=======
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
>>>>>>> Stashed changes
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< Updated upstream
  const [showPassword, setShowPassword] = useState(false);
=======
>>>>>>> Stashed changes

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
<<<<<<< Updated upstream
      // 🔐 Firebase Auth login
=======

>>>>>>> Stashed changes
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = userCred.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

<<<<<<< Updated upstream
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("User Data:", userData);
      } else {
        console.log("No user profile found in Firestore");
=======
      if (!userSnap.exists()) {
        Alert.alert("Error", "User profile not found");
        return;
>>>>>>> Stashed changes
      }

      const role = userSnap.data().role;
      console.log("User role:", role);

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
<<<<<<< Updated upstream
    <ScrollView className="flex-1 bg-gray-50">
      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-16 pb-12 items-center"
      >
        <View className="bg-white bg-opacity-20 p-4 rounded-full mb-4">
          <FontAwesome5 name="car" size={48} color="#fff" />
        </View>
        <Text className="text-white text-3xl font-bold mb-1.5">Car Care Service</Text>
        <Text className="text-cyan-100 text-sm">Professional Car Maintenance</Text>
      </LinearGradient>

      {/* FORM CONTAINER */}
      <View className="px-6 py-8">
        {/* LOGIN TITLE */}
        <View className="mb-8">
          <Text className="text-gray-900 text-2xl font-bold mb-2">Welcome Back!</Text>
          <Text className="text-gray-600 text-sm">Login to book your car service</Text>
        </View>

        {/* EMAIL INPUT */}
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2.5 text-sm">Email Address</Text>
          <LinearGradient
            colors={["#f3f4f6", "#e5e7eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden border border-gray-200"
          >
            <View className="flex-row items-center px-4 bg-white">
              <Ionicons name="mail-outline" size={20} color="#06b6d4" />
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className="flex-1 py-4 ml-3 text-gray-900"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </LinearGradient>
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2.5 text-sm">Password</Text>
          <LinearGradient
            colors={["#f3f4f6", "#e5e7eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden border border-gray-200"
          >
            <View className="flex-row items-center px-4 bg-white">
              <Ionicons name="lock-closed-outline" size={20} color="#06b6d4" />
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity className="mb-6">
          <Text className="text-cyan-500 font-semibold text-sm text-right">Forgot Password?</Text>
        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 px-6"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">Login</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* DIVIDER */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-gray-500 mx-3 text-xs">or continue with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* SOCIAL LOGIN */}
        <TouchableOpacity className="border border-gray-300 rounded-2xl py-3.5 mb-6 flex-row items-center justify-center bg-white">
          <FontAwesome5 name="google" size={18} color="#ea4335" />
          <Text className="text-gray-700 font-semibold ml-2">Google Sign In</Text>
        </TouchableOpacity>

        {/* REGISTER LINK */}
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-600 text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-cyan-500 font-bold text-sm">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

=======
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#06b6d4",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
>>>>>>> Stashed changes
