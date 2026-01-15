import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { orderAPI } from '../../services/orderAPI';
type Product = {
    id: number;
    name: string;
    price: number;
};

type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    subtotal: number;
};

type Order = {
    id: number;
    totalAmount: number;
};
export default function OrderScreen() {
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

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
            setItems(res.data.items || []);

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

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>🛒 Giỏ hàng</Text>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemName}>Sản phẩm #{item.id}</Text>

                        <Text style={styles.itemQuantity}>
                            Số lượng: {item.quantity}
                        </Text>

                        <Text style={styles.itemPrice}>
                            {item.subtotal.toLocaleString()} đ
                        </Text>
                    </View>
                )}
            />

            <View style={styles.totalBox}>
                <Text style={styles.totalText}>
                    Tổng cộng: {order?.totalAmount?.toLocaleString() ?? "0"} đ
                </Text>
            </View>
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
    }
});
