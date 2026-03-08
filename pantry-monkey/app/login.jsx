import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Something went wrong.";
    }
  };

  const createUserDocument = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Only create if it doesn't exist
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: "",
        photoURL: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const handleContinue = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      let userCredential;
      try {
        // Try to sign in first
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError) {
        // If sign in fails, create a new account
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      // Create/verify user document exists
      await createUserDocument(userCredential.user);

      router.replace("/pantry");
    } catch (error) {
      setErrorMessage(getFriendlyError(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Log in or create an account to save your pantry
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8C8C8C"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErrorMessage("");
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8C8C8C"
          secureTextEntry
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrorMessage("");
          }}
        />

        {errorMessage ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Continue"}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    justifyContent: "space-between",
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    textAlign: "center",
    color: "#3A1E14",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#9A9A9A",
    marginBottom: 60,
    lineHeight: 24,
  },
  input: {
    backgroundColor: "#EDEFF2",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
  },
  error: {
    color: "#B00020",
    marginTop: 6,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6C7C36",
    paddingVertical: 22,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 26,
    fontWeight: "600",
  },
});