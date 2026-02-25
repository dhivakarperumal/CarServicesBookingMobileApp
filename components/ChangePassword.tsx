import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User,
} from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";


const ChangePassword: React.FC = () => {
  const user: User | null = auth.currentUser;

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const handleChangePassword = async (): Promise<void> => {
    if (!user || !user.email) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "User not logged in properly.",
      });
      return;
    }

    if (!currentPassword) {
      Toast.show({
        type: "warning",
        text1: "Validation Error",
        text2: "Enter current password",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "warning",
        text1: "Weak Password",
        text2: "New password must be at least 6 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "warning",
        text1: "Mismatch",
        text2: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password updated successfully",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Current password is incorrect",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      {/* Current Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Current Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <Ionicons
            name={showCurrent ? "eye-off" : "eye"}
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <Ionicons
            name={showNew ? "eye-off" : "eye"}
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirm New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons
            name={showConfirm ? "eye-off" : "eye"}
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: "#0B1120",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
});