import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";

// Get all pantry items for a user
export async function getPantryItems(uid) {
  try {
    const pantryRef = collection(db, "users", uid, "pantry");
    // Remove orderBy to avoid index issues - we'll sort client-side
    const snapshot = await getDocs(pantryRef);

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${items.length} items for user ${uid}`);
    return items;
  } catch (error) {
    console.error("Error in getPantryItems:", error);
    throw error;
  }
}

// Add a new pantry item
export async function addPantryItem(uid, item) {
  try {
    const pantryRef = collection(db, "users", uid, "pantry");

    const docRef = await addDoc(pantryRef, {
      name: item.name || "",
      category: item.category || "Other",
      quantity: item.quantity || "",
      unit: item.unit || "",
      storageLocation: item.storageLocation || "",
      dateAdded: item.dateAdded || new Date().toLocaleDateString("en-US"),
      expirationDate: item.expirationDate || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("Added item with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error in addPantryItem:", error);
    throw error;
  }
}

// Update a pantry item
export async function updatePantryItem(uid, itemId, updates) {
  try {
    const itemRef = doc(db, "users", uid, "pantry", itemId);

    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log("Updated item:", itemId);
  } catch (error) {
    console.error("Error in updatePantryItem:", error);
    throw error;
  }
}

// Delete a pantry item
export async function deletePantryItem(uid, itemId) {
  try {
    const itemRef = doc(db, "users", uid, "pantry", itemId);
    await deleteDoc(itemRef);
    console.log("Deleted item:", itemId);
  } catch (error) {
    console.error("Error in deletePantryItem:", error);
    throw error;
  }
}

// Get items by category
export async function getPantryItemsByCategory(uid, category) {
  const items = await getPantryItems(uid);
  return items.filter((item) => item.category === category);
}