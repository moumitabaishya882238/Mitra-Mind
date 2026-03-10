import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeContext';

const PostsScreen = require('./PostsScreen').default;
const MessagesScreen = require('./MessagesScreen').default;
const ListenersScreen = require('./ListenersScreen').default;

type CommunityTab = 'posts' | 'dms' | 'listeners';

export default function CommunityScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [tab, setTab] = useState<CommunityTab>('posts');

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

    const topTabs = useMemo(
        () => [
            { id: 'posts', label: t('community.posts') },
            { id: 'dms', label: t('community.dms') },
            { id: 'listeners', label: t('community.listeners') },
        ],
        [t]
    );

    const onPressTopTab = (id: string) => {
        setTab(id as CommunityTab);
    };

    return (
        <View style={[styles.container, { backgroundColor: '#020617' }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={theme.statusBarStyle} />

            <View style={styles.backgroundLayer}>
                <LinearGradient
                    // Richer, deeper space colors map
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
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('community.title')}</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('community.subtitle')}</Text>

                <View style={[styles.topTabs, { borderColor: 'rgba(212, 202, 255, 0.25)', backgroundColor: 'rgba(24, 32, 66, 0.55)' }]}>
                    {topTabs.map((item) => {
                        const active = item.id === tab;
                        return (
                            <Pressable
                                key={item.id}
                                style={[
                                    styles.topTabBtn,
                                    active && { backgroundColor: 'rgba(92, 64, 232, 0.85)', shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
                                ]}
                                onPress={() => onPressTopTab(item.id)}
                            >
                                <Text
                                    style={[
                                        styles.topTabLabel,
                                        {
                                            color: active ? '#FFFFFF' : 'rgba(238, 243, 255, 0.7)',
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.contentArea}>
                    {tab === 'posts' ? (
                        <PostsScreen navigation={navigation} embedded />
                    ) : tab === 'dms' ? (
                        <MessagesScreen navigation={navigation} embedded />
                    ) : (
                        <ListenersScreen navigation={navigation} />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070D2B', // Fallback deep space
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
        paddingHorizontal: 14,
        paddingTop: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    subtitle: {
        marginTop: 2,
        marginBottom: 10,
        fontSize: 13,
        color: 'rgba(235, 231, 255, 0.82)',
    },
    topTabs: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 4,
        flexDirection: 'row',
        gap: 6,
    },
    topTabBtn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    topTabLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    contentArea: {
        flex: 1,
        marginTop: 12,
    },
});
