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

    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // open category when user taps item
    // navigates to categoryItem.jsx
    const openCategory = (category) => {
        router.push({
            pathname: "/categoryItem",  // screen to open
            params: { category },   // go to chosen category
        });
    };

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