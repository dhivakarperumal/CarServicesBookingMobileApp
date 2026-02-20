import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Header({ title = "Car Care", role = "user" }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Drawer Menu */}
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <FontAwesome name="bars" size={22} color="white" />
        </TouchableOpacity>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <FontAwesome name="bell" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <FontAwesome name="user-circle" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Admin Only Button */}
      {role === "admin" && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => navigation.navigate("AdminDashboard")}
        >
          <FontAwesome name="dashboard" size={16} color="white" />
          <Text style={styles.adminText}> Admin Dashboard</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#005461",
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminBtn: {
    marginTop: 14,
    backgroundColor: "#007d8a",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  adminText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 6,
  },
});

