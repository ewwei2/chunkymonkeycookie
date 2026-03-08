import { useEffect } from "react";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/login");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C7C36" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3EE",
  },
});