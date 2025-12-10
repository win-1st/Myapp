import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Define types
type ErrorState = {
    email: string;
    password: string;
    general: string;
};

type FormField = 'email' | 'password';

export default function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorState>({
        email: '',
        password: '',
        general: ''
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    // Validation functions
    const validateEmail = (email: string): string => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email là bắt buộc';
        if (!emailRegex.test(email)) return 'Email không hợp lệ';
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password) return 'Mật khẩu là bắt buộc';
        if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
    };

    const handleInputChange = (field: FormField, value: string): void => {
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);

        // Clear error for this field when user starts typing
        setErrors(prev => ({
            ...prev,
            [field]: '',
            general: ''
        }));
    };

    const handleSignIn = async (): Promise<void> => {
        // Validate all fields
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError,
                general: ''
            });
            return;
        }

        try {
            setLoading(true);
            setErrors({ email: '', password: '', general: '' });

            // Simulate API call (replace with actual API)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock authentication - replace with actual API
            if (email === 'w@gmail.com' && password === '123456') {
                // Save remember me preference
                if (rememberMe) {
                    // Save credentials to secure storage
                    console.log('Remember me enabled - saving credentials');
                }

                router.replace('/(tabs)');
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: 'Email hoặc mật khẩu không đúng'
                }));
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            }));
            console.error('Sign in error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = (): void => {
        router.push('/forgotpassword');
    };

    const handleCreateAccount = (): void => {
        router.push('/signup');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Đăng Nhập</Text>
                        <Text style={styles.subtitle}>Tìm bữa ăn ngon nhất của bạn</Text>
                    </View>

                    {/* General Error Message */}
                    {errors.general ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" />
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    ) : null}

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.email && styles.inputError
                                ]}
                                placeholder="Nhập địa chỉ email của bạn"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={(value: string) => handleInputChange('email', value)}
                                onBlur={() => {
                                    if (email) {
                                        const error = validateEmail(email);
                                        setErrors(prev => ({ ...prev, email: error }));
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!loading}
                            />
                            {errors.email ? (
                                <View style={styles.errorMessageContainer}>
                                    <Ionicons name="warning" size={14} color="#DC2626" />
                                    <Text style={styles.errorMessage}>{errors.email}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.passwordHeader}>
                                <Text style={styles.label}>Mật Khẩu</Text>
                                <TouchableOpacity onPress={handleForgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        errors.password && styles.inputError
                                    ]}
                                    placeholder="Nhập mật khẩu của bạn"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={(value: string) => handleInputChange('password', value)}
                                    onBlur={() => {
                                        if (password) {
                                            const error = validatePassword(password);
                                            setErrors(prev => ({ ...prev, password: error }));
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.showPasswordButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={22}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password ? (
                                <View style={styles.errorMessageContainer}>
                                    <Ionicons name="warning" size={14} color="#DC2626" />
                                    <Text style={styles.errorMessage}>{errors.password}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Remember Me Checkbox */}
                        <View style={styles.rememberMeContainer}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                                disabled={loading}
                            >
                                <View style={[
                                    styles.checkbox,
                                    rememberMe && styles.checkboxChecked
                                ]}>
                                    {rememberMe && (
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    )}
                                </View>
                                <Text style={styles.rememberMeText}>Nhớ Mật Khẩu</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                loading && styles.buttonDisabled
                            ]}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Đăng Nhập</Text>
                            )}
                        </TouchableOpacity>

                        {/* Create New Account Button */}
                        <TouchableOpacity
                            style={[
                                styles.secondaryButton,
                                loading && styles.buttonDisabled
                            ]}
                            onPress={handleCreateAccount}
                            disabled={loading}
                        >
                            <Text style={styles.secondaryButtonText}>Tạo Tài Khoản Mới</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        color: '#000',
    },
    inputError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    forgotPasswordText: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: '500',
    },
    passwordInputContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    showPasswordButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    rememberMeContainer: {
        marginBottom: 24,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    rememberMeText: {
        fontSize: 14,
        color: '#4B5563',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        color: '#DC2626',
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    errorMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorMessage: {
        color: '#DC2626',
        fontSize: 12,
        marginLeft: 4,
    },
    primaryButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
});