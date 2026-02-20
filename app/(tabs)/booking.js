import { Picker } from "@react-native-picker/picker";
import {
    addDoc,
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase";

const BOOKING_STATUS = {
  BOOKED: "Booked",
};

export default function BookingScreen() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    brand: "",
    model: "",
    issue: "",
    otherIssue: "",
    address: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  const generateBookingId = async () => {
    const counterRef = doc(db, "counters", "bookingCounter");

    const bookingId = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);

      let nextValue = 1;
      if (counterSnap.exists()) {
        nextValue = counterSnap.data().value + 1;
      }

      transaction.set(counterRef, { value: nextValue }, { merge: true });

      return `BS${String(nextValue).padStart(3, "0")}`;
    });

    return bookingId;
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const validate = () => {
    if (!formData.name) return "Name is required";
    if (!formData.phone) return "Phone is required";
    if (!formData.brand) return "Car brand is required";
    if (!formData.model) return "Car model is required";
    if (!formData.issue) return "Issue is required";
    if (!formData.location) return "Location is required";
    if (!formData.address) return "Address is required";
    return null;
  };

  const handleBooking = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Validation", error);
      return;
    }

    try {
      setLoading(true);

      const bookingId = await generateBookingId();

      const bookingData = {
        bookingId,
        ...formData,
        status: BOOKING_STATUS.BOOKED,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      Alert.alert("Success", `Booking Successful: ${bookingId}`);

      setFormData({
        name: "",
        phone: "",
        email: "",
        brand: "",
        model: "",
        issue: "",
        otherIssue: "",
        address: "",
        location: "",
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Book Service</Text>

      {/* NAME */}
      <Input label="Full Name" value={formData.name} onChange={(v) => handleChange("name", v)} />

      {/* PHONE */}
      <Input label="Phone" value={formData.phone} onChange={(v) => handleChange("phone", v)} />

      {/* EMAIL */}
      <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />

      {/* BRAND */}
      <Text className="text-sm mb-1.5 text-gray-700">Car Brand</Text>
      <View className="border border-gray-300 rounded-2.5 mb-3.5">
        <Picker
          selectedValue={formData.brand}
          onValueChange={(v) => handleChange("brand", v)}
        >
          <Picker.Item label="Select Brand" value="" />
          <Picker.Item label="Honda" value="Honda" />
          <Picker.Item label="Hyundai" value="Hyundai" />
          <Picker.Item label="BMW" value="BMW" />
          <Picker.Item label="Audi" value="Audi" />
        </Picker>
      </View>

      {/* MODEL */}
      <Input label="Car Model" value={formData.model} onChange={(v) => handleChange("model", v)} />

      {/* ISSUE */}
      <Text className="text-sm mb-1.5 text-gray-700">Issue</Text>
      <View className="border border-gray-300 rounded-2.5 mb-3.5">
        <Picker
          selectedValue={formData.issue}
          onValueChange={(v) => handleChange("issue", v)}
        >
          <Picker.Item label="Select Issue" value="" />
          <Picker.Item label="Engine Problem" value="Engine Problem" />
          <Picker.Item label="Brake Issue" value="Brake Issue" />
          <Picker.Item label="Electrical" value="Electrical" />
          <Picker.Item label="Others" value="Others" />
        </Picker>
      </View>

      {formData.issue === "Others" && (
        <Input
          label="Describe Issue"
          value={formData.otherIssue}
          onChange={(v) => handleChange("otherIssue", v)}
        />
      )}

      {/* LOCATION */}
      <Input label="Location" value={formData.location} onChange={(v) => handleChange("location", v)} />

      {/* ADDRESS */}
      <Input
        label="Service Address"
        value={formData.address}
        onChange={(v) => handleChange("address", v)}
        multiline
      />

      {/* BUTTON */}
      <TouchableOpacity
        className="bg-cyan-500 py-4 rounded-3xl mt-2.5"
        onPress={handleBooking}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-base">
          {loading ? "Booking..." : "Book Service"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Input({ label, value, onChange, multiline = false }) {
  return (
    <View className="mb-3.5">
      <Text className="text-sm mb-1.5 text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        className={`border border-gray-300 rounded-2.5 p-3 ${multiline ? 'h-20' : ''}`}
        multiline={multiline}
      />
    </View>
  );
}
