import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Mitra Dashboard</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Daily Mood Log</Text>
                <Text>Today you felt: Calm</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Weekly Emotion Trend</Text>
                <Text>[Graph placeholder]</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Stress Score</Text>
                <Text>Current Score: 4/10</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 }
});
