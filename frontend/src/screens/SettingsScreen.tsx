import React from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View style={styles.backgroundLayer}>
                <LinearGradient
                    colors={['#050A22', '#0E0D30', '#1B1240', '#2C1554']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.mainGradient}
                />
                <LinearGradient
                    colors={['rgba(95, 129, 255, 0.10)', 'transparent', 'rgba(154, 89, 255, 0.12)']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.gradientVeil}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
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
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FFFFFF',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(223, 214, 255, 0.2)',
    },
    settingText: {
        fontSize: 16,
        color: '#FFFFFF',
    }
});
