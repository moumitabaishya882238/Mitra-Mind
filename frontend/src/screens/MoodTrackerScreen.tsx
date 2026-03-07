import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function MoodTrackerScreen({ navigation }: any) {

    const handleMoodSelect = (mood: string) => {
        console.log("Selected Mood:", mood);
        // Note: Send mood to backend, then proceed to Dashboard
        navigation.replace('MainTabs');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>How are you feeling right now?</Text>

            <View style={styles.moodGrid}>
                <Button title="Happy 😊" onPress={() => handleMoodSelect('Happy')} />
                <Button title="Calm 😌" onPress={() => handleMoodSelect('Calm')} />
                <Button title="Stressed 😫" onPress={() => handleMoodSelect('Stressed')} />
                <Button title="Anxious 😰" onPress={() => handleMoodSelect('Anxious')} />
                <Button title="Sad 😔" onPress={() => handleMoodSelect('Sad')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    moodGrid: { width: '80%', gap: 15 },
});
