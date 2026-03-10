import React, { useEffect, useState, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { onAINudge, offAINudge, AINudgeEventPayload } from '../../services/socketService';
import { useAppTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

const { width } = Dimensions.get('window');

const AINudgeNotification = () => {
    const [nudge, setNudge] = useState<AINudgeEventPayload | null>(null);
    const { theme } = useAppTheme();
    const { isConnected } = useSocket();
    const navigation = useNavigation<any>();
    const translateY = useRef(new Animated.Value(-200)).current;

    useEffect(() => {
        const handleNudge = (payload: AINudgeEventPayload) => {
            console.log('📬 Proactive Nudge Received:', payload.type);
            setNudge(payload);

            // Slide in animation
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
            }).start();

            // Auto-hide after 15 seconds if same nudge
            setTimeout(() => {
                hideNudge();
            }, 15000);
        };

        if (isConnected) {
            onAINudge(handleNudge);
        }

        return () => {
            offAINudge(handleNudge);
        };
    }, [isConnected]);

    const hideNudge = () => {
        Animated.timing(translateY, {
            toValue: -200,
            duration: 500,
            useNativeDriver: true,
        }).start(() => setNudge(null));
    };

    const handleAction = () => {
        if (!nudge) return;

        hideNudge();

        if (nudge.action === 'chat') {
            navigation.navigate('MainTabs', { screen: 'MitraChat' });
        } else if (nudge.action === 'coping') {
            navigation.navigate('MainTabs', { screen: 'Toolkit' });
        }
    };

    if (!nudge) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.accent,
                    shadowColor: theme.colors.accent,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
                    <Ionicons
                        name={nudge.type === 'STRESS_PEAK' ? 'flash-outline' : 'heart-outline'}
                        size={24}
                        color={theme.colors.accent}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        Mitra is thinking of you
                    </Text>
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                        {nudge.text}
                    </Text>
                </View>

                <TouchableOpacity onPress={hideNudge} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleAction}
                style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
            >
                <Text style={styles.actionText}>
                    {nudge.action === 'chat' ? 'Talk to Mitra' : 'Try an exercise'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 16,
        zIndex: 9999,
        elevation: 10,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    message: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
    actionButton: {
        marginTop: 14,
        height: 44,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default AINudgeNotification;
