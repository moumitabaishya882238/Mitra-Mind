import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    Pressable,
    SafeAreaView,
    StatusBar,
    Linking,
    Animated,
    Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/client';
import { useCrisis } from '../context/CrisisContext';
import { useVoiceInput, useVoiceOutput } from '../hooks/useVoice';
import { buildOfflineChatResponse, enqueueOfflineChat, getOfflineQueueCount } from '../offline/offlineEngine';

type ChatMessage = {
    id: string;
    text: string;
    sender: 'user' | 'ai' | 'crisis-card';
    helplines?: HelplineResource[];
};

type EmotionAnalysis = {
    moodCategory: string;
    stressScore: number;
    distress: 'low' | 'moderate' | 'high';
};

type HelplineResource = {
    name: string;
    phone: string;
    site: string;
};

type CrisisData = {
    detected: boolean;
    helplines: HelplineResource[];
};

const STORAGE_SESSION_KEY = 'mh-session-id';

function getMoodColor(moodCategory: string) {
    const mood = moodCategory.toLowerCase();
    if (mood.includes('calm') || mood.includes('happy')) return '#34D399';
    if (mood.includes('neutral')) return '#60A5FA';
    if (mood.includes('stressed')) return '#FACC15';
    if (mood.includes('anxious')) return '#FB923C';
    if (mood.includes('depressed') || mood.includes('sad')) return '#F87171';
    return '#A78BFA';
}

