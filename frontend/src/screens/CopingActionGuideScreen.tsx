import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    ScrollView,
    Vibration,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import apiClient from '../api/client';
import { copingActions } from '../data/copingActions';

type RouteParams = {
    actionId?: string;
};

type SessionState = 'idle' | 'running' | 'done';
type GuidedPhase = 'inhale' | 'hold' | 'exhale' | 'between' | 'tense' | 'release' | 'relax' | 'mindful-pause';
type AmbienceKey = 'none' | 'rain' | 'ocean' | 'piano';
type CompletionChoice = 'Relaxed' | 'Neutral' | 'Still tense' | 'Calmer' | 'Same' | 'Still overwhelmed';
type GroundingSense = 'see' | 'feel' | 'hear' | 'smell' | 'taste';
type ColorHuntRound = {
    label: string;
    prompt: string;
    emoji: string;
};

const STORAGE_SESSION_KEY = 'mh-session-id';

const MUSCLE_GROUPS = [
    'Hands',
    'Forearms',
    'Shoulders',
    'Face',
    'Chest',
    'Stomach',
    'Legs',
    'Feet',
];

const PMR_MESSAGES = [
    "You're doing great.",
    'Let the tension melt away.',
    'Notice how your muscles feel softer.',
];

const GROUNDING_STEPS: GroundingSense[] = ['see', 'feel', 'hear', 'smell', 'taste'];
const GROUNDING_COUNTS = [5, 4, 3, 2, 1];
const GROUNDING_PROMPTS: Record<GroundingSense, string> = {
    see: 'Name 5 things you can see.',
    feel: 'Name 4 things you can feel.',
    hear: 'Name 3 things you can hear.',
    smell: 'Name 2 things you can smell.',
    taste: 'Name 1 thing you can taste.',
};
const GROUNDING_CIRCLES: Record<GroundingSense, string> = {
    see: 'SEE',
    feel: 'FEEL',
    hear: 'HEAR',
    smell: 'SMELL',
    taste: 'TASTE',
};
const GROUNDING_MESSAGES = [
    'Take your time.',
    'Notice small details around you.',
    'Stay present in the moment.',
    'You are safe right here.',
];

const COLOR_HUNT_ROUNDS: ColorHuntRound[] = [
    { label: 'RED', prompt: 'Round 1 - Find something RED.', emoji: '🔴' },
    { label: 'BLUE', prompt: 'Round 2 - Find something BLUE.', emoji: '🔵' },
    { label: 'GREEN', prompt: 'Round 3 - Find something GREEN.', emoji: '🟢' },
    { label: 'YELLOW', prompt: 'Round 4 - Find something YELLOW.', emoji: '🟡' },
    { label: 'COLORFUL', prompt: 'Round 5 - Find something colorful or patterned.', emoji: '🌈' },
];

const COLOR_HUNT_MESSAGES = [
    'Nice.',
    'Take a slow breath.',
    'Look around for the next color.',
    'You are doing great. Stay curious.',
];

