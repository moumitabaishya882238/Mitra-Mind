import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';
import { APP_THEMES, ThemeName } from '../theme/themes';

export default function SettingsScreen() {
    const { theme, themeName, setThemeName } = useAppTheme();

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
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Choose app theme</Text>

                <View style={styles.themeList}>
                    {(Object.keys(APP_THEMES) as ThemeName[]).map((name) => {
                        const option = APP_THEMES[name];
                        const active = themeName === name;
                        return (
                            <Pressable
                                key={name}
                                style={[
                                    styles.themeRow,
                                    {
                                        backgroundColor: active ? theme.colors.cardBg : 'rgba(255,255,255,0.06)',
                                        borderColor: active ? theme.colors.accent : theme.colors.borderSoft,
                                    },
                                ]}
                                onPress={() => setThemeName(name)}
                            >
                                <View style={styles.themeSwatches}>
                                    <View style={[styles.swatch, { backgroundColor: option.gradients.main[0] }]} />
                                    <View style={[styles.swatch, { backgroundColor: option.gradients.main[1] }]} />
                                    <View style={[styles.swatch, { backgroundColor: option.gradients.main[2] }]} />
                                </View>
                                <Text style={[styles.themeLabel, { color: theme.colors.textPrimary }]}>{option.label}</Text>
                                <Text style={[styles.themeState, { color: active ? theme.colors.accent : theme.colors.textSecondary }]}>
                                    {active ? 'Active' : 'Tap'}
                                </Text>
                            </Pressable>
                        );
                    })}
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
        marginBottom: 8,
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    themeList: {
        marginTop: 4,
        gap: 10,
    },
    themeRow: {
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeSwatches: {
        flexDirection: 'row',
        gap: 6,
        marginRight: 10,
    },
    swatch: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    themeLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    themeState: {
        fontSize: 12,
        fontWeight: '700',
    },
});
