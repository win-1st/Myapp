import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { orderAPI } from '../../services/api';

// Type definition
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

export default function OrderScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

    // Parse the food item from params
    const foodItem: FoodItem = params.item ? JSON.parse(params.item as string) : {
        id: 1,
        name: 'Soup Bumil',
        price: 289000,
        rating: 4.1,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
        category: 'Soup',
        description: 'Delicious traditional soup with fresh ingredients and special spices.',
        available: true
    };

    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('regular');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

    // Load current order ID from storage
    useEffect(() => {
        loadCurrentOrder();
    }, []);

    const loadCurrentOrder = async () => {
        try {
            const orderId = await AsyncStorage.getItem('currentOrderId');
            if (orderId) {
                setCurrentOrderId(parseInt(orderId));
            }
        } catch (error) {
            console.error('Error loading order:', error);
        }
    };

    // Calculate total price
    const basePrice = foodItem.price * quantity;
    const sizePrices = {
        'small': -50000,
        'regular': 0,
        'large': 75000,
    };
    const sizePrice = sizePrices[selectedSize as keyof typeof sizePrices] || 0;
    const totalPrice = basePrice + sizePrice;

    // Handle add to cart with API integration
    const handleAddToCart = async () => {
        if (!foodItem.available) {
            Alert.alert('Thông báo', 'Sản phẩm này hiện không có sẵn');
            return;
        }

        setIsLoading(true);
        try {
            let orderId = currentOrderId;

            // Nếu chưa có order, tạo order mới
            if (!orderId) {
                const orderResponse = await orderAPI.createOrder();
                // Kiểm tra response và lấy orderId
                if (orderResponse.data && orderResponse.data.id) {
                    orderId = orderResponse.data.id;
                    setCurrentOrderId(orderId);
                    await AsyncStorage.setItem('currentOrderId', orderId.toString());
                } else {
                    throw new Error('Không nhận được order ID từ server');
                }
            }

            // CHỈ gọi API nếu orderId không null
            if (orderId !== null && orderId !== undefined) {
                await orderAPI.addItemToOrder(orderId, foodItem.id, quantity);

                // Show success message
                Alert.alert(
                    'Thêm vào giỏ hàng',
                    `${quantity}x ${foodItem.name} đã được thêm vào giỏ hàng`,
                    [
                        {
                            text: 'Tiếp tục mua sắm',
                            onPress: () => router.back(),
                            style: 'cancel'
                        },
                        {
                            text: 'Xem giỏ hàng',
                            onPress: () => {
                                router.push('/(tabs)/order');
                            }
                        }
                    ]
                );
            } else {
                throw new Error('Không thể tạo hoặc lấy order ID');
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle extra
    const toggleExtra = (extra: string) => {
        setSelectedExtras(prev =>
            prev.includes(extra)
                ? prev.filter(item => item !== extra)
                : [...prev, extra]
        );
    };

    // Format price to Vietnamese Dong
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Calculate extras price
    const calculateExtrasPrice = () => {
        const extrasPrices: { [key: string]: number } = {
            'cheese': 15000,
            'sauce': 10000,
            'bread': 25000,
            'drink': 20000,
        };

        return selectedExtras.reduce((total, extra) => {
            return total + (extrasPrices[extra] || 0);
        }, 0);
    };

    const extrasPrice = calculateExtrasPrice();
    const finalTotalPrice = totalPrice + extrasPrice;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Chi tiết đặt hàng',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="#2D3436" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => router.push('/(tabs)/order')}
                        >
                            <Ionicons name="cart-outline" size={24} color="#2D3436" />
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>3</Text>
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Food Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: foodItem.image }}
                        style={styles.foodImage}
                    />
                    <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart" size={24} color="#FF6B35" />
                    </TouchableOpacity>
                    {!foodItem.available && (
                        <View style={styles.unavailableOverlay}>
                            <Text style={styles.unavailableText}>Hết hàng</Text>
                        </View>
                    )}
                </View>

                {/* Food Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.foodName}>{foodItem.name}</Text>

                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= Math.floor(foodItem.rating) ? "star" : "star-outline"}
                                    size={16}
                                    color="#FF6B35"
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingText}>{foodItem.rating} ({foodItem.rating > 4 ? 'Tuyệt vời' : 'Tốt'})</Text>
                    </View>

                    <Text style={styles.category}>{foodItem.category}</Text>

                    <Text style={styles.description}>
                        {foodItem.description || 'Món ăn ngon được chế biến từ nguyên liệu tươi và gia vị đặc biệt. Phù hợp cho mọi dịp.'}
                    </Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(foodItem.price)}</Text>
                        <Text style={styles.deliveryTime}>• 20-30 phút • Giao hàng miễn phí</Text>
                    </View>
                </View>

                {/* Size Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn kích cỡ</Text>
                    <View style={styles.sizeOptions}>
                        {[
                            { id: 'small', label: 'Nhỏ', price: -50000 },
                            { id: 'regular', label: 'Vừa', price: 0 },
                            { id: 'large', label: 'Lớn', price: 75000 },
                        ].map((size) => (
                            <TouchableOpacity
                                key={size.id}
                                style={[
                                    styles.sizeOption,
                                    selectedSize === size.id && styles.selectedSizeOption,
                                ]}
                                onPress={() => setSelectedSize(size.id)}
                            >
                                <Text style={[
                                    styles.sizeLabel,
                                    selectedSize === size.id && styles.selectedSizeLabel,
                                ]}>
                                    {size.label}
                                </Text>
                                <Text style={[
                                    styles.sizePrice,
                                    selectedSize === size.id && styles.selectedSizePrice,
                                ]}>
                                    {size.price > 0 ? `+${formatPrice(size.price)}` :
                                        size.price < 0 ? `${formatPrice(size.price)}` :
                                            'Miễn phí'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Extras */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thêm món phụ</Text>
                    {[
                        { id: 'cheese', label: 'Thêm phô mai', price: 15000 },
                        { id: 'sauce', label: 'Sốt đặc biệt', price: 10000 },
                        { id: 'bread', label: 'Bánh mì tỏi', price: 25000 },
                        { id: 'drink', label: 'Nước ngọt', price: 20000 },
                    ].map((extra) => (
                        <TouchableOpacity
                            key={extra.id}
                            style={styles.extraOption}
                            onPress={() => toggleExtra(extra.id)}
                        >
                            <View style={styles.extraLeft}>
                                <View style={[
                                    styles.checkbox,
                                    selectedExtras.includes(extra.id) && styles.checkedCheckbox,
                                ]}>
                                    {selectedExtras.includes(extra.id) && (
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    )}
                                </View>
                                <Text style={styles.extraLabel}>{extra.label}</Text>
                            </View>
                            <Text style={styles.extraPrice}>+{formatPrice(extra.price)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Special Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yêu cầu đặc biệt</Text>
                    <View style={styles.instructionsContainer}>
                        <Feather name="edit-2" size={20} color="#95A5A6" style={styles.instructionsIcon} />
                        <TextInput
                            style={styles.instructionsInput}
                            placeholder="Ví dụ: Không hành, thêm cay..."
                            placeholderTextColor="#95A5A6"
                            value={specialInstructions}
                            onChangeText={setSpecialInstructions}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.quantitySection}>
                    <Text style={styles.sectionTitle}>Số lượng</Text>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Ionicons name="remove" size={20} color="#2D3436" />
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{quantity}</Text>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => setQuantity(quantity + 1)}
                        >
                            <Ionicons name="add" size={20} color="#2D3436" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết giá</Text>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Giá món ăn</Text>
                            <Text style={styles.priceValue}>{formatPrice(foodItem.price)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Số lượng</Text>
                            <Text style={styles.priceValue}>x{quantity}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Kích cỡ ({selectedSize})</Text>
                            <Text style={styles.priceValue}>
                                {sizePrice !== 0 ? formatPrice(sizePrice) : 'Miễn phí'}
                            </Text>
                        </View>
                        {selectedExtras.length > 0 && (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Món phụ</Text>
                                <Text style={styles.priceValue}>+{formatPrice(extrasPrice)}</Text>
                            </View>
                        )}
                        <View style={[styles.priceRow, styles.totalPriceRow]}>
                            <Text style={styles.totalRowLabel}>Tổng cộng</Text>
                            <Text style={styles.totalRowValue}>{formatPrice(finalTotalPrice)}</Text>
                        </View>
                    </View>
                </View>

                {/* Spacer for bottom button */}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Bottom Order Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.bottomTotalLabel}>Tổng tiền</Text>
                    <Text style={styles.bottomTotalPrice}>{formatPrice(finalTotalPrice)}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.orderButton, (isLoading || !foodItem.available) && styles.disabledButton]}
                    onPress={handleAddToCart}
                    disabled={isLoading || !foodItem.available}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.orderButtonText}>
                                {!foodItem.available ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                            </Text>
                            <Ionicons name="cart" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: 8,
    },
    cartButton: {
        padding: 8,
        marginRight: 8,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF6B35',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    imageContainer: {
        position: 'relative',
    },
    foodImage: {
        width: '100%',
        height: 250,
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: 20,
        paddingBottom: 0,
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3436',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingStars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
        color: '#636E72',
    },
    category: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#636E72',
        lineHeight: 22,
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B35',
        marginRight: 12,
    },
    deliveryTime: {
        fontSize: 14,
        color: '#636E72',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3436',
        marginBottom: 16,
    },
    sizeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sizeOption: {
        flex: 1,
        padding: 16,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    selectedSizeOption: {
        backgroundColor: '#FFF5F2',
        borderColor: '#FF6B35',
    },
    sizeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3436',
        marginBottom: 4,
    },
    selectedSizeLabel: {
        color: '#FF6B35',
    },
    sizePrice: {
        fontSize: 14,
        color: '#636E72',
    },
    selectedSizePrice: {
        color: '#FF6B35',
        fontWeight: '600',
    },
    extraOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    extraLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#DEE2E6',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedCheckbox: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    extraLabel: {
        fontSize: 16,
        color: '#2D3436',
    },
    extraPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3436',
    },
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
    },
    instructionsIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    instructionsInput: {
        flex: 1,
        fontSize: 15,
        color: '#2D3436',
        paddingVertical: 0,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 25,
        padding: 4,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3436',
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: 'center',
    },
    priceBreakdown: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 15,
        color: '#636E72',
    },
    priceValue: {
        fontSize: 15,
        color: '#2D3436',
        fontWeight: '500',
    },
    totalPriceRow: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 12,
        marginTop: 4,
    },
    totalRowLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3436',
    },
    totalRowValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    spacer: {
        height: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    totalContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    bottomTotalLabel: {
        fontSize: 14,
        color: '#636E72',
        marginBottom: 2,
    },
    bottomTotalPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    orderButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    disabledButton: {
        backgroundColor: '#95A5A6',
    },
    orderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
});