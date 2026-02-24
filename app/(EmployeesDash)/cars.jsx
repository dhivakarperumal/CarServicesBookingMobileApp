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
import { KeyboardAvoidingView, Platform } from "react-native";

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
        0,
      ),
    [parts],
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

  const removePartRow = (i) => setParts(parts.filter((_, idx) => idx !== i));

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
        "parts",
      );

      for (let p of validParts) {
        await addDoc(partsRef, {
          serviceId: selectedCar.serviceId || selectedCar.bookingDocId || "",
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
        <Text style={styles.number}>Service ID: {item.serviceId || "N/A"}</Text>

        <Text style={styles.model}>
          {item.carBrand} - {item.carModel}
        </Text>

        <Text style={styles.subText}>Mechanic: {item.employeeName || "-"}</Text>

        {item.partsTotalCost ? (
          <Text style={styles.parts}>Parts Cost: ₹{item.partsTotalCost}</Text>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        {/* 🔎 SEARCH */}
        <TextInput
          placeholder="Search service, car, mechanic..."
          placeholderTextColor="#94a3b8"
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
                style={[styles.filterBtn, filter === f && styles.activeFilter]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[styles.filterText, filter === f && { color: "#fff" }]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {filteredCars.length === 0 ? (
          <Text style={styles.empty}>No Cars Found</Text>
        ) : (
          <FlatList
            data={filteredCars}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}
          />
        )}

        {/* 🔥 PARTS MODAL */}
        <Modal
          visible={partsModal}
          animationType="slide"
          onRequestClose={() => setPartsModal(false)}
        >
          <SafeAreaView style={styles.modal}>
            <Text style={styles.modalTitle}>Add Parts</Text>

            <ScrollView>
              {parts.map((item, index) => (
                <View key={index} style={styles.partCard}>
                  <TextInput
                    placeholder="Part name"
                    placeholderTextColor="#64748b"
                    value={item.partName}
                    onChangeText={(v) => handlePartChange(index, "partName", v)}
                    style={styles.input}
                  />

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder="Qty"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                      value={String(item.qty)}
                      onChangeText={(v) => handlePartChange(index, "qty", v)}
                      style={[styles.input, { flex: 1 }]}
                    />

                    <TextInput
                      placeholder="Price"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                      value={String(item.price)}
                      onChangeText={(v) => handlePartChange(index, "price", v)}
                      style={[styles.input, { flex: 1 }]}
                    />
                  </View>

                  <Text style={styles.total}>
                    Total: ₹{Number(item.qty) * Number(item.price)}
                  </Text>

                  {parts.length > 1 && (
                    <TouchableOpacity onPress={() => removePartRow(index)}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#020617",
  },

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
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    color: "#fff",
  },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  activeFilter: {
    backgroundColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
  },

  partCard: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.15)",
  },

  total: {
    marginTop: 8,
    fontWeight: "800",
    color: "#10b981",
  },
  remove: {
    marginTop: 8,
    color: "#f87171",
    fontWeight: "700",
    textAlign: "center",
  },

  addRow: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  grandTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#38bdf8",
    marginBottom: 16,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  partsBtn: {
    marginTop: 10,
    backgroundColor: "#38bdf8",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  completeBtn: {
    marginTop: 10,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: "#020617",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
    color: "#e5e7eb",
  },
  input: {
    backgroundColor: "#020617",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },

  saveBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  /* 🔥 CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0b3b6f",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  number: {
    fontWeight: "800",
    fontSize: 16,
    color: "#38bdf8",
  },

  model: {
    marginTop: 4,
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },

  subText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
  },

  parts: {
    marginTop: 6,
    fontSize: 12,
    color: "#10b981",
    fontWeight: "700",
  },

  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowOpacity: 0.4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  updateBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  updateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
