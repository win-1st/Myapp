import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { orderAPI } from "../../../services/orderAPI";

type Product = {
    id: number;
    name: string;
    price: number;
};

type OrderItem = {
    id: number;
    quantity: number;
    subtotal: number;
    product: Product;
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const res = await orderAPI.getOrder(Number(id));
            setOrder(res.data.order);
            setItems(res.data.items);
        } catch (err) {
            console.log("❌ Load order detail error", err);
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

    if (!order) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Không tìm thấy đơn hàng</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Đơn hàng #{order.id}</Text>
            <Text>Ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</Text>
            <Text>Trạng thái: {order.status}</Text>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.name}>{item.product.name}</Text>
                        <Text>x{item.quantity}</Text>
                        <Text>{item.subtotal.toLocaleString()} đ</Text>
                    </View>
                )}
            />

            <Text style={styles.total}>
                Tổng tiền: {order.totalAmount.toLocaleString()} đ
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    name: { fontWeight: "600" },
    total: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 12,
        textAlign: "right",
    }
});
