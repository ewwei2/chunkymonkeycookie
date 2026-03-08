import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { colors, fonts } from '../styles/global';
import { seasonalProduce } from '../data/seasonalProduce';

const getExpirationColor = (expirationDate) => {
    if (!expirationDate) return '#888';
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysLeft = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft > 7) return '#4CAF50';       // green - fresh
    if (daysLeft > 3) return '#FFC107';       // yellow - getting close
    if (daysLeft > 0) return '#FF7043';       // orange - expiring soon
    return '#e74c3c';                          // red - expired
};

const isInSeason = (itemName) => {
    const currentMonth = new Date().getMonth() + 1;
    const seasonal = seasonalProduce[currentMonth] || [];
    const lowerName = itemName.toLowerCase();
    return seasonal.some((produce) => lowerName.includes(produce));
};

export default function PantryItem({ item, onEdit, onDelete }) {
    const swipeableRef = useRef(null);

    const dotColor = getExpirationColor(item.expirationDate);
    const seasonal = isInSeason(item.name);

    const renderRightActions = () => (
        <View style={styles.swipeActions}>
            <Pressable
                style={styles.editAction}
                onPress={() => {
                    swipeableRef.current?.close();
                    onEdit(item);
                }}
            >
                <Ionicons name="pencil" size={20} color="#fff" />
            </Pressable>
            <Pressable
                style={styles.deleteAction}
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete(item.id);
                }}
            >
                <Ionicons name="trash" size={20} color="#fff" />
            </Pressable>
        </View>
    );

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
        >
            <View style={styles.card}>
                {/* Left - dot + name + expiry */}
                <View style={styles.left}>
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.expiry}>
                            {item.expirationDate
                                ? `Exp. ${item.expirationDate}`
                                : item.dateAdded
                                ? `${Math.ceil((new Date() - new Date(item.dateAdded)) / (1000 * 60 * 60 * 24))} days in`
                                : ''}
                        </Text>
                    </View>
                </View>

                {/* Right - quantity + storage + seasonal flower */}
                <View style={styles.right}>
                    {seasonal && (
                        <Image
                            source={require('../assets/flowerIcon.png')}
                            style={styles.flower}
                            resizeMode="contain"
                        />
                    )}
                    <View style={styles.rightText}>
                        <Text style={styles.quantity}>
                            {item.quantity} {item.unit}
                        </Text>
                        <Text style={styles.storage}>{item.storageLocation}</Text>
                    </View>
                </View>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    name: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    expiry: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: '#888',
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
        position: 'relative',
    },
    rightText: {
        alignItems: 'flex-end',
    },
    quantity: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    storage: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: '#888',
        marginTop: 2,
    },
    flower: {
        width: 28,
        height: 28,
        position: 'absolute',
        top: -20,
        right: -4,
    },
    swipeActions: {
        flexDirection: 'row',
        marginBottom: 12,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
    },
    editAction: {
        backgroundColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        width: 64,
    },
    deleteAction: {
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        width: 64,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
});