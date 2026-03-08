import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../firebase";
import {
  getRecipesForUser,
  getRecipesForExpiringItems,
} from "../../services/recipeService";

export default function CookbookScreen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, [filter]);

  const loadRecipes = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let results;
      if (filter === "expiring") {
        results = await getRecipesForExpiringItems(auth.currentUser.uid);
      } else {
        results = await getRecipesForUser(auth.currentUser.uid);
      }
      setRecipes(results || []);
    } catch (err) {
      console.error("Error loading recipes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = ({ item }) => {
    const usedCount = item.usedIngredientCount || 0;
    const missedCount = item.missedIngredientCount || 0;

    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() =>
          router.push({
            pathname: "/recipeDetail",
            params: { id: item.id, title: item.title },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.ingredientInfo}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>{usedCount} in pantry</Text>
            </View>
            {missedCount > 0 && (
              <View style={[styles.badge, styles.missingBadge]}>
                <Ionicons name="cart-outline" size={14} color="#FF9800" />
                <Text style={styles.badgeText}>{missedCount} needed</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (!auth.currentUser) {
    return (
      <View style={styles.centered}>
        <Ionicons name="book-outline" size={64} color="#ccc" />
        <Text style={styles.message}>Please log in to see your cookbook</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/login")}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cookbook</Text>
        <Text style={styles.headerSubtitle}>Recipes from your pantry</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <Pressable
          style={[styles.tab, filter === "all" && styles.activeTab]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.tabText, filter === "all" && styles.activeTabText]}>
            All Ingredients
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, filter === "expiring" && styles.activeTab]}
          onPress={() => setFilter("expiring")}
        >
          <Ionicons
            name="alert-circle"
            size={16}
            color={filter === "expiring" ? "#fff" : "#C4725D"}
          />
          <Text style={[styles.tabText, filter === "expiring" && styles.activeTabText]}>
            Use Soon
          </Text>
        </Pressable>
      </View>

      {/* Refresh Button */}
      <Pressable style={styles.refreshButton} onPress={loadRecipes}>
        <Ionicons name="refresh" size={18} color="#6C7C36" />
        <Text style={styles.refreshText}>Refresh Recipes</Text>
      </Pressable>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C7C36" />
          <Text style={styles.loadingText}>Finding recipes...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Error loading recipes</Text>
          <Pressable style={styles.retryButton} onPress={loadRecipes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptyMessage}>
            Add items to your pantry to get recipe suggestions!
          </Text>
          <Pressable style={styles.pantryButton} onPress={() => router.push("/(tabs)/pantry")}>
            <Text style={styles.pantryButtonText}>Go to Pantry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3A1E14",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#C4725D",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#C4725D",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C4725D",
  },
  activeTabText: {
    color: "#fff",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
    marginBottom: 8,
  },
  refreshText: {
    fontSize: 14,
    color: "#6C7C36",
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 120,
    height: 120,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A1E14",
    lineHeight: 22,
  },
  ingredientInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  missingBadge: {
    backgroundColor: "#FFF3E0",
  },
  badgeText: {
    fontSize: 12,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#888",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3A1E14",
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e74c3c",
    marginTop: 16,
  },
  message: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#6C7C36",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pantryButton: {
    backgroundColor: "#6C7C36",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  pantryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#C4725D",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});