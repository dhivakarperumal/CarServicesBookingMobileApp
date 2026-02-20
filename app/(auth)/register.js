import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    if (!username.trim())
      return Alert.alert("Error", "Username is required");

    if (!email.trim())
      return Alert.alert("Error", "Email is required");

    if (!mobile.trim())
      return Alert.alert("Error", "Mobile number is required");

    if (mobile.length !== 10)
      return Alert.alert("Error", "Enter valid 10 digit mobile number");

    if (password.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters");

    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");

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
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created successfully");

      router.replace("/(tabs)/home");
    } catch (err) {
      Alert.alert("Register Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="car-sport-outline" size={60} color="#0EA5E9" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register to access car service features
          </Text>
        </View>

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

        {/* REGISTER BUTTON */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <Text style={styles.loginRedirect}>
          Already have an account?{" "}
          <Text
            style={{ color: "#06B6D4" }}
            onPress={() => router.push("/(auth)/login")}
          >
            Login
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
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
});