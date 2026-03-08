import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import PantryItem from '../components/PantryItem';
import AddItemModal from '../components/AddItemModal';

export default function CategoryItems() {
    const { category } = useLocalSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadItems();
    }, [category]);

    const loadItems = async () => {
        if (!auth.currentUser) return;
        
        try {
            const pantryRef = collection(db, "users", auth.currentUser.uid, "pantry");
            const q = query(pantryRef, where("category", "==", category));
            const snapshot = await getDocs(q);
            
            const itemsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setItems(itemsList);
        } catch (error) {
            console.error("Error loading items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to remove this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "users", auth.currentUser.uid, "pantry", itemId));
                            loadItems();
                        } catch (error) {
                            console.error("Error deleting item:", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#3A1E14" />
                </Pressable>
                <Text style={styles.title}>{category}</Text>
                <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#3A1E14" />
                </Pressable>
            </View>

            {/* Items List */}
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="basket-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No items yet</Text>
                        <Text style={styles.emptySubtitle}>Tap + to add your first {category?.toLowerCase()} item</Text>
                    </View>
                ) : (
                    items.map((item) => (
                        <PantryItem
                            key={item.id}
                            item={item}
                            onEdit={openEditModal}
                            onDelete={handleDeleteItem}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add Item Modal */}
                <AddItemModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onAdd={() => loadItems()}
                    defaultCategory={category}
                />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F3EE",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 70,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: "#F5F3EE",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#3A1E14',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 40,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#3A1E14',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3A1E14',
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    itemExpiry: {
        fontSize: 12,
        color: '#C4725D',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F5F3EE',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3A1E14',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 12,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#6C7C36',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
