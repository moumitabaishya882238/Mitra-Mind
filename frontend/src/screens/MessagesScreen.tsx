import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import MessageBubble from '../components/community/MessageBubble';
import { useAppTheme } from '../context/ThemeContext';
import communityService, { ConversationItem, DirectMessageItem, ModerationResult } from '../services/communityService';

const STORAGE_SESSION_KEY = 'mh-session-id';

type Props = {
    navigation: any;
    route?: any;
    embedded?: boolean;
};

export default function MessagesScreen({ route }: Props) {
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [peerId, setPeerId] = useState<string | null>(route?.params?.peerId || null);
    const [peerName, setPeerName] = useState('');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [messages, setMessages] = useState<DirectMessageItem[]>([]);
    const [inputText, setInputText] = useState('');
    const [moderation, setModeration] = useState<ModerationResult | null>(null);

    const isLight = theme.id === 'matrix-white';

    const ensureSession = useCallback(async () => {
        const stored = (await AsyncStorage.getItem(STORAGE_SESSION_KEY)) || 'anonymous-device';
        setSessionId(stored);
        return stored;
    }, []);

    const loadConversations = useCallback(async () => {
        try {
            const sid = await ensureSession();
            const response = await communityService.getConversations(sid);
            setConversations(response.conversations || []);
        } catch (error) {
            console.error('Failed to load conversations', error);
            setConversations([]);
        }
    }, [ensureSession]);

    const loadThread = useCallback(async (targetPeerId: string) => {
        try {
            const sid = await ensureSession();
            const response = await communityService.getMessageHistory(sid, targetPeerId);
            setPeerId(targetPeerId);
            setPeerName(response.peerAnonymousUsername);
            setMessages(response.messages || []);
        } catch (error) {
            console.error('Failed to load message history', error);
            setMessages([]);
        }
    }, [ensureSession]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (route?.params?.peerId) {
            loadThread(route.params.peerId);
        }
    }, [route?.params?.peerId, loadThread]);

    const send = async () => {
        if (!peerId || !inputText.trim()) return;
        try {
            const sid = await ensureSession();
            const response = await communityService.sendDirectMessage(sid, peerId, inputText.trim());
            setModeration(response.moderation);
            setMessages((prev) => [...prev, response.directMessage]);
            setInputText('');
            loadConversations();
        } catch (error) {
            console.error('Failed to send direct message', error);
        }
    };

    const subtitle = useMemo(() => {
        if (!peerId) return 'Pick a conversation to continue privately.';
        return `Private chat with ${peerName || 'peer'}`;
    }, [peerId, peerName]);

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBarStyle} />
            <SafeAreaView style={styles.safeArea}>
            <View style={[styles.headerCard, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Direct Messages</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
            </View>

            {!peerId ? (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.conversationId}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No messages yet. Start from a post.</Text>}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[styles.conversationItem, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}
                            onPress={() => loadThread(item.peerId)}
                        >
                            <View style={styles.conversationTopRow}>
                                <Text style={[styles.peerName, { color: theme.colors.textPrimary }]}>{item.peerAnonymousUsername}</Text>
                                <Text style={[styles.openTag, { color: theme.colors.accent, borderColor: theme.colors.accent }]}>Open</Text>
                            </View>
                            <Text style={[styles.previewText, { color: theme.colors.textSecondary }]} numberOfLines={2}>{item.lastMessage}</Text>
                        </Pressable>
                    )}
                />
            ) : (
                <KeyboardAvoidingView style={styles.threadWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MessageBubble item={item} theme={theme} />}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                    />

                    {moderation?.flagged ? (
                        <View style={[styles.flagBox, { borderColor: theme.colors.danger, backgroundColor: theme.colors.cardBg }]}>
                            <Text style={[styles.flagTitle, { color: theme.colors.danger }]}>Safety Notice</Text>
                            <Text style={[styles.flagText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                                {moderation.empatheticResponse}
                            </Text>
                        </View>
                    ) : null}

                    <View style={[styles.composer, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Write a private message..."
                            placeholderTextColor={isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'}
                            style={[styles.input, { color: isLight ? '#000000' : theme.colors.textPrimary }]}
                        />
                        <View style={styles.composerActions}>
                            <Pressable onPress={send} style={[styles.sendButton, { backgroundColor: theme.colors.accent }]}>
                                <Text style={styles.sendButtonText}>Send</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    headerCard: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 13,
        marginTop: 8,
    },
    conversationItem: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    conversationTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    peerName: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    openTag: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 11,
        fontWeight: '700',
    },
    previewText: {
        fontSize: 12,
        lineHeight: 18,
    },
    threadWrap: {
        flex: 1,
    },
    messagesList: {
        paddingBottom: 10,
        paddingHorizontal: 2,
    },
    flagBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 8,
    },
    flagTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 3,
    },
    flagText: {
        fontSize: 12,
    },
    composer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
    },
    input: {
        minHeight: 40,
        paddingHorizontal: 8,
        fontSize: 14,
        lineHeight: 20,
    },
    composerActions: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sendButton: {
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
});
