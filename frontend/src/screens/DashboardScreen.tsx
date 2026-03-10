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
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { useCrisis } from '../context/CrisisContext';
import { copingActions, MoodCategory } from '../data/copingActions';
import { cacheDashboardInsights, getCachedDashboardInsights, getOfflineQueueCount } from '../offline/offlineEngine';
import { useAppTheme } from '../context/ThemeContext';
import SupportRecommendationCard from '../components/dashboard/SupportRecommendationCard';

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

function getMoodColor(moodCategory: string) {
    const mood = moodCategory.toLowerCase();
    if (mood.includes('calm') || mood.includes('happy')) return '#34D399';
    if (mood.includes('neutral')) return '#60A5FA';
    if (mood.includes('stressed')) return '#FACC15';
    if (mood.includes('anxious')) return '#FB923C';
    if (mood.includes('depressed') || mood.includes('sad')) return '#F87171';
    if (mood.includes('angry')) return '#F97316';
    return '#A78BFA';
}

function normalizeMoodForActivities(moodCategory: string): MoodCategory {
    const mood = String(moodCategory || '').toLowerCase();
    if (mood.includes('happy')) return 'Happy';
    if (mood.includes('calm')) return 'Calm';
    if (mood.includes('neutral')) return 'Neutral';
    if (mood.includes('stress')) return 'Stressed';
    if (mood.includes('anx')) return 'Anxious';
    if (mood.includes('sad')) return 'Sad';
    if (mood.includes('depress')) return 'Depressed';
    if (mood.includes('angry')) return 'Angry';
    return 'Unknown';
}

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
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { clearCrisisAlert } = useCrisis();
    const { theme } = useAppTheme();
    const [insights, setInsights] = useState<InsightResponse>(defaultInsights);
    const [loading, setLoading] = useState(false);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);

    const loadInsights = useCallback(async () => {
        setLoading(true);
        try {
            const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
            const sessionId = storedSession || 'anonymous-device';
            const response = await apiClient.get('/ai/dashboard-insights', {
                params: { sessionId },
            });
            setInsights({ ...defaultInsights, ...response.data });
            await cacheDashboardInsights(sessionId, { ...defaultInsights, ...response.data });
        } catch (error) {
            console.error('Failed to load dashboard insights', error);
            const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
            const sessionId = storedSession || 'anonymous-device';
            const cached = await getCachedDashboardInsights(sessionId);
            if (cached) {
                setInsights({ ...defaultInsights, ...cached });
            }
        } finally {
            const pendingCount = await getOfflineQueueCount();
            setPendingSyncCount(pendingCount);
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadInsights();
            clearCrisisAlert(); // Clear blinking alert when user views Dashboard
        }, [loadInsights, clearCrisisAlert])
    );

    const stressPercent = Math.max(10, Math.min(100, insights.latest.stressScore * 10));
    const energyPercent = Math.max(10, Math.min(100, (10 - insights.latest.stressScore) * 10));

    const trendBars = (insights.trend.length ? insights.trend : [
        { score: 5, moodCategory: 'Neutral' },
        { score: 6, moodCategory: 'Stressed' },
        { score: 4, moodCategory: 'Calm' },
        { score: 7, moodCategory: 'Anxious' },
        { score: 5, moodCategory: 'Neutral' },
        { score: 6, moodCategory: 'Stressed' },
        { score: 5, moodCategory: 'Neutral' },
    ]).slice(-7);

    const activeMood = normalizeMoodForActivities(insights.latest.moodCategory);

    const moodOrder: MoodCategory[] = [
        'Happy',
        'Calm',
        'Neutral',
        'Stressed',
        'Anxious',
        'Sad',
        'Depressed',
        'Angry',
    ];

    const moodCoverage = moodOrder.map((mood) => ({
        mood,
        count: copingActions.filter((item) => item.moods.includes(mood)).length,
    }));

    const activityCandidates = copingActions.filter((item) => item.moods.includes(activeMood));
    const availableActivities = activityCandidates.filter((item) => item.availability === 'available');
    const upcomingActivities = activityCandidates.filter((item) => item.availability === 'under-development');

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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.topHeader}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>U</Text>
                            </View>
                            <Text style={styles.greetingText}>{t('dashboard.greeting')}</Text>
                        </View>
                        <Text style={styles.greetingText}>{loading ? t('dashboard.syncing') : t('dashboard.insights')}</Text>
                    </View>

                    {pendingSyncCount > 0 ? (
                        <View style={styles.syncPendingPill}>
                            <Text style={styles.syncPendingText}>{t('dashboard.offline_items', { count: pendingSyncCount })}</Text>
                        </View>
                    ) : null}

                    <SupportRecommendationCard />

                    <View style={styles.emotionalStatusBar}>
                        <View style={styles.statusDotContainer}>
                            <View style={[styles.statusDot, { backgroundColor: getMoodColor(insights.latest.moodCategory) }]} />
                            <Text style={styles.statusDotLabel}>{insights.latest.moodCategory}</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusMetric}>
                            <Text style={styles.statusMetricLabel}>{t('dashboard.stress')}</Text>
                            <Text style={styles.statusMetricValue}>{insights.latest.stressScore}/10</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusMetric}>
                            <Text style={styles.statusMetricLabel}>{t('dashboard.trending')}</Text>
                            <Text style={styles.statusMetricValue}>{insights.trend.length > 0 ? '↓' : '→'}</Text>
                        </View>
                    </View>

                    {insights.latest.crisisDetected ? (
                        <View style={[styles.analyticsCard, styles.crisisCard, styles.topCrisisCard]}>
                            <View style={styles.crisisHeader}>
                                <Text style={styles.crisisAlertIcon}>🚨</Text>
                                <View style={styles.crisisHeaderContent}>
                                    <Text style={styles.crisisTitle}>{t('dashboard.crisis_title')}</Text>
                                    <Text style={styles.crisisSubtitle}>
                                        {t('dashboard.crisis_subtitle')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.helplinesList}>
                                {insights.helplines.map((line) => {
                                    // Extract first number before "/" or "or" separator
                                    const primaryPhone = line.phone.split(/\/|or/i)[0].trim();
                                    const phoneNumber = primaryPhone.replace(/[^0-9+]/g, '');
                                    return (
                                        <View key={line.name} style={styles.crisisHelplineItem}>
                                            <View style={styles.helplineIconContainer}>
                                                <Text style={styles.helplineIconText}>📞</Text>
                                            </View>
                                            <View style={styles.helplineInfo}>
                                                <Text style={styles.helplineName}>{line.name}</Text>
                                                <Text style={styles.helplinePhone}>{line.phone}</Text>
                                            </View>
                                            <View style={styles.helplineActions}>
                                                <Pressable
                                                    style={styles.callButton}
                                                    onPress={() => Linking.openURL(`tel:${phoneNumber}`).catch(() => { })}
                                                >
                                                    <Text style={styles.callButtonText}>📱 {t('dashboard.call')}</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={styles.websiteButton}
                                                    onPress={() => Linking.openURL(line.site).catch(() => { })}
                                                >
                                                    <Text style={styles.websiteButtonText}>→</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text style={styles.crisisFooter}>
                                {t('dashboard.crisis_footer')}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.mainQuestion}>{t('dashboard.help_prompt')}</Text>

                            <Pressable
                                style={styles.startConversationButton}
                                onPress={() => navigation.navigate('MitraChat')}
                            >
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonIcon}>{t('dashboard.chat_button')}</Text>
                                    <View style={styles.buttonTextWrapper}>
                                        <Text style={styles.buttonLabel}>{t('dashboard.start_conversation')}</Text>
                                        <Text style={styles.buttonHint}>{t('dashboard.share_thoughts')}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>{t('dashboard.your_insights')}</Text>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{t('dashboard.daily_mood_log')}</Text>
                            <Text style={styles.cardDate}>{t('dashboard.today')}</Text>
                        </View>
                        <View style={styles.moodVisualization}>
                            <View style={styles.moodIndicator}>
                                <View style={styles.moodRow}>
                                    <View style={[styles.moodColorDot, { backgroundColor: getMoodColor(insights.latest.moodCategory) }]} />
                                    <Text style={styles.moodEmoji}>{insights.latest.emoji}</Text>
                                </View>
                                <Text style={styles.moodLabel}>{insights.latest.moodCategory}</Text>
                            </View>
                            <View style={styles.moodStats}>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>{t('dashboard.stress_level')}</Text>
                                    <View style={styles.stressBar}>
                                        <View style={[styles.stressBarFill, { width: `${stressPercent}%` }]} />
                                    </View>
                                    <Text style={styles.statValue}>{insights.latest.stressScore}/10</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>{t('dashboard.energy')}</Text>
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
                            <Text style={styles.cardTitle}>{t('dashboard.weekly_mood_trend')}</Text>
                            <Text style={styles.cardDate}>{t('dashboard.last_7_days')}</Text>
                        </View>
                        <View style={styles.graphPlaceholder}>
                            <View style={styles.barChart}>
                                {trendBars.map((entry, idx) => {
                                    const heightPercent = Math.max(20, Math.min(95, (entry.score / 10) * 100));
                                    const barColor = entry.moodCategory ? getMoodColor(entry.moodCategory) : 'rgba(95, 129, 255, 0.6)';
                                    return (
                                        <View key={`${idx}-${heightPercent}`} style={[styles.bar, { height: `${heightPercent}%`, backgroundColor: barColor + '99' }]} />
                                    );
                                })}
                            </View>
                            <View style={styles.trendLegend}>
                                <Text style={styles.graphNote}>
                                    {t('dashboard.trend_legend', { avg: insights.summary.averageStress, count: insights.summary.entryCount })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{t('dashboard.coping_strategies')}</Text>
                            <Text style={styles.cardDate}>{activeMood}</Text>
                        </View>

                        <Text style={styles.strategySubtitle}>
                            {t('dashboard.strategy_subtitle')}
                        </Text>

                        <View style={styles.moodCoverageWrap}>
                            {moodCoverage.map((entry) => (
                                <View
                                    key={entry.mood}
                                    style={[
                                        styles.moodCoverageChip,
                                        entry.mood === activeMood ? styles.moodCoverageChipActive : null,
                                    ]}
                                >
                                    <Text style={styles.moodCoverageText}>{entry.mood}</Text>
                                    <Text style={styles.moodCoverageCount}>{entry.count}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.strategyGroupTitle}>{t('dashboard.ready_now')}</Text>
                        <View style={styles.activityList}>
                            {(availableActivities.length ? availableActivities : [{
                                id: 'fallback',
                                title: 'No direct match yet',
                                summary: 'Try opening MindSpace to explore nearby categories.',
                            }]).slice(0, 4).map((item) => (
                                <View style={styles.activityItem} key={item.id}>
                                    <Text style={styles.activityIcon}>Play</Text>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{item.title}</Text>
                                        <Text style={styles.activityTime}>{item.summary}</Text>
                                    </View>
                                    {item.id !== 'fallback' ? (
                                        <Pressable
                                            style={styles.activityCta}
                                            onPress={() => navigation.navigate('CopingActionGuide', { actionId: item.id })}
                                        >
                                            <Text style={styles.activityCtaText}>{t('dashboard.start')}</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.strategyGroupTitle, styles.strategyGroupTitleSecondary]}>{t('dashboard.under_development')}</Text>
                        <View style={styles.activityList}>
                            {(upcomingActivities.length ? upcomingActivities : [{
                                id: 'fallback-upcoming',
                                title: 'All good here',
                                summary: 'Current mood already has active options.',
                            }]).slice(0, 5).map((item) => (
                                <View style={styles.activityItem} key={item.id}>
                                    <Text style={styles.activityIcon}>Soon</Text>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{item.title}</Text>
                                        <Text style={styles.activityTime}>{item.summary}</Text>
                                    </View>
                                    <View style={styles.devPill}>
                                        <Text style={styles.devPillText}>{t('dashboard.under_development')}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{t('dashboard.interaction_history')}</Text>
                            <Text style={styles.cardDate}>{t('dashboard.recent')}</Text>
                        </View>
                        <View style={styles.activityList}>
                            {(insights.recentInteractions.length ? insights.recentInteractions : [
                                { text: t('dashboard.fallback_history'), createdAt: new Date().toISOString() },
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
        marginBottom: 12,
    },
    emotionalStatusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(143, 117, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.2)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 18,
        gap: 10,
    },
    statusDotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 2,
    },
    statusDotLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.85)',
    },
    statusMetric: {
        flex: 1,
        alignItems: 'center',
    },
    statusMetricLabel: {
        fontSize: 10,
        color: 'rgba(226, 233, 255, 0.65)',
        marginBottom: 2,
    },
    statusMetricValue: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(238, 243, 255, 0.9)',
    },
    statusDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    syncPendingPill: {
        alignSelf: 'flex-start',
        marginTop: 8,
        marginBottom: 12,
        backgroundColor: 'rgba(120, 176, 255, 0.2)',
        borderColor: 'rgba(170, 205, 255, 0.55)',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    syncPendingText: {
        color: 'rgba(230, 242, 255, 0.95)',
        fontSize: 11,
        fontWeight: '700',
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
    topCrisisCard: {
        borderWidth: 2,
        borderColor: 'rgba(255, 100, 100, 0.7)',
        backgroundColor: 'rgba(200, 50, 50, 0.25)',
        shadowColor: '#EF4444',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        marginBottom: 22,
    },
    crisisHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 14,
    },
    crisisAlertIcon: {
        fontSize: 28,
        marginTop: 2,
    },
    crisisHeaderContent: {
        flex: 1,
    },
    crisisTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FF6B6B',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    crisisSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 200, 200, 0.9)',
        lineHeight: 18,
        fontWeight: '500',
    },
    helplinesList: {
        gap: 10,
        marginBottom: 12,
    },
    crisisHelplineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 150, 150, 0.4)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 12,
    },
    helplineIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 100, 100, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helplineIconText: {
        fontSize: 18,
    },
    helplineInfo: {
        flex: 1,
    },
    helplineName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    helplinePhone: {
        fontSize: 12,
        color: 'rgba(255, 200, 200, 0.85)',
        fontWeight: '600',
    },
    helplineActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: 'rgba(255, 100, 100, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(255, 150, 150, 0.5)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    callButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    websiteButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 150, 150, 0.4)',
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    websiteButtonText: {
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: '700',
    },
    crisisFooter: {
        fontSize: 11,
        color: 'rgba(255, 220, 220, 0.85)',
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '600',
        paddingTop: 6,
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
    moodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    moodColorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
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
    trendLegend: {
        width: '100%',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    graphNote: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.55)',
        textAlign: 'center',
    },
    strategySubtitle: {
        fontSize: 12,
        color: 'rgba(228, 234, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
    },
    moodCoverageWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    moodCoverageChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(212, 202, 255, 0.35)',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    moodCoverageChipActive: {
        borderColor: 'rgba(195, 233, 255, 0.9)',
        backgroundColor: 'rgba(101, 156, 255, 0.24)',
    },
    moodCoverageText: {
        fontSize: 11,
        color: '#E8EEFF',
        fontWeight: '600',
    },
    moodCoverageCount: {
        minWidth: 18,
        textAlign: 'center',
        fontSize: 11,
        color: '#F5F8FF',
        fontWeight: '700',
    },
    strategyGroupTitle: {
        fontSize: 12,
        color: 'rgba(219, 229, 255, 0.9)',
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    strategyGroupTitleSecondary: {
        marginTop: 10,
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
    activityCta: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(188, 224, 255, 0.65)',
        backgroundColor: 'rgba(97, 149, 255, 0.24)',
    },
    activityCtaText: {
        color: '#F3F8FF',
        fontSize: 11,
        fontWeight: '700',
    },
    devPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 213, 145, 0.5)',
        backgroundColor: 'rgba(255, 173, 74, 0.2)',
    },
    devPillText: {
        color: '#FFE8C2',
        fontSize: 10,
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 20,
    },
});
