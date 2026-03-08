import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import { colors, fonts } from '../styles/global';
import { Ionicons } from '@expo/vector-icons';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Don, a fun and friendly AI chef assistant for Pantry Monkey — a pantry management app. 
You help users with:
- Ingredient suggestions and substitutions
- Fun food facts
- Cooking tips and techniques
- Recipe ideas based on what they have
- Food storage and expiration advice

Keep your responses concise, fun, and encouraging. Use food-related emojis occasionally. 
You have a playful personality — like a chef who loves to cook and share knowledge.
Never break character. You are Don the chef, always ready to help in the kitchen!`;

export default function Chat() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hey there! 👨‍🍳 I'm Chunky Monkey, your personal chef assistant! Ask me anything about cooking, ingredients, or food tips. What's cooking today?",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input.trim() };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...updatedMessages,
                    ],
                    max_tokens: 512,
                    temperature: 0.7,
                }),
            });

            const data = await response.json();
            const assistantMessage = {
                role: 'assistant',
                content: data.choices?.[0]?.message?.content || "Sorry, I couldn't think of anything! Try asking again. 🍳",
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Groq error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "Oops, something went wrong in the kitchen! Try again. 🔥" },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Don the Chef</Text>
                <Text style={styles.headerSubtitle}>Your AI kitchen assistant</Text>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messages}
                contentContainerStyle={{ paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBubble,
                            msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                msg.role === 'user' ? styles.userText : styles.assistantText,
                            ]}
                        >
                            {msg.content}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <View style={styles.assistantBubble}>
                        <ActivityIndicator size="small" color={colors.green} />
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask Don anything..."
                    placeholderTextColor="#999"
                    value={input}
                    onChangeText={setInput}
                    multiline
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !input.trim() && { opacity: 0.4 }]}
                    onPress={sendMessage}
                    disabled={!input.trim() || loading}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 24,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 13,
        fontFamily: fonts.regular,
        color: '#888',
        marginTop: 2,
    },
    messages: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
    },
    userBubble: {
        backgroundColor: colors.green,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    messageText: {
        fontSize: 15,
        fontFamily: fonts.regular,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    assistantText: {
        color: colors.text,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        fontFamily: fonts.regular,
        color: colors.text,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sendButton: {
        backgroundColor: colors.green,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

Create a `.env` file in the root of your project:
```
EXPO_PUBLIC_GROQ_API_KEY=your_new_key_here