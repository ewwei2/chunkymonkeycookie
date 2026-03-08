import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.email}>{user?.email || "Not logged in"}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3A1E14",
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6C7C36",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    color: "#555",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9534f",
    marginHorizontal: 20,
    marginTop: 30,
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});