import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { View, ActivityIndicator, Text } from "react-native";

export default function RootLayout() {
  const [user, setUser] = useState(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsub;
  }, []);

  useEffect(() => { if (user === undefined) return; const inAuthGroup = segments[0] === "(auth)"; if (!user && !inAuthGroup) { router.replace("/(auth)/login"); } else if (user && inAuthGroup) { router.replace("/(tabs)"); } }, [user, segments]);

  // ✅ Loading screen instead of null
  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast
        config={{
          success: ({ text1, text2 }) => (
            <View
              style={{
                width: "90%",
                backgroundColor: "#ffffff",
                borderLeftWidth: 4,
                borderLeftColor: "#0EA5E9",
                padding: 15,
                borderRadius: 12,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#0EA5E9", fontWeight: "bold" }}>
                {text1}
              </Text>
              <Text style={{ color: "#000000", marginTop: 4 }}>
                {text2}
              </Text>
            </View>
          ),
          error: ({ text1, text2 }) => (
            <View
              style={{
                width: "90%",
                backgroundColor: "#ffffff",
                borderLeftWidth: 4,
                borderLeftColor: "#EF4444",
                padding: 15,
                borderRadius: 12,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#EF4444", fontWeight: "bold" }}>
                {text1}
              </Text>
              <Text style={{ color: "#000000", marginTop: 4 }}>
                {text2}
              </Text>
            </View>
          ),
          // 🔥 NEW WARNING TYPE
          warning: ({ text1, text2 }) => (
            <View
              style={{
                width: "90%",
                backgroundColor: "#ffffff",
                borderLeftWidth: 4,
                borderLeftColor: "#F59E0B", // amber
                padding: 15,
                borderRadius: 12,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#F59E0B", fontWeight: "bold" }}>
                {text1}
              </Text>
              <Text style={{ color: "#000000", marginTop: 4 }}>
                {text2}
              </Text>
            </View>
          ),
        }}
      />
    </>
  );
}

