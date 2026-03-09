import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import listenerService, { ListenerProfile } from '../services/listenerService';
import { BASE_URL } from '../api/client';

type Props = {
    route: {
        params?: {
            listenerId?: string;
        };
    };
    navigation: any;
};

function getProfileImageUri(profileImage?: string) {
    if (!profileImage) return '';
    const cleaned = profileImage.trim().replace(/\s+/g, '');
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return encodeURI(cleaned);
    }
    return encodeURI(`${BASE_URL}${cleaned}`);
}

export default function ListenerProfileScreen({ route, navigation }: Props) {
    const { theme } = useAppTheme();
    const listenerId = route?.params?.listenerId || '';
    const [profile, setProfile] = useState<ListenerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        if (!listenerId) return;
        setLoading(true);
        try {
            const response = await listenerService.getListenerProfile(listenerId);
            setProfile(response.listener);
        } catch (error) {
            console.error('Failed to load listener profile', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [listenerId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.screenBase }]}>
                <ActivityIndicator size="large" color={theme.colors.accent} style={styles.loader} />
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.screenBase }]}>
                <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                    Unable to load listener profile
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.screenBase }]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={[styles.headerCard, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                    <View style={styles.profileHeader}>
                        {profile.profileImage ? (
                            <Image
                                source={{ uri: getProfileImageUri(profile.profileImage) }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.borderSoft }]}>
                                <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'L'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.headerInfo}>
                            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{profile.name}</Text>
                            <Text style={[styles.role, { color: theme.colors.textSecondary }]}>{profile.role}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: profile.availabilityStatus === 'online' ? '#10B981' : '#6B7280' }]}>
                                <Text style={styles.statusText}>
                                    {profile.availabilityStatus === 'online' ? 'Online' : 'Offline'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Location */}
                {(profile.city || profile.state || profile.country) && (
                    <View style={[styles.section, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Location</Text>
                        <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
                            {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                        </Text>
                    </View>
                )}

                {/* Education & Background */}
                {(profile.educationLevel || profile.fieldOfStudy || profile.occupation) && (
                    <View style={[styles.section, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Education & Background</Text>
                        {profile.educationLevel && (
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Education:</Text>
                                <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{profile.educationLevel}</Text>
                            </View>
                        )}
                        {profile.fieldOfStudy && (
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Field of Study:</Text>
                                <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{profile.fieldOfStudy}</Text>
                            </View>
                        )}
                        {profile.occupation && (
                            <View style={styles.infoRow}>
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Occupation:</Text>
                                <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{profile.occupation}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Motivation */}
                {profile.motivation && (
                    <View style={[styles.section, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Why I Volunteer</Text>
                        <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>{profile.motivation}</Text>
                    </View>
                )}

                {/* Experience */}
                {profile.priorSupportExperience && (
                    <View style={[styles.section, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Prior Experience</Text>
                        <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>{profile.priorSupportExperience}</Text>
                    </View>
                )}

                {/* Verification Badge */}
                <View style={[styles.section, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderSoft }]}>
                    <View style={styles.verificationRow}>
                        <Text style={[styles.verificationText, { color: theme.colors.textSecondary }]}>
                            ✓ Verified Listener
                        </Text>
                        <Text style={[styles.verificationText, { color: theme.colors.textSecondary }]}>
                            ✓ Training Completed
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Pressable
                        style={[styles.button, { backgroundColor: theme.colors.accent, opacity: profile.availabilityStatus === 'online' ? 1 : 0.55 }]}
                        onPress={() => navigation.navigate('ListenerChat', {
                            listenerId: profile.id,
                            listenerDisplayName: profile.name,
                            userId: 'anonymous-device', // You might want to get this from context
                        })}
                        disabled={profile.availabilityStatus !== 'online'}
                    >
                        <Text style={styles.buttonText}>Start Chat</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.button, styles.buttonOutline, { borderColor: theme.colors.borderSoft }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>Go Back</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loader: {
        marginTop: 50,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 14,
    },
    headerCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: '700',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    section: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 13,
        lineHeight: 20,
    },
    infoRow: {
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    value: {
        fontSize: 13,
        lineHeight: 18,
    },
    verificationRow: {
        flexDirection: 'column',
        gap: 8,
    },
    verificationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionButtons: {
        gap: 10,
        marginTop: 8,
        marginBottom: 20,
    },
    button: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
