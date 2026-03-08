import { getPantryItems } from "./pantryService";

const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

// Get recipes based on pantry ingredients
export async function getRecipesByIngredients(ingredients, number = 10) {
  const ingredientList = ingredients.join(",");
  
  const response = await fetch(
    `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientList)}&number=${number}&ranking=2&ignorePantry=false&apiKey=${SPOONACULAR_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  
  return response.json();
}

// Get detailed recipe information
export async function getRecipeDetails(recipeId) {
  const response = await fetch(
    `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch recipe details");
  }
  
  return response.json();
}

// Get recipes for a user based on their pantry
export async function getRecipesForUser(uid) {
  const pantryItems = await getPantryItems(uid);
  
  if (pantryItems.length === 0) {
    return [];
  }
  
  // Extract ingredient names from pantry
  const ingredients = pantryItems.map((item) => item.name);
  
  return getRecipesByIngredients(ingredients);
}

// Get recipes prioritizing items expiring soon
export async function getRecipesForExpiringItems(uid) {
  const pantryItems = await getPantryItems(uid);
  
  if (pantryItems.length === 0) {
    return [];
  }
  
  // Sort by expiration date (soonest first)
  const sorted = pantryItems
    .filter((item) => item.expirationDate)
    .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  
  // Prioritize items expiring within 7 days
  const expiringSoon = sorted
    .filter((item) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    })
    .map((item) => item.name);
  
  if (expiringSoon.length === 0) {
    // Fall back to all ingredients
    return getRecipesByIngredients(pantryItems.map((item) => item.name));
  }
  
  return getRecipesByIngredients(expiringSoon);
}