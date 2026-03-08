import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CommunityReply } from '../../services/communityService';
import { AppTheme } from '../../theme/themes';

type Props = {
    reply: CommunityReply;
    theme: AppTheme;
};

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

export default function ReplyItem({ reply, theme }: Props) {
    const isLight = theme.id === 'matrix-white';
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.cardBg,
                    borderColor: theme.colors.borderSoft,
                },
            ]}
        >
            <View style={styles.topRow}>
                <Text style={[styles.username, { color: theme.colors.textPrimary }]}>{reply.anonymousUsername}</Text>
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>{formatTime(reply.createdAt)}</Text>
            </View>
            <Text style={[styles.message, { color: isLight ? '#000000' : theme.colors.textPrimary }]}>{reply.message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    username: {
        fontSize: 13,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
});
