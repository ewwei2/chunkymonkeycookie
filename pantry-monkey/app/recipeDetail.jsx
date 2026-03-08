import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Share,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRecipeDetails } from "../services/recipeService";

export default function RecipeDetailScreen() {
  const { id, title } = useLocalSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Ingredients");
  const [servings, setServings] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const tabs = ["Ingredients", "Steps", "Nutrition"];

  useEffect(() => {
    loadRecipeDetails();
  }, [id]);

  const loadRecipeDetails = async () => {
    try {
      const details = await getRecipeDetails(id);
      setRecipe(details);
      setServings(details.servings || 2);
    } catch (error) {
      console.error("Error loading recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const adjustServings = (delta) => {
    const newServings = servings + delta;
    if (newServings >= 1 && newServings <= 12) {
      setServings(newServings);
    }
  };

  const getAdjustedAmount = (amount) => {
    if (!recipe || !amount) return amount;
    const ratio = servings / (recipe.servings || 2);
    const adjusted = amount * ratio;
    return adjusted % 1 === 0 ? adjusted : adjusted.toFixed(1);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe?.title}\n${recipe?.sourceUrl || ""}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const renderIngredients = () => (
    <View style={styles.tabContent}>
      {recipe?.extendedIngredients?.map((ingredient, index) => (
        <View key={index} style={styles.ingredientRow}>
          <View style={styles.checkbox} />
          <Text style={styles.ingredientText}>
            {getAdjustedAmount(ingredient.amount)} {ingredient.unit}{" "}
            {ingredient.name}
          </Text>
        </View>
      ))}

      {/* Monkey's Notes */}
      {recipe?.tips && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>🐵 Monkey's Notes</Text>
          <Text style={styles.notesText}>{recipe.tips}</Text>
        </View>
      )}
    </View>
  );

  const renderSteps = () => (
    <View style={styles.tabContent}>
      {recipe?.analyzedInstructions?.[0]?.steps?.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text style={styles.stepNumber}>{index + 1}. {step.step.split(' ').slice(0, 3).join(' ')}</Text>
          <Text style={styles.stepText}>{step.step}</Text>
        </View>
      )) || (
        <Text style={styles.noContent}>No instructions available</Text>
      )}
    </View>
  );

  const renderNutrition = () => {
    const nutrients = recipe?.nutrition?.nutrients || [];
    
    // Get dietary tags
    const dietaryTags = [];
    if (recipe?.vegan) dietaryTags.push("Vegan");
    if (recipe?.dairyFree) dietaryTags.push("Dairy-Free");
    if (recipe?.glutenFree) dietaryTags.push("Gluten Free");
    if (recipe?.vegetarian) dietaryTags.push("Vegetarian");
    if (recipe?.veryHealthy) dietaryTags.push("Healthy");

    // Get cuisine and dish types
    const cuisines = recipe?.cuisines || [];
    const dishTypes = recipe?.dishTypes || [];

    return (
      <View style={styles.tabContent}>
        {/* Cuisine Tags */}
        {(cuisines.length > 0 || dishTypes.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuisine</Text>
            <View style={styles.tagsRow}>
              {[...dishTypes.slice(0, 3), ...cuisines.slice(0, 2)].map((tag, index) => (
                <View key={index} style={styles.cuisineTag}>
                  <Text style={styles.cuisineTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dietary Restrictions */}
        {dietaryTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Restriction</Text>
            <View style={styles.tagsRow}>
              {dietaryTags.map((tag, index) => (
                <View key={index} style={styles.dietTag}>
                  <Text style={styles.dietTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nutrition Table */}
        <View style={styles.nutritionTable}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionHeaderText}>Nutrient</Text>
            <Text style={styles.nutritionHeaderText}>Amount</Text>
          </View>
          {[
            { name: "Calories", key: "Calories", unit: "kcal" },
            { name: "Protein", key: "Protein", unit: "g" },
            { name: "Total Fat", key: "Fat", unit: "g" },
            { name: "— Saturated Fat", key: "Saturated Fat", unit: "g" },
            { name: "Carbohydrates", key: "Carbohydrates", unit: "g" },
            { name: "— Dietary Fiber", key: "Fiber", unit: "g" },
            { name: "— Sugars", key: "Sugar", unit: "g" },
            { name: "Sodium", key: "Sodium", unit: "mg" },
            { name: "Vitamin C", key: "Vitamin C", unit: "% DV" },
            { name: "Iron", key: "Iron", unit: "% DV" },
            { name: "Calcium", key: "Calcium", unit: "% DV" },
          ].map((item, index) => {
            const nutrient = nutrients.find((n) => n.name === item.key);
            return (
              <View key={index} style={styles.nutritionRow}>
                <Text style={styles.nutrientName}>{item.name}</Text>
                <Text style={styles.nutrientValue}>
                  {nutrient ? `~${Math.round(nutrient.amount)}${item.unit === "% DV" ? "% DV" : item.unit}` : "—"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C7C36" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe?.image }}
          style={styles.headerImage}
        />
        <View style={styles.imageOverlay} />
        
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <Pressable style={styles.navButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.topNavRight}>
            <Pressable
              style={styles.navButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#e74c3c" : "#fff"}
              />
            </Pressable>
            <Pressable style={styles.navButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.navButton}>
              <Ionicons name="pencil-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Title on Image */}
        <View style={styles.titleContainer}>
          <Text style={styles.recipeTitle}>{recipe?.title || title}</Text>
          
          {/* Servings and Time */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color="#333" />
              <Pressable onPress={() => adjustServings(-1)}>
                <Text style={styles.adjustButton}>−</Text>
              </Pressable>
              <Text style={styles.metaText}>{servings}</Text>
              <Pressable onPress={() => adjustServings(1)}>
                <Text style={styles.adjustButton}>+</Text>
              </Pressable>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#333" />
              <Text style={styles.metaText}>{recipe?.readyInMinutes || 15} min</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "Ingredients" && renderIngredients()}
        {activeTab === "Steps" && renderSteps()}
        {activeTab === "Nutrition" && renderNutrition()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3EE",
  },
  imageContainer: {
    height: 280,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  topNav: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topNavRight: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F3EE",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A1E14",
    textAlign: "center",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0DDD8",
  },
  metaText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  adjustButton: {
    fontSize: 18,
    color: "#6C7C36",
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#C4725D",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#A85A45",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingTop: 20,
  },
  // Ingredients styles
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  notesCard: {
    backgroundColor: "#FFF8E7",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#D4A84B",
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B6914",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  // Steps styles
  stepContainer: {
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3A1E14",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  noContent: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
  // Nutrition styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cuisineTag: {
    backgroundColor: "#FFF8E7",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8DFC9",
  },
  cuisineTagText: {
    fontSize: 13,
    color: "#8B6914",
    textTransform: "capitalize",
  },
  dietTag: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  dietTagText: {
    fontSize: 13,
    color: "#2E7D32",
  },
  nutritionTable: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  nutritionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  nutrientName: {
    fontSize: 14,
    color: "#333",
  },
  nutrientValue: {
    fontSize: 14,
    color: "#555",
  },
});