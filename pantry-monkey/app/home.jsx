// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { signOut } from "firebase/auth";
// import { router } from "expo-router";
// import { auth } from "../firebase";

// export default function HomeScreen() {
//   const handleLogout = async () => {
//     await signOut(auth);
//     router.replace("/login");
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>You are logged in</Text>
//       <Text style={styles.subtitle}>Firebase auth is working.</Text>

//       <Pressable style={styles.button} onPress={handleLogout}>
//         <Text style={styles.buttonText}>Log Out</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     marginBottom: 24,
//     textAlign: "center",
//   },
//   button: {
//     backgroundColor: "#d9534f",
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });


import { View, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View>
      <Text>Login Page</Text>
    </View>
  );
}