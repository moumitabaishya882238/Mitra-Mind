import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const STORAGE_SESSION_KEY = 'mh-session-id';

export default function WelcomeScreen({ navigation }: any) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();

    const handleStartChat = async () => {
        try {
            // Check if user already has a unique ID
            let userId = await AsyncStorage.getItem(STORAGE_SESSION_KEY);

            // If not, create a new unique ID for this device
            if (!userId) {
                userId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                await AsyncStorage.setItem(STORAGE_SESSION_KEY, userId);
                console.log('✅ New unique user ID created:', userId);
            } else {
                console.log('✅ Existing user ID found:', userId);
            }

            // Navigate to the chat screen
            navigation.replace('MainTabs', { screen: 'MitraChat' });
        } catch (error) {
            console.error('Error handling session ID:', error);
            // Navigate anyway even if there's an error
            navigation.replace('MainTabs', { screen: 'MitraChat' });
        }
    };

    return (
        <View style={styles.fullContainer}>
            {/* Video background - place your video as welcome-video.mp4 in /frontend/assets/ */}
            <Video
                source={require('../../assets/welcome-video.mp4')}
                style={styles.videoBackground}
                resizeMode="cover"
                repeat={true}
                muted={true}
                paused={false}
            />

            {/* Overlay for better text readability */}
            <View
                style={[
                    styles.overlay,
                    { backgroundColor: theme.id === 'mitra-light' ? 'rgba(14, 32, 70, 0.42)' : 'rgba(0,0,0,0.55)' },
                ]}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.greeting}>
                        <Text style={[styles.gradientStart, { color: theme.colors.textPrimary }]}>{t('welcome.welcome')}</Text>{' '}
                        <Text style={[styles.gradientMid, { color: theme.colors.textSecondary }]}>{t('welcome.to')}</Text>{' '}
                        <Text style={[styles.gradientEnd, { color: theme.colors.accent }]}>{t('welcome.mitra')}</Text>
                    </Text>

                    <Text style={styles.message}>
                        {t('welcome.message')}
                    </Text>

                    <Text style={styles.subMessage}>
                        {t('welcome.sub_message')}
                    </Text>

                    <Text style={styles.finalMessage}>
                        {t('welcome.final_message')}
                    </Text>

                    <Button
                        title={t('welcome.button_title')}
                        onPress={handleStartChat}
                        color={theme.colors.accent}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundFallback: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: '#2C3E50',
        zIndex: -1,
    },
    videoBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: -1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        justifyContent: 'center',
        zIndex: 1,
    },
    content: {
        alignItems: 'center',
    },
    greeting: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 14,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    gradientStart: {
        color: '#D8EEFF',
    },
    gradientMid: {
        color: '#9FC9FF',
    },
    gradientEnd: {
        color: '#5B9BD5',
    },
    message: {
        fontSize: 17,
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 14,
        lineHeight: 24,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subMessage: {
        fontSize: 16,
        color: '#F0F0F0',
        textAlign: 'center',
        marginBottom: 22,
        lineHeight: 23,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    bold: {
        fontWeight: '700',
        color: '#5B9BD5',
    },
    finalMessage: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '600',
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
