import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import api from "../services/api";
import { saveAuth } from '../utils/authStorage';

export default function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Thêm state này
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const redirectByRole = (roles: string[]) => {
        console.log('🔄 Redirecting by roles:', roles);

        if (roles.includes('ROLE_ADMIN')) {
            router.replace('/(tabs)');
            return;
        }

        // Mặc định chuyển đến tabs cho user thường
        router.replace('/(tabs)');
    };

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("📤 LOGIN PAYLOAD:", { username, password });

            const res = await api.post("/api/auth/login", {
                username,
                password,
            });

            const data = res.data;

            console.log("✅ LOGIN SUCCESS:", data);

            const authData = {
                token: data.token || data.accessToken,
                user: {
                    id: data.id,
                    username: data.username,
                    fullName: data.fullName,
                    email: data.email,
                    roles: data.roles || [],
                },
            };

            await saveAuth(authData);

            redirectByRole(data.roles || []);

        } catch (err: any) {
            console.log("❌ LOGIN ERROR:", err.message);
            setError("Sai tài khoản hoặc mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    // Hàm toggle ẩn/hiện mật khẩu
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>☕ COFFEE WIN</Text>

            {error ? (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!loading}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword} // Điều khiển ẩn/hiện
                    editable={!loading}
                    placeholderTextColor="#999"
                />
                {/* Nút toggle ẩn/hiện mật khẩu */}
                <TouchableOpacity
                    onPress={toggleShowPassword}
                    style={styles.passwordToggle}
                    disabled={loading}
                >
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>🔑 Đăng nhập</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push('/signup')}
                disabled={loading}
                style={{ marginTop: 16, alignItems: 'center' }}
            >
                <Text style={{
                    color: '#2563EB',
                    fontSize: 14,
                    opacity: loading ? 0.5 : 1
                }}>
                    Chưa có tài khoản? Đăng ký
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    passwordToggle: {
        padding: 8,
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#FF6B35',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    errorBox: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        color: '#DC2626',
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
});