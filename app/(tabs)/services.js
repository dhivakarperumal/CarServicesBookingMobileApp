import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { db } from "../../firebase";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  const renderItem = ({ item }) => (
    <View className="p-4 mb-3 bg-cyan-50 rounded-3xl">
      <Text className="text-base font-semibold mb-1">{item.name}</Text>
      <Text className="text-sm text-gray-700">₹ {item.price}</Text>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Services</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-gray-400">No services available</Text>
        }
      />
    </View>
  );
}
