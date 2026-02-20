import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    View,
} from "react-native";
import { db } from "../../firebase";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({
        docId: d.id, // ✅ always unique
        ...d.data(),
      }));

      setProducts(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const inStock = item.totalStock > 0;

    return (
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row bg-slate-800 rounded-2xl mb-3 border border-slate-700 overflow-hidden"
      >
        {item.image && (
          <Image source={{ uri: item.image }} className="w-24 h-24 rounded-l-2xl" />
        )}

        <View className="flex-1 p-3.5">
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1">
              <Text className="text-sm font-bold text-white">{item.name}</Text>
              <Text className="text-xs text-gray-400">{item.brand}</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="star" size={12} color="#fbbf24" />
              <Text className="text-xs text-gray-300 ml-1">{item.rating}</Text>
            </View>
          </View>

          {/* PRICE SECTION */}
          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-bold text-cyan-400 mr-2">₹ {item.offerPrice}</Text>
            <Text className="text-xs text-gray-500 line-through mr-1.5">₹ {item.mrp}</Text>
            <View className="bg-red-500 bg-opacity-30 px-1.5 py-0.5 rounded">
              <Text className="text-xs text-red-400 font-semibold">{item.offer}% OFF</Text>
            </View>
          </View>

          {/* STOCK */}
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-1.5 ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text
              className={`text-xs font-semibold ${
                inStock ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* HEADER */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-6 pb-6 border-b border-slate-700"
      >
        <Text className="text-white text-2xl font-bold">Car Products</Text>
        <Text className="text-gray-400 text-sm mt-1">Quality parts and accessories</Text>
      </LinearGradient>

      <FlatList
        data={products}
        keyExtractor={(item) => item.docId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Ionicons name="alert-circle-outline" size={48} color="#6b7280" />
            <Text className="text-center text-gray-400 text-sm mt-4">No products available</Text>
          </View>
        }
      />
    </View>
  );
}
