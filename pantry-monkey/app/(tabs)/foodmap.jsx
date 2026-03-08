import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FoodMapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Map</Text>
        <Text style={styles.subtitle}>Find grocery stores nearby</Text>
      </View>

      <View style={styles.placeholder}>
        <Ionicons name="map" size={80} color="#ccc" />
        <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
        <Text style={styles.comingSoonText}>
          We're working on integrating a map to help you find local grocery stores, 
          farmers markets, and food banks in your area.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="storefront-outline" size={24} color="#6C7C36" />
            <Text style={styles.featureText}>Grocery Stores</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="leaf-outline" size={24} color="#6C7C36" />
            <Text style={styles.featureText}>Farmers Markets</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart-outline" size={24} color="#6C7C36" />
            <Text style={styles.featureText}>Food Banks</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="pricetag-outline" size={24} color="#6C7C36" />
            <Text style={styles.featureText}>Deals & Sales</Text>
          </View>
        </View>
      </View>
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
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A1E14",
    marginTop: 20,
  },
  comingSoonText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30,
    gap: 16,
  },
  featureItem: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureText: {
    fontSize: 13,
    color: "#555",
    marginTop: 8,
    fontWeight: "500",
  },
});
