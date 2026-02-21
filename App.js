import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import Profile from "./screens/Profile";
import Notifications from "./screens/Notifications";
import AdminDashboard from "./screens/AdminDashboard";
import Header from "./components/Header";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainStack({ role }) {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <Header role={role} />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}

function DrawerLayout() {
  const role = "admin"; // 🔥 get this from Firebase later

  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Main">
        {() => <MainStack role={role} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <DrawerLayout />
    </NavigationContainer>
  );
}
