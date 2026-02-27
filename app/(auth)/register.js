import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { auth, db } from "../../firebase";

export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const handleRegister = async () => {
    if (loading) return;

    // 🔎 Validations (Same as Web)
    if (!username.trim()) {
      Toast.show({
        type: "warning",
        text1: "Username Required",
        text2: "Please enter your username",
      });
      return;
    }

    if (!email.trim()) {
      Toast.show({
        type: "warning",
        text1: "Email Required",
        text2: "Please enter your email",
      });
      return;
    }

    if (!mobile.trim()) {
      Toast.show({
        type: "warning",
        text1: "Mobile Required",
        text2: "Please enter your mobile number",
      });
      return;
    }

    if (mobile.length !== 10) {
      Toast.show({
        type: "warning",
        text1: "Invalid Mobile",
        text2: "Enter a valid 10 digit mobile number",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "warning",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const isAdmin = adminCode === "ADMIN123DENTAL";
      const role = isAdmin ? "admin" : "user";

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username,
        email,
        mobile,
        role,
        active: true,
        status: "active",
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: "Your account was created successfully",
      });

      router.replace("/(tabs)");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Register Failed",
        text2: err?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1120" }}>

      {/* LOGO FIXED */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo_no_bg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Register to access car service features
        </Text>
      </View>

      {/* SCROLL ONLY FIELDS */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* USERNAME */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
        </View>

        {/* MOBILE */}
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Mobile Number"
            placeholderTextColor="#64748B"
            value={mobile}
            onChangeText={(text) =>
              setMobile(text.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
            maxLength={10}
            style={styles.input}
          />
        </View>

        {/* EMAIL */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* ADMIN CODE */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#94A3B8"
          />
          <TextInput
            placeholder="Admin Code (optional)"
            placeholderTextColor="#64748B"
            value={adminCode}
            onChangeText={setAdminCode}
            style={styles.input}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
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

        {/* CONFIRM PASSWORD */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#64748B"
            secureTextEntry={secureConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setSecureConfirm(!secureConfirm)}
          >
            <Ionicons
              name={
                secureConfirm ? "eye-off-outline" : "eye-outline"
              }
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* FIXED BOTTOM SECTION */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0EA5E9", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientRegisterButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text style={styles.gradientRegisterText}>Register</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.loginRedirect}>
            Already have an account?{" "}
            <Text
              style={{ color: "#06B6D4" }}
              onPress={() => router.push("/(auth)/login")}
            >
              Login
            </Text>
          </Text>

        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 110,   // 👈 IMPORTANT
    backgroundColor: "#0B1120",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 10,
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
    marginBottom: 16,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 15,
  },

  registerButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  registerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  loginRedirect: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 24,
    marginBottom: 40,
    fontSize: 14,
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

  scrollContainer: {
    paddingHorizontal: 24,

  },

  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    backgroundColor: "#0B1120",
  },
  gradientRegisterButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 40,   // controls width
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 16,
  },

  gradientRegisterText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});