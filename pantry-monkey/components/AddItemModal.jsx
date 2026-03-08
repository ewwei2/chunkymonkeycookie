import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/global';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { addPantryItem as addPantryItemToFirestore } from '../services/pantryService';

export default function AddItemModal({ visible, onClose, onAdd, defaultCategory = '' }) {

    const [name, setName] = useState('');
    const [category, setCategory] = useState(defaultCategory || '');
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

    useEffect(() => {
        if (visible) {
            setCategory(defaultCategory || '');
        }
    }, [defaultCategory, visible]);

    const resetForm = () => {
        setName('');
        setCategory(defaultCategory || '');
        setQuantity('');
        setUnit('');
        setStorageLocation('');
        setDateAdded(new Date().toLocaleDateString('en-US'));
        setExpirationDate('');
    };

    const estimateExpiration = (category, itemName, storageLocation) => {
        const base = new Date();
        const lowerName = itemName.toLowerCase();

        if (storageLocation === 'Freezer') {
            base.setDate(base.getDate() + 180);
            return base.toLocaleDateString('en-US');
        }

        if (category === 'Eggs & Dairy') {
            base.setDate(base.getDate() + (lowerName.includes('egg') ? 25 : 10));
            return base.toLocaleDateString('en-US');
        }

        const estimates = {
            Grains: 180,
            Seafood: 2,
            Fruits: 7,
            Drinks: 7,
            Vegetables: 7,
            'Snacks & Sweets': 90,
            Meats: 3,
            Frozen: 180,
            Other: 4,
        };

        base.setDate(base.getDate() + (estimates[category] || 4));
        return base.toLocaleDateString('en-US');
    };

    const handleAdd = async () => {

        if (!name.trim()) {
            Alert.alert('Missing item name', 'Please enter an ingredient name.');
            return;
        }

        if (!user) {
            Alert.alert('Not signed in', 'Please log in before adding pantry items.');
            return;
        }

        if (!category) {
            Alert.alert('Missing category', 'Please select a category.');
            return;
        }

        if (!storageLocation) {
            Alert.alert('Missing storage location', 'Please select a storage location.');
            return;
        }

        const trimmedName = name.trim();

        const newItem = {
            name: trimmedName,
            category,
            quantity: quantity || '',
            unit: unit || '',
            storageLocation,
            dateAdded: dateAdded || new Date().toLocaleDateString('en-US'),
            expirationDate: expirationDate || estimateExpiration(category, trimmedName, storageLocation),
            autoEstimated: !expirationDate,
        };

        try {
            await addPantryItemToFirestore(user.uid, newItem);
            onAdd?.(newItem);
            resetForm();
            onClose?.();
        } catch (error) {
            console.log('Add pantry item error:', error);
            Alert.alert('Error', error.message || 'Failed to add pantry item.');
        }
    };

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
            <View style={styles.overlay}>

                <View style={styles.modalBox}>

                    <Text style={styles.modalTitle}>Add Item</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        <Text style={styles.label}>Ingredient Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Item name'
                            placeholderTextColor='#999'
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Category</Text>

                        <RNPickerSelect
                            onValueChange={(value) => setCategory(value)}
                            value={category}
                            placeholder={{ label: 'Select a category...', value: '' }}
                            doneText='Done'
                            useNativeAndroidPickerStyle={false}
                            items={[
                                { label: 'Grains (bread, pasta, rice)', value: 'Grains' },
                                { label: 'Eggs & Dairy (eggs, milk, cheese)', value: 'Eggs & Dairy' },
                                { label: 'Seafood (fish, shrimp, salmon)', value: 'Seafood' },
                                { label: 'Fruits (apples, berries, citrus)', value: 'Fruits' },
                                { label: 'Vegetables (greens, root veg)', value: 'Vegetables' },
                                { label: 'Drinks (juice, milk, soda)', value: 'Drinks' },
                                { label: 'Meats (chicken, beef, pork)', value: 'Meats' },
                                { label: 'Snacks & Sweets (chips, candy)', value: 'Snacks & Sweets' },
                                { label: 'Frozen (frozen meals, frozen veg)', value: 'Frozen' },
                                { label: 'Other', value: 'Other' },
                            ]}
                            style={pickerStyles}
                            Icon={() => <Ionicons name='chevron-down' size={20} color='#5f5f5f' />}
                        />

                        <Text style={styles.label}>Storage Location</Text>

                        <RNPickerSelect
                            onValueChange={(value) => setStorageLocation(value)}
                            value={storageLocation}
                            placeholder={{ label: 'Select storage location...', value: '' }}
                            doneText='Done'
                            useNativeAndroidPickerStyle={false}
                            items={[
                                { label: 'Dry Pantry', value: 'Dry Pantry' },
                                { label: 'Fridge', value: 'Fridge' },
                                { label: 'Freezer', value: 'Freezer' },
                            ]}
                            style={pickerStyles}
                            Icon={() => <Ionicons name='chevron-down' size={20} color='#5f5f5f' />}
                        />

                        {storageLocation === 'Freezer' && (
                            <Text style={styles.hint}>
                                💡 If meat is in the freezer, classify as frozen
                            </Text>
                        )}

                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Quantity'
                            placeholderTextColor='#999'
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType='numeric'
                        />

                        <Text style={styles.label}>Unit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Unit (lbs, oz, dozen...)'
                            placeholderTextColor='#999'
                            value={unit}
                            onChangeText={setUnit}
                        />

                        <Text style={styles.label}>Date Added</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={new Date().toLocaleDateString('en-US')}
                            placeholderTextColor='#999'
                            value={dateAdded}
                            onChangeText={setDateAdded}
                        />

                        <Text style={styles.label}>Expiration Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Expiration date (MM/DD/YYYY)'
                            placeholderTextColor='#999'
                            value={expirationDate}
                            onChangeText={setExpirationDate}
                        />

                        <Text style={styles.hint}>💡 If left blank, we’ll estimate it!</Text>

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

const pickerStyles = {
    inputIOS: {
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        paddingRight: 36,
        marginBottom: 10,
        color: '#1f1f1f',
        backgroundColor: '#f3f3f3',
        fontFamily: fonts.regular,
    },
    inputAndroid: {
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        paddingRight: 36,
        marginBottom: 10,
        color: '#1f1f1f',
        backgroundColor: '#f3f3f3',
        fontFamily: fonts.regular,
    },
    placeholder: {
        color: '#7a7a7a',
        fontFamily: fonts.regular,
    },
    iconContainer: {
        top: 14,
        right: 12,
    },
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalBox: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
    },
    modalTitle: {
        fontSize: 28,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontFamily: fonts.regular,
        fontStyle: 'italic',
        color: '#5f5f5f',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        color: '#333',
        fontFamily: fonts.regular,
    },
    hint: {
        fontSize: 11,
        fontFamily: fonts.regular,
        color: '#aaa',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: colors.green,
        padding: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    cancelText: {
        textAlign: 'center',
        color: '#aaa',
        fontFamily: fonts.regular,
        marginTop: 4,
        marginBottom: 16,
    },
});