export default function ChatScreen() {
    const { setCrisisAlert } = useCrisis();
    const [sessionId, setSessionId] = useState('anonymous-device');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: "Hi, I'm Mitra. I'm here to listen. How are you feeling today?", sender: 'ai' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [latestAnalysis, setLatestAnalysis] = useState<EmotionAnalysis | null>(null);
    const [crisisData, setCrisisData] = useState<CrisisData>({ detected: false, helplines: [] });
    const [enableTts, setEnableTts] = useState(true);
    const [pendingOfflineCount, setPendingOfflineCount] = useState(0);
    const showConversation = messages.length > 1;

    // Voice input/output hooks
    const voiceInput = useVoiceInput();
    const voiceOutput = useVoiceOutput();
    const isListening = voiceInput.isListening;
    const isSpeaking = voiceOutput.state === 'speaking';
    const isOrbIdle = !isListening && !isSpeaking;
    
    // Mic button animation
    const [micPulseAnim] = useState(new Animated.Value(1));
    const [orbIdleGlowAnim] = useState(new Animated.Value(0));
    const [orbListeningRingAnim] = useState(new Animated.Value(0));
    const [orbWaveAnim] = useState(new Animated.Value(0));
    const [orbPinkWaveAnim] = useState(new Animated.Value(0));

    // Animate mic button when listening
    useEffect(() => {
        if (isListening) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(micPulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(micPulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        } else {
            micPulseAnim.setValue(1);
        }
    }, [isListening, micPulseAnim]);

    // Idle orb glow animation
    useEffect(() => {
        if (!isOrbIdle) return;

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbIdleGlowAnim, {
                    toValue: 1,
                    duration: 1800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
                Animated.timing(orbIdleGlowAnim, {
                    toValue: 0,
                    duration: 1800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();

        return () => {
            loop.stop();
        };
    }, [isOrbIdle, orbIdleGlowAnim]);

    // Listening ring pulse animation
    useEffect(() => {
        if (!isListening) {
            orbListeningRingAnim.setValue(0);
            return;
        }

        const loop = Animated.loop(
            Animated.timing(orbListeningRingAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            })
        );
        loop.start();

        return () => {
            loop.stop();
            orbListeningRingAnim.setValue(0);
        };
    }, [isListening, orbListeningRingAnim]);

    // Speaking waveform animation
    useEffect(() => {
        if (!isSpeaking) {
            orbWaveAnim.setValue(0);
            return;
        }

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbWaveAnim, {
                    toValue: 1,
                    duration: 320,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(orbWaveAnim, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();

        return () => {
            loop.stop();
            orbWaveAnim.setValue(0);
        };
    }, [isSpeaking, orbWaveAnim]);

    // Outer pink aura waveform animation
    useEffect(() => {
        const duration = isListening ? 560 : isSpeaking ? 720 : 1800;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbPinkWaveAnim, {
                    toValue: 1,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
                Animated.timing(orbPinkWaveAnim, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();

        return () => {
            loop.stop();
        };
    }, [isListening, isSpeaking, orbPinkWaveAnim]);

    const orbIdleScale = orbIdleGlowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
    });
    const orbIdleOpacity = orbIdleGlowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.75, 1],
    });
    const listeningRingScale = orbListeningRingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.22],
    });
    const listeningRingOpacity = orbListeningRingAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 0],
    });
    const waveBar1Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 20],
    });
    const waveBar2Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 30],
    });
    const waveBar3Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 12],
    });
    const waveBar4Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [24, 36],
    });
    const waveBar5Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 10],
    });
    const waveBar6Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 28],
    });
    const waveBar7Height = orbWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 18],
    });
    const pinkWaveScaleX = orbPinkWaveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.12, 0.96],
    });
    const pinkWaveScaleY = orbPinkWaveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.9, 1.08],
    });
    const pinkWaveOpacity = orbPinkWaveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.24, 0.5],
    });
    const pinkWaveRotate = orbPinkWaveAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['-2deg', '2deg', '-2deg'],
    });

    useEffect(() => {
        const initializeSession = async () => {
            try {
                const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
                if (storedSession) {
                    setSessionId(storedSession);
                } else {
                    const generatedSession = `session-${Date.now()}`;
                    await AsyncStorage.setItem(STORAGE_SESSION_KEY, generatedSession);
                    setSessionId(generatedSession);
                }

                const queueCount = await getOfflineQueueCount();
                setPendingOfflineCount(queueCount);
            } catch (error) {
                console.warn('Session init failed', error);
            }
        };

        initializeSession();
    }, []);

    // Auto-send voice transcript when captured
    useEffect(() => {
        if (voiceInput.transcript && voiceInput.state === 'processing' && !isSending) {
            setInputText(voiceInput.transcript);
            // Delay to allow state update before sending
            const timer = setTimeout(() => {
                sendMessageWithText(voiceInput.transcript);
                voiceInput.clearTranscript();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [voiceInput.transcript, voiceInput.state, isSending]);

    const sendMessageWithText = async (text: string) => {
        if (!text.trim() || isSending) return;

        const userMsg = { id: Date.now().toString(), text: text.trim(), sender: 'user' as const };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsSending(true);

        try {
            const response = await apiClient.post('/ai/chat', {
                message: userMsg.text,
                language: 'en',
                sessionId,
            });

            const aiReply = response.data?.reply || "I'm here with you. Could you share a bit more?";
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                text: aiReply,
                sender: 'ai' as const,
            };
            setMessages((prev) => [...prev, aiMsg]);

            // Play TTS if enabled
            if (enableTts) {
                try {
                    await voiceOutput.speak(aiReply);
                } catch (err) {
                    console.warn('TTS failed silently, continuing:', err);
                }
            }

            if (response.data?.analysis) {
                setLatestAnalysis({
                    moodCategory: response.data.analysis.moodCategory || 'Unknown',
                    stressScore: Number(response.data.analysis.stressScore || 5),
                    distress: response.data.analysis.distress || 'low',
                });
            }

            if (response.data?.crisisDetected) {
                setCrisisData({
                    detected: true,
                    helplines: response.data?.helplines || [],
                });
                setCrisisAlert(true);
                
                const crisisMsg = {
                    id: (Date.now() + 2).toString(),
                    text: '',
                    sender: 'crisis-card' as const,
                    helplines: response.data?.helplines || [],
                };
                setMessages((prev) => [...prev, crisisMsg]);
            }

            const queueCount = await getOfflineQueueCount();
            setPendingOfflineCount(queueCount);
        } catch (error) {
            console.error('Failed to get AI response', error);

            await enqueueOfflineChat({
                message: userMsg.text,
                language: 'en',
                sessionId,
            });

            const offline = await buildOfflineChatResponse(userMsg.text, sessionId);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: offline.reply,
                sender: 'ai' as const,
            };
            setMessages((prev) => [...prev, errorMsg]);

            setLatestAnalysis({
                moodCategory: offline.analysis.moodCategory || 'Unknown',
                stressScore: Number(offline.analysis.stressScore || 5),
                distress:
                    offline.analysis.distress === 'high' || offline.analysis.distress === 'moderate'
                        ? offline.analysis.distress
                        : 'low',
            });

            const queueCount = await getOfflineQueueCount();
            setPendingOfflineCount(queueCount);
        } finally {
            setIsSending(false);
        }
    };

    const sendMessage = async () => {
        await sendMessageWithText(inputText);
    };

    const handleMicPress = useCallback(async () => {
        if (voiceInput.isListening) {
            await voiceInput.stopListening();
        } else {
            await voiceInput.startListening();
        }
    }, [voiceInput]);

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View style={styles.backgroundLayer}>
                <LinearGradient
                    colors={['#050A22', '#0E0D30', '#1B1240', '#2C1554']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.mainGradient}
                />
                <LinearGradient
                    colors={['rgba(95, 129, 255, 0.10)', 'transparent', 'rgba(154, 89, 255, 0.12)']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.gradientVeil}
                />
                <LinearGradient
                    colors={['rgba(75,118,255,0.16)', 'rgba(75,118,255,0.05)', 'transparent']}
                    start={{ x: 0.02, y: 0.08 }}
                    end={{ x: 0.98, y: 0.95 }}
                    style={styles.nebulaTop}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(162,84,255,0.12)', 'rgba(228,116,255,0.08)']}
                    start={{ x: 0.15, y: 0.15 }}
                    end={{ x: 0.95, y: 0.98 }}
                    style={styles.nebulaBottom}
                />
                <View style={[styles.star, styles.star1]} />
                <View style={[styles.star, styles.star2]} />
                <View style={[styles.star, styles.star3]} />
                <View style={[styles.star, styles.star4]} />
                <View style={[styles.star, styles.star5]} />
                <View style={[styles.star, styles.star6]} />
                <View style={[styles.star, styles.star7]} />
                <View style={[styles.star, styles.star8]} />
                <View style={[styles.star, styles.star9]} />
                <View style={[styles.star, styles.star10]} />
                <View style={[styles.star, styles.star11]} />
                <View style={[styles.star, styles.star12]} />
                <View style={[styles.star, styles.star13]} />
                <View style={[styles.star, styles.star14]} />
                <View style={[styles.star, styles.star15]} />
                <View style={[styles.star, styles.star16]} />
                <View style={[styles.star, styles.star17]} />
                <View style={[styles.star, styles.star18]} />
                <View style={[styles.star, styles.star19]} />
                <View style={[styles.star, styles.star20]} />
                <View style={[styles.star, styles.star21]} />
                <View style={[styles.star, styles.star22]} />
                <View style={[styles.star, styles.star23]} />
                <View style={[styles.star, styles.star24]} />
                <View style={[styles.star, styles.star25]} />
                <View style={[styles.star, styles.star26]} />
                <View style={[styles.star, styles.star27]} />
                <View style={[styles.star, styles.star28]} />
                <View style={[styles.star, styles.star29]} />
                <View style={[styles.star, styles.star30]} />
                <View style={[styles.star, styles.star31]} />
                <View style={[styles.star, styles.star32]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topBar}>
                    <View style={styles.titlePill}>
                        <Text style={styles.titlePillText}>Mitra 1.0</Text>
                    </View>
                </View>

                <Text style={styles.headerSubTitle}>Go ahead, I'm ready to assist</Text>

                <View style={styles.heroArea}>
                    <Animated.View style={[styles.orbAuraPrimary, { opacity: orbIdleOpacity }]} />
                    <View style={styles.orbAuraSecondary} />
                    <Animated.View
                        style={[
                            styles.orbAuraTertiary,
                            {
                                opacity: pinkWaveOpacity,
                                transform: [
                                    { scaleX: pinkWaveScaleX },
                                    { scaleY: pinkWaveScaleY },
                                    { rotate: pinkWaveRotate },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(255, 128, 218, 0.5)', 'rgba(202, 108, 255, 0.22)', 'rgba(255, 113, 208, 0.42)']}
                            start={{ x: 0.15, y: 0.1 }}
                            end={{ x: 0.92, y: 0.95 }}
                            style={styles.orbAuraTertiaryGradient}
                        />
                    </Animated.View>

                    {isListening ? (
                        <Animated.View
                            style={[
                                styles.orbListeningRing,
                                { transform: [{ scale: listeningRingScale }], opacity: listeningRingOpacity },
                            ]}
                        />
                    ) : null}

                    <Animated.View style={[styles.orbOuter, { transform: [{ scale: orbIdleScale }] }]}>
                        <LinearGradient
                            colors={
                                isListening
                                    ? ['#7AF2FF', '#3F88FF', '#8354FF', '#FF6A9F']
                                    : isSpeaking
                                      ? ['#89FFD1', '#45E0B3', '#4AB8FF', '#7E72FF']
                                      : ['#63E7FF', '#375DFF', '#7D43FF', '#FF5FCB']
                            }
                            start={{ x: 0.05, y: 0.1 }}
                            end={{ x: 0.95, y: 0.9 }}
                            style={styles.orbCore}
                        />
                        {isSpeaking ? (
                            <View style={styles.orbWaveContainer}>
                                <Animated.View style={[styles.orbWaveBar, styles.orbWaveBarOuter, { height: waveBar1Height }]} />
                                <Animated.View style={[styles.orbWaveBar, styles.orbWaveBarInner, { height: waveBar2Height }]} />
                                <Animated.View style={[styles.orbWaveBar, { height: waveBar3Height }]} />
                                <Animated.View style={[styles.orbWaveBar, styles.orbWaveBarCenter, { height: waveBar4Height }]} />
                                <Animated.View style={[styles.orbWaveBar, { height: waveBar5Height }]} />
                                <Animated.View style={[styles.orbWaveBar, styles.orbWaveBarInner, { height: waveBar6Height }]} />
                                <Animated.View style={[styles.orbWaveBar, styles.orbWaveBarOuter, { height: waveBar7Height }]} />
                            </View>
                        ) : null}
                    </Animated.View>

                    <Text style={styles.orbStateLabel}>
                        {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Idle'}
                    </Text>
                    {!showConversation ? (
                        <Text style={styles.heroQuestion}>
                            How can I <Text style={styles.heroQuestionStrong}>support</Text> you today?
                        </Text>
                    ) : null}
                </View>

                {showConversation ? (
                    <View style={styles.messageListContainer}>
                        {pendingOfflineCount > 0 ? (
                            <View style={styles.offlineQueuePill}>
                                <Text style={styles.offlineQueuePillText}>
                                    Offline saved messages: {pendingOfflineCount}
                                </Text>
                            </View>
                        ) : null}
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messageListContent}
                            renderItem={({ item }) => {
                                if (item.sender === 'crisis-card') {
                                    return (
                                        <View style={styles.crisisMessageCard}>
                                            <View style={styles.crisisHeader}>
                                                <Text style={styles.crisisAlertIcon}>🚨</Text>
                                                <View style={styles.crisisHeaderText}>
                                                    <Text style={styles.crisisTitle}>Immediate Support Available</Text>
                                                    <Text style={styles.crisisSubtitle}>We detected crisis language. Help is here.</Text>
                                                </View>
                                            </View>

                                            <Text style={styles.crisisResourcesLabel}>Crisis Resources:</Text>

                                            <View style={styles.helplinesList}>
                                                {item.helplines && item.helplines.length > 0 ? (
                                                    item.helplines.map((helpline, idx) => {
                                                        const primaryPhone = helpline.phone.split(/\/|or/i)[0].trim();
                                                        const phoneNumber = primaryPhone.replace(/[^0-9+]/g, '');
                                                        return (
                                                            <View key={idx} style={styles.helplineItem}>
                                                                <View style={styles.helplineHeader}>
                                                                    <Text style={styles.helplinePhoneIcon}>📱</Text>
                                                                    <Text style={styles.helplineName}>{helpline.name}</Text>
                                                                </View>
                                                                <Text style={styles.helplinePhone}>{helpline.phone}</Text>
                                                                <View style={styles.helplineActions}>
                                                                    <Pressable
                                                                        style={styles.callButton}
                                                                        onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
                                                                    >
                                                                        <Text style={styles.callButtonText}>📱 Call</Text>
                                                                    </Pressable>
                                                                    <Pressable
                                                                        style={styles.websiteButton}
                                                                        onPress={() => Linking.openURL(helpline.site)}
                                                                    >
                                                                        <Text style={styles.websiteButtonText}>→ Website</Text>
                                                                    </Pressable>
                                                                </View>
                                                            </View>
                                                        );
                                                    })
                                                ) : (
                                                    <Text style={styles.crisisResourcesLabel}>
                                                        Please contact local emergency services.
                                                    </Text>
                                                )}
                                            </View>

                                            <Text style={styles.crisisFooter}>
                                                You are not alone. Tap any resource above to get immediate help.
                                            </Text>
                                        </View>
                                    );
                                }

                                return (
                                    <View
                                        style={[
                                            styles.messageBubble,
                                            item.sender === 'user' ? styles.userBubble : styles.aiBubble,
                                        ]}
                                    >
                                        <Text style={styles.messageText}>{item.text}</Text>
                                    </View>
                                );
                            }}
                        />
                    </View>
                ) : (
                    <Text style={styles.helperText}>Type your thoughts below and press send.</Text>
                )}

                {latestAnalysis ? (
                    <View style={styles.analysisCard}>
                        <View style={[styles.analysisDot, { backgroundColor: getMoodColor(latestAnalysis.moodCategory) }]} />
                        <Text style={styles.analysisText}>Mood: {latestAnalysis.moodCategory}</Text>
                        <Text style={styles.analysisText}>Stress: {latestAnalysis.stressScore}/10</Text>
                        <Text style={styles.analysisText}>Distress: {latestAnalysis.distress}</Text>
                    </View>
                ) : null}

                {crisisData.detected ? (
                    <View style={[styles.crisisCard]}>
                        <View style={styles.crisisHeader}>
                            <Text style={styles.crisisAlertIcon}>🚨</Text>
                            <View style={styles.crisisHeaderText}>
                                <Text style={styles.crisisTitle}>Immediate Support Available</Text>
                                <Text style={styles.crisisSubtitle}>We detected crisis language. Help is here.</Text>
                            </View>
                        </View>

                        <Text style={styles.crisisResourcesLabel}>Crisis Resources:</Text>

                        <View style={styles.helplinesList}>
                            {crisisData.helplines.length > 0 ? (
                                crisisData.helplines.map((helpline, idx) => {
                                    // Extract first number before "/" or "or" separator
                                    const primaryPhone = helpline.phone.split(/\/|or/i)[0].trim();
                                    const phoneNumber = primaryPhone.replace(/[^0-9+]/g, '');
                                    return (
                                        <View key={idx} style={styles.helplineItem}>
                                            <View style={styles.helplineInfo}>
                                                <Text style={styles.helplineName}>{helpline.name}</Text>
                                                <Text style={styles.helplinePhone}>{helpline.phone}</Text>
                                            </View>
                                            <View style={styles.helplineActions}>
                                                <Pressable
                                                    style={styles.callButton}
                                                    onPress={() => Linking.openURL(`tel:${phoneNumber}`).catch(() => {})}
                                                >
                                                    <Text style={styles.callButtonText}>📱 Call</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={styles.websiteButton}
                                                    onPress={() => Linking.openURL(helpline.site).catch(() => {})}
                                                >
                                                    <Text style={styles.websiteButtonText}>→</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.noHelplines}>Loading resources...</Text>
                            )}
                        </View>

                        <Text style={styles.crisisFooter}>
                            You are not alone. Reach out to one of these resources immediately.
                        </Text>
                    </View>
                ) : null}

                <View style={styles.bottomDock}>
                    <View style={styles.inputContainer}>
                        <LinearGradient
                            pointerEvents="none"
                            colors={['rgba(210, 223, 255, 0.22)', 'rgba(210, 223, 255, 0.06)', 'rgba(210, 223, 255, 0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.inputGlassEdge}
                        />
                        {/* Mic Button */}
                        <Pressable
                            style={[styles.micButton, isListening && styles.micButtonActive]}
                            onPress={handleMicPress}
                            disabled={isSending}
                        >
                            <Animated.View style={{ transform: [{ scale: micPulseAnim }] }}>
                                <LinearGradient
                                    colors={
                                        isListening
                                            ? ['#FF6B6B', '#FF5252', '#FF3030']
                                            : ['#FF78D7', '#A25BFF', '#7B56FF']
                                    }
                                    start={{ x: 0.15, y: 0.1 }}
                                    end={{ x: 0.9, y: 1 }}
                                    style={styles.micButtonGradient}
                                >
                                    <Text style={styles.micButtonText}>
                                        {isListening ? '🎤' : '🎙'}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>
                            {isListening && <View style={styles.listeningIndicator} />}
                        </Pressable>

                        {/* Voice Status */}
                        {(voiceInput.isListening || voiceInput.state === 'processing') && (
                            <View style={styles.voiceStatusBadge}>
                                <Text style={styles.voiceStatusText}>
                                    {voiceInput.isListening ? '🎧 Listening...' : '✓ Got it'}
                                </Text>
                            </View>
                        )}

                        {voiceInput.error && (
                            <View style={styles.voiceErrorBadge}>
                                <Text style={styles.voiceErrorText}>⚠ {voiceInput.error}</Text>
                            </View>
                        )}

                        {/* Text Input */}
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder={
                                voiceInput.isListening
                                    ? 'Listening for your voice...'
                                    : 'Speak or type your thoughts'
                            }
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                            editable={!voiceInput.isListening && !isSending}
                        />

                        {/* TTS Toggle */}
                        <Pressable
                            style={[styles.ttsButton, enableTts && styles.ttsButtonActive]}
                            onPress={() => setEnableTts(!enableTts)}
                        >
                            <LinearGradient
                                colors={
                                    enableTts ? ['#34D399', '#10B981', '#059669'] : ['rgba(52, 211, 153, 0.4)', 'rgba(16, 185, 129, 0.3)']
                                }
                                start={{ x: 0.2, y: 0.1 }}
                                end={{ x: 0.9, y: 0.9 }}
                                style={styles.ttsButtonGradient}
                            >
                                <Text style={styles.ttsButtonText}>{enableTts ? '🔊' : '🔇'}</Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Send Button */}
                        <Pressable style={styles.sendButton} onPress={sendMessage} disabled={isSending || !inputText.trim()}>
                            <LinearGradient
                                colors={['#955CFF', '#6E4CE8']}
                                start={{ x: 0.2, y: 0.1 }}
                                end={{ x: 0.9, y: 0.9 }}
                                style={styles.sendButtonGradient}
                            >
                                <Text style={styles.sendButtonText}>{isSending ? '...' : '↗'}</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070D2B',
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    mainGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 1,
    },
    gradientVeil: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.9,
    },
    nebulaTop: {
        position: 'absolute',
        top: -30,
        left: -30,
        right: -30,
        bottom: -30,
        opacity: 0.78,
    },
    nebulaBottom: {
        position: 'absolute',
        top: -30,
        left: -30,
        right: -30,
        bottom: -30,
        opacity: 0.7,
    },
    star: {
        position: 'absolute',
        width: 1.8,
        height: 1.8,
        borderRadius: 2,
        backgroundColor: 'rgba(236, 243, 255, 0.48)',
    },
    star1: { top: '12%', left: '18%' },
    star2: { top: '16%', left: '72%' },
    star3: { top: '22%', left: '38%' },
    star4: { top: '28%', left: '86%' },
    star5: { top: '36%', left: '14%' },
    star6: { top: '44%', left: '64%' },
    star7: { top: '58%', left: '24%' },
    star8: { top: '68%', left: '78%' },
    star9: { top: '82%', left: '34%' },
    star10: { top: '88%', left: '62%' },
    star11: { top: '14%', left: '52%' },
    star12: { top: '31%', left: '9%' },
    star13: { top: '47%', left: '84%' },
    star14: { top: '63%', left: '56%' },
    star15: { top: '76%', left: '12%' },
    star16: { top: '92%', left: '80%' },
    star17: { top: '8%', left: '44%' },
    star18: { top: '11%', left: '81%' },
    star19: { top: '18%', left: '27%' },
    star20: { top: '24%', left: '63%' },
    star21: { top: '33%', left: '49%' },
    star22: { top: '39%', left: '77%' },
    star23: { top: '46%', left: '19%' },
    star24: { top: '53%', left: '69%' },
    star25: { top: '61%', left: '8%' },
    star26: { top: '67%', left: '42%' },
    star27: { top: '73%', left: '86%' },
    star28: { top: '79%', left: '58%' },
    star29: { top: '84%', left: '21%' },
    star30: { top: '89%', left: '47%' },
    star31: { top: '94%', left: '67%' },
    star32: { top: '97%', left: '33%' },
    safeArea: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 14,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    titlePill: {
        paddingHorizontal: 26,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(143, 117, 255, 0.16)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.2)',
    },
    titlePillText: {
        fontSize: 15,
        lineHeight: 18,
        fontWeight: '600',
        color: 'rgba(238, 243, 255, 0.94)',
        letterSpacing: 0.2,
    },
    headerSubTitle: {
        textAlign: 'center',
        color: 'rgba(226, 233, 255, 0.86)',
        fontSize: 15,
        lineHeight: 21,
        marginTop: 2,
        marginBottom: 22,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    heroArea: {
        alignItems: 'center',
        marginTop: 2,
    },
    orbAuraPrimary: {
        position: 'absolute',
        top: 8,
        width: 236,
        height: 236,
        borderRadius: 118,
        backgroundColor: 'rgba(179, 88, 255, 0.08)',
        shadowColor: '#BC71FF',
        shadowOpacity: 0.32,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
        elevation: 1,
    },
    orbAuraSecondary: {
        position: 'absolute',
        top: 15,
        width: 224,
        height: 224,
        borderRadius: 112,
        backgroundColor: 'rgba(109, 118, 255, 0.06)',
    },
    orbAuraTertiary: {
        position: 'absolute',
        top: 30,
        width: 196,
        height: 196,
        borderRadius: 98,
        overflow: 'hidden',
    },
    orbAuraTertiaryGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 98,
    },
    orbListeningRing: {
        position: 'absolute',
        top: 0,
        width: 214,
        height: 214,
        borderRadius: 107,
        borderWidth: 2,
        borderColor: 'rgba(122, 242, 255, 0.9)',
        backgroundColor: 'rgba(122, 242, 255, 0.12)',
    },
    orbOuter: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(91, 82, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(186, 202, 255, 0.26)',
        shadowColor: '#83A6FF',
        shadowOpacity: 0.55,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    orbCore: {
        width: 188,
        height: 188,
        borderRadius: 94,
        borderWidth: 2,
        borderColor: 'rgba(232, 241, 255, 0.34)',
    },
    orbWaveContainer: {
        position: 'absolute',
        bottom: 36,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 6,
    },
    orbWaveBar: {
        width: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(238, 255, 246, 0.95)',
        shadowColor: '#75FFC3',
        shadowOpacity: 0.6,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
    },
    orbWaveBarCenter: {
        width: 9,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
    },
    orbWaveBarInner: {
        opacity: 0.9,
    },
    orbWaveBarOuter: {
        opacity: 0.75,
    },
    orbStateLabel: {
        marginTop: 12,
        color: 'rgba(223, 238, 255, 0.86)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    heroQuestion: {
        marginTop: 30,
        fontSize: 23,
        lineHeight: 32,
        textAlign: 'center',
        color: 'rgba(225, 232, 248, 0.80)',
        fontWeight: '400',
        paddingHorizontal: 14,
    },
    heroQuestionStrong: {
        color: '#FFFFFF',
        fontWeight: '700',
        textShadowColor: 'rgba(160, 140, 255, 0.85)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    messageListContainer: {
        flex: 1,
        marginTop: 18,
        marginBottom: 10,
    },
    offlineQueuePill: {
        alignSelf: 'flex-start',
        marginBottom: 8,
        backgroundColor: 'rgba(120, 176, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(170, 205, 255, 0.55)',
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    offlineQueuePillText: {
        color: 'rgba(230, 242, 255, 0.95)',
        fontSize: 11,
        fontWeight: '700',
    },
    messageListContent: {
        paddingBottom: 12,
        gap: 10,
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        maxWidth: '84%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(101, 154, 255, 0.95)',
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
        color: '#FFFFFF',
    },
    helperText: {
        marginTop: 18,
        marginBottom: 12,
        textAlign: 'center',
        color: 'rgba(214, 223, 245, 0.58)',
        fontSize: 12,
    },
    analysisCard: {
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(194, 208, 255, 0.22)',
        backgroundColor: 'rgba(12, 18, 46, 0.56)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    analysisDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    analysisText: {
        color: 'rgba(232, 240, 255, 0.90)',
        fontSize: 11,
        fontWeight: '600',
    },
    bottomDock: {
        marginTop: 'auto',
    },
    micButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 226, 255, 0.5)',
        shadowColor: '#C26AFF',
        shadowOpacity: 0.55,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    micButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    micButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
        textShadowColor: 'rgba(74, 26, 131, 0.45)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(194, 208, 255, 0.18)',
        backgroundColor: 'rgba(11, 14, 36, 0.56)',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 6,
        shadowColor: '#6A86FF',
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    inputGlassEdge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 24,
    },
    input: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: 'transparent',
        color: '#EDF4FF',
        paddingHorizontal: 8,
        paddingVertical: 10,
        fontSize: 13,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(181, 153, 255, 0.82)',
        shadowColor: '#946BFF',
        shadowOpacity: 0.55,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    sendButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#E8DEFF',
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 22,
    },
    crisisCard: {
        marginBottom: 12,
        marginHorizontal: 0,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(235, 128, 128, 0.5)',
        backgroundColor: 'rgba(183, 72, 72, 0.18)',
        shadowColor: '#EF4444',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    crisisMessageCard: {
        marginVertical: 8,
        marginHorizontal: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(235, 128, 128, 0.5)',
        backgroundColor: 'rgba(183, 72, 72, 0.18)',
        shadowColor: '#EF4444',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        maxWidth: '92%',
        alignSelf: 'flex-start',
    },
    crisisHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 12,
    },
    crisisAlertIcon: {
        fontSize: 24,
        marginTop: 2,
    },
    crisisHeaderText: {
        flex: 1,
    },
    crisisTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FF6B6B',
        marginBottom: 2,
    },
    crisisSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 200, 200, 0.85)',
        lineHeight: 16,
    },
    crisisResourcesLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 180, 180, 0.9)',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    helplinesList: {
        gap: 8,
        marginBottom: 10,
    },
    helplineItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(235, 128, 128, 0.3)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    helplineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    helplinePhoneIcon: {
        fontSize: 16,
    },
    helplineInfo: {
        flex: 1,
    },
    helplineName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
        flex: 1,
    },
    helplinePhone: {
        fontSize: 11,
        color: 'rgba(255, 200, 200, 0.8)',
        fontWeight: '500',
        marginBottom: 8,
    },
    helplineActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: 'rgba(255, 100, 100, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(255, 150, 150, 0.5)',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    callButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    websiteButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 150, 150, 0.4)',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    websiteButtonText: {
        fontSize: 11,
        color: '#FF6B6B',
        fontWeight: '700',
    },
    noHelplines: {
        fontSize: 12,
        color: 'rgba(255, 200, 200, 0.7)',
        textAlign: 'center',
        paddingVertical: 12,
    },
    crisisFooter: {
        fontSize: 11,
        color: 'rgba(255, 200, 200, 0.75)',
        textAlign: 'center',
        lineHeight: 15,
        fontStyle: 'italic',
    },
    // Voice UI Styles
    micButtonActive: {
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 107, 0.6)',
    },
    listeningIndicator: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF6B6B',
        top: -8,
        right: -8,
    },
    voiceStatusBadge: {
        position: 'absolute',
        top: -32,
        left: 12,
        backgroundColor: 'rgba(100, 220, 155, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(100, 220, 155, 0.5)',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    voiceStatusText: {
        fontSize: 11,
        color: '#64DC9B',
        fontWeight: '600',
    },
    voiceErrorBadge: {
        position: 'absolute',
        top: -32,
        left: 12,
        backgroundColor: 'rgba(255, 107, 107, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.5)',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    voiceErrorText: {
        fontSize: 11,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    ttsButton: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
        marginHorizontal: 8,
    },
    ttsButtonActive: {
        borderColor: 'rgba(52, 211, 153, 0.7)',
        backgroundColor: 'rgba(52, 211, 153, 0.25)',
    },
    ttsButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
    },
    ttsButtonText: {
        fontSize: 20,
    },
});

