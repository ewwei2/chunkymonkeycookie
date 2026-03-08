import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function addPantryItem(uid, item) {
  const pantryRef = collection(db, "users", uid, "pantryItems");

  const docRef = await addDoc(pantryRef, {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getPantryItems(uid) {
  const pantryRef = collection(db, "users", uid, "pantryItems");
  const snapshot = await getDocs(pantryRef);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function updatePantryItem(uid, itemId, updates) {
  const itemRef = doc(db, "users", uid, "pantryItems", itemId);

  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePantryItem(uid, itemId) {
  const itemRef = doc(db, "users", uid, "pantryItems", itemId);
  await deleteDoc(itemRef);
}