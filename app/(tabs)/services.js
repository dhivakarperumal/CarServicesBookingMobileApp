import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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
    <TouchableOpacity className="mb-4">
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-5 border border-slate-700 flex-row items-center justify-between"
      >
        <View className="flex-1">
          <Text className="text-white text-base font-bold mb-1">{item.name}</Text>
          <Text className="text-gray-400 text-sm">Professional maintenance</Text>
        </View>
        <View className="items-center">
          <Text className="text-cyan-400 font-bold text-lg">₹ {item.price}</Text>
          <Ionicons name="chevron-forward" size={20} color="#06b6d4" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900">
      {/* HEADER */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-6 pb-6 border-b border-slate-700"
      >
        <Text className="text-white text-2xl font-bold">Our Services</Text>
        <Text className="text-gray-400 text-sm mt-1">Professional car maintenance packages</Text>
      </LinearGradient>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Ionicons name="alert-circle-outline" size={48} color="#6b7280" />
            <Text className="text-center text-gray-400 text-sm mt-4">No services available</Text>
          </View>
        }
      />
    </View>
  );
}