const AMBIENCE_TRACKS: Record<Exclude<AmbienceKey, 'none'>, { uri: string }> = {
    rain: { uri: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg' },
    ocean: { uri: 'https://actions.google.com/sounds/v1/water/ocean_waves.ogg' },
    piano: { uri: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg' },
};

function mapCompletionChoice(choice: CompletionChoice, mode?: string) {
    if (choice === 'Relaxed') {
        return { moodCategory: 'Calm', stressScore: 3 };
    }
    if (choice === 'Still tense') {
        return { moodCategory: 'Stressed', stressScore: 7 };
    }
    if (choice === 'Calmer') {
        return { moodCategory: 'Calm', stressScore: 3 };
    }
    if (choice === 'Still overwhelmed') {
        return { moodCategory: 'Stressed', stressScore: 7 };
    }
    if (choice === 'Same') {
        return { moodCategory: 'Neutral', stressScore: 5 };
    }
    return { moodCategory: 'Neutral', stressScore: 5 };
}

export default function CopingActionGuideScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const params = (route.params as RouteParams) || {};

    const action = useMemo(() => {
        return copingActions.find((item) => item.id === params.actionId) || copingActions[0];
    }, [params.actionId]);

    const mode = useMemo<'box' | '478' | 'pmr' | 'grounding' | 'color-hunt' | null>(() => {
        if (action.id === 'breathing-box') return 'box';
        if (action.id === 'breathing-478') return '478';
        if (action.id === 'muscle-relax') return 'pmr';
        if (action.id === 'grounding-54321') return 'grounding';
        if (action.id === 'name-objects') return 'color-hunt';
        return null;
    }, [action.id]);

    const isGuidedMode = Boolean(mode);

    const [stepIndex, setStepIndex] = useState(0);
    const hasPrevious = stepIndex > 0;
    const hasNext = stepIndex < action.steps.length - 1;

    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [phase, setPhase] = useState<GuidedPhase>('inhale');
    const [countdown, setCountdown] = useState(5);
    const [cycle, setCycle] = useState(1);
    const [coachText, setCoachText] = useState('Press Start when you are ready.');

    const [currentMuscleGroup, setCurrentMuscleGroup] = useState(MUSCLE_GROUPS[0]);
    const [ambience, setAmbience] = useState<AmbienceKey>('none');
    const [completionChoice, setCompletionChoice] = useState<CompletionChoice | null>(null);
    const [isSavingResult, setIsSavingResult] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Grounding-specific state
    const [groundingStepIndex, setGroundingStepIndex] = useState(0);
    const [groundingItems, setGroundingItems] = useState<string[][]>([[], [], [], [], []]); // Items for each sense
    const [currentItemInput, setCurrentItemInput] = useState('');
    const [grounderCompletionChoice, setGrounderCompletionChoice] = useState<'Calmer' | 'Same' | 'Still overwhelmed' | null>(null);

    const [colorHuntRoundIndex, setColorHuntRoundIndex] = useState(0);
    const [colorHuntCompleted, setColorHuntCompleted] = useState<boolean[]>([false, false, false, false, false]);
    const [isColorHuntTransitioning, setIsColorHuntTransitioning] = useState(false);

    const breathAnim = useRef(new Animated.Value(0)).current;
    const tickAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearRunningTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearRunningTimer();
        };
    }, []);

    useEffect(() => {
        clearRunningTimer();
        setSessionState('idle');
        setCycle(1);
        setCompletionChoice(null);
        setGrounderCompletionChoice(null);
        setColorHuntRoundIndex(0);
        setColorHuntCompleted([false, false, false, false, false]);
        setIsColorHuntTransitioning(false);
        setSaveMessage('');
        breathAnim.setValue(0);

        if (mode === 'grounding') {
            setGroundingStepIndex(0);
            setGroundingItems([[], [], [], [], []]);
            setCurrentItemInput('');
            setPhase('mindful-pause');
            setCountdown(0);
            setCoachText('Press Start to begin the 5-4-3-2-1 Grounding exercise.');
            return;
        }

        if (mode === 'pmr') {
            setCurrentMuscleGroup(MUSCLE_GROUPS[0]);
            setPhase('tense');
            setCountdown(5);
            setCoachText('Press Start to begin Progressive Muscle Relaxation.');
            return;
        }

        if (mode === 'color-hunt') {
            setPhase('mindful-pause');
            setCountdown(0);
            setCoachText('Press Start to begin Color Hunt.');
            return;
        }

        if (mode === '478') {
            setPhase('inhale');
            setCountdown(4);
            setCoachText('Press Start for a guided 4-7-8 session.');
            return;
        }

        setPhase('inhale');
        setCountdown(5);
        setCoachText('Press Start when you are ready.');
    }, [mode, breathAnim]);

    const animateCircle = (target: number, duration: number) => {
        Animated.timing(breathAnim, {
            toValue: target,
            duration,
            useNativeDriver: true,
        }).start();
    };

    const animateTick = () => {
        tickAnim.setValue(0);
        Animated.sequence([
            Animated.timing(tickAnim, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.timing(tickAnim, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const runCountdown = (seconds: number, onComplete: () => void) => {
        let remaining = seconds;
        setCountdown(seconds);
        animateTick();
        clearRunningTimer();

        timerRef.current = setInterval(() => {
            remaining -= 1;

            if (remaining >= 1) {
                setCountdown(remaining);
                animateTick();
                return;
            }

            clearRunningTimer();
            onComplete();
        }, 1000);
    };

    const runBoxBetween = (currentCycle: number) => {
        setPhase('between');

        if (currentCycle === 1) {
            setCoachText("Nice. Let's do this one more.");
        } else {
            setCoachText("Great. Let's do this one more last time.");
        }

        runCountdown(3, () => runBreathingInhale(currentCycle + 1));
    };

    const run478Between = (currentCycle: number) => {
        setPhase('between');
        setCoachText(currentCycle === 1 ? 'Beautiful. One more calm wave.' : 'Final wave. Slow and steady.');
        runCountdown(2, () => runBreathingInhale(currentCycle + 1));
    };

    const runBreathingExhale = (currentCycle: number) => {
        setPhase('exhale');
        setCoachText('Breathe out...');
        const exhaleSeconds = mode === '478' ? 8 : 5;
        animateCircle(0, exhaleSeconds * 1000);

        runCountdown(exhaleSeconds, () => {
            if (currentCycle < 3) {
                if (mode === '478') {
                    run478Between(currentCycle);
                } else {
                    runBoxBetween(currentCycle);
                }
                return;
            }

            setPhase('between');
            setSessionState('done');
            setCoachText(
                mode === '478'
                    ? 'Excellent. You completed 3 rounds of 4-7-8 breathing.'
                    : 'Great job. You completed all 3 rounds.'
            );
            setCountdown(0);
        });
    };

    const runBreathingHold = (currentCycle: number) => {
        setPhase('hold');
        setCoachText('Hold softly. Relax your jaw and shoulders.');
        animateCircle(1.08, 7000);
        runCountdown(7, () => runBreathingExhale(currentCycle));
    };

    const runBreathingInhale = (targetCycle: number) => {
        setCycle(targetCycle);
        setPhase('inhale');
        setCoachText(mode === '478' ? 'Inhale through your nose...' : 'Breathe in...');

        const inhaleSeconds = mode === '478' ? 4 : 5;
        animateCircle(1, inhaleSeconds * 1000);
        runCountdown(inhaleSeconds, () => {
            if (mode === '478') {
                runBreathingHold(targetCycle);
            } else {
                runBreathingExhale(targetCycle);
            }
        });
    };

    const runPmrTense = (roundIndex: number) => {
        const muscleGroup = MUSCLE_GROUPS[roundIndex];
        setCycle(roundIndex + 1);
        setCurrentMuscleGroup(muscleGroup);
        setPhase('tense');
        setCoachText(`Tense your ${muscleGroup}`);
        animateCircle(1, 5000);
        runCountdown(5, () => runPmrHold(roundIndex));
    };

    const runPmrHold = (roundIndex: number) => {
        setPhase('hold');
        setCoachText('Hold');
        animateCircle(1.08, 3000);
        runCountdown(3, () => runPmrRelease(roundIndex));
    };

    const runPmrRelease = (roundIndex: number) => {
        setPhase('release');
        setCoachText('Release slowly');
        Vibration.vibrate(24);
        animateCircle(0.72, 2000);
        runCountdown(2, () => runPmrRelax(roundIndex));
    };

    const runPmrRelax = (roundIndex: number) => {
        setPhase('relax');
        setCoachText('Relax');
        animateCircle(0.85, 5000);
        runCountdown(5, () => {
            if (roundIndex < MUSCLE_GROUPS.length - 1) {
                setPhase('between');
                setCoachText(PMR_MESSAGES[roundIndex % PMR_MESSAGES.length]);
                runCountdown(3, () => runPmrTense(roundIndex + 1));
                return;
            }

            setPhase('between');
            setSessionState('done');
            setCoachText('Session Complete. Notice how your body feels now.');
            setCountdown(0);
        });
    };

    const advanceGroundingStep = () => {
        if (groundingStepIndex < GROUNDING_STEPS.length - 1) {
            setGroundingStepIndex(groundingStepIndex + 1);
            setCurrentItemInput('');
            setPhase('mindful-pause');
            setCoachText(GROUNDING_MESSAGES[groundingStepIndex % GROUNDING_MESSAGES.length]);
            animateCircle(1, 4000);
            runCountdown(4, () => {
                setPhase('mindful-pause');
                setCoachText(GROUNDING_PROMPTS[GROUNDING_STEPS[groundingStepIndex + 1]]);
                setCountdown(0);
            });
        } else {
            // All steps done
            setSessionState('done');
            setPhase('mindful-pause');
            setCoachText('Grounding Complete. Notice how you feel.');
            setCountdown(0);
        }
    };

    const addGroundingItem = () => {
        if (currentItemInput.trim()) {
            const updated = [...groundingItems];
            updated[groundingStepIndex] = [...updated[groundingStepIndex], currentItemInput.trim()];
            setGroundingItems(updated);
            setCurrentItemInput('');
        }
    };

    const removeGroundingItem = (index: number) => {
        const updated = [...groundingItems];
        updated[groundingStepIndex] = updated[groundingStepIndex].filter((_, i) => i !== index);
        setGroundingItems(updated);
    };

    const confirmColorFound = () => {
        if (mode !== 'color-hunt' || isColorHuntTransitioning || sessionState !== 'running') return;

        const currentRound = colorHuntRoundIndex;
        setColorHuntCompleted((prev) => {
            const next = [...prev];
            next[currentRound] = true;
            return next;
        });

        Animated.sequence([
            Animated.timing(breathAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(breathAnim, {
                toValue: 0.45,
                duration: 320,
                useNativeDriver: true,
            }),
        ]).start();
        animateTick();

        if (currentRound >= COLOR_HUNT_ROUNDS.length - 1) {
            setSessionState('done');
            setPhase('between');
            setCountdown(0);
            setCoachText('Color Hunt Complete. You did it.');
            return;
        }

        setIsColorHuntTransitioning(true);
        setPhase('between');
        setCoachText(COLOR_HUNT_MESSAGES[currentRound % COLOR_HUNT_MESSAGES.length]);
        runCountdown(3, () => {
            const nextRound = currentRound + 1;
            setColorHuntRoundIndex(nextRound);
            setPhase('mindful-pause');
            setCountdown(0);
            setCoachText(COLOR_HUNT_ROUNDS[nextRound].prompt);
            setIsColorHuntTransitioning(false);
        });
    };

    const canAdvanceGrounding = groundingItems[groundingStepIndex].length === GROUNDING_COUNTS[groundingStepIndex];

    const startGuidedSession = () => {
        setCompletionChoice(null);
        setGrounderCompletionChoice(null);
        setSaveMessage('');
        setSessionState('running');

        if (mode === 'color-hunt') {
            setColorHuntRoundIndex(0);
            setColorHuntCompleted([false, false, false, false, false]);
            setIsColorHuntTransitioning(false);
            setPhase('mindful-pause');
            setCoachText(COLOR_HUNT_ROUNDS[0].prompt);
            setCountdown(0);
            return;
        }

        if (mode === 'grounding') {
            setGroundingStepIndex(0);
            setGroundingItems([[], [], [], [], []]);
            setCurrentItemInput('');
            setPhase('mindful-pause');
            setCoachText(GROUNDING_PROMPTS[GROUNDING_STEPS[0]]);
            setCountdown(0);
            return;
        }

        if (mode === 'pmr') {
            setPhase('tense');
            setCountdown(5);
            setCycle(1);
            runPmrTense(0);
            return;
        }

        setPhase('inhale');
        setCountdown(mode === '478' ? 4 : 5);
        setCycle(1);
        runBreathingInhale(1);
    };

    const resetGuidedSession = () => {
        clearRunningTimer();
        setSessionState('idle');
        setCycle(1);
        setCompletionChoice(null);
        setGrounderCompletionChoice(null);
        setSaveMessage('');

        if (mode === 'grounding') {
            setGroundingStepIndex(0);
            setGroundingItems([[], [], [], [], []]);
            setCurrentItemInput('');
            setPhase('mindful-pause');
            setCoachText('Press Start to begin the 5-4-3-2-1 Grounding exercise.');
            setCountdown(0);
        } else if (mode === 'color-hunt') {
            setColorHuntRoundIndex(0);
            setColorHuntCompleted([false, false, false, false, false]);
            setIsColorHuntTransitioning(false);
            setPhase('mindful-pause');
            setCoachText('Press Start to begin Color Hunt.');
            setCountdown(0);
        } else if (mode === 'pmr') {
            setPhase('tense');
            setCurrentMuscleGroup(MUSCLE_GROUPS[0]);
            setCountdown(5);
            setCoachText('Press Start to begin Progressive Muscle Relaxation.');
        } else {
            setPhase('inhale');
            setCountdown(mode === '478' ? 4 : 5);
            setCoachText(
                mode === '478'
                    ? 'Press Start for a guided 4-7-8 session.'
                    : 'Press Start when you are ready.'
            );
        }

        breathAnim.setValue(0);
    };

    const saveCompletion = async (choice: CompletionChoice) => {
        if (isSavingResult) return;

        setCompletionChoice(choice);
        setGrounderCompletionChoice(choice as 'Calmer' | 'Same' | 'Still overwhelmed');
        setIsSavingResult(true);
        setSaveMessage('Saving...');

        try {
            const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
            const sessionId = storedSession || 'anonymous-device';
            const mapped = mapCompletionChoice(choice, mode || undefined);
                        const summary = mode === 'grounding'
                                ? `MindSpace Grounding completion: ${choice}`
                                : mode === 'color-hunt'
                                    ? `MindSpace Color Hunt completion: ${choice}`
                                    : `MindSpace PMR completion: ${choice}`;

            await apiClient.post('/ai/log-session-mood', {
                sessionId,
                moodCategory: mapped.moodCategory,
                stressScore: mapped.stressScore,
                crisisDetected: false,
                conversationSummary: summary,
            });

            setSaveMessage('Saved to your mood log.');
        } catch (error) {
            console.error('Failed to save completion', error);
            setSaveMessage('Could not save right now.');
        } finally {
            setIsSavingResult(false);
        }
    };

    const breathingScale = breathAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.18],
    });

    const breathingGlow = breathAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.95],
    });

    const tickScale = tickAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.08],
    });

    const tickOpacity = tickAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
    });

    const shouldPlayAmbience = mode === 'pmr' && ambience !== 'none' && sessionState === 'running';

    const circlePhaseLabel = () => {
        if (mode === 'color-hunt') return 'FIND';
        if (phase === 'inhale') return 'Breathe in';
        if (phase === 'hold') return 'Hold';
        if (phase === 'exhale') return 'Breathe out';
        if (phase === 'tense') return `Tense your ${currentMuscleGroup}`;
        if (phase === 'release') return 'Release slowly';
        if (phase === 'relax') return 'Relax';
        if (phase === 'mindful-pause') return GROUNDING_CIRCLES[GROUNDING_STEPS[groundingStepIndex]];
        return 'Get ready';
    };

    const circleSecondaryLabel = () => {
        if (mode === 'color-hunt') {
            return COLOR_HUNT_ROUNDS[colorHuntRoundIndex].label;
        }
        return countdown > 0 ? String(countdown) : '';
    };

    const roundLabel = mode === 'grounding'
        ? `STEP ${groundingStepIndex + 1} OF 5`
        : mode === 'color-hunt'
          ? `ROUND ${colorHuntRoundIndex + 1} OF 5`
        : mode === 'pmr'
          ? `Round ${cycle} of ${MUSCLE_GROUPS.length}`
          : `Round ${cycle} of 3`;

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
            </View>

            {shouldPlayAmbience ? (
                <Video
                    source={AMBIENCE_TRACKS[ambience as Exclude<AmbienceKey, 'none'>]}
                    repeat
                    paused={!shouldPlayAmbience}
                    volume={0.2}
                    playInBackground={false}
                    ignoreSilentSwitch="ignore"
                    onError={(_error: unknown) => console.log('Ambience playback issue')}
                    style={styles.hiddenAudio}
                />
            ) : null}

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </Pressable>
                    <Text style={styles.headerBadge}>{action.category}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{action.title}</Text>
                    <Text style={styles.meta}>{action.duration}</Text>
                    <Text style={styles.summary}>{action.summary}</Text>

                    {isGuidedMode ? (
                        <View style={styles.breathingSessionCard}>
                            <Text style={styles.breathingRoundText}>{roundLabel.toUpperCase()}</Text>
                            {mode === 'pmr' ? (
                                <Text style={styles.currentGroupText}>{currentMuscleGroup}</Text>
                            ) : null}
                            <Text style={styles.breathingCoachText}>{coachText}</Text>

                            {mode === 'color-hunt' ? (
                                <View style={styles.colorProgressRow}>
                                    {COLOR_HUNT_ROUNDS.map((round, index) => {
                                        const isDone = colorHuntCompleted[index];
                                        const isCurrent = sessionState === 'running' && index === colorHuntRoundIndex;
                                        return (
                                            <View
                                                key={round.label}
                                                style={[
                                                    styles.colorProgressDot,
                                                    isDone ? styles.colorProgressDotDone : null,
                                                    isCurrent ? styles.colorProgressDotCurrent : null,
                                                ]}
                                            >
                                                <Text style={styles.colorProgressEmoji}>{round.emoji}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : null}

                            {mode === 'grounding' && sessionState === 'running' ? (
                                <View style={styles.groundingInputBlock}>
                                    <TextInput
                                        style={styles.groundingTextInput}
                                        placeholder={`Enter item ${groundingItems[groundingStepIndex].length + 1}`}
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={currentItemInput}
                                        onChangeText={setCurrentItemInput}
                                        editable={!isSavingResult}
                                    />
                                    <Pressable
                                        style={[
                                            styles.groundingAddButton,
                                            !currentItemInput.trim() ? styles.groundingAddButtonDisabled : null,
                                        ]}
                                        disabled={!currentItemInput.trim() || isSavingResult}
                                        onPress={addGroundingItem}
                                    >
                                        <Text style={styles.groundingAddButtonText}>Add</Text>
                                    </Pressable>
                                </View>
                            ) : null}

                            {mode === 'grounding' && sessionState === 'running' ? (
                                <View style={styles.groundingItemsList}>
                                    {groundingItems[groundingStepIndex].map((item, idx) => (
                                        <View key={idx} style={styles.groundingItemRow}>
                                            <Text style={styles.groundingItemText}>{`${idx + 1}. ${item}`}</Text>
                                            <Pressable
                                                style={styles.groundingRemoveButton}
                                                onPress={() => removeGroundingItem(idx)}
                                            >
                                                <Text style={styles.groundingRemoveButtonText}>✕</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            {mode === 'pmr' ? (
                                <View style={styles.ambienceBlock}>
                                    <Text style={styles.ambienceLabel}>Ambience</Text>
                                    <View style={styles.ambienceRow}>
                                        {(['none', 'rain', 'ocean', 'piano'] as AmbienceKey[]).map((option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.ambienceChip,
                                                    ambience === option ? styles.ambienceChipActive : null,
                                                ]}
                                                onPress={() => setAmbience(option)}
                                            >
                                                <Text style={styles.ambienceChipText}>
                                                    {option === 'none'
                                                        ? 'Off'
                                                        : option === 'rain'
                                                          ? 'Soft rain'
                                                          : option === 'ocean'
                                                            ? 'Ocean waves'
                                                            : 'Ambient piano'}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            <View style={styles.breathingCircleFrame}>
                                <Animated.View
                                    style={[
                                        styles.breathingCircleGlow,
                                        phase === 'inhale'
                                            ? styles.breathingCircleGlowInhale
                                            : phase === 'hold'
                                              ? styles.breathingCircleGlowHold
                                              : phase === 'exhale'
                                                ? styles.breathingCircleGlowExhale
                                                : phase === 'tense'
                                                  ? styles.breathingCircleGlowInhale
                                                  : phase === 'release'
                                                    ? styles.breathingCircleGlowExhale
                                                    : styles.breathingCircleGlowBetween,
                                        {
                                            opacity: breathingGlow,
                                            transform: [{ scale: breathingScale }],
                                        },
                                    ]}
                                />

                                <Animated.View
                                    style={[
                                        styles.breathingCircle,
                                        phase === 'inhale'
                                            ? styles.breathingCircleInhale
                                            : phase === 'hold'
                                              ? styles.breathingCircleHold
                                              : phase === 'exhale'
                                                ? styles.breathingCircleExhale
                                                : phase === 'tense'
                                                  ? styles.breathingCircleInhale
                                                  : phase === 'release'
                                                    ? styles.breathingCircleExhale
                                                    : styles.breathingCircleBetween,
                                        {
                                            opacity: tickOpacity,
                                            transform: [{ scale: breathingScale }, { scale: tickScale }],
                                        },
                                    ]}
                                >
                                    <Animated.Text style={[styles.phaseText, { opacity: tickOpacity, transform: [{ scale: tickScale }] }]}>
                                        {circlePhaseLabel()}
                                    </Animated.Text>
                                    <Animated.Text
                                        style={[
                                            styles.countdownText,
                                            mode === 'color-hunt' ? styles.circleWordText : null,
                                            { opacity: tickOpacity, transform: [{ scale: tickScale }] },
                                        ]}
                                    >
                                        {circleSecondaryLabel()}
                                    </Animated.Text>
                                </Animated.View>
                            </View>

                            {sessionState !== 'running' ? (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.startBreathingButton,
                                        pressed ? styles.startBreathingButtonPressed : null,
                                    ]}
                                    onPress={startGuidedSession}
                                >
                                    <Text style={styles.startBreathingButtonText}>
                                        {sessionState === 'done'
                                            ? 'Start Again'
                                            : mode === '478'
                                              ? 'Start 4-7-8'
                                              : mode === 'pmr'
                                                ? 'Start Session'
                                                                                                : mode === 'color-hunt'
                                                                                                    ? 'Start Color Hunt'
                                                : mode === 'grounding'
                                                  ? 'Start Grounding'
                                                  : 'Start'}
                                    </Text>
                                </Pressable>
                            ) : null}

                            <Pressable style={styles.resetButton} onPress={resetGuidedSession}>
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </Pressable>

                            {mode === 'pmr' && sessionState === 'done' ? (
                                <View style={styles.completionCard}>
                                    <Text style={styles.completionTitle}>Session Complete</Text>
                                    <Text style={styles.completionLeaf}>🌿</Text>
                                    <Text style={styles.completionQuestion}>How do you feel now?</Text>

                                    <View style={styles.completionOptionsRow}>
                                        {(['Relaxed', 'Neutral', 'Still tense'] as CompletionChoice[]).map((option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.completionOption,
                                                    completionChoice === option ? styles.completionOptionActive : null,
                                                ]}
                                                disabled={isSavingResult}
                                                onPress={() => saveCompletion(option)}
                                            >
                                                <Text style={styles.completionOptionText}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
                                </View>
                            ) : null}

                            {mode === 'grounding' && sessionState === 'running' ? (
                                <Pressable
                                    style={[
                                        styles.groundingAdvanceButton,
                                        !canAdvanceGrounding ? styles.groundingAdvanceButtonDisabled : null,
                                    ]}
                                    disabled={!canAdvanceGrounding}
                                    onPress={advanceGroundingStep}
                                >
                                    <Text style={styles.groundingAdvanceButtonText}>
                                        {groundingStepIndex < GROUNDING_STEPS.length - 1 ? 'Next Step' : 'Finish'}
                                    </Text>
                                </Pressable>
                            ) : null}

                            {mode === 'color-hunt' && sessionState === 'running' ? (
                                <Pressable
                                    style={[
                                        styles.colorHuntFoundButton,
                                        isColorHuntTransitioning ? styles.groundingAdvanceButtonDisabled : null,
                                    ]}
                                    disabled={isColorHuntTransitioning}
                                    onPress={confirmColorFound}
                                >
                                    <Text style={styles.colorHuntFoundText}>Found it</Text>
                                </Pressable>
                            ) : null}

                            {mode === 'grounding' && sessionState === 'done' ? (
                                <View style={styles.groundingCompletionCard}>
                                    <Text style={styles.completionTitle}>Grounding Complete</Text>
                                    <Text style={styles.completionLeaf}>🌿</Text>
                                    <Text style={styles.completionQuestion}>How do you feel now?</Text>

                                    <View style={styles.completionOptionsRow}>
                                        {(['Calmer', 'Same', 'Still overwhelmed'] as CompletionChoice[]).map((option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.completionOption,
                                                    grounderCompletionChoice === option ? styles.completionOptionActive : null,
                                                ]}
                                                disabled={isSavingResult}
                                                onPress={() => saveCompletion(option)}
                                            >
                                                <Text style={styles.completionOptionText}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
                                </View>
                            ) : null}

                            {mode === 'color-hunt' && sessionState === 'done' ? (
                                <View style={styles.groundingCompletionCard}>
                                    <Text style={styles.completionTitle}>Color Hunt Complete</Text>
                                    <Text style={styles.completionLeaf}>🌿</Text>
                                    <Text style={styles.completionQuestion}>How do you feel now?</Text>

                                    <View style={styles.completionOptionsRow}>
                                        {(['Calmer', 'Same', 'Still overwhelmed'] as CompletionChoice[]).map((option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.completionOption,
                                                    grounderCompletionChoice === option ? styles.completionOptionActive : null,
                                                ]}
                                                disabled={isSavingResult}
                                                onPress={() => saveCompletion(option)}
                                            >
                                                <Text style={styles.completionOptionText}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>

                                    {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <>
                            <View style={styles.progressRow}>
                                <Text style={styles.progressText}>Step {stepIndex + 1} of {action.steps.length}</Text>
                                <Pressable style={styles.resetButton} onPress={() => setStepIndex(0)}>
                                    <Text style={styles.resetButtonText}>Reset</Text>
                                </Pressable>
                            </View>

                            <View style={styles.stepCard}>
                                <Text style={styles.stepLabel}>Current Step</Text>
                                <Text style={styles.stepText}>{action.steps[stepIndex]}</Text>
                            </View>

                            <View style={styles.controlsRow}>
                                <Pressable
                                    style={[styles.controlButton, !hasPrevious && styles.controlButtonDisabled]}
                                    disabled={!hasPrevious}
                                    onPress={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                                >
                                    <Text style={styles.controlButtonText}>Back</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.controlButton, !hasNext && styles.controlButtonDisabled]}
                                    disabled={!hasNext}
                                    onPress={() => setStepIndex((prev) => Math.min(action.steps.length - 1, prev + 1))}
                                >
                                    <Text style={styles.controlButtonText}>{hasNext ? 'Next' : 'Complete'}</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
    hiddenAudio: {
        width: 0,
        height: 0,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerRow: {
        marginTop: 8,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(208, 196, 255, 0.45)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },
    headerBadge: {
        color: '#D7CAFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingBottom: 26,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    meta: {
        color: '#C7B9FF',
        fontSize: 13,
        marginBottom: 8,
        fontWeight: '600',
    },
    summary: {
        color: 'rgba(231, 223, 255, 0.9)',
        fontSize: 15,
        lineHeight: 21,
        marginBottom: 18,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressText: {
        color: '#BFAEFF',
        fontSize: 13,
        fontWeight: '700',
    },
    resetButton: {
        backgroundColor: 'rgba(183, 168, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(183, 168, 255, 0.5)',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    resetButtonText: {
        color: '#E8DEFF',
        fontWeight: '600',
        fontSize: 11,
    },
    breathingSessionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.2)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        alignItems: 'center',
    },
    breathingRoundText: {
        color: '#BFAEFF',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    currentGroupText: {
        color: '#EDE7FF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    breathingCoachText: {
        color: '#F4EEFF',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        minHeight: 44,
    },
    ambienceBlock: {
        width: '100%',
        marginBottom: 10,
    },
    ambienceLabel: {
        color: 'rgba(228, 220, 255, 0.85)',
        fontWeight: '700',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    ambienceRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ambienceChip: {
        borderWidth: 1,
        borderColor: 'rgba(212, 201, 255, 0.35)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    ambienceChipActive: {
        borderColor: 'rgba(211, 193, 255, 0.8)',
        backgroundColor: 'rgba(118, 86, 255, 0.36)',
    },
    ambienceChipText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    breathingCircleFrame: {
        width: 240,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    breathingCircleGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(146, 115, 255, 0.45)',
    },
    breathingCircleGlowInhale: {
        backgroundColor: 'rgba(120, 175, 255, 0.45)',
    },
    breathingCircleGlowHold: {
        backgroundColor: 'rgba(181, 144, 255, 0.5)',
    },
    breathingCircleGlowExhale: {
        backgroundColor: 'rgba(112, 245, 208, 0.4)',
    },
    breathingCircleGlowBetween: {
        backgroundColor: 'rgba(236, 195, 255, 0.35)',
    },
    breathingCircle: {
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 1,
        borderColor: 'rgba(210, 197, 255, 0.5)',
        backgroundColor: 'rgba(125, 90, 255, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    breathingCircleInhale: {
        backgroundColor: 'rgba(88, 149, 255, 0.4)',
        borderColor: 'rgba(173, 207, 255, 0.65)',
    },
    breathingCircleHold: {
        backgroundColor: 'rgba(160, 108, 255, 0.42)',
        borderColor: 'rgba(212, 181, 255, 0.7)',
    },
    breathingCircleExhale: {
        backgroundColor: 'rgba(76, 201, 176, 0.36)',
        borderColor: 'rgba(156, 255, 238, 0.62)',
    },
    breathingCircleBetween: {
        backgroundColor: 'rgba(130, 104, 170, 0.32)',
        borderColor: 'rgba(216, 198, 255, 0.55)',
    },
    phaseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    countdownText: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 46,
    },
    circleWordText: {
        fontSize: 30,
        letterSpacing: 0.7,
    },
    colorProgressRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    colorProgressDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(206, 193, 255, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorProgressDotDone: {
        backgroundColor: 'rgba(124, 208, 139, 0.26)',
        borderColor: 'rgba(184, 255, 199, 0.75)',
    },
    colorProgressDotCurrent: {
        borderColor: 'rgba(199, 180, 255, 0.9)',
        backgroundColor: 'rgba(123, 90, 255, 0.35)',
    },
    colorProgressEmoji: {
        fontSize: 16,
    },
    startBreathingButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(192, 180, 255, 0.5)',
        backgroundColor: 'rgba(112, 84, 255, 0.28)',
        marginBottom: 10,
    },
    startBreathingButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    startBreathingButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    completionCard: {
        width: '100%',
        marginTop: 14,
        borderWidth: 1,
        borderColor: 'rgba(192, 224, 196, 0.5)',
        backgroundColor: 'rgba(91, 171, 120, 0.12)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    completionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#E9FFE6',
        marginBottom: 2,
    },
    completionLeaf: {
        fontSize: 22,
        marginBottom: 8,
    },
    completionQuestion: {
        color: '#E6FFE2',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    completionOptionsRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 8,
    },
    completionOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(184, 255, 199, 0.4)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    completionOptionActive: {
        borderColor: 'rgba(228, 255, 216, 0.9)',
        backgroundColor: 'rgba(123, 208, 139, 0.3)',
    },
    completionOptionText: {
        color: '#F5FFF4',
        fontSize: 12,
        fontWeight: '700',
    },
    saveMessage: {
        marginTop: 10,
        color: '#DFFFD8',
        fontSize: 12,
        fontWeight: '600',
    },
    stepCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.2)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    stepLabel: {
        color: '#CBBEFF',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    stepText: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    controlButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(192, 180, 255, 0.5)',
        backgroundColor: 'rgba(112, 84, 255, 0.28)',
    },
    controlButtonDisabled: {
        opacity: 0.35,
    },
    controlButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    groundingInputBlock: {
        width: '100%',
        flexDirection: 'row',
        gap: 8,
        marginVertical: 12,
    },
    groundingTextInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        fontSize: 14,
        fontWeight: '500',
    },
    groundingAddButton: {
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(112, 84, 255, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(192, 180, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groundingAddButtonDisabled: {
        opacity: 0.4,
    },
    groundingAddButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    groundingItemsList: {
        width: '100%',
        gap: 8,
        marginVertical: 10,
    },
    groundingItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(88, 149, 255, 0.15)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(88, 149, 255, 0.3)',
    },
    groundingItemText: {
        color: '#E8F1FF',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    groundingRemoveButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    groundingRemoveButtonText: {
        color: '#FF8A9B',
        fontSize: 16,
        fontWeight: '600',
    },
    groundingAdvanceButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(192, 180, 255, 0.5)',
        backgroundColor: 'rgba(112, 84, 255, 0.28)',
        marginTop: 12,
    },
    groundingAdvanceButtonDisabled: {
        opacity: 0.35,
    },
    groundingAdvanceButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    colorHuntFoundButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(212, 194, 255, 0.7)',
        backgroundColor: 'rgba(126, 97, 255, 0.4)',
        marginTop: 12,
    },
    colorHuntFoundText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    groundingCompletionCard: {
        width: '100%',
        marginTop: 14,
        borderWidth: 1,
        borderColor: 'rgba(192, 224, 196, 0.5)',
        backgroundColor: 'rgba(91, 171, 120, 0.12)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },

});
