import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 FETCH USERS REAL-TIME */
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* 🔹 LOADING STATE */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No users found</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {/* AVATAR */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.username?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>

              {/* USER INFO */}
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>
                  {item.username || "No Name"}
                </Text>

                <Text style={styles.email}>{item.email}</Text>

                

                <Text style={styles.role}>
                  Role: {item.role || "user"}
                </Text>
              </View>

              {/* STATUS BADGE */}
              <View
                style={[
                  styles.statusBadge,
                  item.active ? styles.active : styles.inactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {item.active ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
  },

  loader: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#0b3b6f",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#020617",
    borderWidth: 2,
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  email: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  role: {
    fontSize: 12,
    color: "#38bdf8",
    marginTop: 4,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },

  active: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderColor: "#22c55e",
  },

  inactive: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "#ef4444",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  empty: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
});