import { Ionicons } from '@expo/vector-icons';
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

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        try {
            const res = await orderAPI.getHistory();
            console.log("📜 History:", res.data);

            // backend trả về { orders: [...] }
            setOrders(res.data.orders || []);
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

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return { text: 'Đã giao', color: '#10B981', bgColor: '#D1FAE5' };
            case 'CONFIRMED':
                return { text: 'Đã xác nhận', color: '#3B82F6', bgColor: '#DBEAFE' };
            case 'PREPARING':
                return { text: 'Đang chuẩn bị', color: '#F59E0B', bgColor: '#FEF3C7' };
            case 'SHIPPING':
                return { text: 'Đang giao', color: '#8B5CF6', bgColor: '#EDE9FE' };
            case 'CANCELLED':
                return { text: 'Đã hủy', color: '#EF4444', bgColor: '#FEE2E2' };
            default:
                return { text: 'Chờ xác nhận', color: '#6B7280', bgColor: '#F3F4F6' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const renderOrderItem = ({ item }: { item: OrderHistory }) => {
        const statusInfo = getStatusInfo(item.status);
        const { date, time } = formatDate(item.createdAt);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => openOrderDetail(item)}
                activeOpacity={0.7}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Ionicons name="receipt-outline" size={20} color="#4A6FFF" />
                        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{date} - {time}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={16} color="#6B7280" />
                        <Text style={styles.amountText}>
                            {item.totalAmount.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.detailText}>Xem chi tiết</Text>
                    <Ionicons name="chevron-forward" size={20} color="#4A6FFF" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailItem = ({ item }: { item: OrderItem }) => (
        <View style={styles.detailItem}>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                </Text>
                <Text style={styles.productPrice}>
                    {item.product.price.toLocaleString('vi-VN')} đ
                </Text>
            </View>

            <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>Số lượng: {item.quantity}</Text>
                <Text style={styles.subtotalText}>
                    {item.subtotal.toLocaleString('vi-VN')} đ
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A6FFF" />
                <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
                <Text style={styles.headerSubtitle}>{orders.length} đơn hàng</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color="#E5E7EB" />
                    <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                    <Text style={styles.emptySubtitle}>
                        Đơn hàng của bạn sẽ xuất hiện ở đây
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4A6FFF']}
                            tintColor="#4A6FFF"
                        />
                    }
                />
            )}

            {/* Order Detail Modal */}
            <Modal
                visible={showDetail}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDetail(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {detailLoading ? (
                            <View style={styles.modalLoading}>
                                <ActivityIndicator size="large" color="#4A6FFF" />
                            </View>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setShowDetail(false)}
                                    >
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.modalContent}>
                                    {selectedOrder && (
                                        <View style={styles.orderSummary}>
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.summaryLabel}>Mã đơn hàng</Text>
                                                <Text style={styles.summaryValue}>#{selectedOrder.id}</Text>
                                            </View>
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.summaryLabel}>Ngày đặt</Text>
                                                <Text style={styles.summaryValue}>
                                                    {formatDate(selectedOrder.createdAt).date}
                                                </Text>
                                            </View>
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.summaryLabel}>Trạng thái</Text>
                                                <View style={[styles.statusBadge, {
                                                    backgroundColor: getStatusInfo(selectedOrder.status).bgColor
                                                }]}>
                                                    <Text style={[styles.statusText, {
                                                        color: getStatusInfo(selectedOrder.status).color
                                                    }]}>
                                                        {getStatusInfo(selectedOrder.status).text}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.detailSection}>
                                        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
                                        {detailItems.map((item) => (
                                            <View key={item.id} style={styles.detailItem}>
                                                <View style={styles.productInfo}>
                                                    <Text style={styles.productName}>
                                                        {item.product.name}
                                                    </Text>
                                                    <Text style={styles.productPrice}>
                                                        {item.product.price.toLocaleString('vi-VN')} đ
                                                    </Text>
                                                </View>
                                                <View style={styles.quantityRow}>
                                                    <Text style={styles.quantityLabel}>
                                                        Số lượng: {item.quantity}
                                                    </Text>
                                                    <Text style={styles.subtotalText}>
                                                        {item.subtotal.toLocaleString('vi-VN')} đ
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    {selectedOrder && (
                                        <View style={styles.totalSection}>
                                            <View style={styles.totalRow}>
                                                <Text style={styles.totalLabel}>Tổng cộng</Text>
                                                <Text style={styles.totalAmount}>
                                                    {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.closeModalButton}
                                        onPress={() => setShowDetail(false)}
                                    >
                                        <Text style={styles.closeModalText}>Đóng</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
    },
    listContainer: {
        padding: 20,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderInfo: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4A6FFF',
        marginLeft: 8,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    detailText: {
        fontSize: 14,
        color: '#4A6FFF',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalLoading: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        padding: 20,
    },
    orderSummary: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    detailSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    detailItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    productInfo: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#6B7280',
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4A6FFF',
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    closeModalButton: {
        backgroundColor: '#4A6FFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        color: '#6B7280',
    },
});