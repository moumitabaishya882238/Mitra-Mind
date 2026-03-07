import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import ChatScreen from '../screens/ChatScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MoodTrackerScreen from '../screens/MoodTrackerScreen';
import CopingToolkitScreen from '../screens/CopingToolkitScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app sections
const MainTabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="MitraChat" component={ChatScreen} options={{ title: 'Chat' }} />
            <Tab.Screen name="Toolkit" component={CopingToolkitScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

// Root Stack Navigator
const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Starting with MoodTracker allows a quick check-in before the dashboard */}
            <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
