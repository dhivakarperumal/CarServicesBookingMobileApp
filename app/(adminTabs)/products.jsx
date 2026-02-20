import { View, Text, TouchableOpacity } from "react-native";

export default function Products() {
  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="text-2xl font-bold mb-4">Products</Text>

      <View className="bg-white p-5 rounded-2xl shadow mb-4">
        <Text className="text-gray-600">
          Manage your car service products here.
        </Text>
      </View>

      <TouchableOpacity className="bg-cyan-500 p-4 rounded-2xl items-center">
        <Text className="text-white font-bold">+ Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}