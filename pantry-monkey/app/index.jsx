import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const DEV = false; // Set to true to bypass login during development

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check in dev mode
    if (DEV) {
      router.replace("/(tabs)/home");
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);

      if (user) {
        // User is signed in, go to home
        router.replace("/(tabs)/home");
      } else {
        // No user, go to login
        router.replace("/login");
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Show loading spinner while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C7C36" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    justifyContent: "center",
    alignItems: "center",
  },
});