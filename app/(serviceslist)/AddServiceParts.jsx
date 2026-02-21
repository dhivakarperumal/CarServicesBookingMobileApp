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
    () =>
      parts.reduce(
        (sum, p) => sum + Number(p.qty) * Number(p.price),
        0
      ),
    [parts]
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

      const partsRef = collection(
        db,
        "allServices",
        service.id,
        "parts"
      );

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
        estimatedCost:
          Number(service.estimatedCost || 0) + totalPartsCost,
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
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f1f5f9" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Add Service Parts
      </Text>

      <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 14 }}>
        <Text style={{ fontWeight: "bold" }}>{service.bookingId}</Text>
        <Text>{service.name}</Text>
        <Text>{service.phone}</Text>
        <Text>{service.brand} {service.model}</Text>
      </View>

      <FlatList
        data={parts}
        keyExtractor={(_, i) => i.toString()}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10 }}>
            <TextInput
              placeholder="Part name"
              value={item.partName}
              onChangeText={(v) => handlePartChange(index, "partName", v)}
              style={{ backgroundColor: "#f1f5f9", padding: 8, borderRadius: 6, marginBottom: 8 }}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                placeholder="Qty"
                keyboardType="numeric"
                value={String(item.qty)}
                onChangeText={(v) => handlePartChange(index, "qty", v)}
                style={{ backgroundColor: "#f1f5f9", padding: 8, borderRadius: 6, flex: 1 }}
              />

              <TextInput
                placeholder="Price"
                keyboardType="numeric"
                value={String(item.price)}
                onChangeText={(v) => handlePartChange(index, "price", v)}
                style={{ backgroundColor: "#f1f5f9", padding: 8, borderRadius: 6, flex: 1 }}
              />
            </View>

            <Text style={{ marginTop: 6, fontWeight: "bold" }}>
              Total: ₹{Number(item.qty) * Number(item.price)}
            </Text>

            {parts.length > 1 && (
              <TouchableOpacity
                onPress={() => removePartRow(index)}
                style={{ marginTop: 6, backgroundColor: "#fee2e2", padding: 6, borderRadius: 6 }}
              >
                <Text style={{ textAlign: "center", color: "#dc2626" }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={addPartRow}
        style={{ backgroundColor: "black", padding: 12, borderRadius: 8, marginBottom: 12 }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
          + Add Part
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Total: ₹{totalPartsCost}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: "black", padding: 12, borderRadius: 8 }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Save Parts
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}