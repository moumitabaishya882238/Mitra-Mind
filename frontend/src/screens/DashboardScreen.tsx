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
    Animated,
    Easing,
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
    const [graphType, setGraphType] = useState<'bar' | 'line'>('line');
    const [timeRange, setTimeRange] = useState<'weekly' | 'daily' | 'hourly'>('weekly');
    const [chartLayout, setChartLayout] = useState({ width: 0, height: 100 });

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

    // Star breathing/twinkling background animation
    const [starTwinkleAnim] = useState(new Animated.Value(0.3));
    React.useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(starTwinkleAnim, {
                    toValue: 0.8,
                    duration: 3500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(starTwinkleAnim, {
                    toValue: 0.3,
                    duration: 4000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [starTwinkleAnim]);

    const stressPercent = Math.max(10, Math.min(100, insights.latest.stressScore * 10));
    const energyPercent = Math.max(10, Math.min(100, (10 - insights.latest.stressScore) * 10));

    const baseTrend: any[] = insights.trend.length ? insights.trend : [
        { score: 5, moodCategory: 'Neutral' },
        { score: 6, moodCategory: 'Stressed' },
        { score: 4, moodCategory: 'Calm' },
        { score: 7, moodCategory: 'Anxious' },
        { score: 5, moodCategory: 'Neutral' },
        { score: 6, moodCategory: 'Stressed' },
        { score: 5, moodCategory: 'Neutral' },
    ];

    // Generate mock granular data based on baseTrend
    const getTrendDataForRange = () => {
        if (timeRange === 'weekly') {
            return baseTrend.slice(-7);
        }
        if (timeRange === 'daily') {
            // Expand to 24 hours (simulated hourly data)
            const dailyData = [];
            for (let i = 0; i < 24; i++) {
                const baseScore = baseTrend[baseTrend.length - 1].score;
                const variation = Math.sin(i / 3) * 2; // Create a wave pattern
                dailyData.push({
                    score: Math.max(1, Math.min(10, baseScore + variation)),
                    moodCategory: (baseScore + variation) > 6 ? 'Stressed' : 'Calm'
                });
            }
            return dailyData;
        }
        if (timeRange === 'hourly') {
            // Expand to 60 minutes (simulated minute data for last hour)
            const hourlyData = [];
            for (let i = 0; i < 60; i += 5) {
                const baseScore = baseTrend[baseTrend.length - 1].score;
                const variation = (Math.random() * 2) - 1; // Slight rapid variations
                hourlyData.push({
                    score: Math.max(1, Math.min(10, baseScore + variation)),
                    moodCategory: baseScore > 5 ? 'Anxious' : 'Neutral'
                });
            }
            return hourlyData;
        }
        return baseTrend;
    };

    const trendBars = getTrendDataForRange();

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
        <View style={[styles.container, { backgroundColor: '#020617' }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBarStyle} />

            <View style={styles.backgroundLayer}>
                <LinearGradient
                    // Richer, deeper space colors match ChatScreen
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
                <Animated.View style={[styles.star, styles.star1, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star2, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star3, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star4, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star5, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star6, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star7, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star8, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star9, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star10, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star11, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star12, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star13, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star14, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star15, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star16, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star17, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star18, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star19, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star20, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star21, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star22, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star23, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star24, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star25, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star26, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star27, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star28, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star29, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star30, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star31, { opacity: starTwinkleAnim }]} />
                <Animated.View style={[styles.star, styles.star32, { opacity: starTwinkleAnim }]} />
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
                        <View style={styles.graphHeaderRow}>
                            <View>
                                <Text style={styles.cardTitle}>Mood Trend</Text>
                                <View style={styles.timeRangeSelector}>
                                    <Pressable onPress={() => setTimeRange('weekly')}>
                                        <Text style={[styles.timeRangeText, timeRange === 'weekly' && styles.timeRangeTextActive]}>Weekly</Text>
                                    </Pressable>
                                    <View style={styles.timeRangeDivider} />
                                    <Pressable onPress={() => setTimeRange('daily')}>
                                        <Text style={[styles.timeRangeText, timeRange === 'daily' && styles.timeRangeTextActive]}>Daily</Text>
                                    </Pressable>
                                    <View style={styles.timeRangeDivider} />
                                    <Pressable onPress={() => setTimeRange('hourly')}>
                                        <Text style={[styles.timeRangeText, timeRange === 'hourly' && styles.timeRangeTextActive]}>Hourly</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={styles.graphToggleSlider}>
                                <Pressable
                                    style={[styles.graphToggleButton, graphType === 'bar' && styles.graphToggleButtonActive]}
                                    onPress={() => setGraphType('bar')}
                                >
                                    <Text style={[styles.graphToggleText, graphType === 'bar' && styles.graphToggleTextActive]}>Bar</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.graphToggleButton, graphType === 'line' && styles.graphToggleButtonActive]}
                                    onPress={() => setGraphType('line')}
                                >
                                    <Text style={[styles.graphToggleText, graphType === 'line' && styles.graphToggleTextActive]}>Line</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={styles.graphPlaceholder}>
                            {graphType === 'bar' ? (
                                <View style={styles.barChart}>
                                    {trendBars.map((entry, idx) => {
                                        const heightPercent = Math.max(20, Math.min(95, (entry.score / 10) * 100));
                                        const barColor = entry.moodCategory ? getMoodColor(entry.moodCategory) : 'rgba(95, 129, 255, 0.6)';
                                        return (
                                            <View key={`${idx}-${heightPercent}`} style={[styles.bar, { height: `${heightPercent}%`, backgroundColor: barColor + '99' }]} />
                                        );
                                    })}
                                </View>
                            ) : (
                                <View
                                    style={styles.lineChartContainer}
                                    onLayout={(e) => setChartLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
                                >
                                    {chartLayout.width > 0 && trendBars.map((entry, idx) => {
                                        const x = (idx / Math.max(1, trendBars.length - 1)) * chartLayout.width;
                                        const yPercent = 100 - Math.max(10, Math.min(95, (entry.score / 10) * 100));
                                        const y = (yPercent / 100) * chartLayout.height;
                                        const dotColor = entry.moodCategory ? getMoodColor(entry.moodCategory) : 'rgba(95, 129, 255, 1)';

                                        // Draw connecting line to previous point
                                        let lineFragment = null;
                                        if (idx > 0) {
                                            const prevEntry = trendBars[idx - 1];
                                            const prevX = ((idx - 1) / Math.max(1, trendBars.length - 1)) * chartLayout.width;
                                            const prevYPercent = 100 - Math.max(10, Math.min(95, (prevEntry.score / 10) * 100));
                                            const prevY = (prevYPercent / 100) * chartLayout.height;

                                            // Calculate distance and angle for CSS line
                                            const dx = x - prevX;
                                            const dy = y - prevY;
                                            const length = Math.sqrt(dx * dx + dy * dy);
                                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                                            const cx = (prevX + x) / 2;
                                            const cy = (prevY + y) / 2;

                                            lineFragment = (
                                                <View
                                                    key={`line-${idx}`}
                                                    style={[
                                                        styles.connectingLine,
                                                        {
                                                            left: cx - length / 2,
                                                            top: cy - 1, // height is 2, so center is at 1
                                                            width: length,
                                                            transform: [
                                                                { rotate: `${angle}deg` }
                                                            ]
                                                        }
                                                    ]}
                                                />
                                            );
                                        }

                                        return (
                                            <React.Fragment key={`frag-${idx}`}>
                                                {lineFragment}
                                                <View
                                                    key={`dot-${idx}`}
                                                    style={[
                                                        styles.lineChartDot,
                                                        { left: x, top: y, backgroundColor: dotColor, shadowColor: dotColor }
                                                    ]}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                </View>
                            )}

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

                    <SupportRecommendationCard />

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
        backgroundColor: '#070D2B',
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
    star: {
        position: 'absolute',
        width: 2.2,
        height: 2.2,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
    },
    star1: { top: '12%', left: '18%' },
    star2: { top: '16%', left: '72%' },
    star3: { top: '22%', left: '38%' },
    star4: { top: '28%', left: '86%' },
    star5: { top: '36%', left: '14%' },
    star6: { top: '44%', left: '64%' },
    star7: { top: '58%', left: '24%' },
    star8: { top: '68%', left: '78%' },
    star9: { top: '82%', left: '34%' },
    star10: { top: '88%', left: '62%' },
    star11: { top: '14%', left: '52%' },
    star12: { top: '31%', left: '9%' },
    star13: { top: '47%', left: '84%' },
    star14: { top: '63%', left: '56%' },
    star15: { top: '76%', left: '12%' },
    star16: { top: '92%', left: '80%' },
    star17: { top: '8%', left: '44%' },
    star18: { top: '11%', left: '81%' },
    star19: { top: '18%', left: '27%' },
    star20: { top: '24%', left: '63%' },
    star21: { top: '33%', left: '49%' },
    star22: { top: '39%', left: '77%' },
    star23: { top: '46%', left: '19%' },
    star24: { top: '53%', left: '69%' },
    star25: { top: '61%', left: '8%' },
    star26: { top: '67%', left: '42%' },
    star27: { top: '73%', left: '86%' },
    star28: { top: '79%', left: '58%' },
    star29: { top: '84%', left: '21%' },
    star30: { top: '89%', left: '47%' },
    star31: { top: '94%', left: '67%' },
    star32: { top: '97%', left: '33%' },
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
        backgroundColor: 'rgba(24, 32, 66, 0.65)', // Deep glass blue
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.15)',
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
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
        backgroundColor: 'rgba(92, 64, 232, 0.85)', // Premium purple core
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.45)', // Brighter glowing edge
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 28,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
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
        backgroundColor: 'rgba(24, 32, 66, 0.55)', // Deep space glass
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.12)',
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
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
    graphHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    timeRangeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    timeRangeText: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.45)', // subtly dimmed when inactive
        fontWeight: '500',
    },
    timeRangeTextActive: {
        color: 'rgba(143, 117, 255, 0.95)', // premium active purple
        fontWeight: '700',
    },
    timeRangeDivider: {
        width: 1,
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    graphToggleSlider: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    graphToggleButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    graphToggleButtonActive: {
        backgroundColor: 'rgba(143, 117, 255, 0.35)',
    },
    graphToggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(226, 233, 255, 0.6)',
    },
    graphToggleTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
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
        height: 8, // slightly thicker
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // brighter track
        borderRadius: 4,
        overflow: 'hidden',
    },
    stressBarFill: {
        height: '100%',
        backgroundColor: 'rgba(255, 150, 130, 0.8)',
        borderRadius: 3,
    },
    energyBar: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 4,
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
    lineChartContainer: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        position: 'relative',
        width: '100%',
        paddingHorizontal: 4,
        marginTop: 10,
    },
    lineChartDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: -5, // center offset
        marginTop: -5,  // center offset
        borderWidth: 2,
        borderColor: '#182042', // Background color for cutout effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10, // Dots on top of lines
    },
    connectingLine: {
        position: 'absolute',
        height: 2,
        backgroundColor: 'rgba(143, 117, 255, 0.45)', // Premium line color connecting dots
        zIndex: 5,
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
        borderColor: 'rgba(212, 202, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    moodCoverageChipActive: {
        borderColor: 'rgba(143, 117, 255, 0.8)',
        backgroundColor: 'rgba(92, 64, 232, 0.35)', // Deep active purple
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
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
