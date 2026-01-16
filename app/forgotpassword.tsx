import { Ionicons } from '@expo/vector-icons';
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
import api from "../services/api";
type ErrorState = {
    email: string;
    general: string;
};

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorState>({
        email: '',
        general: ''
    });

    // Validation function
    const validateEmail = (email: string): string => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email là bắt buộc';
        if (!emailRegex.test(email)) return 'Email không hợp lệ';
        return '';
    };

    const handleInputChange = (value: string): void => {
        setEmail(value);
        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            email: '',
            general: ''
        }));
    };

    const handleSendResetLink = async () => {
        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError, general: "" });
            return;
        }

        try {
            setLoading(true);
            setErrors({ email: "", general: "" });

            await api.post("/api/auth/forgot-password", {
                email: email
            });

            setSuccess(true);
        } catch (err: any) {
            if (err.response?.data) {
                const message =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data.message || "Có lỗi xảy ra";

                setErrors({ email: "", general: message });
            } else {
                setErrors({ email: "", general: "Không thể kết nối server" });
            }
        }
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

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Quên mật khẩu</Text>
                            <Text style={styles.subtitle}>
                                Nhập email để nhận link đặt lại
                            </Text>
                        </View>
                        <View style={styles.backButtonPlaceholder} />
                    </View>

                    {/* General Error Message */}
                    {errors.general ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" />
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    ) : null}

                    {/* Success Message */}
                    {success ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <Text style={styles.successText}>
                                Link đặt lại mật khẩu đã được gửi!
                            </Text>
                        </View>
                    ) : null}

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.email && styles.inputError
                                ]}
                                placeholder="Type your email address"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={handleInputChange}
                                onBlur={() => {
                                    if (email) {
                                        const error = validateEmail(email);
                                        setErrors(prev => ({ ...prev, email: error }));
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!loading && !success}
                            />
                            {errors.email ? (
                                <View style={styles.errorMessageContainer}>
                                    <Ionicons name="warning" size={14} color="#DC2626" />
                                    <Text style={styles.errorMessage}>{errors.email}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Instructions */}
                        <View style={styles.instructionsContainer}>
                            <Ionicons name="information-circle-outline" size={18} color="#666" />
                            <Text style={styles.instructionsText}>
                                Kiểm tra cả hộp thư spam nếu bạn không nhận được email trong vài phút.
                            </Text>
                        </View>

                        {/* Send Reset Link Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                (loading || success) && styles.buttonDisabled
                            ]}
                            onPress={handleSendResetLink}
                            disabled={loading || success}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    {success ? 'Đã gửi' : 'Gửi link đặt lại mật khẩu'}
                                </Text>
                            )}
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
    // Header styles - Giống signup
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
    },
    backButtonPlaceholder: {
        width: 40,
    },
    headerTextContainer: {
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 28, // Hơi nhỏ hơn signup (32) cho phù hợp
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
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
        marginBottom: 24,
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
    instructionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 30,
    },
    instructionsText: {
        color: '#666',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
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
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    successText: {
        color: '#065F46',
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
        marginBottom: 16,
        marginTop: 10,
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

});