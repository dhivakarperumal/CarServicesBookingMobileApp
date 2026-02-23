import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#0EA5E9" />
        <Text style={styles.backText}>BACK</Text>
      </TouchableOpacity>

      {/* HERO IMAGE */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: service.image }} style={styles.image} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>{service.name}</Text>

        <Text style={styles.description}>{service.description}</Text>

        {/* FEATURES */}
        {service.features && (
          <View style={styles.featuresContainer}>
            {service.features.map((item: string, index: number) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookText}>BOOK THIS SERVICE</Text>
        </TouchableOpacity>
      </View>

      {/* INFO CARDS */}
      <View style={styles.infoSection}>
        <InfoCard title="SERVICE TYPE" value={service.type || "Premium"} />
        <InfoCard title="DURATION" value={service.duration || "2 – 3 Hours"} />
        <InfoCard title="WARRANTY" value={service.warranty || "6 Months"} />
      </View>
    </ScrollView>
  );
}

/* INFO CARD COMPONENT */
const InfoCard = ({ title, value }: any) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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

  bookButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 30,
  },

  bookText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 2,
  },

  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  infoCard: {
    backgroundColor: "#0b0f14",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
  },

  infoTitle: {
    color: "#0EA5E9",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },

  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});