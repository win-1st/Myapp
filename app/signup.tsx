import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api'; // Kiểm tra đường dẫn này
import { saveAuth } from '../utils/authStorage'; // Thêm import để auto login sau khi register

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm fullName
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 📸 chọn avatar (frontend demo)
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Cần quyền truy cập thư viện ảnh');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets?.length) {
            setImage(result.assets[0].uri);
        }
    };

    const validate = () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return false;
        }
        if (password.length < 6) {
            setError('Mật khẩu tối thiểu 6 ký tự');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return false;
        }
        if (!email.includes('@')) {
            setError('Email không hợp lệ');
            return false;
        }
        setError('');
        return true;
    };

    // Hàm redirect giống SignIn
    const redirectByRole = (roles: string[]) => {
        console.log('🔄 Redirecting by roles:', roles);

        if (roles.includes('ROLE_ADMIN')) {
            router.replace('/(tabs)');
            return;
        }

        // Mặc định chuyển đến tabs cho user thường
        router.replace('/(tabs)');
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            setError('');

            // Tạo payload theo đúng format backend yêu cầu
            const payload = {
                username,
                email,
                password,
                fullName: fullName || username, // Gửi fullName nếu có
                // ⭐ FIX QUAN TRỌNG: Backend của bạn expect "roles" là array string
                roles: ['USER'] // hoặc ['user'] tùy backend
            };

            console.log('📤 REGISTER PAYLOAD:', payload);

            // Gọi API register
            const res = await api.post('/auth/register', payload);

            console.log('✅ REGISTER SUCCESS:', res.data);

            // ⭐ OPTION 1: Auto login sau khi register
            Alert.alert(
                'Thành công',
                'Đăng ký thành công! Bạn có muốn đăng nhập ngay?',
                [
                    {
                        text: 'Để sau',
                        style: 'cancel',
                        onPress: () => router.replace('/signin')
                    },
                    {
                        text: 'Đăng nhập',
                        onPress: async () => {
                            try {
                                // Auto login với tài khoản vừa tạo
                                const loginRes = await api.post('/auth/login', {
                                    username,
                                    password
                                });

                                console.log('✅ AUTO LOGIN SUCCESS:', loginRes.data);

                                // Lưu auth data
                                const authData = {
                                    token: loginRes.data.token,
                                    user: {
                                        id: loginRes.data.id,
                                        username: loginRes.data.username,
                                        fullName: loginRes.data.fullName,
                                        email: loginRes.data.email,
                                        roles: loginRes.data.roles || []
                                    }
                                };

                                await saveAuth(authData);

                                // Redirect
                                redirectByRole(loginRes.data.roles || []);

                            } catch (loginErr: any) {
                                console.error('❌ Auto login failed:', loginErr);
                                router.replace('/signin');
                            }
                        }
                    }
                ]
            );

        } catch (err: any) {
            console.log('❌ REGISTER ERROR:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            // Xử lý lỗi chi tiết hơn
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                if (typeof errorData === 'string') {
                    setError(errorData);
                } else if (errorData?.message) {
                    setError(errorData.message);
                } else {
                    setError('Thông tin không hợp lệ. Vui lòng kiểm tra lại.');
                }
            } else if (err.response?.status === 409) {
                setError('Tài khoản hoặc email đã tồn tại');
            } else if (err.response?.status === 500) {
                setError('Lỗi server. Vui lòng thử lại sau.');
            } else if (err.message.includes('Network Error')) {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra mạng.');
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>📝 Đăng ký tài khoản</Text>

                    {/* Avatar (optional) */}
                    <View style={styles.avatarWrap}>
                        <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.avatarImg} />
                            ) : (
                                <Text style={styles.avatarText}>📷 Thêm ảnh</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    {/* Full Name Input (optional) */}
                    <TextInput
                        style={styles.input}
                        placeholder="Họ và tên"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                    />

                    {/* Username Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Tên đăng nhập *"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!loading}
                    />

                    {/* Email Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email *"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!loading}
                    />

                    {/* Password Input */}
                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu *"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={styles.eye}
                            onPress={() => setShowPassword(!showPassword)}
                            disabled={loading}
                        >
                            <Text style={styles.eyeText}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu *"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={styles.eye}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                        >
                            <Text style={styles.eyeText}>
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>📝 Đăng ký</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        onPress={() => router.replace('/signin')}
                        style={styles.loginLink}
                        disabled={loading}
                    >
                        <Text style={styles.loginText}>
                            Đã có tài khoản? <Text style={styles.loginHighlight}>Đăng nhập ngay</Text>
                        </Text>
                    </TouchableOpacity>
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
    scroll: {
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    avatarWrap: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F0',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        color: '#FF6B35',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        fontSize: 16,
    },
    passwordWrap: {
        position: 'relative',
        marginBottom: 16,
    },
    eye: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 4,
    },
    eyeText: {
        fontSize: 18,
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
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
        textAlign: 'center',
    },
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    loginText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    },
    loginHighlight: {
        color: '#2563EB',
        fontWeight: '600',
    },
});