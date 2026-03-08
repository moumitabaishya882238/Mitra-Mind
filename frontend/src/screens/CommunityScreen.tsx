import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../context/ThemeContext';

const PostsScreen = require('./PostsScreen').default;
const MessagesScreen = require('./MessagesScreen').default;

type CommunityTab = 'posts' | 'dms';

export default function CommunityScreen({ navigation }: any) {
    const { theme } = useAppTheme();
    const [tab, setTab] = useState<CommunityTab>('posts');

    const topTabs = useMemo(
        () => [
            { id: 'ai', label: 'AI Chatbot' },
            { id: 'posts', label: 'Posts' },
            { id: 'dms', label: 'DMs' },
        ],
        []
    );

    const onPressTopTab = (id: string) => {
        if (id === 'ai') {
            // Keep AI companion as primary feature by redirecting directly to existing chat tab.
            navigation.navigate('MitraChat');
            return;
        }

        setTab(id as CommunityTab);
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
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Community Support</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Anonymous peer support</Text>

                <View style={[styles.topTabs, { borderColor: theme.colors.borderSoft, backgroundColor: theme.colors.cardBg }]}>
                    {topTabs.map((item) => {
                        const active = (item.id === 'posts' && tab === 'posts') || (item.id === 'dms' && tab === 'dms');
                        return (
                            <Pressable
                                key={item.id}
                                style={[
                                    styles.topTabBtn,
                                    active && { backgroundColor: theme.colors.accent },
                                ]}
                                onPress={() => onPressTopTab(item.id)}
                            >
                                <Text
                                    style={[
                                        styles.topTabLabel,
                                        {
                                            color: active ? '#FFFFFF' : theme.colors.textPrimary,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.contentArea}>
                    {tab === 'posts' ? (
                        <PostsScreen navigation={navigation} embedded />
                    ) : (
                        <MessagesScreen navigation={navigation} embedded />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        paddingHorizontal: 14,
        paddingTop: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 2,
        marginBottom: 10,
        fontSize: 13,
    },
    topTabs: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        gap: 6,
    },
    topTabBtn: {
        flex: 1,
        borderRadius: 9,
        paddingVertical: 8,
        alignItems: 'center',
    },
    topTabLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    contentArea: {
        flex: 1,
        marginTop: 12,
    },
});
