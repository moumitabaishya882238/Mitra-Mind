import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_THEMES, AppTheme, DEFAULT_THEME, ThemeName } from '../theme/themes';

const STORAGE_THEME_KEY = 'mitra-theme-name';
const LEGACY_THEME_MAP: Record<string, ThemeName> = {
    'gemini-white': 'matrix-white',
};

type ThemeContextValue = {
    themeName: ThemeName;
    theme: AppTheme;
    setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    themeName: DEFAULT_THEME,
    theme: APP_THEMES[DEFAULT_THEME],
    setThemeName: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_THEME_KEY);
                if (!stored) {
                    return;
                }

                const mapped = LEGACY_THEME_MAP[stored] ?? stored;
                if (mapped in APP_THEMES) {
                    const validTheme = mapped as ThemeName;
                    setThemeNameState(validTheme);
                    if (mapped !== stored) {
                        AsyncStorage.setItem(STORAGE_THEME_KEY, validTheme).catch((error) => {
                            console.warn('Failed to migrate legacy theme preference', error);
                        });
                    }
                } else {
                    setThemeNameState(DEFAULT_THEME);
                    AsyncStorage.setItem(STORAGE_THEME_KEY, DEFAULT_THEME).catch((error) => {
                        console.warn('Failed to reset invalid theme preference', error);
                    });
                }
            } catch (error) {
                console.warn('Failed to load theme preference', error);
            }
        };

        load();
    }, []);

    const setThemeName = (name: ThemeName) => {
        setThemeNameState(name);
        AsyncStorage.setItem(STORAGE_THEME_KEY, name).catch((error) => {
            console.warn('Failed to save theme preference', error);
        });
    };

    const value = useMemo(() => {
        const safeThemeName = themeName in APP_THEMES ? themeName : DEFAULT_THEME;
        return {
            themeName: safeThemeName,
            theme: APP_THEMES[safeThemeName],
            setThemeName,
        };
    }, [themeName]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    return useContext(ThemeContext);
}
