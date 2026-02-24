import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function AddServiceParts() {
  const { serviceId } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [parts, setParts] = useState([{ partName: "", qty: 1, price: 0 }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* 🔥 Load selected service */
  useEffect(() => {
    if (!serviceId) return;

    const loadService = async () => {
      try {
        const snap = await getDoc(doc(db, "allServices", serviceId));

        if (!snap.exists()) {
          Alert.alert("Service not found");
          router.back();
          return;
        }

        setService({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.log(err);
        Alert.alert("Error loading service");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  const handlePartChange = (i, field, value) => {
    const copy = [...parts];
    copy[i][field] = value;
    setParts(copy);
  };

  const addPartRow = () => {
    setParts([...parts, { partName: "", qty: 1, price: 0 }]);
  };

  const removePartRow = (i) => {
    setParts(parts.filter((_, idx) => idx !== i));
  };

  const totalPartsCost = useMemo(
    () => parts.reduce((sum, p) => sum + Number(p.qty) * Number(p.price), 0),
    [parts],
  );

  const handleSave = async () => {
    if (!service) return;

    const validParts = parts.filter((p) => p.partName);

    if (validParts.length === 0) {
      Alert.alert("Add at least one part");
      return;
    }

    try {
      setSaving(true);

      const partsRef = collection(db, "allServices", service.id, "parts");

      for (let p of validParts) {
        await addDoc(partsRef, {
          partName: p.partName,
          qty: Number(p.qty),
          price: Number(p.price),
          total: Number(p.qty) * Number(p.price),
          createdAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, "allServices", service.id), {
        estimatedCost: Number(service.estimatedCost || 0) + totalPartsCost,
        serviceStatus: "Bill Pending",
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Parts added successfully");
      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to save parts");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !service) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
  style={{ flex: 1, backgroundColor: "#020617" }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
      <View
        style={{
          paddingTop: 48, 
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderColor: "rgba(56,189,248,0.2)",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            color: "#e5e7eb",
          }}
        >
          Add Service Parts
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 180,
          flexGrow: 1,
        }}
      >
        {/* SERVICE INFO */}
        <View
          style={{
            backgroundColor: "#0f172a",
            padding: 18,
            borderRadius: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "rgba(56,189,248,0.2)",
          }}
        >
          <Text style={{ color: "#38bdf8", fontWeight: "900", fontSize: 16 }}>
            {service.bookingId}
          </Text>

          <Text style={{ color: "#fff", marginTop: 6 }}>{service.name}</Text>
          <Text style={{ color: "#94a3b8" }}>{service.phone}</Text>

          <Text style={{ color: "#94a3b8" }}>
            {service.brand} {service.model}
          </Text>
        </View>

        {/* PARTS LIST */}
        <FlatList
          data={parts}
          keyExtractor={(_, i) => i.toString()}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: "#0f172a",
                padding: 18,
                borderRadius: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(56,189,248,0.15)",
              }}
            >
              <TextInput
                placeholder="Part name"
                placeholderTextColor="#64748b"
                value={item.partName}
                onChangeText={(v) => handlePartChange(index, "partName", v)}
                style={{
                  backgroundColor: "#020617",
                  color: "#fff",
                  borderWidth: 1,
                  borderColor: "rgba(56,189,248,0.25)",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                  fontSize: 16,
                }}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  placeholder="Qty"
                  keyboardType="numeric"
                  value={String(item.qty)}
                  onChangeText={(v) => handlePartChange(index, "qty", v)}
                  placeholderTextColor="#64748b"
                  style={{
                    flex: 1,
                    backgroundColor: "#020617",
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "rgba(56,189,248,0.25)",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />

                <TextInput
                  placeholder="Price"
                  keyboardType="numeric"
                  value={String(item.price)}
                  onChangeText={(v) => handlePartChange(index, "price", v)}
                  placeholderTextColor="#64748b"
                  style={{
                    flex: 1,
                    backgroundColor: "#020617",
                    color: "#fff",
                    borderWidth: 1,
                    borderColor: "rgba(56,189,248,0.25)",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <Text
                style={{
                  marginTop: 12,
                  fontWeight: "800",
                  fontSize: 16,
                  color: "#10b981",
                }}
              >
                Total: ₹{Number(item.qty) * Number(item.price)}
              </Text>

              {parts.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePartRow(index)}
                  style={{
                    marginTop: 10,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(239,68,68,0.5)",
                  }}
                >
                  <Text style={{ textAlign: "center", color: "#f87171" }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />

        {/* ADD PART */}
        <TouchableOpacity
          onPress={addPartRow}
          style={{
            backgroundColor: "#38bdf8",
            paddingVertical: 16,
            borderRadius: 16,
            marginBottom: 20,
          }}
        >
          <Text
            style={{ color: "#020617", textAlign: "center", fontWeight: "900" }}
          >
            + Add Part
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM TOTAL BAR */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#020617",
          borderTopWidth: 1,
          borderColor: "rgba(56,189,248,0.2)",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#0f172a",
            padding: 18,
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(56,189,248,0.25)",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#38bdf8" }}>
            ₹{totalPartsCost}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: "#10b981",
              paddingVertical: 14,
              paddingHorizontal: 22,
              borderRadius: 16,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#020617", fontWeight: "900" }}>
                Save Parts
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
