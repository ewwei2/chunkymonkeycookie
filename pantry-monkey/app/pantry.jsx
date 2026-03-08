import { View, Text, TextInput, Pressable, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { router } from "expo-router";
import { colors } from '../styles/global';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AddItemModal from '../components/AddItemModal';


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

            <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name='arrow-back' size={28} color={colors.text} />
            </Pressable>

            <Text style={styles.title}>Pantry</Text>

            <View style={styles.headerSpace} />
        </View>

            {/* search bar + add button */}
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search for ingredients'
                    placeholderTextColor={"#5F5F5F"}
                    value={search}
                    onChangeText={setSearch}
                />
                <Pressable style={styles.addButton} onPress={() => {
                    console.log('pressed');
                    setModalVisible(true);
                }}>
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
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

            {/* shelves */}
            <View style={styles.pantryCard}>
                <ScrollView
                contentContainerStyle={styles.pantryScrollContent}
                showsVerticalScrollIndicator={false}
                >
                <View style={styles.shelfWrapper}>
                    <Image
                    source={require('../assets/pantry.png')}
                    style={styles.ShelfImage}
                    resizeMode='contain'
                    />

                {/* food overlays */}
                <Pressable
                    style={[styles.categoryIcon, styles.grains]}
                    onPress={() => openCategory('Grains')}
                >
                    <Image source={require('../assets/bread.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.dairy]}
                    onPress={() => openCategory('Eggs & Dairy')}
                >
                    <Image source={require('../assets/dairy.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.seafood]}
                    onPress={() => openCategory('Seafood')}
                >
                    <Image source={require('../assets/salmon.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.fruits]}
                    onPress={() => openCategory('Fruits')}
                >
                    <Image source={require('../assets/fruits.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.meat]}
                    onPress={() => openCategory('Meats')}
                >
                    <Image source={require('../assets/meat.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.veggies]}
                    onPress={() => openCategory('Vegetables')}
                >
                    <Image source={require('../assets/vegetables.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.sweets]}
                    onPress={() => openCategory('Snacks & Sweets')}
                >
                    <Image source={require('../assets/cheesecake.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.drinks]}
                    onPress={() => openCategory('Drinks')}
                >
                    <Image source={require('../assets/drinks.png')} style={styles.foodIcon} />
                </Pressable>

                <Pressable
                    style={[styles.categoryIcon, styles.ice]}
                    onPress={() => openCategory('Frozen')}
                >
                    <Image source={require('../assets/ice.png')} style={styles.foodIcon} />
                </Pressable>
                
                <Pressable
                    style={[styles.categoryIcon, styles.cereal]}
                    onPress={() => openCategory('Other')}
                >
                    <Image source={require('../assets/cereal.png')} style={styles.foodIcon} />
                </Pressable>

            </View>
            </ScrollView>
            </View>

            {/* add item modal */}
            <AddItemModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={(item) => console.log(item)} // hook up to Firestore later
            />
        
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
        fontSize: 36,
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

    addButtonText: {
        fontSize: 24,
        color: colors.text,
    },

    pantryCard: {
        flex: 1,
        backgroundColor: '#FFE4C1',
        borderRadius: 32,
        margin: 15,
        overflow: 'hidden',
    },

    pantryScrollContent: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    
    shelfWrapper: {
        width: "100%",
        alignItems: "center",
        position: "relative",
        marginTop: 100,
    },

    shelfSection: {
        position: 'relative',
        width: '100%',
        height: 140,
        marginBottom: 20,
    },

    ShelfImage: {
        width: "100%",
        height: 700,
    },  

    foodIcon: {
        width: 90,
        height: 80,
        resizeMode: 'contain',
    },

    categoryIcon: {
        position: 'absolute',
    },

    grains: {
        top: -66,
        left: 80,
    },

    dairy: {
        top: -76,
        right: 80,
    },
    
    seafood: {
        top: 116,
        left: 78,
    },

    fruits: {
        top: 104,
        right: 68,
    },

    meat: {
        top: 276,
        left: 78,
    },

    veggies: {
        top: 268,
        right: 64,
    },

    sweets: {
        top: 424,
        left: 78,
    },

    drinks: {
        top: 416,
        right: 68,
    },

    ice: {
        top: 594,
        left: 78,
    },

    cereal: {
        top: 588,
        right: 74,
    },
});