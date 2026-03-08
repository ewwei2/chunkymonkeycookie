import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { colors } from "../styles/global";
import { Ionicons } from "@expo/vector-icons";

// Seasonal produce data
const seasonalProduce = {
  Spring: {
    months: "March - May",
    description: "Short window, big flavor. These picks are at their peak right now — and gone by June.",
    items: ["Strawberries", "Asparagus", "Arugula", "Artichokes", "Fava Beans", "Radishes", "Snap Peas", "Spinach", "New Potatoes", "Spring Onion", "Cherries", "Apricots"],
  },
  Summer: {
    months: "June - August",
    description: "Peak sunshine means peak flavor. Enjoy these summer favorites while they last.",
    items: ["Tomatoes", "Corn", "Peaches", "Watermelon", "Zucchini", "Bell Peppers", "Berries", "Cucumbers", "Eggplant", "Green Beans"],
  },
  Fall: {
    months: "September - November",
    description: "Harvest season brings hearty produce perfect for cozy meals.",
    items: ["Pumpkin", "Apples", "Squash", "Sweet Potatoes", "Pears", "Cranberries", "Brussels Sprouts", "Cauliflower", "Grapes", "Pomegranate"],
  },
  Winter: {
    months: "December - February",
    description: "Cold weather, warm dishes. These winter picks are at their best.",
    items: ["Citrus", "Kale", "Beets", "Carrots", "Cabbage", "Leeks", "Parsnips", "Turnips", "Winter Squash", "Grapefruit"],
  },
};

// Recipe categories
const recipeCategories = [
  { name: "Breakfast", icon: "🍳" },
  { name: "Lunch", icon: "🥗" },
  { name: "Dinner", icon: "🍝" },
  { name: "Dessert", icon: "🍰" },
  { name: "Snack", icon: "🥨" },
  { name: "More", icon: "📖" },
];

// Sample in-season recipes
const inSeasonRecipes = [
  {
    id: 1,
    title: "Ginger Garlic & Snow Pea Stir-Fry",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    favorited: false,
  },
  {
    id: 2,
    title: "Tuscan Kale & White Bean Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    favorited: false,
  },
];

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

export default function HomeScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState({});
  
  const currentSeason = getCurrentSeason();
  const season = seasonalProduce[currentSeason];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Chef";
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {getDisplayName()}</Text>
        <Text style={styles.subtitle}>What's cooking today?</Text>
      </View>

      {/* Season Card */}
      <View style={styles.seasonCard}>
        <View style={styles.seasonIconContainer}>
          <Text style={styles.seasonIcon}>🌸</Text>
        </View>
        <Text style={styles.seasonTitle}>{currentSeason} Season</Text>
        <Text style={styles.seasonMonths}>{season.months}</Text>
        <Text style={styles.seasonDescription}>{season.description}</Text>

        {/* Seasonal Items Tags */}
        <View style={styles.tagsContainer}>
          {season.items.map((item, index) => (
            <Pressable key={index} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable style={styles.filterButton}>
          <Ionicons name="options-outline" size={18} color="#666" />
        </Pressable>
      </View>

      {/* Recipe Categories */}
      <View style={styles.categoriesGrid}>
        {recipeCategories.map((category, index) => (
          <Pressable key={index} style={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* In-Season Recipes */}
      <Text style={styles.sectionTitle}>In-Season Recipes</Text>
      <View style={styles.recipesRow}>
        {inSeasonRecipes.map((recipe) => (
          <Pressable key={recipe.id} style={styles.recipeCard}>
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
            <Pressable
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(recipe.id)}
            >
              <Ionicons
                name={favorites[recipe.id] ? "heart" : "heart-outline"}
                size={20}
                color={favorites[recipe.id] ? "#e74c3c" : "#fff"}
              />
            </Pressable>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3A1E14",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  seasonCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  seasonIconContainer: {
    marginBottom: 12,
  },
  seasonIcon: {
    fontSize: 48,
  },
  seasonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A1E14",
  },
  seasonMonths: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  seasonDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: "#F5F3EE",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0DDD8",
  },
  tagText: {
    fontSize: 13,
    color: "#555",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  filterButton: {
    padding: 6,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  categoryCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A1E14",
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  recipesRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  recipeCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 120,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    padding: 10,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    marginHorizontal: 20,
    marginTop: 30,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});