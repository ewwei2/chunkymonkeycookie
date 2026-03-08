import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet, ActivityIndicator, Modal } from "react-native";
// Remove: import { BlurView } from "expo-blur";
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

// Recipe categories with images
const recipeCategories = [
  { name: "Breakfast", icon: null, image: require("../../assets/breakfast-pan.png"), type: "breakfast" },
  { name: "Lunch", icon: null, image: require("../../assets/burger.png"), type: "lunch" },
  { name: "Dinner", icon: null, image: require("../../assets/pasta.png"), type: "dinner" },
  { name: "Dessert", icon: null, image: require("../../assets/smiley-cheesecake.png"), type: "dessert" },
  { name: "Snack", icon: null, image: require("../../assets/banana.png"), type: "snack" },
  { name: "More", icon: null, image: require("../../assets/smiley-drink.png"), type: "beverage" },
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
  const [inSeasonRecipes, setInSeasonRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [missionVisible, setMissionVisible] = useState(false);
  
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
      
      // Make sure data is an array before setting
      if (Array.isArray(data)) {
        setInSeasonRecipes(data);
      } else {
        console.log("API response:", data);
        setInSeasonRecipes([]);
      }
    } catch (error) {
      console.error("Error fetching in-season recipes:", error);
      setInSeasonRecipes([]);
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

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/recipeCategory",
      params: { 
        category: category.name,
        type: category.type 
      },
    });
  };

  const handleRecipePress = (recipe) => {
    router.push({
      pathname: "/recipeDetail",
      params: { id: recipe.id, title: recipe.title },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Greeting only */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {getDisplayName()}!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }}>
        {/* Season Card with overlapping Bookmark */}
        <View style={styles.seasonCardWrapper}>
          {/* Bookmark - positioned to overlap from top */}
          <Pressable style={styles.bookmarkButton} onPress={() => setMissionVisible(true)}>
            <Image 
              source={require("../../assets/bookmark.png")} 
              style={styles.bookmarkIcon}
            />
          </Pressable>
          
          {/* Season Card */}
          <View style={styles.seasonCard}>
            <Text style={styles.seasonTitle}>{currentSeason} Season</Text>
            <Text style={styles.seasonMonths}>{season.months}</Text>
            <Text style={styles.seasonDescription}>{season.description}</Text>
          </View>
        </View>

        {/* Season Tags */}
        <View style={styles.seasonTagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {season.items.map((item, index) => (
              <Pressable key={index} style={styles.seasonTag}>
                <Text style={styles.seasonTagText}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
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
              onPress={() => handleCategoryPress(category)}
            >
              {category.image ? (
                <Image source={category.image} style={styles.categoryImage} />
              ) : (
                <Text style={styles.categoryCardIcon}>{category.icon}</Text>
              )}
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
        ) : inSeasonRecipes && inSeasonRecipes.length > 0 ? (
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
        ) : (
          <View style={styles.emptyRecipes}>
            <Text style={styles.emptyText}>No seasonal recipes available</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Mission Statement Modal with Blur */}
      <Modal
        visible={missionVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMissionVisible(false)}
      >
        <View style={styles.blurContainer}>
          <Pressable style={styles.modalOverlay} onPress={() => setMissionVisible(false)}>
            <Pressable style={styles.missionCard} onPress={(e) => e.stopPropagation()}>
              {/* Close button */}
              <Pressable style={styles.closeButton} onPress={() => setMissionVisible(false)}>
                <Ionicons name="close" size={24} color="#3A1E14" />
              </Pressable>

              <Text style={styles.missionTitle}>Our Mission Statement</Text>
              <Text style={styles.missionSubtitle}>In season, in sync</Text>
              
              <Text style={styles.missionText}>
                PantryMonkey was built for USF students, by USF students. This project a living pantry that celebrates what California grows, reminds you what needs to be eaten before it expires, and proves that the most sustainable meal is the one made from what you already have.
              </Text>
              
              <Image 
                source={require("../../assets/flower.png")} 
                style={styles.missionImage}
              />
            </Pressable>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A1E14",
  },
  // Season Card Wrapper - needs to allow overflow
  seasonCardWrapper: {
    marginHorizontal: 20,
    marginTop: 40,
    position: "relative",
  },
  // Season Card
  seasonCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingRight: 60,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  // Bookmark - positioned absolutely on right, overlapping card
  bookmarkButton: {
    position: "absolute",
    top: -139,
    right: 16,
    zIndex: 100,
    elevation: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  bookmarkIcon: {
    width: 70,
    height: 150,
    resizeMode: "contain",
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
    paddingHorizontal: 20,
  },
  // Season Tags
  seasonTagsContainer: {
    marginTop: 16,
    paddingLeft: 20,
  },
  seasonTag: {
    backgroundColor: "#E8E6E1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  seasonTagText: {
    fontSize: 13,
    color: "#555",
  },
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
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
  // Categories
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
  categoryCardIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  categoryImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A1E14",
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  // Recipes
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  recipesScroll: {
    paddingHorizontal: 20,
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
  emptyRecipes: {
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  // Mission Modal
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 100,
  },
  missionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A1E14",
    marginBottom: 4,
  },
  missionSubtitle: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 16,
  },
  missionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  missionImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 20,
  },
});