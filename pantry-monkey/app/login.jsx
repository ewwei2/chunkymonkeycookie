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
    const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyError = (code) => {
        switch (code) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
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

    const handleLogin = async () => {
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
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            console.log('Sign in successful:', userCredential.user.uid);
            await createUserDocument(userCredential.user);
            router.replace('/(tabs)/home');
        } catch (error) {
            console.log('Sign in error:', error.code, error.message);
            setErrorMessage(getFriendlyError(error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setErrorMessage('');

        if (!email.trim() || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password should be at least 6 characters.');
            return;
        }

        setLoading(true);
        console.log('Attempting registration with:', email.trim());

        if (!auth) {
            setErrorMessage('Firebase not initialized. Check your .env file.');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            console.log('Registration successful:', userCredential.user.uid);
            await createUserDocument(userCredential.user);
            // New accounts go to onboarding
            router.replace('/onboarding');
        } catch (error) {
            console.log('Registration error:', error.code, error.message);
            setErrorMessage(getFriendlyError(error.code));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMessage('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
                <Text style={styles.subtitle}>
                    {isLogin 
                        ? 'Sign in to access your pantry' 
                        : 'Sign up to start tracking your pantry'}
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

                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder='Confirm Password'
                        placeholderTextColor='#8C8C8C'
                        secureTextEntry
                        autoCapitalize='none'
                        autoCorrect={false}
                        value={confirmPassword}
                        onChangeText={(t) => {
                            setConfirmPassword(t);
                            setErrorMessage('');
                        }}
                    />
                )}

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                {/* Toggle between Login and Register */}
                <Pressable style={styles.toggleContainer} onPress={toggleMode}>
                    <Text style={styles.toggleText}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Text style={styles.toggleLink}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </Text>
                    </Text>
                </Pressable>
            </View>

            <View style={styles.bottomSection}>
                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={isLogin ? handleLogin : handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Text>
                </Pressable>
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
        paddingTop: 100,
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 36,
        fontFamily: fonts.bold,
        textAlign: 'center',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: fonts.regular,
        textAlign: 'center',
        color: colors.secondary,
        marginBottom: 40,
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
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    error: {
        color: '#B00020',
        fontFamily: fonts.regular,
        marginTop: 6,
        marginBottom: 10,
        textAlign: 'center',
    },
    toggleContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 15,
        fontFamily: fonts.regular,
        color: colors.textMuted || '#666',
    },
    toggleLink: {
        color: '#677D32',
        fontFamily: fonts.bold,
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
        fontSize: 24,
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