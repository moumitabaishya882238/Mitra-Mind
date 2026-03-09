import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import listenerService, { ListenerItem } from '../services/listenerService';
import { BASE_URL } from '../api/client';

const STORAGE_SESSION_KEY = 'mh-session-id';

function getProfileImageUri(profileImage?: string) {
    if (!profileImage) return '';
    const cleaned = profileImage.trim().replace(/\s+/g, '');
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return encodeURI(cleaned);
    }
    return encodeURI(`${BASE_URL}${cleaned}`);
}

type Props = {
    navigation: any;
};

export default function ListenersScreen({ navigation }: Props) {
    const { theme } = useAppTheme();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [listeners, setListeners] = useState<ListenerItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_SESSION_KEY)
            .then((sid) => setSessionId(sid || 'anonymous-device'))
            .catch(() => setSessionId('anonymous-device'));
    }, []);

    const loadListeners = useCallback(async () => {
        setLoading(true);
        try {
            const response = await listenerService.getListeners();
            setListeners(response.listeners || []);
        } catch (error) {
            console.error('Failed to load listeners', error);
            setListeners([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadListeners();
    }, [loadListeners]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.headerCard, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Verified Listener Network</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Connect with trained volunteers for human support.</Text>
            </View>

            {loading ? <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading listeners...</Text> : null}

            <FlatList
                data={listeners}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No verified listeners available right now.</Text>
                }
                renderItem={({ item, index }) => {
                    const imageUri = getProfileImageUri(item.profileImage);
                    const showImage = Boolean(imageUri) && !failedImageIds[item.id];
                    return (
                    <View style={[styles.card, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                        {showImage ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.profileImage}
                                resizeMode="cover"
                                onError={() => {
                                    setFailedImageIds((prev) => ({ ...prev, [item.id]: true }));
                                }}
                            />
                        ) : (
                            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.borderSoft }]}>
                                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                                    {item.name ? item.name.charAt(0).toUpperCase() : 'L'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cardContent}>
                            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{item.name || `Listener_${index + 1}`}</Text>
                            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Role: {item.role}</Text>
                            <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>Status: {item.availabilityStatus === 'online' ? 'Online' : 'Offline'}</Text>

                            <View style={styles.buttonRow}>
                                <Pressable
                                    style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.accent }]}
                                    onPress={() => navigation.navigate('ListenerProfile', {
                                        listenerId: item.id,
                                    })}
                                >
                                    <Text style={[styles.buttonLabel, { color: theme.colors.accent }]}>View Profile</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.colors.accent, opacity: item.availabilityStatus === 'online' ? 1 : 0.55 }]}
                                    onPress={() => navigation.navigate('ListenerChat', {
                                        listenerId: item.id,
                                        listenerDisplayName: item.name || `Listener_${index + 1}`,
                                        userId: sessionId,
                                    })}
                                    disabled={item.availabilityStatus !== 'online'}
                                >
                                    <Text style={[styles.buttonLabel, { color: '#FFFFFF' }]}>Start Chat</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    );
                }}
            />
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
        fontSize: 18,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
    },
    loadingText: {
        fontSize: 12,
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 8,
    },
    emptyText: {
        marginTop: 6,
        fontSize: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
    },
    meta: {
        fontSize: 12,
        marginBottom: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: 'center',
    },
    buttonPrimary: {
        // backgroundColor applied dynamically
    },
    buttonSecondary: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    buttonLabel: {
        fontSize: 12,
        fontWeight: '800',
    },
});
