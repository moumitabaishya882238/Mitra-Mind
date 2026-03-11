import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';
import PostCard from '../components/community/PostCard';
import communityService, { CommunityFilter, CommunityPost } from '../services/communityService';

const STORAGE_SESSION_KEY = 'mh-session-id';

type Props = {
    navigation: any;
    embedded?: boolean;
};

export default function PostsScreen({ navigation }: Props) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [filter, setFilter] = useState<CommunityFilter>('all');
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<CommunityPost[]>([]);

    const filters = useMemo(
        () => [
            { id: 'all' as CommunityFilter, label: t('community.filter_all') },
            { id: 'mine' as CommunityFilter, label: t('community.filter_mine') },
            { id: 'saved' as CommunityFilter, label: t('community.filter_saved') },
        ],
        [t]
    );

    const ensureSessionId = useCallback(async () => {
        const stored = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
            setSessionId(stored);
            return stored;
        }

        const generated = `student-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000).toString(36)}`;
        await AsyncStorage.setItem(STORAGE_SESSION_KEY, generated);
        setSessionId(generated);
        return generated;
    }, []);

    const loadPosts = useCallback(async (nextFilter: CommunityFilter = filter) => {
        setLoading(true);
        try {
            const sid = await ensureSessionId();
            const response = await communityService.getPosts(sid, nextFilter);
            setPosts(response.posts || []);
        } catch (error) {
            console.error('Failed to load community posts', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [ensureSessionId, filter]);

    useEffect(() => {
        loadPosts();
    }, [filter, loadPosts]);

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            loadPosts();
        });
        return unsub;
    }, [navigation, loadPosts]);

    const toggleSave = async (post: CommunityPost) => {
        try {
            if (post.saved) {
                await communityService.unsavePost(sessionId, post.id);
            } else {
                await communityService.savePost(sessionId, post.id);
            }
            loadPosts();
        } catch (error) {
            console.error('Save/unsave failed', error);
        }
    };

    const deletePost = async (post: CommunityPost) => {
        try {
            await communityService.deletePost(sessionId, post.id);
            loadPosts();
        } catch (error) {
            console.error('Delete post failed', error);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.createButton,
                    pressed && styles.createButtonPressed,
                ]}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Text style={styles.createButtonText}>{t('community.share_prompt')}</Text>
            </Pressable>

            <View style={styles.filterRow}>
                {filters.map((item) => {
                    const active = item.id === filter;
                    return (
                        <Pressable
                            key={item.id}
                            style={[
                                styles.filterButton,
                                active ? styles.filterButtonActive : null,
                            ]}
                            onPress={() => setFilter(item.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    active ? styles.filterTextActive : null,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {loading ? (
                <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>{t('community.loading')}</Text>
            ) : null}

            {!loading && !posts.length ? (
                <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>{t('community.no_posts')}</Text>
            ) : null}

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        theme={theme}
                        onOpen={() => navigation.navigate('PostDetail', { postId: item.id })}
                        onToggleSave={() => toggleSave(item)}
                        onDelete={() => deletePost(item)}
                        onMessageAuthor={() => navigation.navigate('Messages', { peerId: item.userId })}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createButton: {
        backgroundColor: 'rgba(92, 64, 232, 0.45)', // Premium purple core
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.35)', // Glowing edge
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    createButtonPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.9,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    filterButton: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    filterButtonActive: {
        borderColor: 'rgba(143, 117, 255, 0.8)',
        backgroundColor: 'rgba(92, 64, 232, 0.35)', // Deep active purple
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(226, 233, 255, 0.65)',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    stateText: {
        fontSize: 14,
        marginBottom: 8,
        color: 'rgba(238, 243, 255, 0.7)',
        textAlign: 'center',
        marginTop: 20,
    },
    listContent: {
        paddingBottom: 22,
    },
});
