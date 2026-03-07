import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    FlatList,
    Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CopingAction, copingActions } from '../data/copingActions';

export default function CopingToolkitScreen() {
    const navigation = useNavigation<any>();
    const firstPlayable = useMemo(
        () => copingActions.find((action) => action.availability === 'available') || copingActions[0],
        []
    );
    const [selectedActionId, setSelectedActionId] = useState<string>(firstPlayable.id);

    const isUnderDevelopment = (action: CopingAction) => action.availability === 'under-development';

    const selectedAction = useMemo(
        () => copingActions.find((action) => action.id === selectedActionId) || copingActions[0],
        [selectedActionId]
    );

    const startSelectedAction = () => {
        if (isUnderDevelopment(selectedAction)) {
            return;
        }
        navigation.navigate('CopingActionGuide', { actionId: selectedAction.id });
    };

    const renderAction = ({ item }: { item: CopingAction }) => {
        const isSelected = item.id === selectedActionId;
        const underDevelopment = isUnderDevelopment(item);

        return (
            <Pressable
                onPress={() => {
                    if (!underDevelopment) {
                        setSelectedActionId(item.id);
                    }
                }}
                onLongPress={() => {
                    if (!underDevelopment) {
                        navigation.navigate('CopingActionGuide', { actionId: item.id });
                    }
                }}
                disabled={underDevelopment}
                style={({ pressed }) => [
                    styles.toolCard,
                    isSelected ? styles.toolCardSelected : null,
                    underDevelopment ? styles.toolCardUnderDevelopment : null,
                    pressed && !underDevelopment ? styles.toolCardPressed : null,
                ]}
            >
                <View style={styles.cardHeaderRow}>
                    <Text style={styles.toolCategory}>{item.category}</Text>
                    <View style={styles.cardMetaRight}>
                        <Text style={styles.toolDuration}>{item.duration}</Text>
                        {underDevelopment ? <Text style={styles.underDevelopmentBadge}>Under Development</Text> : null}
                    </View>
                </View>
                <Text style={styles.toolTitle}>{item.title}</Text>
                <Text style={styles.toolSummary}>{item.summary}</Text>
                <View style={styles.cardFooterRow}>
                    <Text style={[styles.selectionLabel, isSelected ? styles.selectionLabelActive : null]}>
                        {underDevelopment ? 'Coming soon' : isSelected ? 'Selected' : 'Tap to select'}
                    </Text>
                    <Text style={styles.longPressHint}>{underDevelopment ? 'Not selectable yet' : 'Long press to start'}</Text>
                </View>
            </Pressable>
        );
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
            </View>

            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.title}>MindSpace</Text>
                <Text style={styles.subtitle}>
                    Pick from the list. Selected action starts on a full guide page.
                </Text>

                <Pressable onPress={startSelectedAction} style={({ pressed }) => [styles.startButton, pressed ? styles.startButtonPressed : null]}>
                    <Text style={styles.startButtonText}>Start: {selectedAction.title}</Text>
                </Pressable>

                <FlatList
                    data={copingActions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAction}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 12,
        color: '#FFFFFF',
    },
    subtitle: {
        color: 'rgba(235, 231, 255, 0.82)',
        fontSize: 14,
        marginBottom: 12,
    },
    startButton: {
        backgroundColor: 'rgba(112, 84, 255, 0.34)',
        borderWidth: 1,
        borderColor: 'rgba(205, 193, 255, 0.6)',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    startButtonPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.92,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 24,
    },
    toolCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(223, 214, 255, 0.18)',
        padding: 14,
    },
    toolCardSelected: {
        borderColor: 'rgba(206, 195, 255, 0.78)',
        backgroundColor: 'rgba(129, 97, 255, 0.22)',
        shadowColor: '#9273FF',
        shadowOpacity: 0.35,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    toolCardPressed: {
        transform: [{ scale: 0.985 }],
        opacity: 0.94,
    },
    toolCardUnderDevelopment: {
        opacity: 0.62,
        borderColor: 'rgba(196, 183, 255, 0.28)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardMetaRight: {
        alignItems: 'flex-end',
    },
    toolCategory: {
        color: '#C9BCFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    toolDuration: {
        color: 'rgba(223, 214, 255, 0.85)',
        fontSize: 12,
        fontWeight: '600',
    },
    underDevelopmentBadge: {
        marginTop: 4,
        color: '#F5D8A8',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toolTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    toolSummary: {
        fontSize: 13,
        lineHeight: 18,
        color: 'rgba(234, 229, 255, 0.9)',
    },
    cardFooterRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionLabel: {
        color: 'rgba(214, 205, 255, 0.75)',
        fontSize: 11,
        fontWeight: '600',
    },
    selectionLabelActive: {
        color: '#F7F3FF',
    },
    longPressHint: {
        color: 'rgba(214, 205, 255, 0.75)',
        fontSize: 11,
    },
});
