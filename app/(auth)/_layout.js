import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}