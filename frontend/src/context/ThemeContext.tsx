import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_THEMES, AppTheme, DEFAULT_THEME, ThemeName } from '../theme/themes';

const STORAGE_THEME_KEY = 'mitra-theme-name';

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
                if (stored && stored in APP_THEMES) {
                    setThemeNameState(stored as ThemeName);
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

    const value = useMemo(
        () => ({
            themeName,
            theme: APP_THEMES[themeName],
            setThemeName,
        }),
        [themeName]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    return useContext(ThemeContext);
}
