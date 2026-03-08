import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../../theme/themes';
import { DirectMessageItem } from '../../services/communityService';

type Props = {
    item: DirectMessageItem;
    theme: AppTheme;
};

function formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
}

export default function MessageBubble({ item, theme }: Props) {
    const isMine = item.isMine;
    const isLight = theme.id === 'matrix-white';

    return (
        <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
            <View
                style={[
                    styles.bubble,
                    isMine
                        ? { backgroundColor: theme.colors.accent }
                        : {
                            backgroundColor: theme.colors.cardBg,
                            borderColor: theme.colors.borderSoft,
                            borderWidth: 1,
                        },
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        isMine
                            ? { color: '#FFFFFF' }
                            : { color: isLight ? '#000000' : theme.colors.textPrimary },
                    ]}
                >
                    {item.message}
                </Text>

                <Text
                    style={[
                        styles.meta,
                        isMine
                            ? { color: 'rgba(255,255,255,0.8)' }
                            : { color: isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.62)' },
                    ]}
                >
                    {formatTime(item.timestamp)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        width: '100%',
        marginBottom: 10,
    },
    rowMine: {
        alignItems: 'flex-end',
    },
    rowOther: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '84%',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingTop: 9,
        paddingBottom: 6,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
    meta: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
        fontWeight: '600',
    },
});
