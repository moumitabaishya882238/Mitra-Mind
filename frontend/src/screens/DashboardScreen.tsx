import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function DashboardScreen() {
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
                <View style={[styles.star, styles.star1]} />
                <View style={[styles.star, styles.star2]} />
                <View style={[styles.star, styles.star3]} />
                <View style={[styles.star, styles.star4]} />
                <View style={[styles.star, styles.star5]} />
                <View style={[styles.star, styles.star6]} />
                <View style={[styles.star, styles.star7]} />
                <View style={[styles.star, styles.star8]} />
                <View style={[styles.star, styles.star9]} />
                <View style={[styles.star, styles.star10]} />
                <View style={[styles.star, styles.star11]} />
                <View style={[styles.star, styles.star12]} />
                <View style={[styles.star, styles.star13]} />
                <View style={[styles.star, styles.star14]} />
                <View style={[styles.star, styles.star15]} />
                <View style={[styles.star, styles.star16]} />
                <View style={[styles.star, styles.star17]} />
                <View style={[styles.star, styles.star18]} />
                <View style={[styles.star, styles.star19]} />
                <View style={[styles.star, styles.star20]} />
                <View style={[styles.star, styles.star21]} />
                <View style={[styles.star, styles.star22]} />
                <View style={[styles.star, styles.star23]} />
                <View style={[styles.star, styles.star24]} />
                <View style={[styles.star, styles.star25]} />
                <View style={[styles.star, styles.star26]} />
                <View style={[styles.star, styles.star27]} />
                <View style={[styles.star, styles.star28]} />
                <View style={[styles.star, styles.star29]} />
                <View style={[styles.star, styles.star30]} />
                <View style={[styles.star, styles.star31]} />
                <View style={[styles.star, styles.star32]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Top Header with Avatar & Settings */}
                    <View style={styles.topHeader}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>👤</Text>
                            </View>
                            <Text style={styles.greetingText}>Hi, there!</Text>
                        </View>
                        <Pressable style={styles.settingsIcon}>
                            <Text style={styles.settingsIconText}>⚙</Text>
                        </Pressable>
                    </View>

                    {/* Main Question */}
                    <Text style={styles.mainQuestion}>What can I help you with today?</Text>

                    {/* Start Conversation Button - Full Width */}
                    <Pressable style={styles.startConversationButton}>
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonIcon}>💬</Text>
                            <View style={styles.buttonTextWrapper}>
                                <Text style={styles.buttonLabel}>Start Conversation</Text>
                                <Text style={styles.buttonHint}>Share your thoughts and feelings</Text>
                            </View>
                        </View>
                    </Pressable>

                    {/* Analytics Section */}
                    <Text style={styles.sectionTitle}>Your Insights</Text>

                    {/* Daily Mood Log Card */}
                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Daily Mood Log</Text>
                            <Text style={styles.cardDate}>Today</Text>
                        </View>
                        <View style={styles.moodVisualization}>
                            <View style={styles.moodIndicator}>
                                <Text style={styles.moodEmoji}>😌</Text>
                                <Text style={styles.moodLabel}>Calm</Text>
                            </View>
                            <View style={styles.moodStats}>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Stress Level:</Text>
                                    <View style={styles.stressBar}>
                                        <View style={[styles.stressBarFill, { width: '40%' }]} />
                                    </View>
                                    <Text style={styles.statValue}>4/10</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Energy:</Text>
                                    <View style={styles.energyBar}>
                                        <View style={[styles.energyBarFill, { width: '65%' }]} />
                                    </View>
                                    <Text style={styles.statValue}>6.5/10</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Weekly Trend Card */}
                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Weekly Mood Trend</Text>
                            <Text style={styles.cardDate}>Last 7 days</Text>
                        </View>
                        <View style={styles.graphPlaceholder}>
                            <View style={styles.barChart}>
                                <View style={[styles.bar, { height: '50%' }]} />
                                <View style={[styles.bar, { height: '65%' }]} />
                                <View style={[styles.bar, { height: '55%' }]} />
                                <View style={[styles.bar, { height: '70%' }]} />
                                <View style={[styles.bar, { height: '60%' }]} />
                                <View style={[styles.bar, { height: '75%' }]} />
                                <View style={[styles.bar, { height: '68%' }]} />
                            </View>
                            <Text style={styles.graphNote}>Mood trends will display here</Text>
                        </View>
                    </View>

                    {/* Activity Heatmap Card */}
                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Interaction History</Text>
                            <Text style={styles.cardDate}>Recent</Text>
                        </View>
                        <View style={styles.activityList}>
                            <View style={styles.activityItem}>
                                <Text style={styles.activityIcon}>📝</Text>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>Shared daily thoughts</Text>
                                    <Text style={styles.activityTime}>2 hours ago</Text>
                                </View>
                            </View>
                            <View style={styles.activityItem}>
                                <Text style={styles.activityIcon}>🧘</Text>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>Completed mindfulness exercise</Text>
                                    <Text style={styles.activityTime}>Yesterday</Text>
                                </View>
                            </View>
                            <View style={styles.activityItem}>
                                <Text style={styles.activityIcon}>💭</Text>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>Discussed coping strategies</Text>
                                    <Text style={styles.activityTime}>3 days ago</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Coping Toolkit Recommendation */}
                    <View style={styles.analyticsCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Recommended Tools</Text>
                            <Text style={styles.cardDate}>Based on mood</Text>
                        </View>
                        <View style={styles.toolsList}>
                            <Pressable style={styles.toolItem}>
                                <Text style={styles.toolIcon}>🎵</Text>
                                <Text style={styles.toolName}>Calming Music</Text>
                            </Pressable>
                            <Pressable style={styles.toolItem}>
                                <Text style={styles.toolIcon}>📱</Text>
                                <Text style={styles.toolName}>Breathing Exercises</Text>
                            </Pressable>
                            <Pressable style={styles.toolItem}>
                                <Text style={styles.toolIcon}>📚</Text>
                                <Text style={styles.toolName}>Articles</Text>
                            </Pressable>
                            <Pressable style={styles.toolItem}>
                                <Text style={styles.toolIcon}>📊</Text>
                                <Text style={styles.toolName}>Progress Tracking</Text>
                            </Pressable>
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
    star: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 50,
    },
    star1: { width: 1, height: 1, top: '8%', left: '15%' },
    star2: { width: 1.5, height: 1.5, top: '12%', left: '75%' },
    star3: { width: 1, height: 1, top: '20%', left: '10%' },
    star4: { width: 1, height: 1, top: '25%', right: '12%' },
    star5: { width: 1.2, height: 1.2, top: '35%', left: '22%' },
    star6: { width: 1, height: 1, top: '40%', right: '28%' },
    star7: { width: 1, height: 1, top: '45%', left: '8%' },
    star8: { width: 1, height: 1, top: '50%', right: '5%' },
    star9: { width: 1, height: 1, top: '55%', left: '85%' },
    star10: { width: 1, height: 1, top: '60%', left: '18%' },
    star11: { width: 1, height: 1, top: '65%', right: '35%' },
    star12: { width: 1, height: 1, top: '70%', left: '45%' },
    star13: { width: 1, height: 1, top: '75%', right: '18%' },
    star14: { width: 1, height: 1, top: '80%', left: '72%' },
    star15: { width: 1, height: 1, top: '85%', left: '12%' },
    star16: { width: 1, height: 1, top: '90%', right: '42%' },
    star17: { width: 1, height: 1, top: '15%', left: '48%' },
    star18: { width: 1, height: 1, top: '32%', left: '88%' },
    star19: { width: 1, height: 1, top: '38%', left: '5%' },
    star20: { width: 1, height: 1, top: '52%', left: '92%' },
    star21: { width: 1, height: 1, top: '58%', left: '35%' },
    star22: { width: 1, height: 1, top: '68%', left: '2%' },
    star23: { width: 1, height: 1, top: '78%', left: '78%' },
    star24: { width: 1, height: 1, top: '88%', left: '52%' },
    star25: { width: 1, height: 1, top: '22%', right: '8%' },
    star26: { width: 1, height: 1, top: '42%', right: '15%' },
    star27: { width: 1, height: 1, top: '62%', right: '48%' },
    star28: { width: 1, height: 1, top: '72%', right: '65%' },
    star29: { width: 1, height: 1, top: '82%', right: '25%' },
    star30: { width: 1, height: 1, top: '10%', left: '62%' },
    star31: { width: 1, height: 1, top: '48%', left: '68%' },
    star32: { width: 1, height: 1, top: '92%', left: '38%' },
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
        fontSize: 24,
    },
    greetingText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.94)',
    },
    settingsIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(152, 132, 255, 0.16)',
        borderWidth: 1,
        borderColor: 'rgba(220, 210, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIconText: {
        fontSize: 18,
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
        shadowColor: '#9075FF',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    buttonIcon: {
        fontSize: 28,
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
        backgroundColor: 'rgba(143, 117, 255, 0.20)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.26)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: 'rgba(143, 117, 255, 0.2)',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
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
        fontSize: 20,
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
    toolsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    toolItem: {
        width: '48%',
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(95, 129, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(95, 129, 255, 0.3)',
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
    },
    toolIcon: {
        fontSize: 20,
    },
    toolName: {
        fontSize: 12,
        color: 'rgba(238, 243, 255, 0.85)',
        fontWeight: '500',
        textAlign: 'center',
    },
    bottomSpacer: {
        height: 20,
    },
});
