import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>Anonymous Mode Enabled</Text>
                <Switch value={true} />
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>Allow Voice Output (TTS)</Text>
                <Switch value={true} />
            </View>

            <View style={styles.settingRow}>
                <Text style={styles.settingText}>Daily Check-in Reminder</Text>
                <Switch value={true} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    settingText: { fontSize: 16 }
});
