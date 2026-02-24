import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ServiceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const snap = await getDoc(doc(db, "services", id as string));
        if (snap.exists()) {
          setService({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#94A3B8" }}>Service not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* HERO IMAGE */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: service.image }} style={styles.image} />
        </View>

        <View style={styles.content}>
          {/* SERVICE CODE */}
          <Text style={styles.serviceCode}>{service.SE003 || "SERVICE"}</Text>

          {/* IMAGE NAME */}
          <Text style={styles.title}>
            {service["image name"] || service.name}
          </Text>

          {/* PRICE */}
          <Text style={styles.price}>₹ {service.price?.toLocaleString()}</Text>

          {/* DESCRIPTION */}
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>{service.description}</Text>

         

          {/* SUPPORTED BRANDS */}
          {service.supportedBrands?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>SUPPORTED BRANDS</Text>
              <View style={styles.brandContainer}>
                {service.supportedBrands.map((brand: string, index: number) => (
                  <View key={index} style={styles.brandTag}>
                    <Text style={styles.brandText}>{brand}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

           {/* SPARE PARTS */}
          {service.sparePartsIncluded?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>SPARE PARTS INCLUDED</Text>
              {service.sparePartsIncluded.map((item: string, index: number) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.dot} />
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {/* CTA */}
          <TouchableOpacity style={styles.bookButton} onPress={() => router.push("/(tabs)/booking")}>
            <Text style={styles.bookText}>BOOK SERVICE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  loader: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 6,
  },

  backText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },

  imageWrapper: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  image: {
    width: "100%",
    height: 250,
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 15,
  },

  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },

  featuresContainer: {
    marginBottom: 25,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0EA5E9",
    marginRight: 10,
  },

  featureText: {
    color: "#D1D5DB",
    fontSize: 13,
  },

  serviceCode: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },

  price: {
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#0EA5E9",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 10,
    marginBottom: 10,
  },

  brandContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },

  brandTag: {
    borderWidth: 1,
    borderColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  brandText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "600",
  },

  bookButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 30,
    marginTop:20,
  },

  bookText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 2,
  },
});
