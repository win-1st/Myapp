import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
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

type OrderItem = {
    id: number;
    product: {
        name: string;
        price: number;
    };
    quantity: number;
    subtotal: number;
};

export default function HistoryScreen() {
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
    const [detailItems, setDetailItems] = useState<OrderItem[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    // ✅ GIỮ useFocusEffect
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    // ================= LOAD HISTORY =================
    const loadHistory = async () => {
        try {
            const res = await orderAPI.getHistory();
            console.log("📜 History:", res.data);

            // ✅ 1️⃣ CHỈ LOẠI NEW
            const filtered = (res.data.orders || []).filter(
                (o: any) => o.status !== "NEW"
            );

            setOrders(filtered);
        } catch (err) {
            console.log("❌ Load history error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    // ================= LOAD DETAIL =================
    const openOrderDetail = async (order: OrderHistory) => {
        try {
            setDetailLoading(true);
            setShowDetail(true);
            setSelectedOrder(order);

            const res = await orderAPI.getOrder(order.id);
            setDetailItems(res.data.items || []);
        } catch (err) {
            console.log("❌ Load detail error", err);
        } finally {
            setDetailLoading(false);
        }
    };

    // ================= STATUS =================
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { text: 'Đã thanh toán', color: '#16A34A', bgColor: '#DCFCE7' };

            case 'PENDING':
                return { text: 'Chờ thanh toán', color: '#F97316', bgColor: '#FFEDD5' };

            case 'CONFIRMED':
                return { text: 'Đã xác nhận', color: '#3B82F6', bgColor: '#DBEAFE' };

            case 'PREPARING':
                return { text: 'Đang chuẩn bị', color: '#F59E0B', bgColor: '#FEF3C7' };

            case 'SHIPPING':
                return { text: 'Đang giao', color: '#8B5CF6', bgColor: '#EDE9FE' };

            case 'DELIVERED':
                return { text: 'Đã giao', color: '#10B981', bgColor: '#D1FAE5' };

            case 'CANCELLED':
                return { text: 'Đã hủy', color: '#EF4444', bgColor: '#FEE2E2' };

            default:
                return { text: status, color: '#6B7280', bgColor: '#F3F4F6' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // ================= RENDER =================
    const renderOrderItem = ({ item }: { item: OrderHistory }) => {
        const statusInfo = getStatusInfo(item.status);
        const { date, time } = formatDate(item.createdAt);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => openOrderDetail(item)}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                <Text>{date} - {time}</Text>
                <Text style={styles.amount}>
                    {item.totalAmount.toLocaleString('vi-VN')} đ
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* DETAIL MODAL */}
            <Modal visible={showDetail} transparent animationType="slide">
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        {detailLoading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>
                                    Đơn #{selectedOrder?.id}
                                </Text>

                                <ScrollView>
                                    {detailItems.map(item => (
                                        <View key={item.id}>
                                            <Text>{item.product.name}</Text>
                                            <Text>x{item.quantity}</Text>
                                            <Text>
                                                {item.subtotal.toLocaleString('vi-VN')} đ
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity onPress={() => setShowDetail(false)}>
                                    <Text>Đóng</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ================= STYLE =================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    orderCard: {
        padding: 16,
        margin: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 2
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    orderId: { fontWeight: '700', fontSize: 16 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    amount: { fontSize: 18, fontWeight: '700', marginTop: 8 },
    modal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%'
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 }
});
