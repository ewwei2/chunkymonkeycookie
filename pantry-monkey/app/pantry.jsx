import { colors } from '../styles/global';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  addPantryItem as addPantryItemToFirestore,
  getPantryItems,
  updatePantryItem as updatePantryItemInFirestore,
  deletePantryItem as deletePantryItemFromFirestore,
} from '../services/pantryService';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { Swipeable } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';

export default function Pantry() {

    // store all pantry items
    const [items, setItems] = useState([]);

    // modal visibility
    const [modalVisible, setModalVisible] = useState(false);

    // form field states
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [storageLocation, setStorageLocation] = useState('');
    const [dateAdded, setDateAdded] = useState(new Date().toLocaleDateString('en-US'));
    const [expirationDate, setExpirationDate] = useState('');
    const [editingID, setEditingID] = useState(null);

    // search and filter state
    const [search, setSearch] = useState('');

    const user = auth.currentUser;

    const loadItems = async () => {
    if (!user) return;

    try {
        const pantryItems = await getPantryItems(user.uid);
        setItems(pantryItems);
    } catch (error) {
        Alert.alert("Error", error.message);
    }
    };

    useEffect(() => {
    loadItems();
    }, []);

    // auto estimate expiration date based on category
    const estimateExpiration = (category, itemName) => {
        const base = new Date();

        // check for eggs vs dairy
        if (category === 'Eggs & Dairy') {
            const name = itemName.toLowerCase();
            if (name.includes('egg')) {
                base.setDate(base.getDate() + 25);
            } else {
                base.setDate(base.getDate() + 10);
            }
            return base.toLocaleDateString('en-US');
        }

        const estimates = {
            'Grains': 180,
            'Seafood': 2,
            'Fruits': 7,
            'Drinks': 7,
            'Vegetables': 7,
            'Snacks & Sweets': 90,
            'Meats': 3,
            'Frozen': 180,
        };

        base.setDate(base.getDate() + (estimates[category] || 4));
        return base.toLocaleDateString('en-US');
    };

    // returns true if item is currently in season
    const isInSeason = (itemName) => {
        const month = new Date().getMonth() + 1;
        const seasonal = defaultSeasonal[month] || [];
        return seasonal.some(s => itemName.toLowerCase().includes(s));
    };

    // returns freshness dot color based on days until expiration
    const getFreshnessColor = (expirationDate) => {
        if (!expirationDate) return '#A0A0A0';
        const diffDays = Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) return '#5FB058';
        if (diffDays > 4) return '#EAAF48';
        if (diffDays > 1) return '#D85D3A';
        return '#464A57';
    };

    // returns true if item is expired
    const isExpired = (expirationDate) => {
        if (!expirationDate) return false;
        return new Date(expirationDate) < new Date();
    };

    // returns true if item expires within 3 days
    const isExpiringSoon = (expirationDate) => {
        if (!expirationDate) return false;
        const diffDays = Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    };

    // create new item or update existing
    const addItem = async () => {
        if (!name || !user) return;

        const itemData = {
            name,
            category,
            quantity,
            unit,
            storageLocation,
            dateAdded: editingID ? dateAdded : new Date().toLocaleDateString('en-US'),
            expirationDate: expirationDate || estimateExpiration(category, name),
            autoEstimated: !expirationDate,
        };

        try {
            if (editingID) {
            await updatePantryItemInFirestore(user.uid, editingID, itemData);
            setEditingID(null);
            } else {
            await addPantryItemToFirestore(user.uid, itemData);
            }

            setName('');
            setCategory('');
            setQuantity('');
            setUnit('');
            setStorageLocation('');
            setExpirationDate('');
            setDateAdded(new Date().toLocaleDateString('en-US'));
            setModalVisible(false);

            await loadItems();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    // open edit modal pre-filled with item data
    const openEditModal = (item) => {
        setName(item.name);
        setCategory(item.category);
        setQuantity(item.quantity);
        setUnit(item.unit);
        setStorageLocation(item.storageLocation);
        setDateAdded(item.dateAdded);
        setExpirationDate(item.expirationDate);
        setEditingID(item.id);
        setModalVisible(true);
    };

    // sort items: in season → expiring soon → fresh → expired, newest first within each group
    const sortItems = [...items].sort((a, b) => {
        const priority = (item) => {
            if (isInSeason(item.name)) return 1;
            if (isExpiringSoon(item.expirationDate)) return 2;
            if (isExpired(item.expirationDate)) return 4;
            return 3;
        };

        if (priority(a) !== priority(b)) return priority(a) - priority(b);
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    // filter items by search query
    const filteredItems = sortItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    // swipe left → edit and delete buttons
    const renderRightActions = (item) => (
        <View style={styles.swipeActions}>
            <TouchableOpacity style={styles.editAction} onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAction} onPress={() => deleteItem(item.id)}>
                <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    // renders each pantry item card
    const renderItem = ({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
            <TouchableOpacity
                onPress={() => {
                    if (isExpired(item.expirationDate)) {
                        Alert.alert(
                            'Item Expired!',
                            'This item is expired. Remove it?',
                            [
                                { text: 'Remove', onPress: () => deleteItem(item.id), style: 'destructive' },
                                { text: 'Keep', style: 'cancel' },
                            ]
                        );
                    }
                }}
            >
                <View style={[styles.itemCard, isExpired(item.expirationDate) && styles.expiredCard]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        {/* freshness dot */}
                        <View style={[styles.freshnessDot, { backgroundColor: getFreshnessColor(item.expirationDate) }]} />

                        {/* item name + expiration */}
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.itemName, isExpired(item.expirationDate) && styles.expiredText]}>
                                {item.name}
                            </Text>
                            <Text style={styles.itemDetail}>
                                Exp. {item.expirationDate} {item.autoEstimated ? '(est.)' : ''}
                            </Text>
                        </View>

                        {/* quantity + storage + seasonal flower */}
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.itemQuantity}>{item.quantity} {item.unit}</Text>
                            <Text style={styles.itemDetail}>{item.storageLocation}</Text>
                            {isInSeason(item.name) && <Text>🌸</Text>}
                        </View>

                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>

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

            {/* pantry list */}
            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No items yet — tap + to add something!</Text>
                }
            />

            {/* add/edit modal */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{editingID ? 'Edit Item' : 'Add Item'}</Text>

                        <TextInput style={styles.input} placeholder="Item name" value={name} onChangeText={setName} />

                        <Text style={styles.label}>Category</Text>
                        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
                            <Picker.Item label="Select a category..." value="" />
                            <Picker.Item label="Grains (bread, pasta, rice)" value="Grains" />
                            <Picker.Item label="Eggs & Dairy (eggs, milk, cheese)" value="Eggs & Dairy" />
                            <Picker.Item label="Seafood (fish, shrimp, salmon)" value="Seafood" />
                            <Picker.Item label="Fruits (apples, berries, citrus)" value="Fruits" />
                            <Picker.Item label="Vegetables (greens, root veg)" value="Vegetables" />
                            <Picker.Item label="Drinks (juice, milk, soda)" value="Drinks" />
                            <Picker.Item label="Meats (chicken, beef, pork)" value="Meats" />
                            <Picker.Item label="Snacks & Sweets (chips, candy)" value="Snacks & Sweets" />
                            <Picker.Item label="Frozen (frozen meals, frozen veg)" value="Frozen" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>

                        <Text style={styles.label}>Storage Location</Text>
                        <Picker selectedValue={storageLocation} onValueChange={setStorageLocation} style={styles.picker}>
                            <Picker.Item label="Select storage location..." value="" />
                            <Picker.Item label="Dry Pantry" value="Dry Pantry" />
                            <Picker.Item label="Fridge" value="Fridge" />
                            <Picker.Item label="Freezer" value="Freezer" />
                        </Picker>

                        {storageLocation === 'Freezer' && (
                            <Text style={styles.hint}>💡 Storing meat? Select Frozen as your category!</Text>
                        )}

                        <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Unit (lbs, oz, dozen...)" value={unit} onChangeText={setUnit} />
                        <TextInput style={styles.input} placeholder="Date added (MM/DD/YYYY)" value={dateAdded} onChangeText={setDateAdded} />
                        <TextInput style={styles.input} placeholder="Expiration date (MM/DD/YYYY) — optional" value={expirationDate} onChangeText={setExpirationDate} />
                        <Text style={styles.hint}>💡 Leave blank and we'll estimate it!</Text>

                        <TouchableOpacity style={styles.submitButton} onPress={addItem}>
                            <Text style={styles.submitButtonText}>{editingID ? 'Save Changes' : 'Add to Pantry'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setModalVisible(false); setEditingID(null); }}>
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
    expiredCard: { opacity: 0.4 },
    freshnessDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    expiredText: { color: '#aaa' },
    itemDetail: { fontSize: 12, color: '#888' },
    itemQuantity: { fontSize: 14, fontWeight: '600' },
    swipeActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 },
    editAction: { backgroundColor: '#888', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    deleteAction: { backgroundColor: '#888', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '90%', maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 4 },
    hint: { fontSize: 11, color: '#aaa', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
    picker: { marginBottom: 10 },
    submitButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    submitButtonText: { color: '#fff', fontWeight: 'bold' },
    cancelText: { textAlign: 'center', color: '#aaa', marginTop: 4 },
});