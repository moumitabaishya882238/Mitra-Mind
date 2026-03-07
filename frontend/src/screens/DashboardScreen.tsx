import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    ScrollView,
    Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/client';

type InsightResponse = {
    latest: {
        moodCategory: string;
        stressScore: number;
        crisisDetected: boolean;
        emoji: string;
    };
    trend: Array<{
        stressScore: number;
        score: number;
        moodCategory: string;
        date: string;
    }>;
    summary: {
        entryCount: number;
        averageStress: number;
    };
    copingStrategies: string[];
    recentInteractions: Array<{
        text: string;
        createdAt: string;
    }>;
    helplines: Array<{
        name: string;
        phone: string;
        site: string;
    }>;
};

const STORAGE_SESSION_KEY = 'mh-session-id';

const defaultInsights: InsightResponse = {
    latest: {
        moodCategory: 'Neutral',
        stressScore: 5,
        crisisDetected: false,
        emoji: '😐',
    },
    trend: [],
    summary: {
        entryCount: 0,
        averageStress: 5,
    },
    copingStrategies: [],
    recentInteractions: [],
    helplines: [],
};

function relativeTime(value: string) {
    const date = new Date(value).getTime();
    if (!date) return 'Recently';
    const diffMin = Math.max(1, Math.floor((Date.now() - date) / 60000));
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day ago`;
}

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [insights, setInsights] = useState<InsightResponse>(defaultInsights);
    const [loading, setLoading] = useState(false);

    const loadInsights = useCallback(async () => {
        setLoading(true);
        try {
            const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
            const sessionId = storedSession || 'anonymous-device';
            const response = await apiClient.get('/ai/dashboard-insights', {
                params: { sessionId },
            });
            setInsights({ ...defaultInsights, ...response.data });
        } catch (error) {
            console.error('Failed to load dashboard insights', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadInsights();
        }, [loadInsights])
    );

    const stressPercent = Math.max(10, Math.min(100, insights.latest.stressScore * 10));
    const energyPercent = Math.max(10, Math.min(100, (10 - insights.latest.stressScore) * 10));

    const trendBars = (insights.trend.length ? insights.trend : [
        { score: 5 }, { score: 6 }, { score: 4 }, { score: 7 }, { score: 5 }, { score: 6 }, { score: 5 },
    ]).slice(-7);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View style={styles.backgroundLayer}>
                <LinearGradient
                    colors={['#050A22', '#0E0D30', '#1B1240', '#2C1554']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.mainGradient}
                />
                <LinearGradient
                    colors={['rgba(95, 129, 255, 0.10)', 'transparent', 'rgba(154, 89, 255, 0.12)']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.gradientVeil}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.topHeader}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>U</Text>
                            </View>
                            <Text style={styles.greetingText}>Hi, there!</Text>
                        </View>
                        <Text style={styles.greetingText}>{loading ? 'Syncing...' : 'Insights'}</Text>
                    </View>

                    <Text style={styles.mainQuestion}>What can I help you with today?</Text>

                    <Pressable
                        style={styles.startConversationButton}
                        onPress={() => navigation.navigate('MitraChat')}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonIcon}>Chat</Text>
                            <View style={styles.buttonTextWrapper}>
                                <Text style={styles.buttonLabel}>Start Conversation</Text>
                                <Text style={styles.buttonHint}>Share your thoughts and feelings</Text>
                            </View>
                        </View>
                    </Pressable>

                    <Text style={styles.sectionTitle}>Your Insights</Text>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Daily Mood Log</Text>
                            <Text style={styles.cardDate}>Today</Text>
                        </View>
                        <View style={styles.moodVisualization}>
                            <View style={styles.moodIndicator}>
                                <Text style={styles.moodEmoji}>{insights.latest.emoji}</Text>
                                <Text style={styles.moodLabel}>{insights.latest.moodCategory}</Text>
                            </View>
                            <View style={styles.moodStats}>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Stress Level:</Text>
                                    <View style={styles.stressBar}>
                                        <View style={[styles.stressBarFill, { width: `${stressPercent}%` }]} />
                                    </View>
                                    <Text style={styles.statValue}>{insights.latest.stressScore}/10</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Energy:</Text>
                                    <View style={styles.energyBar}>
                                        <View style={[styles.energyBarFill, { width: `${energyPercent}%` }]} />
                                    </View>
                                    <Text style={styles.statValue}>{(energyPercent / 10).toFixed(1)}/10</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Weekly Mood Trend</Text>
                            <Text style={styles.cardDate}>Last 7 days</Text>
                        </View>
                        <View style={styles.graphPlaceholder}>
                            <View style={styles.barChart}>
                                {trendBars.map((entry, idx) => {
                                    const heightPercent = Math.max(20, Math.min(95, (entry.score / 10) * 100));
                                    return <View key={`${idx}-${heightPercent}`} style={[styles.bar, { height: `${heightPercent}%` }]} />;
                                })}
                            </View>
                            <Text style={styles.graphNote}>
                                Avg stress: {insights.summary.averageStress}/10 from {insights.summary.entryCount} entries
                            </Text>
                        </View>
                    </View>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Interaction History</Text>
                            <Text style={styles.cardDate}>Recent</Text>
                        </View>
                        <View style={styles.activityList}>
                            {(insights.recentInteractions.length ? insights.recentInteractions : [
                                { text: 'Start chatting to build your history', createdAt: new Date().toISOString() },
                            ]).map((item, idx) => (
                                <View style={styles.activityItem} key={`${item.createdAt}-${idx}`}>
                                    <Text style={styles.activityIcon}>Note</Text>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{item.text}</Text>
                                        <Text style={styles.activityTime}>{relativeTime(item.createdAt)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Personalized coping strategies</Text>
                            <Text style={styles.cardDate}>Live</Text>
                        </View>
                        <View style={styles.activityList}>
                            {(insights.copingStrategies.length ? insights.copingStrategies : [
                                'Start a conversation to receive personalized coping strategies.',
                            ]).slice(0, 4).map((strategy) => (
                                <View style={styles.activityItem} key={strategy}>
                                    <Text style={styles.activityIcon}>Tip</Text>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{strategy}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {insights.latest.crisisDetected ? (
                        <View style={[styles.analyticsCard, styles.crisisCard]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Urgent support resources</Text>
                                <Text style={styles.cardDate}>Important</Text>
                            </View>
                            <Text style={styles.crisisText}>
                                Potential crisis language detected. Please contact immediate help resources below.
                            </Text>
                            <View style={styles.activityList}>
                                {insights.helplines.map((line) => (
                                    <Pressable key={line.name} style={styles.activityItem} onPress={() => Linking.openURL(line.site)}>
                                        <Text style={styles.activityIcon}>SOS</Text>
                                        <View style={styles.activityInfo}>
                                            <Text style={styles.activityTitle}>{line.name}</Text>
                                            <Text style={styles.activityTime}>{line.phone}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 20,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(143, 117, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
        color: 'rgba(238, 243, 255, 0.95)',
        fontWeight: '700',
    },
    greetingText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.94)',
    },
    mainQuestion: {
        fontSize: 24,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.96)',
        marginBottom: 20,
        lineHeight: 32,
    },
    startConversationButton: {
        width: '100%',
        backgroundColor: 'rgba(143, 117, 255, 0.24)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.32)',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginBottom: 26,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    buttonIcon: {
        fontSize: 14,
        color: 'rgba(238, 243, 255, 0.94)',
        fontWeight: '700',
        width: 36,
    },
    buttonTextWrapper: {
        flex: 1,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.96)',
        marginBottom: 4,
    },
    buttonHint: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.65)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(238, 243, 255, 0.94)',
        marginBottom: 14,
        marginTop: 8,
    },
    analyticsCard: {
        backgroundColor: 'rgba(143, 117, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.26)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },
    crisisCard: {
        backgroundColor: 'rgba(183, 72, 72, 0.24)',
        borderColor: 'rgba(235, 128, 128, 0.48)',
    },
    crisisText: {
        color: 'rgba(255, 231, 231, 0.95)',
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.94)',
    },
    cardDate: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.65)',
    },
    moodVisualization: {
        gap: 12,
    },
    moodIndicator: {
        alignItems: 'center',
        gap: 6,
    },
    moodEmoji: {
        fontSize: 36,
    },
    moodLabel: {
        fontSize: 14,
        color: 'rgba(238, 243, 255, 0.86)',
        fontWeight: '500',
    },
    moodStats: {
        gap: 10,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.75)',
        minWidth: 75,
    },
    stressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    stressBarFill: {
        height: '100%',
        backgroundColor: 'rgba(255, 150, 130, 0.8)',
        borderRadius: 3,
    },
    energyBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    energyBarFill: {
        height: '100%',
        backgroundColor: 'rgba(130, 200, 255, 0.8)',
        borderRadius: 3,
    },
    statValue: {
        fontSize: 12,
        color: 'rgba(238, 243, 255, 0.8)',
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },
    graphPlaceholder: {
        alignItems: 'center',
        gap: 12,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 100,
        width: '100%',
        gap: 6,
    },
    bar: {
        flex: 1,
        backgroundColor: 'rgba(95, 129, 255, 0.6)',
        borderRadius: 4,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    graphNote: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.55)',
        textAlign: 'center',
    },
    activityList: {
        gap: 10,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
    },
    activityIcon: {
        fontSize: 12,
        color: 'rgba(238, 243, 255, 0.85)',
        fontWeight: '700',
        width: 28,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 13,
        color: 'rgba(238, 243, 255, 0.88)',
        fontWeight: '500',
    },
    activityTime: {
        fontSize: 11,
        color: 'rgba(226, 233, 255, 0.65)',
        marginTop: 2,
    },
    bottomSpacer: {
        height: 20,
    },
});
