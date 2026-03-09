import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { useAppTheme } from '../../context/ThemeContext';

const STORAGE_SESSION_KEY = 'mh-session-id';

type Recommendation = {
    distressScore: number;
    tier: 'low' | 'medium' | 'high';
    recommendation: {
        primaryAction: string;
        supportLevel: number;
        actions: string[];
    };
};

function getTierLabel(tier: Recommendation['tier']) {
    if (tier === 'high') return 'High distress';
    if (tier === 'medium') return 'Medium distress';
    return 'Low distress';
}

export default function SupportRecommendationCard() {
    const { theme } = useAppTheme();
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Recommendation | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadRecommendation = async () => {
            setLoading(true);
            try {
                const sessionId = (await AsyncStorage.getItem(STORAGE_SESSION_KEY)) || 'anonymous-device';
                const response = await apiClient.get('/support/recommendation', {
                    params: { sessionId },
                });

                if (!mounted) return;
                setData(response.data as Recommendation);
            } catch (error) {
                console.error('Failed to load support recommendation', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadRecommendation();

        return () => {
            mounted = false;
        };
    }, []);

    const onPrimaryAction = () => {
        if (!data) return;

        if (data.tier === 'high') {
            navigation.navigate('Community');
            return;
        }

        if (data.tier === 'medium') {
            navigation.navigate('MitraChat');
            return;
        }

        navigation.navigate('Toolkit');
    };

    return (
        <View style={[styles.card, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.kicker, { color: theme.colors.textSecondary }]}>Mood-Aware Support Routing</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Support Recommendation</Text>

            {loading && !data ? (
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Calculating support layer...</Text>
            ) : null}

            {data ? (
                <>
                    <View style={styles.row}>
                        <Text style={[styles.badge, { color: theme.colors.accent, borderColor: theme.colors.accent }]}>
                            {getTierLabel(data.tier)}
                        </Text>
                        <Text style={[styles.scoreText, { color: theme.colors.textPrimary }]}>Distress Score: {data.distressScore}/100</Text>
                    </View>

                    <Text style={[styles.primaryAction, { color: theme.colors.textPrimary }]}>{data.recommendation.primaryAction}</Text>

                    <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Suggested action: {data.recommendation.actions[0]}</Text>

                    <Pressable style={[styles.button, { backgroundColor: theme.colors.accent }]} onPress={onPrimaryAction}>
                        <Text style={styles.buttonLabel}>Open Recommended Support</Text>
                    </Pressable>
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },
    kicker: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 10,
    },
    loadingText: {
        fontSize: 13,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        fontSize: 11,
        fontWeight: '800',
        overflow: 'hidden',
    },
    scoreText: {
        fontSize: 12,
        fontWeight: '700',
    },
    primaryAction: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 6,
    },
    actionText: {
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 10,
    },
    button: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
});
