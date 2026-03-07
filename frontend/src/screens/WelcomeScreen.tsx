import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
// import Video from 'react-native-video';

export default function WelcomeScreen({ navigation }: any) {
    const handleStartChat = () => {
        navigation.replace('MainTabs', { screen: 'MitraChat' });
    };

    return (
        <View style={styles.fullContainer}>
            {/* 🎬 VIDEO BACKGROUND - Temporarily disabled */}
            {/* <Video
                source={require('../assets/welcome-video.mp4')}
                style={styles.videoBackground}
                resizeMode="cover"
                repeat
                muted
                controls={false}
            /> */}
            
            {/* Background color fallback */}
            <View style={styles.backgroundFallback} />
            
            {/* 🌫️ OVERLAY FOR BETTER TEXT READABILITY */}
            <View style={styles.overlay} />
            
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.greeting}>Welcome, Friend! 👋</Text>
                    
                    <Text style={styles.message}>
                        Are you feeling anxious? Stressed? Bad? Overwhelmed? Or maybe just need someone to listen?
                    </Text>

                    <Text style={styles.subMessage}>
                        You're in the right place. I'm <Text style={styles.bold}>Mitra</Text>, your AI companion. I'm here to listen, without judgment, and help you feel better.
                    </Text>

                    <View style={styles.features}>
                        <Text style={styles.featureItem}>✨ Share what's on your mind</Text>
                        <Text style={styles.featureItem}>💭 Get empathetic support</Text>
                        <Text style={styles.featureItem}>🛡️ Your conversations are anonymous</Text>
                        <Text style={styles.featureItem}>🌱 Learn coping strategies</Text>
                    </View>

                    <Text style={styles.finalMessage}>
                        Let's talk. Tell me how you're really feeling today.
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    message: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 26,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subMessage: {
        fontSize: 16,
        color: '#F0F0F0',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    bold: {
        fontWeight: '700',
        color: '#5B9BD5',
    },
    features: {
        marginVertical: 25,
        width: '100%',
        paddingHorizontal: 10,
    },
    featureItem: {
        fontSize: 15,
        color: '#FFF',
        marginVertical: 8,
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    finalMessage: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: '600',
        lineHeight: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
