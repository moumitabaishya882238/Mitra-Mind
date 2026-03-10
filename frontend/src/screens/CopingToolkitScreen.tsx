import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    FlatList,
    Pressable,
    Alert,
    Linking,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { CopingAction, copingActions } from '../data/copingActions';
import { useAppTheme } from '../context/ThemeContext';

const MOODMAPS_URL = 'https://moodmaps.vercel.app';

export default function CopingToolkitScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { theme } = useAppTheme();
    const firstPlayable = useMemo(
        () => copingActions.find((action) => action.availability === 'available') || copingActions[0],
        []
    );
    const [selectedActionId, setSelectedActionId] = useState<string>(firstPlayable.id);

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

    const isUnderDevelopment = (action: CopingAction) => action.availability === 'under-development';

    const selectedAction = useMemo(
        () => copingActions.find((action) => action.id === selectedActionId) || copingActions[0],
        [selectedActionId]
    );

    const startSelectedAction = () => {
        if (isUnderDevelopment(selectedAction)) {
            return;
        }
        navigation.navigate('CopingActionGuide', { actionId: selectedAction.id });
    };

    const openMoodMaps = () => {
        Alert.alert(
            t('mindspace.alert_title'),
            t('mindspace.alert_msg'),
            [
                { text: t('mindspace.not_now'), style: 'cancel' },
                {
                    text: t('mindspace.continue'),
                    onPress: () => {
                        Linking.openURL(MOODMAPS_URL).catch(() => {
                            Alert.alert(t('mindspace.error_title'), t('mindspace.error_msg'));
                        });
                    },
                },
            ]
        );
    };

    const renderAction = ({ item }: { item: CopingAction }) => {
        const isSelected = item.id === selectedActionId;
        const underDevelopment = isUnderDevelopment(item);

        return (
            <Pressable
                onPress={() => {
                    if (!underDevelopment) {
                        setSelectedActionId(item.id);
                    }
                }}
                onLongPress={() => {
                    if (!underDevelopment) {
                        navigation.navigate('CopingActionGuide', { actionId: item.id });
                    }
                }}
                disabled={underDevelopment}
                style={({ pressed }) => [
                    styles.toolCard,
                    isSelected ? styles.toolCardSelected : null,
                    underDevelopment ? styles.toolCardUnderDevelopment : null,
                    pressed && !underDevelopment ? styles.toolCardPressed : null,
                ]}
            >
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.toolCategory}>{item.category}</Text>
                    <View style={styles.cardMetaRight}>
                        <Text style={styles.toolDuration}>{item.duration}</Text>
                        {underDevelopment ? <Text style={styles.underDevelopmentBadge}>Under Development</Text> : null}
                    </View>
                </View>
                <Text style={styles.toolTitle}>{t(`mindspace.actions.${item.id}.title`)}</Text>
                <Text style={styles.toolSummary}>{t(`mindspace.actions.${item.id}.summary`)}</Text>
                <View style={styles.cardFooterRow}>
                    <Text style={[styles.selectionLabel, isSelected ? styles.selectionLabelActive : null]}>
                        {underDevelopment ? t('mindspace.coming_soon') : isSelected ? t('mindspace.selected') : t('mindspace.tap_to_select')}
                    </Text>
                    <Text style={styles.longPressHint}>{underDevelopment ? t('mindspace.not_selectable') : t('mindspace.long_press_start')}</Text>
                </View>
            </Pressable>
        );
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
                <Text style={styles.title}>{t('mindspace.title')}</Text>
                <Text style={styles.subtitle}>
                    {t('mindspace.subtitle')}
                </Text>

                <Pressable onPress={startSelectedAction} style={({ pressed }) => [styles.startButton, pressed ? styles.startButtonPressed : null]}>
                    <Text style={styles.startButtonText}>{t('mindspace.start_prefix')}{t(`mindspace.actions.${selectedAction.id}.title`)}</Text>
                </Pressable>

                <Pressable onPress={openMoodMaps} style={({ pressed }) => [styles.moodMapsCard, pressed ? styles.moodMapsCardPressed : null]}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.toolCategory}>{t('mindspace.env_tool')}</Text>
                        <Text style={styles.moodMapsBadge}>MoodMaps</Text>
                    </View>
                    <Text style={styles.toolTitle}>MoodMaps</Text>
                    <Text style={styles.moodMapsSubtitle}>{t('mindspace.moodmaps_subtitle')}</Text>
                    <Text style={styles.toolSummary}>
                        {t('mindspace.moodmaps_summary')}
                    </Text>
                    <View style={styles.cardFooterRow}>
                        <Text style={styles.selectionLabelActive}>{t('mindspace.special')}</Text>
                        <Text style={styles.longPressHint}>{t('mindspace.tap_open_web')}</Text>
                    </View>
                </Pressable>

                <FlatList
                    data={copingActions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAction}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 12,
        color: '#FFFFFF',
    },
    subtitle: {
        color: 'rgba(235, 231, 255, 0.82)',
        fontSize: 14,
        marginBottom: 12,
    },
    startButton: {
        backgroundColor: 'rgba(92, 64, 232, 0.85)', // Premium purple core
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.45)', // Brighter glowing edge
        borderRadius: 14,
        paddingVertical: 14, // Slightly taller
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    startButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16, // Larger text for main CTA
        fontWeight: '700',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    toolCard: {
        backgroundColor: 'rgba(24, 32, 66, 0.45)', // Deep space glass
        borderRadius: 16, // Smoother corners
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.12)',
        padding: 18,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    toolCardSelected: {
        borderColor: 'rgba(143, 117, 255, 0.8)',
        backgroundColor: 'rgba(92, 64, 232, 0.25)', // active deep purple
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.45,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    toolCardPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.94,
    },
    moodMapsCard: {
        backgroundColor: 'rgba(23, 56, 68, 0.45)', // Deep space teal
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(103, 212, 197, 0.4)', // Glowing teal edge
        padding: 18,
        shadowColor: '#67D4C5',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    moodMapsCardPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.9,
    },
    moodMapsBadge: {
        color: '#D7FFF8',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    moodMapsSubtitle: {
        fontSize: 13,
        color: '#D2FFF9',
        marginBottom: 6,
        fontWeight: '600',
    },
    toolCardUnderDevelopment: {
        opacity: 0.62,
        borderColor: 'rgba(196, 183, 255, 0.28)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardMetaRight: {
        alignItems: 'flex-end',
    },
    toolCategory: {
        color: '#C9BCFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    toolDuration: {
        color: 'rgba(223, 214, 255, 0.85)',
        fontSize: 12,
        fontWeight: '600',
    },
    underDevelopmentBadge: {
        marginTop: 4,
        color: '#F5D8A8',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toolTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    toolSummary: {
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(238, 243, 255, 0.82)',
    },
    cardFooterRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionLabel: {
        color: 'rgba(214, 205, 255, 0.75)',
        fontSize: 11,
        fontWeight: '600',
    },
    selectionLabelActive: {
        color: '#FFFFFF',
    },
    longPressHint: {
        color: 'rgba(214, 205, 255, 0.75)',
        fontSize: 11,
    },
});
