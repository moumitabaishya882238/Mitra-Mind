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
import { connectSocket, disconnectSocket, offNewDirectMessage, onNewDirectMessage } from '../services/socketService';
import LinearGradient from 'react-native-linear-gradient';

const STORAGE_SESSION_KEY = 'mh-session-id';

type Props = {
    navigation: any;
    route?: any;
    embedded?: boolean;
};

export default function MessagesScreen({ route, embedded }: Props) {
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [peerId, setPeerId] = useState<string | null>(route?.params?.peerId || null);
    const [peerName, setPeerName] = useState('');
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [messages, setMessages] = useState<DirectMessageItem[]>([]);
    const [inputText, setInputText] = useState('');
    const [moderation, setModeration] = useState<ModerationResult | null>(null);

    const isLight = theme.id === 'matrix-white';
    const isEmbedded = embedded || route?.params?.embedded;

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

    useEffect(() => {
        let unmounted = false;
        let cleanupHandler: (() => void) | undefined;

        const setupRealtime = async () => {
            const sid = await ensureSession();
            if (unmounted) return;

            connectSocket(sid);

            const handleNewDm = (payload: { directMessage?: DirectMessageItem }) => {
                const incoming = payload?.directMessage;
                if (!incoming) return;

                loadConversations();

                if (!peerId) return;
                if (incoming.senderId !== peerId && incoming.receiverId !== peerId) return;

                setMessages((prev) => {
                    if (prev.some((item) => item.id === incoming.id)) return prev;
                    return [...prev, incoming];
                });
            };

            onNewDirectMessage(handleNewDm);
            cleanupHandler = () => offNewDirectMessage(handleNewDm);
        };

        setupRealtime();

        return () => {
            unmounted = true;
            if (cleanupHandler) cleanupHandler();
            disconnectSocket();
        };
    }, [ensureSession, loadConversations, peerId]);

    const send = async () => {
        if (!peerId || !inputText.trim()) return;
        try {
            const sid = await ensureSession();
            const response = await communityService.sendDirectMessage(sid, peerId, inputText.trim());
            setModeration(response.moderation);
            setMessages((prev) => {
                if (prev.some((item) => item.id === response.directMessage.id)) return prev;
                return [...prev, response.directMessage];
            });
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
        <View style={[styles.container, { backgroundColor: isEmbedded ? 'transparent' : '#020617' }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBarStyle} />

            {!isEmbedded && (
                <View style={styles.backgroundLayer}>
                    <LinearGradient
                        colors={['#060B26', '#09103D', '#120D31', '#050314']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.mainGradient}
                    />
                    <LinearGradient
                        colors={theme.gradients.veil}
                        start={{ x: 0.1, y: 0 }}
                        end={{ x: 0.9, y: 1 }}
                        style={styles.gradientVeil}
                    />
                </View>
            )}

            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.headerCard, { borderColor: 'rgba(142, 161, 255, 0.25)', backgroundColor: 'rgba(24, 32, 66, 0.55)' }]}>
                    <Text style={styles.title}>Direct Messages</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                {!peerId ? (
                    <FlatList
                        data={conversations}
                        keyExtractor={(item) => item.conversationId}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Start from a post.</Text>}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.conversationItem}
                                onPress={() => loadThread(item.peerId)}
                            >
                                <View style={styles.conversationTopRow}>
                                    <Text style={styles.peerName}>{item.peerAnonymousUsername}</Text>
                                    <Text style={styles.openTag}>Open</Text>
                                </View>
                                <Text style={styles.previewText} numberOfLines={2}>{item.lastMessage}</Text>
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

                        <View style={styles.composer}>
                            <TextInput
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Write a private message..."
                                placeholderTextColor={'rgba(255,255,255,0.45)'}
                                style={styles.input}
                            />
                            <View style={styles.composerActions}>
                                <Pressable onPress={send} style={styles.sendButton}>
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
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    mainGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 1,
    },
    gradientVeil: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    headerCard: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 4,
        color: 'rgba(235, 231, 255, 0.82)',
    },
    emptyText: {
        fontSize: 13,
        marginTop: 14,
        textAlign: 'center',
        color: 'rgba(238, 243, 255, 0.65)',
    },
    conversationItem: {
        backgroundColor: 'rgba(24, 32, 66, 0.45)', // Deep space glass
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.12)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },
    conversationTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    peerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    openTag: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(143, 117, 255, 0.9)',
        borderColor: 'rgba(143, 117, 255, 0.4)',
        backgroundColor: 'rgba(92, 64, 232, 0.15)',
    },
    previewText: {
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(226, 233, 255, 0.65)',
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
        backgroundColor: 'rgba(23, 28, 56, 0.65)',
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.15)',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 10,
        marginBottom: 12,
    },
    input: {
        minHeight: 40,
        fontSize: 14,
        lineHeight: 20,
        color: '#FFFFFF',
    },
    composerActions: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: 'rgba(92, 64, 232, 0.85)', // Premium purple core
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.25)', // Brighter glowing edge
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
