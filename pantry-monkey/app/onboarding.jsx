import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { colors, fonts } from '../styles/global';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSpace } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 6;

const DIETARY_OPTIONS = [
    { key: 'GLUTEN-FREE', label: 'Gluten Free', image: require('../assets/GLUTEN-FREE.png'), checkedImage: require('../assets/GLUTEN-FREECHECK.png') },
    { key: 'LACTOSEINTOLERANT', label: 'Lactose Intolerant', image: require('../assets/LACTOSEINTOLERANT.png'), checkedImage: require('../assets/LACTOSEINTOLERANTCHECK.png') },
    { key: 'DAIRYFREE', label: 'Dairy Free', image: require('../assets/DAIRYFREE.png'), checkedImage: require('../assets/DAIRYFREECHECK.png') },
    { key: 'NUTFREE', label: 'Nut Free', image: require('../assets/NUTFREE.png'), checkedImage: require('../assets/NUTFREECHECK.png') },
    { key: 'PEANUT', label: 'Peanut Allergy', image: require('../assets/PEANUT.png'), checkedImage: require('../assets/PEANUTCHECK.png') },
    { key: 'PESCATARIAN', label: 'Pescatarian', image: require('../assets/PESCATARIAN.png'), checkedImage: require('../assets/PESCATARIANCHECK.png') },
    { key: 'VEGETARIAN', label: 'Vegetarian', image: require('../assets/VEGETARIAN.png'), checkedImage: require('../assets/VEGETARIANCHECK.png') },
    { key: 'VEGAN', label: 'Vegan', image: require('../assets/VEGAN.png'), checkedImage: require('../assets/VEGANCHECK.png') },
];

