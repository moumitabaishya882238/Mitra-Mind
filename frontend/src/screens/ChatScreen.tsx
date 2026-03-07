import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    Pressable,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/client';

export default function ChatScreen() {
    const [messages, setMessages] = useState<{ id: string, text: string, sender: 'user' | 'ai' }[]>([
        { id: '1', text: "Hi, I'm Mitra. I'm here to listen. How are you feeling today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const showConversation = messages.length > 1;

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' as const };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        try {
            // Send to backend API
            const response = await apiClient.post('/ai/generate-response', {
                message: userMsg.text
            });

            const aiMsg = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'ai' as const };
            setMessages(prev => [...prev, aiMsg]);

            // OPTIONAL: trigger Text-to-Speech (TTS) here with react-native-tts for the aiMsg.text

        } catch (error) {
            console.error('Failed to get AI response', error);
            const errorMsg = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' as const };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

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
                    <View style={styles.orbAuraPrimary} />
                    <View style={styles.orbAuraSecondary} />
                    <View style={styles.orbAuraTertiary} />
                    <View style={styles.orbOuter}>
                        <LinearGradient
                            colors={['#63E7FF', '#375DFF', '#7D43FF', '#FF5FCB']}
                            start={{ x: 0.05, y: 0.1 }}
                            end={{ x: 0.95, y: 0.9 }}
                            style={styles.orbCore}
                        />
                    </View>
                    <Text style={styles.heroQuestion}>
                        How can I <Text style={styles.heroQuestionStrong}>support</Text> you today?
                    </Text>
                </View>

                {showConversation ? (
                    <View style={styles.messageListContainer}>
                        <FlatList
                            data={messages}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.messageListContent}
                            renderItem={({ item }) => (
                                <View
                                    style={[
                                        styles.messageBubble,
                                        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
                                    ]}
                                >
                                    <Text style={styles.messageText}>{item.text}</Text>
                                </View>
                            )}
                        />
                    </View>
                ) : (
                    <Text style={styles.helperText}>Type your thoughts below and press send.</Text>
                )}

                <View style={styles.bottomDock}>
                    <View style={styles.micRow}>
                        <Pressable style={styles.micButton}>
                            <LinearGradient
                                colors={['#FF78D7', '#A25BFF', '#7B56FF']}
                                start={{ x: 0.15, y: 0.1 }}
                                end={{ x: 0.9, y: 1 }}
                                style={styles.micButtonGradient}
                            >
                                <Text style={styles.micButtonText}>Mic</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>

                    <View style={styles.inputContainer}>
                        <LinearGradient
                            pointerEvents="none"
                            colors={['rgba(210, 223, 255, 0.22)', 'rgba(210, 223, 255, 0.06)', 'rgba(210, 223, 255, 0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.inputGlassEdge}
                        />
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Speak question or press the mic"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                        />
                        <Pressable style={styles.sendButton} onPress={sendMessage}>
                            <LinearGradient
                                colors={['#955CFF', '#6E4CE8']}
                                start={{ x: 0.2, y: 0.1 }}
                                end={{ x: 0.9, y: 0.9 }}
                                style={styles.sendButtonGradient}
                            >
                                <Text style={styles.sendButtonText}>↗</Text>
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
    iconGhost: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(152, 132, 255, 0.16)',
        borderWidth: 1,
        borderColor: 'rgba(220, 210, 255, 0.2)',
    },
    iconGhostText: {
        color: 'rgba(235, 238, 255, 0.92)',
        fontSize: 17,
        fontWeight: '700',
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
        backgroundColor: 'rgba(255, 114, 213, 0.05)',
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
    bottomDock: {
        marginTop: 'auto',
    },
    micRow: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 18,
    },
    micButton: {
        width: 86,
        height: 86,
        borderRadius: 43,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 226, 255, 0.5)',
        shadowColor: '#C26AFF',
        shadowOpacity: 0.9,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 14,
    },
    micButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    micButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
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
});
