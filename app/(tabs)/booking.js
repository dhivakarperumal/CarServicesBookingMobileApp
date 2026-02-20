import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import {
    addDoc,
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import {
    ActivityIndicator,
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

      Alert.alert("Success", `Booking Created: ${bookingId}`);

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
    <ScrollView className="flex-1 bg-slate-900">
      {/* HEADER */}
      <LinearGradient
        colors={["#1e293b", "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-6 pb-6 border-b border-slate-700"
      >
        <Text className="text-white text-2xl font-bold">Book Service</Text>
        <Text className="text-gray-400 text-sm mt-1">Schedule your car maintenance</Text>
      </LinearGradient>

      <View className="px-4 py-8">
        {/* NAME */}
        <Input 
          label="Full Name" 
          icon="person-outline"
          value={formData.name} 
          onChange={(v) => handleChange("name", v)} 
          placeholder="Enter your full name"
        />

        {/* PHONE */}
        <Input 
          label="Phone Number" 
          icon="call-outline"
          value={formData.phone} 
          onChange={(v) => handleChange("phone", v)} 
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        {/* EMAIL */}
        <Input 
          label="Email Address" 
          icon="mail-outline"
          value={formData.email} 
          onChange={(v) => handleChange("email", v)} 
          placeholder="Enter email"
          keyboardType="email-address"
        />

        {/* CAR BRAND */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-2.5 text-sm">Car Brand</Text>
          <View className="bg-slate-800 border border-slate-700 rounded-2xl flex-row items-center px-4">
            <Ionicons name="car-outline" size={20} color="#06b6d4" />
            <Picker
              selectedValue={formData.brand}
              onValueChange={(v) => handleChange("brand", v)}
              style={{ flex: 1, color: "#fff", marginLeft: 12 }}
            >
              <Picker.Item label="Select Brand" value="" color="#6b7280" />
              <Picker.Item label="Honda" value="Honda" color="#fff" />
              <Picker.Item label="Hyundai" value="Hyundai" color="#fff" />
              <Picker.Item label="BMW" value="BMW" color="#fff" />
              <Picker.Item label="Audi" value="Audi" color="#fff" />
            </Picker>
          </View>
        </View>

        {/* CAR MODEL */}
        <Input 
          label="Car Model" 
          icon="cube-outline"
          value={formData.model} 
          onChange={(v) => handleChange("model", v)} 
          placeholder="Enter car model"
        />

        {/* ISSUE */}
        <View className="mb-6">
          <Text className="text-white font-semibold mb-2.5 text-sm">Issue Type</Text>
          <View className="bg-slate-800 border border-slate-700 rounded-2xl flex-row items-center px-4">
            <Ionicons name="alert-circle-outline" size={20} color="#06b6d4" />
            <Picker
              selectedValue={formData.issue}
              onValueChange={(v) => handleChange("issue", v)}
              style={{ flex: 1, color: "#fff", marginLeft: 12 }}
            >
              <Picker.Item label="Select Issue" value="" color="#6b7280" />
              <Picker.Item label="Engine Problem" value="Engine Problem" color="#fff" />
              <Picker.Item label="Brake Issue" value="Brake Issue" color="#fff" />
              <Picker.Item label="Electrical" value="Electrical" color="#fff" />
              <Picker.Item label="Others" value="Others" color="#fff" />
            </Picker>
          </View>
        </View>

        {formData.issue === "Others" && (
          <Input
            label="Describe Your Issue"
            icon="document-text-outline"
            value={formData.otherIssue}
            onChange={(v) => handleChange("otherIssue", v)}
            placeholder="Describe the issue"
            multiline
          />
        )}

        {/* LOCATION */}
        <Input 
          label="Location" 
          icon="location-outline"
          value={formData.location} 
          onChange={(v) => handleChange("location", v)} 
          placeholder="Enter your location"
        />

        {/* ADDRESS */}
        <Input
          label="Service Address"
          icon="home-outline"
          value={formData.address}
          onChange={(v) => handleChange("address", v)}
          placeholder="Enter complete address"
          multiline
        />

        {/* BOOKING BUTTON */}
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl overflow-hidden shadow-lg mt-8 mb-6"
        >
          <TouchableOpacity
            className="flex-row items-center justify-center py-4"
            onPress={handleBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">Book Service</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

function Input({ label, value, onChange, multiline = false, icon, placeholder, keyboardType }) {
  return (
    <View className="mb-6">
      <Text className="text-white font-semibold mb-2.5 text-sm">{label}</Text>
      <View className="bg-slate-800 border border-slate-700 rounded-2xl flex-row items-center px-4 py-1">
        {icon && <Ionicons name={icon} size={20} color="#06b6d4" />}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          className={`flex-1 text-white ${icon ? 'ml-3' : ''} ${multiline ? 'h-20' : 'py-3.5'}`}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}