const AVATARS = [
    { key: 'donmonkey', image: require('../assets/donmonkey.png') },
    { key: 'donduck', image: require('../assets/donduck.png') },
    { key: 'donwhale', image: require('../assets/donwhale.png') },
    { key: 'dondonkey', image: require('../assets/dondonkey.png') },
    { key: 'donfish', image: require('../assets/donfish.png') },
    { key: 'doncat', image: require('../assets/doncat.png') },
    { key: 'donturtle', image: require('../assets/donturtle.png') },
    { key: 'donpanda', image: require('../assets/donpanda.png') },
    { key: 'donraccoon', image: require('../assets/donraccoon.png') },
];

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
        fontSize: 14,
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
        fontSize: 14,
    },
    placeholder: {
        color: '#7a7a7a',
        fontFamily: fonts.regular,
    },
    iconContainer: {
        top: 14,
        right: 12,
    },
    done: {
        color: colors.green,
        fontFamily: fonts.bold,
    },
    modalViewTop: { backgroundColor: '#ffffff' },
    modalViewMiddle: { backgroundColor: '#ffffff' },
    modalViewBottom: { backgroundColor: '#ffffff' },
};

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [selectedDietary, setSelectedDietary] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    // restore step on mount
    useEffect(() => {
        const restoreStep = async () => {
            const saved = await AsyncStorage.getItem('onboardingStep');
            if (saved) setStep(parseInt(saved));
        };
        restoreStep();
    }, []);

    // save step whenever it changes
    useEffect(() => {
        AsyncStorage.setItem('onboardingStep', String(step));
    }, [step]);

    const nextStep = () => {
        if (step < TOTAL_STEPS) setStep(step + 1);
    };

    const toggleDietary = (key) => {
        setSelectedDietary((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const saveAndFinish = async () => {
        await AsyncStorage.removeItem('onboardingStep');
        const user = auth.currentUser;
        if (!user) {
            router.replace('/home');
            return;
        }
        try {
            await setDoc(
                doc(db, 'users', user.uid),
                {
                    name,
                    pronouns,
                    dietaryRestrictions: selectedDietary,
                    avatar: selectedAvatar,
                    onboardingComplete: true,
                },
                { merge: true }
            );
            router.replace('/home');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            router.replace('/home');
        }
    };

    const ProgressBar = () => (
        <View style={styles.progressContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.progressSegment,
                        i < step ? styles.progressActive : styles.progressInactive,
                    ]}
                />
            ))}
        </View>
    );

    // step 1 - welcome
    if (step === 1) return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>Hi there!</Text>
                <Text style={styles.subtitle}>Before you start, we have a few questions</Text>
                <Image source={require('../assets/monkey.png')} style={styles.mascot} resizeMode="contain" />
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    // step 2 - who are you
    if (step === 2) return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>Who are you?</Text>
                <Text style={styles.subtitle}>What would you like to be called?</Text>
                <View style={styles.formBlock}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />
                    <RNPickerSelect
                        onValueChange={(value) => setPronouns(value)}
                        value={pronouns}
                        placeholder={{ label: 'Pronouns...', value: '' }}
                        doneText='Done'
                        darkTheme={false}
                        useNativeAndroidPickerStyle={false}
                        items={[
                            { label: 'He/Him', value: 'He/Him' },
                            { label: 'She/Her', value: 'She/Her' },
                            { label: 'They/Them', value: 'They/Them' },
                            { label: 'Prefer not to say', value: 'Prefer not to say' },
                        ]}
                        style={pickerStyles}
                        Icon={() => <Ionicons name='chevron-down' size={20} color='#5f5f5f' />}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    // step 3 - dietary restrictions
    if (step === 3) return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>
                    What's <Text style={styles.highlight}>not</Text> on{'\n'}your plate
                </Text>
                <Text style={styles.subtitle}>Pick everything that fits you</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContainer}
                    snapToInterval={width * 0.55 + 16}
                    decelerationRate="fast"
                >
                    {DIETARY_OPTIONS.map((option) => {
                        const isSelected = selectedDietary.includes(option.key);
                        return (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => toggleDietary(option.key)}
                                style={styles.dietCard}
                            >
                                <Image
                                    source={isSelected ? option.checkedImage : option.image}
                                    style={styles.dietImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.dietLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextStep} style={{ marginTop: 12 }}>
                <Text style={styles.skipText}>Set up later</Text>
            </TouchableOpacity>
        </View>
    );

    // step 4 - avatar
    if (step === 4) return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>Avatar</Text>
                <Text style={styles.subtitle}>Which Don you cooking with?</Text>
                <View style={styles.avatarGrid}>
                    {AVATARS.map((avatar) => (
                        <TouchableOpacity
                            key={avatar.key}
                            onPress={() => setSelectedAvatar(avatar.key)}
                            style={[
                                styles.avatarItem,
                                selectedAvatar === avatar.key && styles.avatarSelected,
                            ]}
                        >
                            <Image source={avatar.image} style={styles.avatarImage} resizeMode="contain" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextStep} style={{ marginTop: 12 }}>
                <Text style={styles.skipText}>Set up later</Text>
            </TouchableOpacity>
        </View>
    );

    // step 5 - notifications
    if (step === 5) return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>Notifications</Text>
                <Image source={require('../assets/flowerMonkey.png')} style={styles.mascot} resizeMode="contain" />
                <View style={styles.notifList}>
                    <View style={styles.notifItem}>
                        <Image source={require('../assets/mood-smile.png')} style={styles.notifIcon} resizeMode="contain" />
                        <Text style={styles.notifText}>Next farmers market nearby</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.notifItem}>
                        <Image source={require('../assets/trash.png')} style={styles.notifIcon} resizeMode="contain" />
                        <Text style={styles.notifText}>Upcoming food expirations</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.notifItem}>
                        <Image source={require('../assets/sparkles-sharp.png')} style={styles.notifIcon} resizeMode="contain" />
                        <Text style={styles.notifText}>Recommended new recipes</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>Turn on Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextStep} style={{ marginTop: 12 }}>
                <Text style={styles.skipText}>Set up later</Text>
            </TouchableOpacity>
        </View>
    );

    // step 6 - your pantry
    return (
        <View style={styles.container}>
            <ProgressBar />
            <View style={styles.content}>
                <Text style={styles.title}>Your Pantry</Text>
                <Text style={styles.subtitle}>Add 5 items to get started</Text>
                <TouchableOpacity style={styles.addFoodRow} onPress={() => router.push('/pantry')}>
                    <Text style={styles.addFoodText}>+  Add food to your pantry</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={saveAndFinish}>
                <Text style={styles.nextButtonText}>Let's Cook</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 40,
    },
    progressSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    progressActive: {
        backgroundColor: colors.green,
    },
    progressInactive: {
        backgroundColor: '#ddd',
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    formBlock: {
        width: '100%',
        marginTop: 40,
    },
    title: {
        fontSize: 40,
        fontFamily: fonts.bold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
    },
    highlight: {
        color: '#E8613A',
    },
    mascot: {
        width: 240,
        height: 260,
        marginTop: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#f3f3f3',
        fontSize: 14,
        fontFamily: fonts.regular,
        color: '#1f1f1f',
        marginBottom: 10,
    },
    carouselContainer: {
        paddingHorizontal: 16,
        gap: 16,
        alignItems: 'center',
    },
    dietCard: {
        width: width * 0.55,
        borderRadius: 16,
        alignItems: 'center',
        padding: 16,
    },
    dietImage: {
        width: 180,
        height: 180,
    },
    dietLabel: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: fonts.regular,
        color: '#333',
        textAlign: 'center',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
    },
    avatarItem: {
        width: (width - 96) / 3,
        height: (width - 96) / 3,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    avatarSelected: {
        borderColor: colors.green,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    notifList: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 0,
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 12,
    },
    notifIcon: {
        width: 22,
        height: 22,
    },
    notifText: {
        fontSize: 15,
        fontFamily: fonts.regular,
        color: '#555',
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
    },
    addFoodRow: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginTop: 16,
    },
    addFoodText: {
        fontSize: 15,
        fontFamily: fonts.regular,
        color: '#888',
    },
    skipText: {
        textAlign: 'center',
        color: '#888',
        fontFamily: fonts.regular,
        fontSize: 14,
        marginBottom: 12,
        textDecorationLine: 'underline',
    },
    nextButton: {
        backgroundColor: colors.green,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
    },
    nextButtonText: {
        color: '#fff',
        fontFamily: fonts.bold,
        fontSize: 16,
    },
});