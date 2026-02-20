import { View, Text, FlatList } from "react-native";

const bookings = [
  { id: "1", name: "Car Wash", user: "Dhivakar", date: "20 Feb" },
  { id: "2", name: "Oil Change", user: "Kumar", date: "21 Feb" },
];

export default function Bookings() {
  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="text-2xl font-bold mb-4">Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl shadow mb-3">
            <Text className="font-bold text-gray-800">{item.name}</Text>
            <Text className="text-gray-500">User: {item.user}</Text>
            <Text className="text-gray-400 text-sm">{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}