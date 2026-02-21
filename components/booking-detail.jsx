import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";

const STATUS_FLOW = [
  "BOOKED",
  "CALL_VERIFIED",
  "APPROVED",
  "PROCESSING",
  "WAITING_SPARE",
  "SERVICE_GOING",
  "BILL_PENDING",
  "BILL_COMPLETED",
  "SERVICE_COMPLETED",
];

export default function BookingDetails() {
  const { booking } = useLocalSearchParams();
  const router = useRouter();

  const data = JSON.parse(booking);
  const activeIndex = STATUS_FLOW.indexOf(data.normalizedStatus);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>
        Booking ID: {data.bookingId}
      </Text>

      {/* Booking Details */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{data.name}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{data.phone}</Text>

        <Text style={styles.label}>Brand</Text>
        <Text style={styles.value}>{data.brand}</Text>

        <Text style={styles.label}>Model</Text>
        <Text style={styles.value}>{data.model}</Text>

        <Text style={styles.label}>Issue</Text>
        <Text style={styles.value}>{data.issue}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{data.address}</Text>
      </View>

      {/* Status Section */}
<View style={styles.statusSection}>
  {data.normalizedStatus !== "CANCELLED" ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.trackerContainer}
    >
      {STATUS_FLOW.map((status, index) => {
        const isCompleted = index <= activeIndex;

        return (
          <View key={status} style={styles.stepWrapper}>
            
            {/* Circle */}
            <View
              style={[
                styles.circle,
                isCompleted && styles.activeCircle,
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  isCompleted && styles.activeText,
                ]}
              >
                {index + 1}
              </Text>
            </View>

            {/* Label */}
            <Text style={styles.stepLabel}>
              {status.replace(/_/g, " ")}
            </Text>

            {/* Line */}
            {index !== STATUS_FLOW.length - 1 && (
              <View
                style={[
                  styles.line,
                  index < activeIndex && styles.activeLine,
                ]}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  ) : (
    <Text style={styles.cancelledText}>
      ❌ Booking Cancelled
    </Text>
  )}
</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },

  backBtn: {
    color: "#38bdf8",
    marginBottom: 15,
    fontSize: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },

  label: {
    color: "#38bdf8",
    fontSize: 13,
    marginTop: 12,
  },

  value: {
    color: "#e5e7eb",
    fontSize: 15,
    marginTop: 4,
  },

  statusSection: {
    marginTop: 30,
  },

  trackerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  stepContainer: {
    alignItems: "center",
    margin: 8,
    width: 80,
  },

  statusSection: {
  marginTop: 40,
},

trackerContainer: {
  alignItems: "center",
  paddingHorizontal: 10,
},

stepWrapper: {
  alignItems: "center",
  marginRight: 40,
},

circle: {
  width: 50,
  height: 50,
  borderRadius: 25,
  borderWidth: 2,
  borderColor: "#4b5563",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
},

activeCircle: {
  backgroundColor: "#38bdf8",
  borderColor: "#38bdf8",
},

stepText: {
  color: "#9ca3af",
  fontWeight: "700",
  fontSize: 16,
},

activeText: {
  color: "#000",
},

stepLabel: {
  marginTop: 8,
  fontSize: 12,
  textAlign: "center",
  color: "#d1d5db",
  width: 90,
},

line: {
  position: "absolute",
  top: 25,
  left: 50,
  width: 40,
  height: 2,
  backgroundColor: "#4b5563",
},

activeLine: {
  backgroundColor: "#38bdf8",
},

  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },

  stepText: {
    color: "#9ca3af",
    fontWeight: "600",
  },

  stepLabel: {
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
    color: "#d1d5db",
  },

  cancelledText: {
    color: "#ef4444",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});