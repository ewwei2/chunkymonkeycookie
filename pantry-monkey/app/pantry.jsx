import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '../styles/global';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AddItemModal from '../components/AddItemModal';

const { width } = Dimensions.get('window');
const titleSize = width < 380 ? 32 : 36;

const categories = [
    'Grains',
    'Eggs & Dairy',
    'Seafood',
    'Fruits',
    'Vegetables',
    'Drinks',
    'Meats',
    'Snacks & Sweets',
    'Frozen',
    'Other',
];

export default function Pantry() {
    const [search, setSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const openCategory = (category) => {
        router.push({
            pathname: '/categoryItem',
            params: { category },
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name='arrow-back' size={28} color={colors.text} />
                </Pressable>

                <Text style={styles.title}>Pantry</Text>

                <View style={styles.headerSpace} />
            </View>

            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search for ingredients'
                    placeholderTextColor='#5F5F5F'
                    value={search}
                    onChangeText={setSearch}
                />

                <Pressable
                    style={styles.addButton}
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
            </View>

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

                        <Pressable
                            style={[styles.categoryIcon, styles.grains]}
                            onPress={() => openCategory('Grains')}
                        >
                            <Image
                                source={require('../assets/bread.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.dairy]}
                            onPress={() => openCategory('Eggs & Dairy')}
                        >
                            <Image
                                source={require('../assets/dairy.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.seafood]}
                            onPress={() => openCategory('Seafood')}
                        >
                            <Image
                                source={require('../assets/salmon.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.fruits]}
                            onPress={() => openCategory('Fruits')}
                        >
                            <Image
                                source={require('../assets/fruits.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.meat]}
                            onPress={() => openCategory('Meats')}
                        >
                            <Image
                                source={require('../assets/meat.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.veggies]}
                            onPress={() => openCategory('Vegetables')}
                        >
                            <Image
                                source={require('../assets/vegetables.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.sweets]}
                            onPress={() => openCategory('Snacks & Sweets')}
                        >
                            <Image
                                source={require('../assets/cheesecake.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.drinks]}
                            onPress={() => openCategory('Drinks')}
                        >
                            <Image
                                source={require('../assets/drinks.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.ice]}
                            onPress={() => openCategory('Frozen')}
                        >
                            <Image
                                source={require('../assets/ice.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.categoryIcon, styles.cereal]}
                            onPress={() => openCategory('Other')}
                        >
                            <Image
                                source={require('../assets/cereal.png')}
                                style={styles.foodIcon}
                            />
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            <AddItemModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={(item) => console.log(item)}
            />
        </SafeAreaView>
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
        marginTop: 0,
        marginBottom: 24,
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
        fontSize: titleSize,
        textAlign: 'center',
        color: colors.text,
        fontFamily: fonts.bold,
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
        fontFamily: fonts.regular,
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
        fontFamily: fonts.regular,
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
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        marginTop: 100,
    },

    shelfSection: {
        position: 'relative',
        width: '100%',
        height: 140,
        marginBottom: 20,
    },

    ShelfImage: {
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