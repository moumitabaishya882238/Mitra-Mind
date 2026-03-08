import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useCrisis } from '../context/CrisisContext';
import { useAppTheme } from '../context/ThemeContext';

// Import screens
import ChatScreen from '../screens/ChatScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CopingToolkitScreen from '../screens/CopingToolkitScreen';
import CopingActionGuideScreen from '../screens/CopingActionGuideScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type IconProps = {
    name: string;
    color: string;
    focused: boolean;
    showCrisisBadge?: boolean;
};

const TabIcon = ({ name, color, focused, showCrisisBadge = false }: IconProps) => (
    <View style={styles.tabIconWrap}>
        <Ionicons name={name} size={20} color={color} style={{ opacity: focused ? 1 : 0.92 }} />
        {showCrisisBadge ? <CrisisAlertBadge /> : null}
    </View>
);

// Blinking red badge component
const CrisisAlertBadge = () => {
    const { crisisAlertActive } = useCrisis();
    const { theme } = useAppTheme();
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

    return <Animated.View style={[styles.crisisBadge, { opacity: blinkAnim, backgroundColor: theme.colors.danger, borderColor: theme.colors.tabBg, shadowColor: theme.colors.danger }]} />;
};

// Bottom Tab Navigator for main app sections
const MainTabNavigator = () => {
    const { theme } = useAppTheme();

    return (
        <Tab.Navigator 
            screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: theme.colors.tabActive,
                tabBarInactiveTintColor: theme.colors.tabInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBg,
                    borderTopColor: theme.colors.tabBorder,
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
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} focused={focused} showCrisisBadge />
                    ),
                }}
            />
            <Tab.Screen 
                name="MitraChat" 
                component={ChatScreen} 
                options={{ 
                    title: 'Chat',
                    tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} focused={focused} />,
                }} 
            />
            <Tab.Screen 
                name="Toolkit" 
                component={CopingToolkitScreen}
                options={{
                    title: 'MindSpace',
                    tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'leaf' : 'leaf-outline'} color={color} focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />,
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} />,
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
            <Stack.Screen name="CopingActionGuide" component={CopingActionGuideScreen} />
            {/* Community stack routes are separated so posts and DM threads can open over tabs. */}
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabIconWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 18,
    },
    crisisBadge: {
        position: 'absolute',
        top: -2,
        right: -8,
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
    },
});

export default AppNavigator;
