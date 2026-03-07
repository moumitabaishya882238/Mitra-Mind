import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCrisis } from '../context/CrisisContext';

// Import screens
import ChatScreen from '../screens/ChatScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CopingToolkitScreen from '../screens/CopingToolkitScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Blinking red badge component
const CrisisAlertBadge = () => {
    const { crisisAlertActive } = useCrisis();
    const blinkAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (crisisAlertActive) {
            const blinkAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnim, {
                        toValue: 0.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(blinkAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            blinkAnimation.start();
            return () => blinkAnimation.stop();
        } else {
            blinkAnim.setValue(0);
        }
    }, [crisisAlertActive, blinkAnim]);

    if (!crisisAlertActive) return null;

    return (
        <Animated.View style={[styles.crisisBadge, { opacity: blinkAnim }]} />
    );
};

// Bottom Tab Navigator for main app sections
const MainTabNavigator = () => {
    return (
        <Tab.Navigator 
            screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: '#8B5CF6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#1F2937',
                    borderTopColor: 'rgba(139, 92, 246, 0.2)',
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '700',
                    marginTop: -2,
                },
            }}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={DashboardScreen}
                options={{
                    tabBarIcon: () => <CrisisAlertBadge />,
                }}
            />
            <Tab.Screen 
                name="MitraChat" 
                component={ChatScreen} 
                options={{ 
                    title: 'Chat',
                    tabBarIcon: () => null,
                }} 
            />
            <Tab.Screen 
                name="Toolkit" 
                component={CopingToolkitScreen}
                options={{
                    tabBarIcon: () => null,
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                    tabBarIcon: () => null,
                }}
            />
        </Tab.Navigator>
    );
};

// Root Stack Navigator
const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Start with a warm welcome screen - no form, just friendly greeting */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    crisisBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#1F2937',
        shadowColor: '#EF4444',
        shadowOpacity: 0.9,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        marginBottom: 4,
    },
});

export default AppNavigator;
