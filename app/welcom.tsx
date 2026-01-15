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
let LottieComponent: any = null;
let isWeb = Platform.OS === 'web';

if (isWeb) {
    // Trên web, dùng lottie-react (lottie-web)
    try {
        LottieComponent = require('lottie-react').default;
    } catch (error) {
        console.log('Lottie-web not available on web');
    }
} else {
    // Trên mobile, dùng lottie-react-native
    try {
        LottieComponent = require('lottie-react-native').default;
    } catch (error) {
        console.log('Lottie-react-native not available');
    }
}

export default function WelcomeScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const animationRef = useRef<any>(null);
    const [useFallback, setUseFallback] = useState(false);
    const [timeLeft, setTimeLeft] = useState(3);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [animationData, setAnimationData] = useState<any>(null);

    // Load animation data
    useEffect(() => {
        if (isWeb && LottieComponent) {
            // OPTION 2: Từ file local (phức tạp hơn)
            import('../assets/animations/welcome.json')
                .then(data => {
                    setAnimationData(data.default || data);
                })
                .catch(error => {
                    console.log('Error loading JSON on web:', error);
                    setUseFallback(true);
                });
        }
    }, []);

    // Xử lý navigation khi timeLeft = 0
    useEffect(() => {
        if (timeLeft === 0) {
            router.replace('/signin');
        }
    }, [timeLeft]);

    // Animation và timer
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
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }),
        ]).start();

        // Timer đếm ngược - ĐÃ SỬA: KHÔNG gọi router.replace trong đây
        const countdown = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Tự động chuyển trang sau 3 giây (dự phòng nếu có lỗi)
        const timeout = setTimeout(() => {
            router.replace('/signin');
        }, 3000);

        return () => {
            clearInterval(countdown);
            clearTimeout(timeout);
        };
    }, []);

    const handleSkip = () => {
        router.replace('/signin');
    };

    // Render animation section - ĐƠN GIẢN HÓA: Dùng GIF/Image cho cả web và mobile
    const renderAnimation = () => {
        // Nếu dùng fallback
        if (useFallback || !LottieComponent) {
            return (
                <View style={styles.fallbackContainer}>
                    <Ionicons name="fast-food" size={120} color="#FF6B35" />
                    <View style={styles.fallbackIcon}>
                        <Ionicons name="bicycle" size={40} color="#FF6B35" />
                    </View>
                </View>
            );
        }

        // Đơn giản: Dùng Image với GIF cho cả web và mobile
        try {
            if (isWeb) {
                // Trên web, dùng Lottie từ URL
                return LottieComponent && animationData ? (
                    <LottieComponent
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                        style={styles.lottieAnimation}
                    />
                ) : (
                    <View style={styles.fallbackContainer}>
                        <Ionicons name="fast-food" size={120} color="#FF6B35" />
                        <View style={styles.fallbackIcon}>
                            <Ionicons name="bicycle" size={40} color="#FF6B35" />
                        </View>
                    </View>
                );
            } else {
                // Trên mobile, dùng Lottie từ file local
                return (
                    <LottieComponent
                        ref={animationRef}
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
            }
        } catch (error) {
            console.log('Error loading animation:', error);
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
            {/* Skip Button với timer - ĐÃ SỬA LỖI ANIMATED */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <View style={styles.timerContainer}>
                    <View style={styles.progressBarBackground}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    // Sửa: Dùng transform scaleX thay vì width percentage
                                    transform: [{
                                        scaleX: progressAnim
                                    }]
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.skipText}>Skip {timeLeft}s</Text>
                </View>
            </TouchableOpacity>

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

                    {/* Countdown Message */}
                    <View style={styles.countdownContainer}>
                        <Text style={styles.countdownText}>
                            Redirecting to sign in page in {timeLeft} seconds...
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
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
        paddingBottom: 40,
    },
    skipButton: {
        alignSelf: 'flex-end',
        padding: 16,
        paddingRight: 24,
    },
    timerContainer: {
        position: 'relative',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    progressBarBackground: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        borderRadius: 20,
        overflow: 'hidden',
    },
    progressBarFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        borderRadius: 20,
        transformOrigin: 'left center',
    },
    skipText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        zIndex: 1,
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
        marginBottom: 30,
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
    countdownContainer: {
        marginTop: 20,
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    countdownText: {
        fontSize: 14,
        color: '#FF6B35',
        textAlign: 'center',
        fontWeight: '500',
    },
});