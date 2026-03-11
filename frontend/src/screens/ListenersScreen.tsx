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
            <View style={[styles.headerCard, { borderColor: 'rgba(142, 161, 255, 0.25)', backgroundColor: 'rgba(24, 32, 66, 0.55)' }]}>
                <Text style={styles.title}>Verified Listener Network</Text>
                <Text style={styles.subtitle}>Connect with trained volunteers for human support.</Text>
            </View>

            {loading ? <Text style={styles.loadingText}>Loading listeners...</Text> : null}

            <FlatList
                data={listeners}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No verified listeners available right now.</Text>
                }
                renderItem={({ item, index }) => {
                    const imageUri = getProfileImageUri(item.profileImage);
                    const showImage = Boolean(imageUri) && !failedImageIds[item.id];
                    return (
                        <View style={styles.card}>
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
                                <View style={[styles.profileImagePlaceholder, { backgroundColor: 'rgba(92, 64, 232, 0.25)' }]}>
                                    <Text style={styles.placeholderText}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : 'L'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <Text style={styles.name}>{item.name || `Listener_${index + 1}`}</Text>
                                <Text style={styles.meta}>Role: {item.role}</Text>
                                <Text style={styles.meta}>Status: {item.availabilityStatus === 'online' ? 'Online' : 'Offline'}</Text>

                                <View style={styles.buttonRow}>
                                    <Pressable
                                        style={[styles.button, styles.buttonSecondary]}
                                        onPress={() => navigation.navigate('ListenerProfile', {
                                            listenerId: item.id,
                                        })}
                                    >
                                        <Text style={styles.buttonLabelSecondary}>View Profile</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.button, styles.buttonPrimary, { opacity: item.availabilityStatus === 'online' ? 1 : 0.55 }]}
                                        onPress={() => navigation.navigate('ListenerChat', {
                                            listenerId: item.id,
                                            listenerDisplayName: item.name || `Listener_${index + 1}`,
                                            userId: sessionId,
                                        })}
                                        disabled={item.availabilityStatus !== 'online'}
                                    >
                                        <Text style={styles.buttonLabel}>Start Chat</Text>
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
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(235, 231, 255, 0.82)',
    },
    loadingText: {
        fontSize: 13,
        marginBottom: 8,
        color: 'rgba(238, 243, 255, 0.7)',
        textAlign: 'center',
        marginTop: 10,
    },
    listContent: {
        paddingBottom: 22,
    },
    emptyText: {
        marginTop: 14,
        fontSize: 13,
        textAlign: 'center',
        color: 'rgba(238, 243, 255, 0.65)',
    },
    card: {
        backgroundColor: 'rgba(24, 32, 66, 0.45)', // Deep space glass
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.12)',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    profileImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(143, 117, 255, 0.4)',
    },
    placeholderText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    cardContent: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
        color: '#FFFFFF', // Bright title
    },
    meta: {
        fontSize: 13,
        marginBottom: 2,
        color: 'rgba(226, 233, 255, 0.65)',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    button: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    buttonPrimary: {
        backgroundColor: 'rgba(92, 64, 232, 0.85)', // Premium purple core
        borderColor: 'rgba(223, 214, 255, 0.35)', // Brighter glowing edge
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonSecondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    buttonLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    buttonLabelSecondary: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(238, 243, 255, 0.9)',
    },
});
