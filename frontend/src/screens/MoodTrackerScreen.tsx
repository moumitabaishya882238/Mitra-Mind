import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';

export default function MoodTrackerScreen({ navigation }: any) {
    const { theme } = useAppTheme();

    const handleMoodSelect = (mood: string) => {
        console.log("Selected Mood:", mood);
        // Note: Send mood to backend, then proceed to Dashboard
        navigation.replace('MainTabs');
    };

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
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>How are you feeling right now?</Text>

                    <View style={styles.moodGrid}>
                        <Button title="Happy 😊" onPress={() => handleMoodSelect('Happy')} />
                        <Button title="Calm 😌" onPress={() => handleMoodSelect('Calm')} />
                        <Button title="Stressed 😫" onPress={() => handleMoodSelect('Stressed')} />
                        <Button title="Anxious 😰" onPress={() => handleMoodSelect('Anxious')} />
                        <Button title="Sad 😔" onPress={() => handleMoodSelect('Sad')} />
                    </View>
                </View>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#FFFFFF',
    },
    moodGrid: {
        width: '80%',
        gap: 15,
    },
});
