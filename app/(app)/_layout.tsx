import { Stack } from "expo-router";
import Header from "../../components/Header";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
        headerShown: true,
      }}
    >
      <Stack.Screen name="cart" options={{ title: "Cart" }} />
      <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
      <Stack.Screen name="products/[slug]" options={{ title: "Product Details" }} />
      <Stack.Screen name="service/[id]" options={{ title: "Service Details" }} />
    </Stack>
  );
}
