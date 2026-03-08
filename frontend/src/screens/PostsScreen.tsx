import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import PostCard from '../components/community/PostCard';
import communityService, { CommunityFilter, CommunityPost } from '../services/communityService';

const STORAGE_SESSION_KEY = 'mh-session-id';

type Props = {
    navigation: any;
    embedded?: boolean;
};

export default function PostsScreen({ navigation }: Props) {
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [filter, setFilter] = useState<CommunityFilter>('all');
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<CommunityPost[]>([]);

    const filters = useMemo(
        () => [
            { id: 'all' as CommunityFilter, label: 'All Posts' },
            { id: 'mine' as CommunityFilter, label: 'My Posts' },
            { id: 'saved' as CommunityFilter, label: 'Saved Posts' },
        ],
        []
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
                style={[styles.createButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Text style={styles.createButtonText}>+ Share how you're feeling</Text>
            </Pressable>

            <View style={styles.filterRow}>
                {filters.map((item) => {
                    const active = item.id === filter;
                    return (
                        <Pressable
                            key={item.id}
                            style={[
                                styles.filterButton,
                                {
                                    borderColor: active ? theme.colors.accent : theme.colors.borderSoft,
                                    backgroundColor: active ? theme.colors.cardBg : 'transparent',
                                },
                            ]}
                            onPress={() => setFilter(item.id)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: active ? theme.colors.accent : theme.colors.textSecondary },
                                ]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {loading ? (
                <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>Loading posts...</Text>
            ) : null}

            {!loading && !posts.length ? (
                <Text style={[styles.stateText, { color: theme.colors.textSecondary }]}>No posts yet. Be the first to share.</Text>
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
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: 'center',
        marginBottom: 10,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    filterButton: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
    },
    stateText: {
        fontSize: 13,
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 22,
    },
});
