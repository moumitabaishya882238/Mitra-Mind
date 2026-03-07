import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function CopingToolkitScreen() {
    const tools = [
        { id: '1', title: '5-4-3-2-1 Grounding Technique' },
        { id: '2', title: 'Deep Breathing Exercise' },
        { id: '3', title: 'Manage Academic Anxiety (CBT)' },
        { id: '4', title: 'Sleep Hygiene Checklist' }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Coping Toolkit</Text>

            <FlatList
                data={tools}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.toolCard}>
                        <Text style={styles.toolTitle}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    toolCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 1 },
    toolTitle: { fontSize: 16, fontWeight: '600' }
});
