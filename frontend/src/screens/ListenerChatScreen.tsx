import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import listenerService, { ListenerChatMessage } from '../services/listenerService';
import {
    connectSocket,
    disconnectSocket,
    offNewListenerChatMessage,
    onNewListenerChatMessage,
} from '../services/socketService';

type Props = {
    route: {
        params?: {
            listenerId?: string;
            userId?: string;
            listenerDisplayName?: string;
        };
    };
};

function isMine(message: ListenerChatMessage, userId: string) {
    return message.senderRole === 'user' && message.userId === userId;
}

export default function ListenerChatScreen({ route }: Props) {
    const { theme } = useAppTheme();
    const listenerId = route?.params?.listenerId || '';
    const userId = route?.params?.userId || 'anonymous-device';
    const listenerDisplayName = route?.params?.listenerDisplayName || 'Verified Listener';

    const [messages, setMessages] = useState<ListenerChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const title = useMemo(() => `Chat with ${listenerDisplayName}`, [listenerDisplayName]);

    const loadHistory = useCallback(async () => {
        if (!listenerId) return;
        setLoading(true);
        try {
            const response = await listenerService.getListenerChat(userId, listenerId);
            setMessages(response.messages || []);
        } catch (error) {
            console.error('Failed to load listener chat history', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [listenerId, userId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        if (!userId || !listenerId) return;

        connectSocket(userId);

        const handler = (payload: { chatMessage?: ListenerChatMessage }) => {
            const incoming = payload?.chatMessage;
            if (!incoming) return;
            if (incoming.listenerId !== listenerId) return;

            setMessages((prev) => {
                if (prev.some((item) => item.id === incoming.id)) return prev;
                return [...prev, incoming];
            });
        };

        onNewListenerChatMessage(handler);

        return () => {
            offNewListenerChatMessage(handler);
            disconnectSocket();
        };
    }, [listenerId, userId]);

    const send = async () => {
        if (!listenerId || !inputText.trim()) return;
        try {
            const response = await listenerService.sendListenerChatMessage(userId, listenerId, inputText.trim());
            setMessages((prev) => [...prev, response.chatMessage]);
            setInputText('');
        } catch (error) {
            console.error('Failed to send listener chat message', error);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.screenBase }]}>
            <View style={[styles.headerCard, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Verified volunteer listener support</Text>
            </View>

            {loading ? <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading chat history...</Text> : null}

            <KeyboardAvoidingView style={[styles.threadWrap, { backgroundColor: theme.colors.screenBase }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    style={{ backgroundColor: theme.colors.screenBase }}
                    renderItem={({ item }) => {
                        const mine = isMine(item, userId);
                        return (
                            <View style={[styles.bubble, mine ? [styles.mine, { backgroundColor: theme.colors.accent }] : [styles.theirs, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]]}>
                                <Text style={[styles.messageText, { color: mine ? '#FFFFFF' : theme.colors.textPrimary }]}>{item.message}</Text>
                            </View>
                        );
                    }}
                />

                <View style={[styles.composer, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Write your message..."
                        placeholderTextColor={theme.id === 'matrix-white' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'}
                        style={[styles.input, { color: theme.colors.textPrimary }]}
                    />
                    <Pressable style={[styles.sendButton, { backgroundColor: theme.colors.accent }]} onPress={send}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    headerCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 3,
        fontSize: 12,
    },
    loadingText: {
        fontSize: 12,
        marginBottom: 8,
    },
    threadWrap: {
        flex: 1,
    },
    messagesList: {
        paddingBottom: 10,
    },
    bubble: {
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        maxWidth: '84%',
    },
    mine: {
        alignSelf: 'flex-end',
    },
    theirs: {
        alignSelf: 'flex-start',
        borderWidth: 1,
    },
    messageText: {
        fontSize: 13,
        lineHeight: 18,
    },
    composer: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        minHeight: 38,
        fontSize: 13,
        paddingHorizontal: 8,
    },
    sendButton: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
});
