import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../styles/global';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addPantryItem as addPantryItemToFirestore } from '../services/pantryService';


export default function AddItemModal({ visible, onClose, onAdd, defaultCategory = '' }) {

    const [name, setName] = useState('');
    const [category, setCategory] = useState(defaultCategory);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [storageLocation, setStorageLocation] = useState('');
    const [dateAdded, setDateAdded] = useState(new Date().toLocaleDateString('en-US'));
    const [expirationDate, setExpirationDate] = useState('');

    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    // auto-fill category when opened from a category screen
    useEffect(() => {
        setCategory(defaultCategory);
    }, [defaultCategory, visible]);

    const estimateExpiration = (category, itemName) => {
        const base = new Date();
        if (category === 'Eggs & Dairy') {
            base.setDate(base.getDate() + (itemName.toLowerCase().includes('egg') ? 25 : 10));
            return base.toLocaleDateString('en-US');
        }
        const estimates = {
            'Grains': 180, 'Seafood': 2, 'Fruits': 7, 'Drinks': 7,
            'Vegetables': 7, 'Snacks & Sweets': 90, 'Meats': 3, 'Frozen': 180,
        };
        base.setDate(base.getDate() + (estimates[category] || 4));
        return base.toLocaleDateString('en-US');
    };

    const handleAdd = async () => {
        if (!name.trim()) return;
        if (!user) return;

        const newItem = {
            name, category, quantity, unit, storageLocation,
            dateAdded: new Date().toLocaleDateString('en-US'),
            expirationDate: expirationDate || estimateExpiration(category, name),
            autoEstimated: !expirationDate,
        };

        try {
            await addPantryItemToFirestore(user.uid, newItem);
            onAdd?.(newItem);
            setName('');
            setCategory(defaultCategory);
            setQuantity('');
            setUnit('');
            setStorageLocation('');
            setExpirationDate('');
            onClose();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Add Item</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Ingredient Name</Text>
                        <TextInput style={styles.input} placeholder="Item name" value={name} onChangeText={setName} />

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

                        <Text style={styles.label}>Storage Location</Text>
                        <Picker selectedValue={storageLocation} onValueChange={setStorageLocation} style={styles.picker}>
                            <Picker.Item label="Select storage location..." value="" />
                            <Picker.Item label="Dry Pantry" value="Dry Pantry" />
                            <Picker.Item label="Fridge" value="Fridge" />
                            <Picker.Item label="Freezer" value="Freezer" />
                        </Picker>
                        {storageLocation === 'Freezer' && (
                            <Text style={styles.hint}>💡 If meat is in the freezer, to classify as frozen</Text>
                        )}

                        <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                        <TextInput style={styles.input} placeholder="Unit (lbs, oz, dozen...)" value={unit} onChangeText={setUnit} />
                        <TextInput style={styles.input} placeholder={new Date().toLocaleDateString('en-US')} value={dateAdded} onChangeText={setDateAdded} />
                        <TextInput style={styles.input} placeholder="Expiration date (MM/DD/YYYY)" value={expirationDate} onChangeText={setExpirationDate} />
                        <Text style={styles.hint}>💡 If left blank and we'll estimate it!</Text>

                        <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                            <Text style={styles.submitButtonText}>Add to Pantry</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '90%', maxHeight: '80%' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    label: { fontSize: 13, fontStyle: 'italic', color: '#555', marginBottom: 4 },
    hint: { fontSize: 11, color: '#aaa', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
    picker: { marginBottom: 10 },
    submitButton: { backgroundColor: '#5C6B3A', padding: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10, marginTop: 8 },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    cancelText: { textAlign: 'center', color: '#aaa', marginTop: 4 },
});