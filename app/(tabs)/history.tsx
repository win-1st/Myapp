import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { orderAPI } from '../../services/orderAPI';

type OrderHistory = {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
};

export default function HistoryScreen() {
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await orderAPI.getHistory();
            console.log("📜 History:", res.data);

            // backend trả về { orders: [...] }
            setOrders(res.data.orders);
        } catch (err) {
            console.log("❌ Load history error", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("vi-VN");

    const formatMoney = (n: number) =>
        n.toLocaleString("vi-VN") + " đ";

    const renderItem = ({ item }: { item: OrderHistory }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.orderId}>Đơn #{item.id}</Text>
                <Text
                    style={[
                        styles.status,
                        item.status === "DELIVERED"
                            ? styles.delivered
                            : styles.pending
                    ]}
                >
                    {item.status === "DELIVERED"
                        ? "Đã thanh toán"
                        : item.status === "CONFIRMED"
                            ? "Chờ thanh toán"
                            : "Đang xử lý"}
                </Text>
            </View>

            <Text style={styles.date}>
                {formatDate(item.createdAt)}
            </Text>

            <View style={styles.row}>
                <Text style={styles.total}>
                    {formatMoney(item.totalAmount)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!orders.length) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ textAlign: "center", marginTop: 40 }}>
                    Chưa có đơn hàng nào
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
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
