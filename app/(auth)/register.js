import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
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

      Alert.alert("Success", "Account created");

      // ✅ Expo Router navigation
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Register Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Text
        style={styles.link}
        onPress={() => router.push("/(auth)/login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#06b6d4",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 16,
    color: "#06b6d4",
  },
});
