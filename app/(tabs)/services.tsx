import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebase";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Service {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  sparePartsIncluded?: string[];
  supportedBrands?: string[];
  status: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snap) => {
      const data: Service[] = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Service, "id">),
        }))
        .filter((item) => item.status === "active"); // ✅ only active

      setServices(data);
    });

    return () => unsub();
  }, []);

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      {/* Image */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/(app)/service/${item.id}`)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/(app)/service/${item.id}`)}
      >
        <Text
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>

      {/* SPARE PARTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Includes:</Text>

        {[0, 1, 2].map((i) => {
          const part = item.sparePartsIncluded?.[i];
          return (
            <Text key={i} style={styles.listItem}>
              {part ? (
                <>
                  <FontAwesome name="check" size={12} color="#0EA5E9" /> {part}
                </>
              ) : (
                " "
              )}
            </Text>
          );
        })}
      </View>

      {/* SUPPORTED BRANDS */}
      {item.supportedBrands?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Brands:</Text>
          <Text style={styles.listItem}>
            {item.supportedBrands.join(", ")}
          </Text>
        </View>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        onPress={() => router.push(`/(app)/service/${item.id}`)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#0EA5E9", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <Text style={styles.gradientButtonText}>
            View More
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        numColumns={2}   // 👈 ADD THIS
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No services available</Text>
        }
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 16,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.25)",
    width: "48%",
    minHeight: 240,   // 👈 Standard height
    justifyContent: "space-between",
  },

  image: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },

  imagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    marginBottom: 8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontVariant: ["small-caps"],
    fontWeight: "700",
    marginBottom: 8,
  },

  description: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 12,
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0EA5E9",
    marginBottom: 12,
  },

  section: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  listItem: {
    color: "#E5E7EB",
    fontSize: 12,
    marginBottom: 0,
    lineHeight: 18,
  },

  gradientButton: {
    alignSelf: "center",   // 👈 center it
    width: "70%",          // 👈 decrease width (you can try 60% / 65%)
    paddingVertical: 7,    // slightly smaller
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  gradientButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  empty: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 50,
  },
});