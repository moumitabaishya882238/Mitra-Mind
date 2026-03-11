import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { CrisisProvider } from './src/context/CrisisContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SocketProvider } from './src/context/SocketContext';
import AINudgeNotification from './src/components/ai/AINudgeNotification';
import apiClient from './src/api/client';
import { startOfflineSync } from './src/offline/offlineEngine';
import './src/services/i18n';

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
                <SocketProvider>
                    <CrisisProvider>
                        <NavigationContainer>
                            <AppNavigator />
                            <AINudgeNotification />
                        </NavigationContainer>
                    </CrisisProvider>
                </SocketProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
