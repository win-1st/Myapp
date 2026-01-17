import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
};

export default function OrderScreen() {
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] =
        useState<"CASH" | "MOMO" | "VNPAY">("CASH");

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

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!items.length) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.empty}>🛒 Giỏ hàng trống</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>🛒 Giỏ hàng</Text>

            <FlatList
                data={items}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image
                            source={{
                                uri: item.product.imageUrl.startsWith("http")
                                    ? item.product.imageUrl
                                    : `${API_BASE}${item.product.imageUrl}`,
                            }}
                            style={styles.image}
                        />

                        <View style={styles.info}>
                            <Text style={styles.name}>{item.product.name}</Text>
                            <Text style={styles.price}>
                                {item.product.price.toLocaleString()} đ
                            </Text>

                            <View style={styles.qtyRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.qtyBtn,
                                        item.quantity <= 1 && styles.qtyDisabled,
                                    ]}
                                    disabled={item.quantity <= 1}
                                    onPress={() =>
                                        changeQuantity(
                                            item.product.id,
                                            item.quantity - 1
                                        )
                                    }
                                >
                                    <Text style={styles.qtyText}>−</Text>
                                </TouchableOpacity>

                                <Text style={styles.qtyNum}>
                                    {item.quantity}
                                </Text>

                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() =>
                                        changeQuantity(
                                            item.product.id,
                                            item.quantity + 1
                                        )
                                    }
                                >
                                    <Text style={styles.qtyText}>＋</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.right}>
                            <Text style={styles.subtotal}>
                                {item.subtotal.toLocaleString()} đ
                            </Text>
                            <TouchableOpacity
                                onPress={() => removeItem(item.product.id)}
                            >
                                <Text style={styles.delete}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <View style={styles.totalBox}>
                <Text style={styles.total}>
                    Tổng cộng: {order?.totalAmount.toLocaleString()} đ
                </Text>
            </View>

            <TouchableOpacity
                style={styles.payBtn}
                onPress={() => setShowPaymentModal(true)}
            >
                <Text style={styles.payText}>Thanh toán</Text>
            </TouchableOpacity>

            {/* PAYMENT MODAL */}
            <Modal visible={showPaymentModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            💳 Phương thức thanh toán
                        </Text>

                        {["CASH", "MOMO", "VNPAY"].map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    styles.methodBtn,
                                    paymentMethod === m &&
                                    styles.methodActive,
                                ]}
                                onPress={() => setPaymentMethod(m as any)}
                            >
                                <Text
                                    style={[
                                        styles.methodText,
                                        paymentMethod === m && { color: "#fff" },
                                    ]}
                                >
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.confirmText}>
                                Xác nhận thanh toán
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowPaymentModal(false)}
                        >
                            <Text style={styles.cancel}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f6f6f6" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
    empty: { fontSize: 18, color: "#888" },

    item: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },

    image: { width: 90, height: 90, borderRadius: 10 },
    info: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
    name: { fontSize: 16, fontWeight: "600" },
    price: { color: "#E53935", fontWeight: "bold" },

    qtyRow: { flexDirection: "row", alignItems: "center" },
    qtyBtn: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    qtyDisabled: { opacity: 0.4 },
    qtyText: { fontSize: 18, fontWeight: "bold" },
    qtyNum: { marginHorizontal: 12, fontSize: 16, fontWeight: "bold" },

    right: { alignItems: "flex-end", justifyContent: "space-between" },
    subtotal: { fontWeight: "bold" },
    delete: { fontSize: 20, color: "red" },

    totalBox: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 8,
    },
    total: { fontSize: 18, fontWeight: "bold", textAlign: "right" },

    payBtn: {
        backgroundColor: "#E53935",
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    payText: { color: "#fff", textAlign: "center", fontSize: 18 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    methodBtn: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 8,
    },
    methodActive: { backgroundColor: "#E53935", borderColor: "#E53935" },
    methodText: { textAlign: "center", fontSize: 16 },
    confirmBtn: {
        backgroundColor: "#E53935",
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
    },
    confirmText: { color: "#fff", textAlign: "center" },
    cancel: { textAlign: "center", marginTop: 10, color: "#888" },
});
