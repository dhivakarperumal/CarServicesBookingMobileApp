import { View, Text, TouchableOpacity } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 bg-slate-100 p-4 items-center">
      <View className="bg-white p-6 rounded-3xl shadow w-full items-center">
        <View className="w-24 h-24 bg-cyan-500 rounded-full items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">A</Text>
        </View>

        <Text className="text-xl font-bold">Admin Name</Text>
        <Text className="text-gray-500 mb-6">admin@email.com</Text>

        <TouchableOpacity className="bg-cyan-500 px-6 py-3 rounded-2xl w-full items-center">
          <Text className="text-white font-bold">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}