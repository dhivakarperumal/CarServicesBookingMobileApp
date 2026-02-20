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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const inStock = item.totalStock > 0;

    return (
      <View className="flex-row bg-white p-3 rounded-3.5 mb-3 shadow-lg">
        {item.image && (
          <Image source={{ uri: item.image }} className="w-22 h-22 rounded-2.5 mr-3" />
        )}

        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
          <Text className="text-xs text-gray-500 mb-1">{item.brand}</Text>

          {/* PRICE SECTION */}
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-bold text-cyan-500 mr-2">₹ {item.offerPrice}</Text>
            <Text className="text-xs text-gray-400 line-through mr-1.5">₹ {item.mrp}</Text>
            <Text className="text-xs text-green-600 font-semibold">{item.offer}% OFF</Text>
          </View>

          {/* STOCK */}
          <Text
            className={`text-xs font-semibold ${
              inStock ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Text>

          {/* RATING */}
          <Text className="text-xs text-amber-400 mt-0.5">⭐ {item.rating}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="text-2xl font-bold mb-4 text-gray-900">Car Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.docId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
