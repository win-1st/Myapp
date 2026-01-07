import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const orders = [
    {
        id: '1',
        date: '12 Jan 2026',
        total: 'IDR 289,000',
        status: 'Delivered',
    },
    {
        id: '2',
        date: '10 Jan 2026',
        total: 'IDR 150,000',
        status: 'Pending',
    },
];

export default function HistoryScreen() {
    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text
                    style={[
                        styles.status,
                        item.status === 'Delivered'
                            ? styles.delivered
                            : styles.pending,
                    ]}
                >
                    {item.status}
                </Text>
            </View>

            <Text style={styles.date}>{item.date}</Text>

            <View style={styles.row}>
                <Text style={styles.total}>{item.total}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    card: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        color: '#666',
        marginVertical: 6,
    },
    total: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
    },

    status: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    delivered: {
        color: 'green',
    },
    pending: {
        color: '#FF6B35',
    },
});
