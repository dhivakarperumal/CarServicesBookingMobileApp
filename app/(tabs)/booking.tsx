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
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { ImageBackground } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

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
  const router = useRouter();

  const [coords, setCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  // use current location
  const handleUseCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Allow location access to continue",
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!reverseGeocode.length) {
        throw new Error("Address not found");
      }

      const address = reverseGeocode[0];

      const city = address.city || address.subregion || address.district || "";

      const allowedCities = ["chennai", "tirupathur"];

      const available = allowedCities.some((allowed) =>
        city.toLowerCase().includes(allowed),
      );

      setIsServiceAvailable(available);

      if (!available) {
        Toast.show({
          type: "error",
          text1: "Service Not Available",
          text2: "Service available only in Chennai & Tirupattur",
        });
      }

      setCoords({
        lat: latitude,
        lng: longitude,
      });

      handleChange(
        "location",
        `${address.name || ""}, ${address.street || ""}, ${address.city || ""}`,
      );
    } catch (error) {
      console.log("Location error:", error);

      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Unable to fetch location",
      });
    } finally {
      setLocationLoading(false);
    }
  };

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

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const brand = formData.brand.trim();
    const model = formData.model.trim();
    const issue = formData.issue.trim();
    const otherIssue = formData.otherIssue.trim();
    const location = formData.location.trim();
    const address = formData.address.trim();

    // Name
    if (!name) return "Full name is required";

    // Phone (10 digits)
    if (!/^[6-9][0-9]{9}$/.test(phone))
      return "Mobile number must start with 6-9 and be 10 digits";

    // Email (optional but validate if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter valid email address";

    // Brand & Model
    if (!brand) return "Car brand is required";
    if (!model) return "Car model is required";

    // Issue
    if (!issue) return "Please select an issue";

    if (issue === "Others" && !otherIssue) return "Please describe your issue";

    // Location
    if (!location) return "Location is required";
    if (!address) return "Service address is required";

    // Coordinates check (FIXED)
    if (coords.lat === null || coords.lng === null)
      return "Please use current location";

    // Service availability
    if (!isServiceAvailable)
      return "Service available only in Chennai & Tirupattur";

    return null;
  };

  const handleBooking = async () => {
    if (loading) return;
    const error = validate();
    if (error) {
      Toast.show({
        type: "warning",
        text1: "Validation Error",
        text2: error,
      });
      return;
    }

    try {
      setLoading(true);

      const bookingId = await generateBookingId();

      const user = auth.currentUser;

      if (!user) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again",
        });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "bookings"), {
        bookingId,
        uid: user.uid,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        issue:
          formData.issue === "Others"
            ? formData.otherIssue.trim()
            : formData.issue,
        location: formData.location.trim(),
        address: formData.address.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        status: BOOKING_STATUS.BOOKED,
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Booking Successful",
        text2: `Booking ID: ${bookingId}`,
      });

      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/profile",
          params: { tab: "servicestatus" },
        });
      }, 1500);

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
      Toast.show({
        type: "error",
        text1: "Booking Failed",
        text2: "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfAJ3Ai3tu58SWAJ2mK_EhozE-OIgQXcLXNg&s",
      }}
      style={{ flex: 1 }}
    >
      <View style={styles.overlay} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Book Service</Text>

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(v) => handleChange("name", v)}
        />
        <Input
          label="Mobile"
          placeholder="Enter mobile number"
          value={formData.phone}
          keyboardType="numeric"
          onChange={(v) => {
            const cleaned = v.replace(/[^0-9]/g, "");
            if (cleaned.length <= 10) {
              handleChange("phone", cleaned);
            }
          }}
        />
        <Input
          label="Email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(v) => handleChange("email", v)}
        />

        {/* BRAND */}
        <Text style={styles.label}>Car Brand</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            dropdownIconColor="#0EA5E9"
            selectedValue={formData.brand}
            onValueChange={(v) => handleChange("brand", v)}
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Brand" value="" />
            <Picker.Item label="Honda" value="Honda" />
            <Picker.Item label="Hyundai" value="Hyundai" />
            <Picker.Item label="BMW" value="BMW" />
            <Picker.Item label="Audi" value="Audi" />
          </Picker>
        </View>

        <Input
          label="Car Model"
          placeholder="Ex: Swift / City / X5"
          value={formData.model}
          onChange={(v) => handleChange("model", v)}
        />

        {/* ISSUE */}
        <Text style={styles.label}>Issue</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            dropdownIconColor="#0EA5E9"
            selectedValue={formData.issue}
            onValueChange={(v) => {
              handleChange("issue", v);
              if (v !== "Others") {
                handleChange("otherIssue", "");
              }
            }}
            style={{ color: "#fff" }}
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
            placeholder="Describe your problem"
            value={formData.otherIssue}
            onChange={(v) => handleChange("otherIssue", v)}
          />
        )}

        <Input
          label="Location"
          placeholder="Area / Landmark"
          value={formData.location}
          onChange={(v) => handleChange("location", v)}
        />

        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          disabled={locationLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#0EA5E9", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientLocationBtn}
          >
            {locationLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="location-outline" size={18} color="#fff" />
                <Text style={styles.gradientLocationText}>
                  Use Current Location
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Input
          label="Service Address"
          placeholder="House No, Street, Area"
          value={formData.address}
          onChange={(v) => handleChange("address", v)}
          multiline
        />

        <TouchableOpacity
          onPress={handleBooking}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#0EA5E9", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.gradientButtonText}>Book Now</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor="#64748B"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={keyboardType === "numeric" ? 10 : undefined}
        style={[styles.input, multiline && { height: 90 }]}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#0B1120",
    padding: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
  },

  label: {
    color: "#94A3B8",
    marginBottom: 6,
    fontSize: 13,
  },

  input: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
  },

  pickerWrapper: {
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.3)",
    marginBottom: 16,
  },

  gradientButton: {
    paddingVertical: 13,
    borderRadius: 50,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 20,
    alignSelf: "center",
  },

  gradientButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  gradientLocationBtn: {
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    alignSelf: "center",
  },

  gradientLocationText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
