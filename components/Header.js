import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Header({ title = "Car Care" }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity>
          <FontAwesome name="bars" size={22} color="white" /> 
        </TouchableOpacity>

        

        <View style={styles.rightIcons}>
          <FontAwesome name="bell" size={20} color="white" />
          <FontAwesome name="user-circle" size={22} color="white" />
        </View>
      </View>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#005461", // cyan-500
    borderBottomLeftRadius:0,
    borderBottomRightRadius: 0,
    elevation: 6, // shadow Android
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // RN 0.71+ only
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    fontSize: 14,
  },
});

