import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useAppTheme } from '../context/ThemeContext';
import communityService, { ModerationResult } from '../services/communityService';

const STORAGE_SESSION_KEY = 'mh-session-id';

// Same moods from DailyMoodLog.js - AI can connect community mood with chatbot conversations
const MOOD_OPTIONS = [
    'None',
    'Happy',
    'Calm',
    'Neutral',
    'Stressed',
    'Anxious',
    'Sad',
    'Depressed',
    'Angry',
];

export default function CreatePostScreen({ navigation }: any) {
    const { theme } = useAppTheme();
    const [message, setMessage] = useState('');
    const [mood, setMood] = useState('');
    const [saving, setSaving] = useState(false);
    const [moderation, setModeration] = useState<ModerationResult | null>(null);

    const disabled = useMemo(() => saving || !message.trim(), [saving, message]);

    const onCreatePost = async () => {
        if (disabled) return;
        setSaving(true);
        try {
            const sessionId = (await AsyncStorage.getItem(STORAGE_SESSION_KEY)) || 'anonymous-device';
            const response = await communityService.createPost(sessionId, message.trim(), mood.trim());
            setModeration(response.moderation);
            navigation.goBack();
        } catch (error) {
            console.error('Failed to create post', error);
        } finally {
            setSaving(false);
        }
    };

    const isLight = theme.id === 'matrix-white';

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
                <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Post</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Share what you are feeling. Your identity stays anonymous.</Text>

                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        placeholder="I feel overwhelmed with exams this week..."
                        placeholderTextColor={isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)'}
                        style={[
                            styles.messageInput,
                            {
                                color: isLight ? '#000000' : theme.colors.textPrimary,
                                backgroundColor: theme.colors.cardBg,
                                borderColor: theme.colors.borderSoft,
                            },
                        ]}
                    />

                    <View
                        style={[
                            styles.moodPickerContainer,
                            {
                                backgroundColor: theme.colors.cardBg,
                                borderColor: theme.colors.borderSoft,
                            },
                        ]}
                    >
                        <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>
                            Select Mood (Optional):
                        </Text>
                        <Picker
                            selectedValue={mood || 'None'}
                            onValueChange={(value) => setMood(value === 'None' ? '' : value)}
                            style={[
                                styles.moodPicker,
                                {
                                    color: isLight ? '#000000' : theme.colors.textPrimary,
                                },
                            ]}
                            dropdownIconColor={isLight ? '#000000' : theme.colors.textPrimary}
                        >
                            {MOOD_OPTIONS.map((moodOption) => (
                                <Picker.Item
                                    key={moodOption}
                                    label={moodOption === 'None' ? '-- No mood selected --' : moodOption}
                                    value={moodOption}
                                    color="#000000"
                                />
                            ))}
                        </Picker>
                    </View>

                    {moderation?.flagged ? (
                        <View style={[styles.flagBox, { borderColor: theme.colors.danger, backgroundColor: theme.colors.cardBg }]}>
                            <Text style={[styles.flagTitle, { color: theme.colors.danger }]}>Support Suggestion</Text>
                            <Text style={[styles.flagText, { color: theme.colors.textSecondary }]}>{moderation.empatheticResponse}</Text>
                        </View>
                    ) : null}

                    <Pressable
                        onPress={onCreatePost}
                        disabled={disabled}
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: disabled ? theme.colors.tabInactive : theme.colors.accent,
                            },
                        ]}
                    >
                        <Text style={styles.submitButtonText}>{saving ? 'Posting...' : 'Post Anonymously'}</Text>
                    </Pressable>
                </KeyboardAvoidingView>
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
    },
    flex: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 12,
    },
    messageInput: {
        minHeight: 180,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
        fontSize: 15,
        lineHeight: 22,
    },
    moodPickerContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 10,
        paddingTop: 8,
        paddingHorizontal: 8,
        paddingBottom: 4,
    },
    moodLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 0,
        paddingLeft: 4,
    },
    moodPicker: {
        marginTop: -8,
    },
    flagBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
    },
    flagTitle: {
        fontWeight: '800',
        marginBottom: 4,
    },
    flagText: {
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 15,
    },
});
