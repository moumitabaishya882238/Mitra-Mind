import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import ReplyItem from '../components/community/ReplyItem';
import { useAppTheme } from '../context/ThemeContext';
import communityService, { CommunityPost, CommunityReply, ModerationResult } from '../services/communityService';

const STORAGE_SESSION_KEY = 'mh-session-id';

// Mood-based color system (same as PostCard)
function getMoodColor(mood: string): { accent: string; bg: string; text: string } {
    const moodLower = mood.toLowerCase();
    switch (moodLower) {
        case 'happy':
            return { accent: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)', text: '#2E7D32' };
        case 'calm':
            return { accent: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)', text: '#1565C0' };
        case 'neutral':
            return { accent: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.15)', text: '#616161' };
        case 'stressed':
            return { accent: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)', text: '#E65100' };
        case 'anxious':
            return { accent: '#FFC107', bg: 'rgba(255, 193, 7, 0.15)', text: '#F57F17' };
        case 'sad':
            return { accent: '#673AB7', bg: 'rgba(103, 58, 183, 0.15)', text: '#4527A0' };
        case 'depressed':
            return { accent: '#607D8B', bg: 'rgba(96, 125, 139, 0.15)', text: '#37474F' };
        case 'angry':
            return { accent: '#F44336', bg: 'rgba(244, 67, 54, 0.15)', text: '#C62828' };
        default:
            return { accent: '#78909C', bg: 'rgba(120, 144, 156, 0.15)', text: '#546E7A' };
    }
}

export default function PostDetailScreen({ route, navigation }: any) {
    const { postId } = route.params || {};
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [post, setPost] = useState<CommunityPost | null>(null);
    const [replies, setReplies] = useState<CommunityReply[]>([]);
    const [replyText, setReplyText] = useState('');
    const [moderation, setModeration] = useState<ModerationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const loadDetails = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const stored = (await AsyncStorage.getItem(STORAGE_SESSION_KEY)) || 'anonymous-device';
            setSessionId(stored);
            const response = await communityService.getPostDetail(stored, postId);
            setPost(response.post);
            setReplies(response.replies || []);
        } catch (error) {
            console.error('Failed to load post detail', error);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const onSendReply = async () => {
        if (!replyText.trim()) return;
        try {
            const response = await communityService.createReply(sessionId, postId, replyText.trim());
            setModeration(response.moderation);
            setReplies((prev) => [...prev, response.reply]);
            setReplyText('');
        } catch (error) {
            console.error('Reply send failed', error);
        }
    };

    const isLight = theme.id === 'matrix-white';
    const moodColors = post?.mood ? getMoodColor(post.mood) : null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.screenBase }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBarStyle} />
            <View style={styles.backgroundLayer}>
                <LinearGradient
                    colors={theme.gradients.main}
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

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Post Details</Text>

                    {post ? (
                        <View
                            style={[
                                styles.postShell,
                                {
                                    borderColor: theme.colors.borderSoft,
                                    backgroundColor: theme.colors.cardBg,
                                    borderLeftColor: moodColors?.accent || theme.colors.borderSoft,
                                    borderLeftWidth: moodColors ? 4 : 1,
                                },
                            ]}
                        >
                            <Text style={[styles.userText, { color: theme.colors.textPrimary }]}>{post.anonymousUsername}</Text>
                            <Text style={[styles.postText, { color: isLight ? '#000000' : theme.colors.textPrimary }]}>{post.message}</Text>
                            
                            {post.mood && moodColors ? (
                                <View style={[styles.moodTag, { backgroundColor: moodColors.bg, borderColor: moodColors.accent }]}>
                                    <Text style={[styles.moodTagText, { color: moodColors.text }]}>
                                        {post.mood}
                                    </Text>
                                </View>
                            ) : null}
                            
                            <View style={styles.inlineActions}>
                                <Text style={[styles.replyLabel, { color: theme.colors.textSecondary }]}>Replies: {replies.length}</Text>
                                {post.userId !== sessionId ? (
                                    <Pressable onPress={() => navigation.navigate('Messages', { peerId: post.userId })}>
                                        <Text style={[styles.dmAction, { color: theme.colors.accent }]}>Message Author</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>
                    ) : loading ? (
                        <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>Loading...</Text>
                    ) : (
                        <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>Post not found.</Text>
                    )}

                    <FlatList
                        data={replies}
                        keyExtractor={(item) => item.id}
                        style={styles.replyList}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        renderItem={({ item }) => <ReplyItem reply={item} theme={theme} />}
                    />

                    {moderation?.flagged ? (
                        <View style={[styles.flagBox, { borderColor: theme.colors.danger, backgroundColor: theme.colors.cardBg }]}>
                            <Text style={[styles.flagTitle, { color: theme.colors.danger }]}>Safety Notice</Text>
                            <Text style={[styles.flagText, { color: theme.colors.textSecondary }]}>{moderation.empatheticResponse}</Text>
                        </View>
                    ) : null}

                    <View style={[styles.replyComposer, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                        <TextInput
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Write a supportive reply..."
                            placeholderTextColor={isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'}
                            style={[styles.replyInput, { color: isLight ? '#000000' : theme.colors.textPrimary }]}
                        />
                        <Pressable onPress={onSendReply} style={[styles.sendButton, { backgroundColor: theme.colors.accent }]}>
                            <Text style={styles.sendButtonText}>Send</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
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
        zIndex: -1,
    },
    mainGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    gradientVeil: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 10,
    },
    title: {
        fontSize: 21,
        fontWeight: '800',
        marginBottom: 10,
    },
    postShell: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    userText: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 4,
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 8,
    },
    moodTag: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    moodTagText: {
        fontSize: 12,
        fontWeight: '700',
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    replyLabel: {
        fontSize: 12,
    },
    dmAction: {
        fontSize: 12,
        fontWeight: '700',
    },
    stateText: {
        fontSize: 13,
        marginBottom: 8,
    },
    replyList: {
        flex: 1,
    },
    flagBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    flagTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 4,
    },
    flagText: {
        fontSize: 12,
        lineHeight: 18,
    },
    replyComposer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
    },
    replyInput: {
        minHeight: 44,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    sendButton: {
        alignSelf: 'flex-end',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginTop: 6,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
    },
});
