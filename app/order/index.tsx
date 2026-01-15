import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { orderAPI } from '../../services/orderAPI';

/* ================= TYPES ================= */

interface FoodItem {
    id: number;
    name: string;
    price: number;
    rating: number;
    image: string;
    category: string;
    description?: string;
    available: boolean;
}

/* ================= SCREEN ================= */

export default function DetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

    /* ===== Parse product from params ===== */
    const foodItem: FoodItem = params.item
        ? JSON.parse(params.item as string)
        : {
            id: 1,
            name: 'Soup Bumil',
            price: 289000,
            rating: 4.1,
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
            category: 'Soup',
            description: 'Delicious traditional soup with fresh ingredients and special spices.',
            available: true,
        };

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<'small' | 'regular' | 'large'>('regular');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

    /* ================= LOAD ORDER ================= */

    useEffect(() => {
        loadCurrentOrder();
    }, []);

    const loadCurrentOrder = async () => {
        try {
            const orderId = await AsyncStorage.getItem('currentOrderId');
            if (orderId) setCurrentOrderId(parseInt(orderId));
        } catch (e) {
            console.log("❌ Load order error", e);
        }
    };

    /* ================= PRICE ================= */

    const basePrice = foodItem.price * quantity;

    const sizePrices = {
        small: -50000,
        regular: 0,
        large: 75000,
    };

    const sizePrice = sizePrices[selectedSize];
    const totalPrice = basePrice + sizePrice;

    const extrasPrices: Record<string, number> = {
        cheese: 15000,
        sauce: 10000,
        bread: 25000,
        drink: 20000,
    };

    const extrasPrice = selectedExtras.reduce((t, e) => t + (extrasPrices[e] || 0), 0);
    const finalTotalPrice = totalPrice + extrasPrice;

    /* ================= CART ================= */

    const handleAddToCart = async () => {
        try {
            setIsLoading(true);

            let orderId = currentOrderId;

            if (!orderId) {
                const res = await orderAPI.createOrder();
                console.log("🧾 Create order response:", res.data);

                orderId = res.data.orderId;   // 🔥 gán lại biến ngoài

                if (!orderId) {
                    Alert.alert("Lỗi", "Không tạo được đơn hàng");
                    return;
                }

                await AsyncStorage.setItem("currentOrderId", orderId.toString());
                setCurrentOrderId(orderId);
            }

            // 🔥 Đảm bảo orderId là number
            await orderAPI.addItemToOrder(orderId, foodItem.id, quantity);

            Alert.alert("✅ Thành công", "Đã thêm vào giỏ hàng");
            router.push("/(tabs)/order");

        } catch (e) {
            console.log("❌ Add to cart error:", e);
            Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
        } finally {
            setIsLoading(false);
        }
    };
    /* ================= UI ================= */

    const toggleExtra = (extra: string) => {
        setSelectedExtras(prev =>
            prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]
        );
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Chi tiết món ăn",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push("/(tabs)/order")}>
                            <Ionicons name="cart-outline" size={24} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView>
                <Image source={{ uri: foodItem.image }} style={styles.foodImage} />

                <View style={styles.info}>
                    <Text style={styles.name}>{foodItem.name}</Text>
                    <Text style={styles.price}>{formatPrice(foodItem.price)}</Text>
                    <Text style={styles.desc}>{foodItem.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>Số lượng</Text>
                    <View style={styles.qtyRow}>
                        <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Ionicons name="remove-circle-outline" size={28} />
                        </TouchableOpacity>
                        <Text style={styles.qty}>{quantity}</Text>
                        <TouchableOpacity onPress={() => setQuantity(q => q + 1)}>
                            <Ionicons name="add-circle-outline" size={28} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>Tổng: {formatPrice(finalTotalPrice)}</Text>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddToCart}
                disabled={isLoading}
            >
                {isLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.addText}>Thêm vào giỏ hàng</Text>
                }
            </TouchableOpacity>
        </SafeAreaView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    foodImage: { width: "100%", height: 260 },
    info: { padding: 16 },
    name: { fontSize: 22, fontWeight: "bold" },
    price: { fontSize: 18, color: "#FF6B35", marginVertical: 6 },
    desc: { color: "#666" },
    section: { padding: 16 },
    title: { fontSize: 18, fontWeight: "bold" },
    qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
    qty: { fontSize: 20, marginHorizontal: 16 },
    addBtn: {
        backgroundColor: "#FF6B35",
        padding: 18,
        alignItems: "center",
    },
    addText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
