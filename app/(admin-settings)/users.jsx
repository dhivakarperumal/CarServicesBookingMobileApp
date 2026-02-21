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
    // backgroundColor: "#0f172a",
    padding: 16,
  },

  loader: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  email: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  mobile: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  role: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 4,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  active: {
    backgroundColor: "#dcfce7",
  },

  inactive: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },

  empty: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 20,
  },
});