import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { router } from "expo-router";
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Pantry() {
    const [search, setSearch] = useState('');

    const openCategory = (category) => {
        router.push({
            pathname: "/categoryItem",
            params: { category },
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Pantry</Text>
            </View>

            {/* Search bar + add button */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for ingredients"
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <Pressable>
                        <Ionicons name="options-outline" size={18} color="#666" />
                    </Pressable>
                </View>
                <Pressable 
                    style={styles.addButton} 
                    onPress={() => router.push("/categoryItem")}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
            </View>

            {/* Pantry Shelves */}
            <View style={styles.pantryCard}>
                <ScrollView
                    contentContainerStyle={styles.pantryScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.shelfWrapper}>
                        <Image
                            source={require('../../assets/pantry.png')}
                            style={styles.shelfImage}
                            resizeMode="contain"
                        />

                        {/* Food category overlays */}
                        <Pressable
                            style={[styles.categoryIcon, styles.grains]}
                            onPress={() => openCategory('Grains')}
                        >
                            <Image source={require('../../assets/bread.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.dairy]}
                            onPress={() => openCategory('Eggs & Dairy')}
                        >
                            <Image source={require('../../assets/dairy.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.seafood]}
                            onPress={() => openCategory('Seafood')}
                        >
                            <Image source={require('../../assets/salmon.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.fruits]}
                            onPress={() => openCategory('Fruits')}
                        >
                            <Image source={require('../../assets/fruits.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.meat]}
                            onPress={() => openCategory('Meats')}
                        >
                            <Image source={require('../../assets/meat.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.veggies]}
                            onPress={() => openCategory('Vegetables')}
                        >
                            <Image source={require('../../assets/vegetables.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.sweets]}
                            onPress={() => openCategory('Snacks & Sweets')}
                        >
                            <Image source={require('../../assets/cheesecake.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.drinks]}
                            onPress={() => openCategory('Drinks')}
                        >
                            <Image source={require('../../assets/drinks.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.ice]}
                            onPress={() => openCategory('Frozen')}
                        >
                            <Image source={require('../../assets/ice.png')} style={styles.foodIcon} />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.cereal]}
                            onPress={() => openCategory('Other')}
                        >
                            <Image source={require('../../assets/cereal.png')} style={styles.foodIcon} />
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F3EE",
    },
    header: {
        paddingTop: 70,  // Increased from 60 to account for notch/Dynamic Island
        paddingBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3A1E14',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 15,
        color: '#333',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        fontSize: 24,
        color: '#3A1E14',
        fontWeight: '300',
    },
    pantryCard: {
        flex: 1,
        backgroundColor: '#FFE4C1',
        borderRadius: 32,
        marginHorizontal: 15,
        marginBottom: 10,  // Account for tab bar
        overflow: 'hidden',
    },
    pantryScrollContent: {
        alignItems: 'center',
        paddingBottom: 50,
    },
    shelfWrapper: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        marginTop: 100,
    },
    shelfImage: {
        width: '100%',
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