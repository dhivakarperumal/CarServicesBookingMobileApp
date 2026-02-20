import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      // 🔐 Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 👤 Save display name in Auth
      await updateProfile(userCred.user, {
        displayName: name,
      });

      // 🗄 Save user profile in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        name: name,
        email: email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created successfully!");

      // ✅ Expo Router navigation
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Register Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* GRADIENT HEADER */}
      <LinearGradient
        colors={["#0891b2", "#06b6d4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-10 items-center"
      >
        <View className="bg-white bg-opacity-20 p-4 rounded-full mb-4">
          <FontAwesome5 name="car" size={48} color="#fff" />
        </View>
        <Text className="text-white text-3xl font-bold mb-1.5">Car Care Service</Text>
        <Text className="text-cyan-100 text-sm">Create your account</Text>
      </LinearGradient>

      {/* FORM CONTAINER */}
      <View className="px-6 py-8">
        {/* REGISTER TITLE */}
        <View className="mb-8">
          <Text className="text-gray-900 text-2xl font-bold mb-2">Create Account</Text>
          <Text className="text-gray-600 text-sm">Join us and start booking services</Text>
        </View>

        {/* FULL NAME INPUT */}
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2.5 text-sm">Full Name</Text>
          <LinearGradient
            colors={["#f3f4f6", "#e5e7eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl overflow-hidden border border-gray-200"
          >
            <View className="flex-row items-center px-4 bg-white">
              <Ionicons name="person-outline" size={20} color="#06b6d4" />
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </LinearGradient>
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
                placeholder="Minimum 6 characters"
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

        {/* TERMS & CONDITIONS */}
        <View className="flex-row items-center mb-6">
          <Text className="text-gray-600 text-xs flex-1">
            By registering, you agree to our{' '}
            <Text className="text-cyan-500 font-semibold">Terms & Conditions</Text>
          </Text>
        </View>

        {/* REGISTER BUTTON */}
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-lg mb-6"
        >
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 px-6"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">Register</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* LOGIN LINK */}
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-600 text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-cyan-500 font-bold text-sm">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
