import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import Video from 'react-native-video';

export default function WelcomeScreen({ navigation }: any) {
    const handleStartChat = () => {
        navigation.replace('MainTabs', { screen: 'MitraChat' });
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
            <View style={styles.overlay} />
            
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.greeting}>
                        <Text style={styles.gradientStart}>Welcome</Text>{' '}
                        <Text style={styles.gradientMid}>to</Text>{' '}
                        <Text style={styles.gradientEnd}>Mitra</Text>
                    </Text>
                    
                    <Text style={styles.message}>
                        A private space to check in, reflect, and get calm, practical support.
                    </Text>

                    <Text style={styles.subMessage}>
                        Mitra is your AI companion for emotional well-being. Share how you feel and receive supportive guidance, anytime.
                    </Text>

                    <Text style={styles.finalMessage}>
                        Begin when you are ready.
                    </Text>

                    <Button 
                        title="Start Chatting with Mitra" 
                        onPress={handleStartChat}
                        color="#5B9BD5"
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
