import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { CrisisProvider } from './src/context/CrisisContext';
import { ThemeProvider } from './src/context/ThemeContext';
import apiClient from './src/api/client';
import { startOfflineSync } from './src/offline/offlineEngine';

const App = () => {
    useEffect(() => {
        const stopSync = startOfflineSync(apiClient);
        return () => {
            stopSync();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <CrisisProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </CrisisProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
