import { View, Text, TextInput, Pressable, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from "expo-router";
import { colors } from '../styles/global';
import { useState } from 'react';

    // pantry categories
    const categories = [
        "Grains",
        "Eggs & Dairy",
        "Seafood",
        "Fruits",
        "Vegetables",
        "Drinks",
        "Meats",
        "Snacks & Sweets",
        "Frozen",
        "Other",
    ];

export default function Pantry(){

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
        if (!user) return;

        try {
            const pantryItems = await getPantryItems(user.uid);
            const filtered = pantryItems.filter(
                (item) => !selectedCategory || item.category === selectedCategory
            );
            setItems(filtered);
        } catch (error) {
            console.error("Load error:", error);
            Alert.alert("Error", error.message);
        }
    };

    const createItem = async (newItem) => {
        if (!user) return;

        try {
            await addPantryItemToFirestore(user.uid, newItem);
            await loadItems();
        } catch (error) {
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
    resetForm();
    setModalVisible(true);
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
      id: editingID || Date.now().toString(),
      name,
      category,
      quantity,
      unit,
      storageLocation,
      dateAdded,
      expirationDate,
    };

    if (editingID) {
      await updateItem(itemPayload);
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
        <View style={ styles.container }>

            <Text style={styles.title}>Pantry</Text>

            {/* search bar + add button */}
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for ingredients"
                    placeholderTextColor={"#5F5F5F"}
                    value={search}
                    onChangeText={setSearch}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        )}
  ListEmptyComponent={
    <Text style={styles.emptyText}>No items yet — tap + to add something!</Text>
  }
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

        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        marginTop: 16,
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
        // iOS
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        // android
        elevation: 4,
    },
    addButton: {
        backgroundColor: '#fff',
        borderRadius: 22,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        // iOS
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        // android
        elevation: 4,
    },
    addButtonText: { fontSize: 24, color: '#333' },
    itemCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    expiredCard: {
        opacity: 0.4 
    },
    freshnessDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12
    },
});