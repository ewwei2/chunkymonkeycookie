import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

// Seasonal produce data
const seasonalProduce = {
  Spring: {
    months: "March - May",
    description: "Short window, big flavor. These picks are at their peak right now — and gone by June.",
    items: ["Strawberries", "Asparagus", "Arugula", "Artichokes", "Fava Beans", "Radishes", "Snap Peas", "Spinach", "New Potatoes", "Spring Onion", "Cherries", "Apricots"],
    searchTerms: "asparagus,strawberry,spinach",
  },
  Summer: {
    months: "June - August", 
    description: "Peak sunshine means peak flavor.",
    items: ["Tomatoes", "Corn", "Peaches", "Watermelon", "Zucchini", "Bell Peppers", "Berries", "Cucumbers"],
    searchTerms: "tomato,corn,zucchini",
  },
  Fall: {
    months: "September - November",
    description: "Harvest season brings hearty produce.",
    items: ["Pumpkin", "Apples", "Squash", "Sweet Potatoes", "Pears", "Cranberries", "Brussels Sprouts"],
    searchTerms: "pumpkin,apple,squash",
  },
  Winter: {
    months: "December - February",
    description: "Cold weather, warm dishes.",
    items: ["Citrus", "Kale", "Beets", "Carrots", "Cabbage", "Leeks", "Parsnips"],
    searchTerms: "kale,beet,carrot",
  },
};

// Recipe categories
const recipeCategories = [
  { name: "Breakfast", icon: "🍳" },
  { name: "Lunch", icon: "🍔" },
  { name: "Dinner", icon: "🍽️" },
  { name: "Dessert", icon: "🍰" },
  { name: "Snack", icon: "🍌" },
  { name: "Appetizer", icon: "🥗" },
];

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

const getSeasonIcon = (season) => {
  switch (season) {
    case "Spring": return "🌸";
    case "Summer": return "☀️";
    case "Fall": return "🍂";
    case "Winter": return "❄️";
    default: return "🌸";
  }
};

export default function HomeScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState({});
  const [inSeasonRecipes, setInSeasonRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  
  const currentSeason = getCurrentSeason();
  const season = seasonalProduce[currentSeason];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchInSeasonRecipes();
  }, []);

  const fetchInSeasonRecipes = async () => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${season.searchTerms}&number=4&ranking=2&apiKey=${SPOONACULAR_API_KEY}`
      );
      const data = await response.json();
      setInSeasonRecipes(data);
    } catch (error) {
      console.error("Error fetching in-season recipes:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Chef";
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategoryPress = (categoryName) => {
    router.push({
      pathname: "/recipeCategory",
      params: { category: categoryName },
    });
  };

  const handleRecipePress = (recipe) => {
    router.push({
      pathname: "/recipeDetail",
      params: { id: recipe.id, title: recipe.title },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {getDisplayName()}!</Text>
        <Text style={styles.subtitle}>What's cooking today?</Text>
      </View>

      {/* Season Card */}
      <View style={styles.seasonCard}>
        <Text style={styles.seasonIcon}>{getSeasonIcon(currentSeason)}</Text>
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

      {/* Recipe Categories Grid */}
      <View style={styles.categoriesGrid}>
        {recipeCategories.map((category, index) => (
          <Pressable 
            key={index} 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category.name)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* In-Season Recipes */}
      <Text style={styles.sectionTitle}>In-Season Recipes</Text>
      
      {loadingRecipes ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C7C36" />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recipesScroll}
        >
          {inSeasonRecipes.map((recipe) => (
            <Pressable 
              key={recipe.id} 
              style={styles.recipeCard}
              onPress={() => handleRecipePress(recipe)}
            >
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <Pressable
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(recipe.id)}
              >
                <Ionicons
                  name={favorites[recipe.id] ? "heart" : "heart-outline"}
                  size={18}
                  color={favorites[recipe.id] ? "#e74c3c" : "#fff"}
                />
              </Pressable>
              <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ height: 100 }} />
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
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
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
  seasonIcon: {
    fontSize: 48,
    marginBottom: 12,
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
    width: "31%",
    backgroundColor: "#C4725D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A1E14",
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  recipesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recipeCard: {
    width: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
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
    borderRadius: 16,
    padding: 6,
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    padding: 10,
    lineHeight: 18,
  },
});