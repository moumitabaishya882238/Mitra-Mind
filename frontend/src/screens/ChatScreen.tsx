import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import apiClient from '../api/client';

export default function ChatScreen() {
    const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'ai' }[]>([
        { id: '1', text: "Hi, I'm Mitra. I'm here to listen. How are you feeling today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' as const };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        try {
            // Send to backend API
            const response = await apiClient.post('/ai/generate-response', {
                message: userMsg.text
            });

            const aiMsg = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'ai' as const };
            setMessages(prev => [...prev, aiMsg]);

            // OPTIONAL: trigger Text-to-Speech (TTS) here with react-native-tts for the aiMsg.text

        } catch (error) {
            console.error('Failed to get AI response', error);
            const errorMsg = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' as const };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#F5F5F5' },
    messageBubble: { padding: 15, borderRadius: 20, marginVertical: 5, maxWidth: '80%' },
    userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
    aiBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
    messageText: { fontSize: 16, color: '#333' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, backgroundColor: '#FFF' },
});
