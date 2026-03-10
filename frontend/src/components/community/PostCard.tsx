import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../theme/themes';
import { CommunityPost } from '../../services/communityService';

type Props = {
    post: CommunityPost;
    theme: AppTheme;
    onOpen: () => void;
    onToggleSave: () => void;
    onDelete: () => void;
    onMessageAuthor: () => void;
};

// Mood-based color system for better visual feedback
function getMoodColor(mood: string): { accent: string; bg: string; text: string } {
    const moodLower = mood.toLowerCase();
    switch (moodLower) {
        case 'happy':
            return { accent: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)', text: '#2E7D32' }; // Green
        case 'calm':
            return { accent: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)', text: '#1565C0' }; // Blue
        case 'neutral':
            return { accent: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.15)', text: '#616161' }; // Gray
        case 'stressed':
            return { accent: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)', text: '#E65100' }; // Orange
        case 'anxious':
            return { accent: '#FFC107', bg: 'rgba(255, 193, 7, 0.15)', text: '#F57F17' }; // Amber
        case 'sad':
            return { accent: '#673AB7', bg: 'rgba(103, 58, 183, 0.15)', text: '#4527A0' }; // Purple
        case 'depressed':
            return { accent: '#607D8B', bg: 'rgba(96, 125, 139, 0.15)', text: '#37474F' }; // Blue Gray (darker)
        case 'angry':
            return { accent: '#F44336', bg: 'rgba(244, 67, 54, 0.15)', text: '#C62828' }; // Red
        default:
            return { accent: '#78909C', bg: 'rgba(120, 144, 156, 0.15)', text: '#546E7A' }; // Default gray
    }
}

function formatTime(value: string) {
    const ms = new Date(value).getTime();
    if (!ms) return 'now';
    const diffMin = Math.max(1, Math.floor((Date.now() - ms) / 60000));
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
}

export default function PostCard({ post, theme, onOpen, onToggleSave, onDelete, onMessageAuthor }: Props) {
    const isLight = theme.id === 'matrix-white';
    const moodColors = post.mood ? getMoodColor(post.mood) : null;

    return (
        <Pressable
            style={[
                styles.card,
                {
                    borderLeftColor: moodColors?.accent || 'rgba(142, 161, 255, 0.4)',
                    borderLeftWidth: moodColors ? 4 : 2,
                },
            ]}
            onPress={onOpen}
        >
            <View style={styles.headerRow}>
                <Text style={styles.username}>{post.anonymousUsername}</Text>
                <Text style={styles.timeText}>{formatTime(post.createdAt)}</Text>
            </View>

            <Text style={styles.message}>{post.message}</Text>

            {post.mood && moodColors ? (
                <View style={[styles.moodTag, { backgroundColor: moodColors.bg, borderColor: moodColors.accent }]}>
                    <Text style={[styles.moodTagText, { color: moodColors.text }]}>
                        {post.mood}
                    </Text>
                </View>
            ) : null}

            {post.moderation?.flagged ? (
                <View style={[styles.flagBox, { borderColor: theme.colors.danger }]}>
                    <Text style={[styles.flagTitle, { color: theme.colors.danger }]}>Support Alert</Text>
                    <Text style={[styles.flagText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {post.moderation.empatheticResponse || 'Sensitive content detected. Support resources are available.'}
                    </Text>
                </View>
            ) : null}

            <View style={styles.footerRow}>
                <Text style={[styles.replyCount, { color: theme.colors.textSecondary }]}>Replies: {post.replyCount}</Text>
                <View style={styles.actionsRow}>
                    <Pressable onPress={onToggleSave} style={styles.actionButton}>
                        <Text style={[styles.actionText, { color: theme.colors.accent }]}>{post.saved ? 'Unsave' : 'Save'}</Text>
                    </Pressable>
                    {!post.canDelete ? (
                        <Pressable onPress={onMessageAuthor} style={styles.actionButton}>
                            <Text style={[styles.actionText, { color: theme.colors.accent }]}>DM</Text>
                        </Pressable>
                    ) : null}
                    {post.canDelete ? (
                        <Pressable onPress={onDelete} style={styles.actionButton}>
                            <Text style={[styles.actionText, { color: theme.colors.danger }]}>Delete</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(24, 32, 66, 0.45)', // Deep space glass
        borderWidth: 1,
        borderColor: 'rgba(142, 161, 255, 0.12)',
        borderRadius: 16,
        padding: 16, // Smoother internal padding
        marginBottom: 14,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    username: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF', // Bright title
    },
    timeText: {
        fontSize: 12,
        color: 'rgba(226, 233, 255, 0.6)',
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
        color: 'rgba(238, 243, 255, 0.94)', // Soft glowing readability
    },
    moodTag: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    moodTagText: {
        fontSize: 12,
        fontWeight: '700',
    },
    flagBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 8,
    },
    flagTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 4,
    },
    flagText: {
        fontSize: 12,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    replyCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        paddingVertical: 2,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
