import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Conditional import cho Lottie
let LottieView: any = null;
let isWeb = Platform.OS === 'web';

if (!isWeb) {
    try {
        LottieView = require('lottie-react-native').default;
    } catch (error) {
        console.log('Lottie not available');
    }
}

export default function WelcomeScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const animationRef = useRef<any>(null);
    const [useFallback, setUseFallback] = useState(isWeb);

    useEffect(() => {
        // Animation khi mở màn hình
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Start Lottie animation nếu có
        if (animationRef.current && !useFallback) {
            setTimeout(() => {
                animationRef.current?.play();
            }, 300);
        }
    }, [useFallback]);

    const handleGetStarted = () => {
        router.replace('/signin');
    };


    // Render animation section
    const renderAnimation = () => {
        // Trên web hoặc fallback, dùng icon hoặc image
        if (useFallback || !LottieView) {
            return (
                <View style={styles.fallbackContainer}>
                    <Ionicons name="fast-food" size={120} color="#FF6B35" />
                    <View style={styles.fallbackIcon}>
                        <Ionicons name="bicycle" size={40} color="#FF6B35" />
                    </View>
                </View>
            );
        }

        // Trên mobile, dùng Lottie
        try {
            // OPTION 1: Từ file local (phải là file JSON)
            return (
                <LottieView
                    ref={animationRef}
                    // Đảm bảo file là .json, không phải .gif
                    source={require('../assets/animations/welcome.json')}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                    resizeMode="contain"
                    onAnimationFailure={(error: any) => {
                        console.log('Lottie animation failed:', error);
                        setUseFallback(true);
                    }}
                />
            );
        } catch (error) {
            console.log('Error loading Lottie animation:', error);
            return (
                <View style={styles.fallbackContainer}>
                    <Ionicons name="fast-food" size={120} color="#FF6B35" />
                    <View style={styles.fallbackIcon}>
                        <Ionicons name="bicycle" size={40} color="#FF6B35" />
                    </View>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Animated Content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Animation Section */}
                    <View style={styles.animationContainer}>
                        {renderAnimation()}
                    </View>

                    {/* Title Section */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Welcome to Foodie</Text>
                        <Text style={styles.subtitle}>
                            Find the best food and drinks around you
                        </Text>
                        <Text style={styles.description}>
                            Discover amazing restaurants, order your favorite meals,
                            and enjoy delicious food delivered to your doorstep
                        </Text>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Ionicons name="restaurant" size={24} color="#FF6B35" />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Best Restaurants</Text>
                                <Text style={styles.featureDescription}>
                                    Find top-rated restaurants near you
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons name="bicycle" size={24} color="#FF6B35" />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Fast Delivery</Text>
                                <Text style={styles.featureDescription}>
                                    Get your food delivered in minutes
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons name="card" size={24} color="#FF6B35" />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureTitle}>Easy Payment</Text>
                                <Text style={styles.featureDescription}>
                                    Secure and convenient payment options
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Get Started Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.9}
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.arrowIcon} />
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
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 100,
    },

    content: {
        alignItems: 'center',
        paddingTop: 20,
    },
    animationContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: width * 0.8,
        maxHeight: 300,
    },
    lottieAnimation: {
        width: '100%',
        height: '100%',
    },
    fallbackContainer: {
        width: width * 0.8,
        height: width * 0.8,
        maxWidth: 300,
        maxHeight: 300,
        backgroundColor: '#F9F9F9',
        borderRadius: 150,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF6B35',
        borderStyle: 'dashed',
        position: 'relative',
    },
    fallbackIcon: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#FF6B35',
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    featureTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    getStartedButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    getStartedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    arrowIcon: {
        marginLeft: 8,
    },
});