import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "warning",
        text1: "Missing Details",
        text2: "Please enter both email and password",
      });
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
        await auth.signOut();
        Toast.show({
          type: "error",
          text1: "Profile Not Found",
          text2: "User profile not found",
        });

        return;
      }

      const userData = userSnap.data();

      // ✅ CHECK STATUS FIRST
      if (userData.status !== "active") {
        await auth.signOut();

        Toast.show({
          type: "error",
          text1: "Account Disabled",
          text2: "Your account has been disabled. Contact admin.",
        });

        return;
      }

      const role = userData.role?.toLowerCase();

      if (role === "admin") {
        router.replace("/(adminTabs)/home");
      } else if (role === "mechanic") {
        router.replace("/(EmployeesDash)/dashboard");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#0B1120" }}
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo_no_bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Car Service Login</Text>
        <Text style={styles.subtitle}>
          Sign in to manage services & bookings
        </Text>
      </View>

      {/* Email */}
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Email or Username"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#94A3B8"
          />
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
        style={{ marginTop: 10 }}
      >
        <LinearGradient
          colors={["#0EA5E9", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientLoginButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.gradientLoginText}>Sign In</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Register */}
      <Text
        onPress={() => router.push("/(auth)/register")}
        style={styles.registerText}
      >
        Don’t have an account?{" "}
        <Text style={{ color: "#06B6D4" }}>Register</Text>
      </Text>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "center",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 15,
  },

  registerText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 24,
    fontSize: 14,
  },

  gradientLoginButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 40,   // controls width
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",     // centers button
    marginTop: 10,
  },

  gradientLoginText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});