import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hey! I'm your PantryMonkey chef assistant 🐵🍳\n\nI can help you with:\n• Recipe ideas based on your pantry\n• Cooking tips & techniques\n• Substitutions for ingredients\n• Meal planning suggestions\n\nWhat would you like to cook today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const pantryRef = collection(db, "users", user.uid, "pantry");
      const snapshot = await getDocs(pantryRef);
      const items = snapshot.docs.map((doc) => doc.data().name || doc.data().item);
      setPantryItems(items.filter(Boolean));
    } catch (error) {
      console.error("Error fetching pantry:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are a friendly, helpful cooking assistant for PantryMonkey, a sustainable cooking app for USF students. 

Your personality:
- Warm, encouraging, and supportive
- Use occasional food emojis 🍳🥗🍝
- Keep responses concise but helpful
- Focus on reducing food waste and using seasonal ingredients

The user's current pantry contains: ${pantryItems.length > 0 ? pantryItems.join(", ") : "No items added yet"}

Current season: ${getCurrentSeason()} (focus on seasonal California produce)

Help users with:
- Recipe suggestions using their pantry items
- Cooking techniques and tips
- Ingredient substitutions
- Meal planning
- Food storage advice
- Reducing food waste`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Fast and capable model
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage.content },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.choices[0].message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! I'm having trouble connecting right now. Please try again in a moment! 🙈",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🐵</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const quickPrompts = [
    "What can I make with my pantry?",
    "Quick dinner ideas",
    "How to reduce food waste?",
    "What's in season now?",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chef Assistant</Text>
        <Text style={styles.headerSubtitle}>Your AI cooking companion</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <View style={styles.quickPromptsContainer}>
          {quickPrompts.map((prompt, index) => (
            <Pressable
              key={index}
              style={styles.quickPrompt}
              onPress={() => setInput(prompt)}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C7C36" />
          <Text style={styles.loadingText}>Cooking up a response...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about cooking..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F5F3EE",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3A1E14",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  assistantBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#6C7C36",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  userMessageText: {
    color: "#fff",
  },
  quickPromptsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  quickPrompt: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  quickPromptText: {
    fontSize: 13,
    color: "#6C7C36",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6C7C36",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
});