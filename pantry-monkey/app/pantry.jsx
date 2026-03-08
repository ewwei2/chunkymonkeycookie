import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Swipeable } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { defaultSeasonal } from '../data/seasonalProduce';
import { colors } from '../styles/global';
import { useLocalSearchParams } from 'expo-router';

export default function CategoryItems({ route }) {

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
    

    useEffect(() => {
        setCategory(selectedCategory || '');
    }, [selectedCategory]);

    useEffect(() => {
        loadItems();
    }, [selectedCategory]);

    const loadItems = async () => {
        // TODO: aidan - fetch items from Firestore for selectedCategory
    };

    const createItem = async (newItem) => {
        // TODO: aidan - add item to Firestore
        setItems((prev) => [...prev, newItem]);
    };

    const updateItem = async (updatedItem) => {
    // TODO: aidan - update item in Firestore
        setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
    };

    const removeItem = async (id) => {
        // TODO: aidan - delete item from Firestore
        setItems((prev) => prev.filter((item) => item.id !== id));
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
        <View style={styles.container}>
      <Text style={styles.title}>{selectedCategory || "Pantry"}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for ingredients"
          placeholderTextColor="#5F5F5F"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <View style={styles.itemCard}>
            <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>
                {item.quantity} {item.unit}
                </Text>
                <Text style={styles.itemDetail}>{item.storageLocation}</Text>
                <Text style={styles.itemDetail}>Exp. {item.expirationDate}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                style={styles.editAction}
                onPress={() => openEditModal(item)}
                >
                <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => removeItem(item.id)}
                >
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 10,
    paddingLeft: 16,
    height: 40,
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#fff",
    borderRadius: 22,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 4,
  },
});