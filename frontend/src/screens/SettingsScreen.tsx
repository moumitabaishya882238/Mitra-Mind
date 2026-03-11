import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    ScrollView,
    Alert,
    Linking,
    NativeModules,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../context/ThemeContext';
import { APP_THEMES, ThemeName } from '../theme/themes';

const LANGUAGES = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];

const LANGUAGE_KEY = 'user-language';

function resolveLandingHost(): string {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
        if (match?.[1]) {
            return match[1];
        }
    }

    if (Platform.OS === 'android') return '10.0.2.2';
    return 'localhost';
}

const LANDING_FEEDBACK_URL = `http://${resolveLandingHost()}:3000/feedback`;

export default function SettingsScreen() {
    const { theme, themeName, setThemeName } = useAppTheme();
    const { t, i18n } = useTranslation();

    const changeLanguage = async (code: string) => {
        await i18n.changeLanguage(code);
        await AsyncStorage.setItem(LANGUAGE_KEY, code);
    };

    const openFeedbackPage = async () => {
        try {
            await Linking.openURL(LANDING_FEEDBACK_URL);
        } catch {
            Alert.alert(t('settings.feedback_error_title'), t('settings.feedback_error_message'));
        }
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('settings.title')}</Text>

                    {/* Language Selection */}
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginTop: 10 }]}>
                        {t('settings.language_subtitle')}
                    </Text>
                    <View style={styles.listContainer}>
                        {LANGUAGES.map((lang) => {
                            const active = i18n.language === lang.code;
                            return (
                                <Pressable
                                    key={lang.code}
                                    style={[
                                        styles.itemRow,
                                        {
                                            backgroundColor: active ? theme.colors.cardBg : 'rgba(255,255,255,0.06)',
                                            borderColor: active ? theme.colors.accent : theme.colors.borderSoft,
                                        },
                                    ]}
                                    onPress={() => changeLanguage(lang.code)}
                                >
                                    <View style={styles.langInfo}>
                                        <Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{lang.native}</Text>
                                        <Text style={[styles.itemSubLabel, { color: theme.colors.textSecondary }]}>{lang.label}</Text>
                                    </View>
                                    <Text style={[styles.itemState, { color: active ? theme.colors.accent : theme.colors.textSecondary }]}>
                                        {active ? t('settings.active') : t('settings.tap')}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Theme Selection */}
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginTop: 25 }]}>
                        {t('settings.theme_subtitle')}
                    </Text>
                    <View style={styles.listContainer}>
                        {(Object.keys(APP_THEMES) as ThemeName[]).map((name) => {
                            const option = APP_THEMES[name];
                            const active = themeName === name;
                            return (
                                <Pressable
                                    key={name}
                                    style={[
                                        styles.itemRow,
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
                                    <Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{option.label}</Text>
                                    <Text style={[styles.itemState, { color: active ? theme.colors.accent : theme.colors.textSecondary }]}>
                                        {active ? t('settings.active') : t('settings.tap')}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginTop: 25 }]}>
                        {t('settings.support_subtitle')}
                    </Text>
                    <View style={styles.listContainer}>
                        <Pressable
                            style={[
                                styles.itemRow,
                                {
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    borderColor: theme.colors.borderSoft,
                                },
                            ]}
                            onPress={openFeedbackPage}
                        >
                            <View style={styles.langInfo}>
                                <Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{t('settings.feedback_label')}</Text>
                                <Text style={[styles.itemSubLabel, { color: theme.colors.textSecondary }]}>{t('settings.feedback_hint')}</Text>
                            </View>
                            <Text style={[styles.itemState, { color: theme.colors.textSecondary }]}>{t('settings.tap')}</Text>
                        </Pressable>
                    </View>
                </ScrollView>
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
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContainer: {
        marginTop: 4,
        gap: 10,
    },
    itemRow: {
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    langInfo: {
        flex: 1,
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
    itemLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    itemSubLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    itemState: {
        fontSize: 12,
        fontWeight: '700',
    },
});
