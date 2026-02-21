import { Stack } from "expo-router";

export default function SettingsStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f172a",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerShadowVisible: false,
      }}
    />
  );
}