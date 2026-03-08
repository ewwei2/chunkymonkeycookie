import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { colors, fonts } from '../styles/global';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyError = (code) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
                return 'No account found. Creating new account...';
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password.';
            case 'auth/email-already-in-use':
                return 'This email is already registered. Try signing in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return `Error: ${code}`;
        }
    };

    const createUserDocument = async (user) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    displayName: '',
                    photoURL: '',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                console.log('Created user document');
            }
        } catch (error) {
            console.log('Error creating user doc (non-fatal):', error);
        }
    };

    const handleContinue = async () => {
        setErrorMessage('');

        if (!email.trim() || !password) {
            setErrorMessage('Please enter email and password.');
            return;
        }

        setLoading(true);
        console.log('Attempting login with:', email.trim());

        if (!auth) {
            setErrorMessage('Firebase not initialized. Check your .env file.');
            setLoading(false);
            return;
        }

        try {
            console.log('Trying signInWithEmailAndPassword...');
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            console.log('Sign in successful:', userCredential.user.uid);
            await createUserDocument(userCredential.user);
            router.replace('/(tabs)/home');
        } catch (signInError) {
            console.log('Sign in error:', signInError.code, signInError.message);

            if (signInError.code === 'auth/user-not-found') {
                try {
                    console.log('User not found, creating account...');
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        email.trim(),
                        password
                    );
                    console.log('Account created:', userCredential.user.uid);
                    await createUserDocument(userCredential.user);
                    router.replace('/(tabs)/home');
                } catch (signUpError) {
                    console.log('Sign up error:', signUpError.code, signUpError.message);
                    setErrorMessage(getFriendlyError(signUpError.code));
                }
            } else {
                setErrorMessage(getFriendlyError(signInError.code));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>
                    Log in or create an account to save your pantry
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder='Email'
                    placeholderTextColor='#8C8C8C'
                    autoCapitalize='none'
                    keyboardType='email-address'
                    autoCorrect={false}
                    value={email}
                    onChangeText={(t) => {
                        setEmail(t);
                        setErrorMessage('');
                    }}
                />

                <TextInput
                    style={styles.input}
                    placeholder='Password'
                    placeholderTextColor='#8C8C8C'
                    secureTextEntry
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={password}
                    onChangeText={(t) => {
                        setPassword(t);
                        setErrorMessage('');
                    }}
                />

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            </View>

            <View style={styles.bottomSection}>
                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : 'Continue'}
                    </Text>
                </Pressable>

                {__DEV__ && (
                    <>
                        <Pressable
                            style={styles.devButton}
                            onPress={() => router.push('/pantry')}
                        >
                            <Text style={styles.devButtonText}>DEV: Skip Login → Pantry</Text>
                        </Pressable>

                        <Pressable
                            style={styles.devButton}
                            onPress={() => router.replace('/onboarding')}
                        >
                            <Text style={styles.devButtonText}>
                                DEV: Skip to Onboarding
                            </Text>
                        </Pressable>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'space-between',
    },
    content: {
        paddingTop: 120,
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 40,
        fontFamily: fonts.bold,
        textAlign: 'center',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: fonts.regular,
        textAlign: 'center',
        color: colors.secondary,
        marginBottom: 60,
        lineHeight: 24,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.text,
        marginBottom: 20,
    },
    error: {
        color: '#B00020',
        fontFamily: fonts.regular,
        marginTop: 6,
        textAlign: 'center',
    },
    bottomSection: {
        marginBottom: 0,
    },
    button: {
        backgroundColor: '#677D32',
        paddingVertical: 22,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 26,
        fontFamily: fonts.bold,
    },
    devButton: {
        marginTop: 12,
        marginHorizontal: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#eee',
        borderRadius: 12,
        alignItems: 'center',
    },
    devButtonText: {
        color: '#333',
        fontFamily: fonts.regular,
        fontSize: 14,
    },
});