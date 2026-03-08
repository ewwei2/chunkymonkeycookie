import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Swipeable } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { defaultSeasonal } from '../data/seasonalProduce';
import { colors } from '../styles/global';
import { useLocalSearchParams } from 'expo-router';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addPantryItem as addPantryItemToFirestore,
  getPantryItems,
  updatePantryItem as updatePantryItemInFirestore,
  deletePantryItem as deletePantryItemFromFirestore,
} from '../services/pantryService';
import AddItemModal from '../components/AddItemModal';
import { router } from 'expo-router';
// ...existing code...

export default function CategoryItems() {

    const [user, setUser] = useState(auth.currentUser);

    const { category: selectedCategory } = useLocalSearchParams();

    // data state
    const [items, setItems] = useState([]);

    // ui state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingID, setEditingID] = useState(null);
    const [search, setSearch] = useState('');

    // form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState(selectedCategory || '');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [storageLocation, setStorageLocation] = useState('');
    const [dateAdded, setDateAdded] = useState(new Date().toLocaleDateString('en-US'));
    const [expirationDate, setExpirationDate] = useState('');

    // modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    
    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("Auth state changed:", currentUser?.uid || "No user");
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        setCategory(selectedCategory || '');
    }, [selectedCategory]);

     useEffect(() => {
        if (user) {
            loadItems();
        }
    }, [selectedCategory, user]);

    const loadItems = async () => {
        if (!user) {
            console.log("No user, skipping load");
            return;
        }

        try {
            console.log("Loading items for user:", user.uid);
            const pantryItems = await getPantryItems(user.uid);
            console.log("Fetched items:", pantryItems);

            const categoryItems = pantryItems.filter(
                (item) => !selectedCategory || item.category === selectedCategory
            );

            setItems(categoryItems);
        } catch (error) {
            console.error("Load error:", error);
            Alert.alert("Error", error.message);
        }
    };

    const createItem = async (newItem) => {
        if (!user) {
            console.log("No user, cannot create item");
            return;
        }

        try {
            console.log("Creating item for user:", user.uid, newItem);
            const id = await addPantryItemToFirestore(user.uid, newItem);
            console.log("USER UID:", user?.uid);
            console.log("Saved item to Firestore");
            await loadItems();
        } catch (error) {
            console.error("Create error:", error);
            Alert.alert("Error", error.message);
        }
    };

    const updateItem = async (updatedItem) => {
    if (!user) return;

    try {
        const { id, ...updates } = updatedItem;
        await updatePantryItemInFirestore(user.uid, id, updates);
        await loadItems();
    } catch (error) {
        Alert.alert("Error", error.message);
    }
    };

    const removeItem = async (id) => {
    if (!user) return;

    try {
        await deletePantryItemFromFirestore(user.uid, id);
        await loadItems();
    } catch (error) {
        Alert.alert("Error", error.message);
    }
    };

    const resetForm = () => {
        setName('');
        setCategory(selectedCategory || '');
        setQuantity('');
        setUnit('');
        setStorageLocation('');
        setDateAdded(new Date().toLocaleDateString('en-US'));
        setExpirationDate('');
        setEditingID(null);
    };

    const openAddModal = () => {
        setAddModalVisible(true);
    };

    const openEditModal = (item) => {
        setName(item.name || '');
        setCategory(item.category || selectedCategory || '');
        setQuantity(item.quantity || '');
        setUnit(item.unit || '');
        setStorageLocation(item.storageLocation || '');
        setDateAdded(item.dateAdded || '');
        setExpirationDate(item.expirationDate || '');
        setEditingID(item.id);
        setModalVisible(true);
    };

    const saveItem = async () => {
    if (!name.trim()) {
        Alert.alert('Missing info', 'Please enter an item name.');
        return;
    }

    const itemPayload = {
        name,
        category,
        quantity,
        unit,
        storageLocation,
        dateAdded,
        expirationDate,
    };

    if (editingID) {
        await updateItem({ id: editingID, ...itemPayload });
    } else {
        await createItem(itemPayload);
    }

    setModalVisible(false);
    resetForm();
    };  

    const filteredItems = items.filter(
    (item) =>
      (!selectedCategory || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name='arrow-back' size={28} color={colors.text} />
            </Pressable>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.4}>{selectedCategory || 'Pantry'}</Text>
            <View style={styles.headerSpace} />
        </View>

        <View style={styles.searchRow}>
            <TextInput
                style={styles.searchInput}
                placeholder="Add, search for ingredients"
                placeholderTextColor="#5F5F5F"
                value={search}
                onChangeText={setSearch}
            />
            <Pressable style={styles.addButton} onPress={openAddModal}>
                <Text style={styles.addButtonText}>+</Text>
            </Pressable>
        </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.itemCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>
                    {item.quantity} {item.unit}
                </Text>
                <Text style={styles.itemDetail}>{item.storageLocation}</Text>
                <Text style={styles.itemDetail}>Exp. {item.expirationDate}</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.editAction} onPress={() => openEditModal(item)}>
                    <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteAction} onPress={() => removeItem(item.id)}>
                    <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
                </View>
            </View>
            </View>
        )}
        ListEmptyComponent={
            <Text style={styles.emptyText}>No items yet — tap + to add something!</Text>
        }
    />

        <AddItemModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAdd={() => loadItems()}
          defaultCategory={selectedCategory}
        />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingID ? "Edit Item" : "Add Item"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Item name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Category</Text>
            <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
              <Picker.Item label="Select a category..." value="" />
              <Picker.Item label="Grains" value="Grains" />
              <Picker.Item label="Eggs & Dairy" value="Eggs & Dairy" />
              <Picker.Item label="Seafood" value="Seafood" />
              <Picker.Item label="Fruits" value="Fruits" />
              <Picker.Item label="Vegetables" value="Vegetables" />
              <Picker.Item label="Drinks" value="Drinks" />
              <Picker.Item label="Meats" value="Meats" />
              <Picker.Item label="Snacks & Sweets" value="Snacks & Sweets" />
              <Picker.Item label="Frozen" value="Frozen" />
              <Picker.Item label="Other" value="Other" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
            />

            <TextInput
              style={styles.input}
              placeholder="Unit (lbs, oz, dozen...)"
              value={unit}
              onChangeText={setUnit}
            />

            <TextInput
              style={styles.input}
              placeholder="Storage Location"
              value={storageLocation}
              onChangeText={setStorageLocation}
            />

            <TextInput
              style={styles.input}
              placeholder="Date added (MM/DD/YYYY)"
              value={dateAdded}
              onChangeText={setDateAdded}
            />

            <TextInput
              style={styles.input}
              placeholder="Expiration date (MM/DD/YYYY)"
              value={expirationDate}
              onChangeText={setExpirationDate}
            />

            <TouchableOpacity style={styles.submitButton} onPress={saveItem}>
              <Text style={styles.submitButtonText}>
                {editingID ? "Save Changes" : "Add to Pantry"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
    },

    header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 20,
    },
    
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 26,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        marginRight: 42,
    },
    headerSpace: {
        width: 52,
    },
    title: {
        flex: 1,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.text,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 15,
        width: 324,
        height: 40,
        alignSelf: 'center',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 10,
        paddingLeft: 16,
        height: 40,
        fontSize: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    addButton: {
        backgroundColor: '#fff',
        borderRadius: 22,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },

    addButtonText: {
        fontSize: 24,
        color: colors.text,
    },
    
    emptyText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    
    itemCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
    },

    itemDetail: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },

    editAction: {
        backgroundColor: "#888",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },

    deleteAction: {
        backgroundColor: "#888",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
});
