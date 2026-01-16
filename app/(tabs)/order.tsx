import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { API_BASE } from "../../services/api";
import { orderAPI } from '../../services/orderAPI';
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
    product: Product;   // 🔥
};

type Order = {
    id: number;
    totalAmount: number;
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
                console.log("❌ No currentOrderId in storage");
                setLoading(false);
                return;
            }

            const orderId = parseInt(orderIdStr);
            console.log("📦 Loading order:", orderId);

            const res = await orderAPI.getOrder(orderId);

            console.log("🧾 ORDER API RESPONSE:", JSON.stringify(res.data, null, 2));

            setOrder(res.data.order);
            setItems(res.data.items);

        } catch (e) {
            console.log("❌ Load order error", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!items.length) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>🛒 Giỏ hàng trống</Text>
            </SafeAreaView>
        );
    }

    const handleCheckout = async (method: "CASH" | "MOMO" | "PAYOS") => {
        if (!order) {
            alert("❌ Không tìm thấy đơn hàng");
            return;
        }

        try {
            setLoading(true);

            await orderAPI.confirm(order.id);

            const res = await orderAPI.pay(order.id, method); // 🔥 dùng method
            console.log("💰 Payment result:", res.data);

            alert("✅ Thanh toán thành công!");

            await AsyncStorage.removeItem("currentOrderId");
            setItems([]);
            setOrder(null);
            setShowPaymentModal(false);

        } catch (err) {
            console.log("❌ Payment error", err);
            alert("❌ Thanh toán thất bại");
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (productId: number) => {
        if (!order) return;

        try {
            await orderAPI.removeItem(order.id, productId);
            loadOrder(); // reload giỏ hàng sau khi xóa
        } catch (err) {
            console.log("❌ Remove item error", err);
            alert("❌ Không thể xóa sản phẩm");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>🛒 Giỏ hàng</Text>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image
                            source={{
                                uri: item.product.imageUrl.startsWith("http")
                                    ? item.product.imageUrl
                                    : `${API_BASE}${item.product.imageUrl}`
                            }}
                            style={{ width: 80, height: 80, borderRadius: 8 }}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.itemName}>{item.product.name}</Text>
                            <Text>Số lượng: {item.quantity}</Text>
                            <Text>{item.subtotal.toLocaleString()} đ</Text>
                        </View>

                        {/* 🗑️ Nút xóa */}
                        <TouchableOpacity
                            onPress={() => removeItem(item.product.id)}
                            style={{ padding: 10 }}
                        >
                            <Text style={{ fontSize: 20, color: "red" }}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.payBtn} onPress={() => setShowPaymentModal(true)}>
                <Text style={styles.payText}>Thanh toán</Text>
            </TouchableOpacity>



            <View style={styles.totalBox}>
                <Text style={styles.totalText}>
                    Tổng cộng: {order?.totalAmount?.toLocaleString() ?? "0"} đ
                </Text>
            </View>

            <Modal visible={showPaymentModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>💳 Chọn phương thức thanh toán</Text>

                        {["CASH", "MOMO", "VNPAY"].map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    styles.methodBtn,
                                    paymentMethod === m && styles.methodActive
                                ]}
                                onPress={() => setPaymentMethod(m as any)}
                            >
                                <Text
                                    style={[
                                        styles.methodText,
                                        paymentMethod === m && { color: "#fff" }
                                    ]}
                                >
                                    {m === "CASH" && "💵 Tiền mặt"}
                                    {m === "MOMO" && "📱 Momo"}
                                    {m === "VNPAY" && "🏦 VNPay"}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => handleCheckout(paymentMethod)}
                        >
                            <Text style={styles.confirmText}>Xác nhận thanh toán</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 16
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333"
    },

    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 18,
        color: "#888"
    },

    item: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2
    },

    itemName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    },

    itemQuantity: {
        fontSize: 14,
        color: "#555"
    },

    itemPrice: {
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 6,
        color: "#E53935"
    },

    totalBox: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderTopWidth: 1,
        borderColor: "#eee"
    },

    totalText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        textAlign: "right"
    },

    payBtn: {
        backgroundColor: "#E53935",
        padding: 16,
        borderRadius: 12,
        marginTop: 12
    },
    payText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold"
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },

    modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center"
    },

    methodBtn: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10
    },

    methodActive: {
        backgroundColor: "#E53935",
        borderColor: "#E53935"
    },

    methodText: {
        fontSize: 16,
        textAlign: "center"
    },

    confirmBtn: {
        backgroundColor: "#E53935",
        padding: 14,
        borderRadius: 12,
        marginTop: 10
    },

    confirmText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold"
    },

    cancelText: {
        textAlign: "center",
        marginTop: 12,
        color: "#888"
    }
});


