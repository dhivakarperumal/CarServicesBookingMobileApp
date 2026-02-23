import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function CarsScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [partsModal, setPartsModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const [parts, setParts] = useState([{ partName: "", qty: 1, price: 0 }]);
  const [savingParts, setSavingParts] = useState(false);

  /* 🔥 FETCH SERVICES */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "assignedServices"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCars(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  /* 🔎 SEARCH + FILTER */
  const filteredCars = useMemo(() => {
    return cars
      .filter((item) => {
        if (filter === "all") return true;
        return item.serviceStatus === filter;
      })
      .filter((item) => {
        const text = search.toLowerCase();

        return (
          item.serviceId?.toLowerCase().includes(text) ||
          item.carBrand?.toLowerCase().includes(text) ||
          item.carModel?.toLowerCase().includes(text) ||
          item.employeeName?.toLowerCase().includes(text)
        );
      });
  }, [cars, search, filter]);

  /* 🔥 TOTAL PARTS COST */
  const totalPartsCost = useMemo(
    () =>
      parts.reduce(
        (sum, p) => sum + Number(p.qty || 0) * Number(p.price || 0),
        0
      ),
    [parts]
  );

  /* 🔥 START SERVICE */
  const startService = async (item) => {
    await updateDoc(doc(db, "assignedServices", item.id), {
      serviceStatus: "In Progress",
      startedAt: new Date(),
    });
  };

  /* 🔥 OPEN PARTS MODAL */
  const openPartsModal = (item) => {
    setSelectedCar(item);
    setParts([{ partName: "", qty: 1, price: 0 }]);
    setPartsModal(true);
  };

  const addPartRow = () =>
    setParts([...parts, { partName: "", qty: 1, price: 0 }]);

  const removePartRow = (i) =>
    setParts(parts.filter((_, idx) => idx !== i));

  const handlePartChange = (i, field, value) => {
    const copy = [...parts];
    copy[i][field] = value;
    setParts(copy);
  };

  /* 🔥 SAVE PARTS */
  const saveParts = async () => {
    if (!selectedCar) return;

    const validParts = parts.filter((p) => p.partName);

    if (validParts.length === 0) {
      Alert.alert("Add at least one part");
      return;
    }

    try {
      setSavingParts(true);

      const partsRef = collection(
        db,
        "assignedServices",
        selectedCar.id,
        "parts"
      );

      for (let p of validParts) {
        await addDoc(partsRef, {
          serviceId:
            selectedCar.serviceId || selectedCar.bookingDocId || "",
          partName: p.partName,
          qty: Number(p.qty),
          price: Number(p.price),
          total: Number(p.qty) * Number(p.price),
          createdAt: new Date(),
        });
      }

      await updateDoc(doc(db, "assignedServices", selectedCar.id), {
        partsAdded: true,
        partsTotalCost:
          Number(selectedCar.partsTotalCost || 0) + totalPartsCost,
        serviceStatus: "Parts Added",
      });

      setPartsModal(false);
      setSelectedCar(null);
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to save parts");
    } finally {
      setSavingParts(false);
    }
  };

  /* 🔥 COMPLETE SERVICE */
  const completeService = async (item) => {
    if (!item.partsAdded) {
      Alert.alert("Add Parts", "Please add parts before completing");
      return;
    }

    await updateDoc(doc(db, "assignedServices", item.id), {
      serviceStatus: "Completed",
      completedAt: new Date(),
    });
  };

  /* 🎨 STATUS COLOR */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return { bg: "#d1fae5", text: "#065f46" };
      case "In Progress":
        return { bg: "#e0f2fe", text: "#075985" };
      case "Parts Added":
        return { bg: "#ede9fe", text: "#5b21b6" };
      default:
        return { bg: "#fef3c7", text: "#92400e" };
    }
  };

  /* 🔥 CARD UI */
  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.serviceStatus);

    return (
      <View style={styles.card}>
        <Text style={styles.number}>
          Service ID: {item.serviceId || "N/A"}
        </Text>

        <Text style={styles.model}>
          {item.carBrand} - {item.carModel}
        </Text>

        <Text style={styles.subText}>
          Mechanic: {item.employeeName || "-"}
        </Text>

        {item.partsTotalCost ? (
          <Text style={styles.parts}>
            Parts Cost: ₹{item.partsTotalCost}
          </Text>
        ) : null}

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.serviceStatus || "Assigned"}
          </Text>
        </View>

        {item.serviceStatus === "Assigned" && (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => startService(item)}
          >
            <Text style={styles.updateText}>Start Service</Text>
          </TouchableOpacity>
        )}

        {item.serviceStatus === "In Progress" && !item.partsAdded && (
          <TouchableOpacity
            style={styles.partsBtn}
            onPress={() => openPartsModal(item)}
          >
            <Text style={styles.updateText}>Add Parts</Text>
          </TouchableOpacity>
        )}

        {item.partsAdded && item.serviceStatus !== "Completed" && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => completeService(item)}
          >
            <Text style={styles.updateText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔎 SEARCH */}
      <TextInput
        placeholder="Search service, car, mechanic..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* 🎛 FILTER TABS */}
      <View style={styles.filterRow}>
        {["all", "Assigned", "In Progress", "Parts Added", "Completed"].map(
          (f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                filter === f && styles.activeFilter,
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && { color: "#fff" },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {filteredCars.length === 0 ? (
        <Text style={styles.empty}>No Cars Found</Text>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
        />
      )}

      {/* 🔥 PARTS MODAL */}
      <Modal visible={partsModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={styles.modalTitle}>Add Parts</Text>

          <ScrollView>
            {parts.map((item, index) => (
              <View key={index} style={styles.partCard}>
                <TextInput
                  placeholder="Part name"
                  value={item.partName}
                  onChangeText={(v) =>
                    handlePartChange(index, "partName", v)
                  }
                  style={styles.input}
                />

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={String(item.qty)}
                    onChangeText={(v) =>
                      handlePartChange(index, "qty", v)
                    }
                    style={[styles.input, { flex: 1 }]}
                  />

                  <TextInput
                    placeholder="Price"
                    keyboardType="numeric"
                    value={String(item.price)}
                    onChangeText={(v) =>
                      handlePartChange(index, "price", v)
                    }
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>

                <Text style={styles.total}>
                  Total: ₹{Number(item.qty) * Number(item.price)}
                </Text>

                {parts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removePartRow(index)}
                  >
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addRow} onPress={addPartRow}>
              <Text style={styles.updateText}>+ Add Part</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.grandTotal}>
            Parts Total: ₹{totalPartsCost}
          </Text>

          <TouchableOpacity style={styles.saveBtn} onPress={saveParts}>
            {savingParts ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateText}>Save Parts</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setPartsModal(false)}
          >
            <Text style={styles.updateText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f9" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* 🔥 HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { fontSize: 22, fontWeight: "bold", color: "#111" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  serviceId: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "700",
  color: "#2563eb",
},

search: {
  backgroundColor: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#e5e7eb",
},

filterRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: 12,
  gap: 6,
},

filterBtn: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: "#e5e7eb",
  borderRadius: 8,
},

activeFilter: {
  backgroundColor: "#111827",
},

filterText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#374151",
},

partCard: {
  backgroundColor: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
},

total: {
  marginTop: 6,
  fontWeight: "bold",
},

remove: {
  marginTop: 6,
  color: "#dc2626",
  fontWeight: "600",
},

addRow: {
  backgroundColor: "#111",
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 10,
},

grandTotal: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 10,
},

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  parts: {
  marginTop: 6,
  fontSize: 13,
  color: "#374151",
  fontWeight: "600",
},

partsBtn: {
  marginTop: 10,
  backgroundColor: "#3b82f6",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
},

completeBtn: {
  marginTop: 10,
  backgroundColor: "#10b981",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
},

modal: {
  flex: 1,
  padding: 16,
  backgroundColor: "#f9fafb",
},

modalTitle: {
  fontSize: 18,
  fontWeight: "800",
  marginBottom: 12,
},

input: {
  backgroundColor: "#fff",
  padding: 12,
  borderRadius: 10,
  minHeight: 80,
  textAlignVertical: "top",
  marginBottom: 12,
},

saveBtn: {
  backgroundColor: "#111",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 10,
},

  /* 🔥 CARD */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  number: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111827",
  },

  model: {
    marginTop: 4,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "600",
  },

  subText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  updateBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  updateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});