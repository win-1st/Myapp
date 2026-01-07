import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CheckoutScreen() {
    const router = useRouter();

    const handlePlaceOrder = () => {
        Alert.alert(
            'Order Placed 🎉',
            'Your food is on the way!',
            [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/history'),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.card}>
                        <Ionicons name="location-outline" size={22} color="#FF6B35" />
                        <Text style={styles.cardText}>
                            123 Nguyen Van A Street, Ho Chi Minh City
                        </Text>
                    </View>
                </View>

                {/* Payment */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.card}>
                        <Ionicons name="card-outline" size={22} color="#FF6B35" />
                        <Text style={styles.cardText}>Cash on Delivery</Text>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text>Soup Bumil x1</Text>
                        <Text>IDR 289,000</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text>Delivery Fee</Text>
                        <Text>Free</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>IDR 289,000</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order */}
            <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
                <Text style={styles.buttonText}>Place Order</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },

    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
    },
    cardText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#EAEAEA',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B35',
    },

    button: {
        backgroundColor: '#FF6B35',
        padding: 18,
        borderRadius: 12,
        margin: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
