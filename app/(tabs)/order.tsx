import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../services/api";
import { orderAPI } from "../../services/orderAPI";

type Product = {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
};

type OrderItem = {
    id: number;
    quantity: number;
    subtotal: number;
    product: Product;
};

type Order = {
    id: number;
    totalAmount: number;
    status?: string;
};

export default function OrderScreen() {
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOMO" | "PAYOS">("CASH");

    useEffect(() => {
        loadOrder();
    }, []);

    const loadOrder = async () => {
        try {
            const orderIdStr = await AsyncStorage.getItem("currentOrderId");
            if (!orderIdStr) {
                setLoading(false);
                return;
            }

            const res = await orderAPI.getOrder(Number(orderIdStr));
            setOrder(res.data.order);
            setItems(res.data.items);
        } catch (e) {
            console.log("❌ Load order error", e);
        } finally {
            setLoading(false);
        }
    };

    const changeQuantity = async (productId: number, newQty: number) => {
        if (!order || newQty < 1) return;
        try {
            await orderAPI.updateQuantity(order.id, productId, newQty);
            loadOrder();
        } catch (e) {
            alert("❌ Không thể cập nhật số lượng");
        }
    };

    const removeItem = async (productId: number) => {
        if (!order) return;
        try {
            await orderAPI.removeItem(order.id, productId);
            loadOrder();
        } catch (e) {
            alert("❌ Không thể xóa sản phẩm");
        }
    };

    const handleCheckout = async () => {
        if (!order) return;

        try {
            setLoading(true);

            await orderAPI.confirm(order.id);

            if (paymentMethod === "PAYOS") {
                const res = await orderAPI.pay(order.id, "PAYOS");

                const checkoutUrl = res.data.checkoutUrl;
                await Linking.openURL(checkoutUrl);
                return;
            }

            // CASH / MOMO
            await orderAPI.pay(order.id, paymentMethod);
            alert("✅ Thanh toán thành công");

            await AsyncStorage.removeItem("currentOrderId");
            setOrder(null);
            setItems([]);
            setShowPaymentModal(false);

        } catch (e) {
            alert("❌ Thanh toán thất bại");
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "CASH":
                return <Ionicons name="cash-outline" size={24} color="#4A6FFF" />;
            case "MOMO":
                return <Ionicons name="phone-portrait-outline" size={24} color="#D82D8B" />;
            case "PAYOS":
                return <Ionicons name="card-outline" size={24} color="#005BA4" />;
            default:
                return <Ionicons name="card-outline" size={24} color="#333" />;
        }
    };

    const getPaymentMethodName = (method: string) => {
        switch (method) {
            case "CASH": return "Tiền mặt";
            case "MOMO": return "Ví MoMo";
            case "PAYOS": return "PAYOS";
            default: return method;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4A6FFF" />
            </SafeAreaView>
        );
    }

    if (!items.length) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={100} color="#E0E0E0" />
                    <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                    <Text style={styles.emptySubtitle}>
                        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
                <Text style={styles.headerSubtitle}>{items.length} sản phẩm</Text>
            </View>

            {/* Cart Items */}
            <FlatList
                data={items}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image
                            source={{
                                uri: item.product.imageUrl.startsWith("http")
                                    ? item.product.imageUrl
                                    : `${API_BASE}${item.product.imageUrl}`,
                            }}
                            style={styles.productImage}
                        />

                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.productPrice}>
                                {item.product.price.toLocaleString()} đ
                            </Text>

                            {/* Quantity Controls */}
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.quantityButton,
                                        item.quantity <= 1 && styles.quantityButtonDisabled,
                                    ]}
                                    disabled={item.quantity <= 1}
                                    onPress={() => changeQuantity(item.product.id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove-outline" size={20} color={item.quantity <= 1 ? "#CCC" : "#333"} />
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => changeQuantity(item.product.id, item.quantity + 1)}
                                >
                                    <Ionicons name="add-outline" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.productActions}>
                            <Text style={styles.subtotal}>
                                {item.subtotal.toLocaleString()} đ
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => removeItem(item.product.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FF4757" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Order Summary */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>
                        {order?.totalAmount.toLocaleString()} đ
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                    <Text style={styles.summaryValue}>0 đ</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>
                        {order?.totalAmount.toLocaleString()} đ
                    </Text>
                </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => setShowPaymentModal(true)}
            >
                <Ionicons name="card-outline" size={22} color="#FFF" />
                <Text style={styles.checkoutText}>Thanh toán</Text>
            </TouchableOpacity>

            {/* Payment Modal */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.paymentMethods}>
                            {["CASH", "MOMO", "PAYOS"].map((method) => (
                                <TouchableOpacity
                                    key={method}
                                    style={[
                                        styles.paymentMethod,
                                        paymentMethod === method && styles.paymentMethodActive,
                                    ]}
                                    onPress={() => setPaymentMethod(method as any)}
                                >
                                    <View style={styles.methodInfo}>
                                        {renderPaymentMethodIcon(method)}
                                        <View style={styles.methodTextContainer}>
                                            <Text style={[
                                                styles.methodName,
                                                paymentMethod === method && styles.methodNameActive
                                            ]}>
                                                {getPaymentMethodName(method)}
                                            </Text>
                                            <Text style={styles.methodDescription}>
                                                {method === "CASH" ? "Thanh toán khi nhận hàng" :
                                                    method === "MOMO" ? "Thanh toán qua ví MoMo" :
                                                        "Thanh toán qua PAYOS"}
                                            </Text>
                                        </View>
                                    </View>
                                    {paymentMethod === method && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4A6FFF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
                                        <Text style={styles.confirmButtonText}>
                                            Xác nhận thanh toán
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowPaymentModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
    listContainer: {
        padding: 20,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F5F5F5",
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: "#F8F8F8",
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "space-between",
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        lineHeight: 22,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: "700",
        color: "#E53935",
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
        alignSelf: "flex-start",
        padding: 4,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },
    quantityButtonDisabled: {
        backgroundColor: "#F5F5F5",
        borderColor: "#EEE",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: "center",
    },
    productActions: {
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    subtotal: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    deleteButton: {
        padding: 8,
    },
    summaryCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: "#F8F9FF",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E8F0FF",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: "#666",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    divider: {
        height: 1,
        backgroundColor: "#E8E8E8",
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#E53935",
    },
    checkoutButton: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: "#4A6FFF",
        borderRadius: 14,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4A6FFF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    checkoutText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFF",
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    paymentMethods: {
        padding: 20,
    },
    paymentMethod: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        marginBottom: 12,
    },
    paymentMethodActive: {
        borderColor: "#4A6FFF",
        backgroundColor: "#F8FAFF",
    },
    methodInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    methodTextContainer: {
        marginLeft: 12,
    },
    methodName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    methodNameActive: {
        color: "#4A6FFF",
    },
    methodDescription: {
        fontSize: 14,
        color: "#666",
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    confirmButton: {
        backgroundColor: "#4A6FFF",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
        marginLeft: 8,
    },
    cancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
});