import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ImageBackground,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { FontAwesome } from "@expo/vector-icons";

export default function Pricing() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricingPackages = async () => {
            const snapshot = await getDocs(collection(db, "pricingPackages"));
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPackages(data);
            setLoading(false);
        };

        fetchPricingPackages();
    }, []);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
        );
    }

    return (
        <ImageBackground
            source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfAJ3Ai3tu58SWAJ2mK_EhozE-OIgQXcLXNg&s",
            }}
            style={styles.background}
        >
            <View style={styles.overlay} />

            <View style={styles.container}>
                <Text style={styles.title}>Our Pricing</Text>

                <FlatList
                    data={packages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.title}</Text>

                            <Text style={styles.price}>
                                ₹ {item.price}
                                <Text style={styles.perText}> /service</Text>
                            </Text>

                            {item.features?.map((feature: string, index: number) => (
                                <View key={index} style={styles.featureRow}>
                                    <FontAwesome name="check" size={14} color="#0EA5E9" />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#111827",
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "rgba(14,165,233,0.3)",
    },
    feature: {
        color: "#CBD5E1",
        fontSize: 14,
        marginTop: 4,
    },
    cardTitle: {
        color: "#0EA5E9",
        fontSize: 23,
        fontWeight: "600",
    },
    price: {
        color: "white",
        fontSize: 40,
        fontWeight: "bold",
        marginVertical: 8,
    },
    perText: {
        fontSize: 14,        // smaller than price
        fontWeight: "400",
        color: "#CBD5E1",    // slightly lighter
    },
    description: {
        color: "#CBD5E1",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },

    featureText: {
        color: "#CBD5E1",
        fontSize: 14,
        marginLeft: 8,
    },
});