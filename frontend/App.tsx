import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { CrisisProvider } from './src/context/CrisisContext';

const App = () => {
    return (
        <SafeAreaProvider>
            <CrisisProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </CrisisProvider>
        </SafeAreaProvider>
    );
};

export default App;
