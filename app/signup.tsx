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
import api from '../services/api';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        setError('');
        return true;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            setError('');

            const payload = {
                username,
                email,
                password,
                roles: ['user'], // ⭐ FIX Ở ĐÂY
            };

            console.log('REGISTER PAYLOAD:', payload);

            const res = await api.post('/auth/register', payload);

            console.log('REGISTER SUCCESS:', res.data);

            Alert.alert('Thành công', 'Đăng ký thành công!', [
                {
                    text: 'Đăng nhập',
                    onPress: () => router.replace('/signin'),
                },
            ]);
        } catch (err: any) {
            console.log('REGISTER ERROR:', err.response?.data || err.message);
            setError(
                typeof err.response?.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || 'Đăng ký thất bại'
            );
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
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.title}>📝 Đăng ký</Text>

                    {/* Avatar */}
                    <View style={styles.avatarWrap}>
                        <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.avatarImg} />
                            ) : (
                                <Text style={styles.avatarText}>Thêm ảnh</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Tên đăng nhập"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eye}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.eye}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Đăng ký</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/signin')}
                        style={{ marginTop: 20 }}
                    >
                        <Text style={styles.loginText}>
                            Đã có tài khoản? Đăng nhập
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
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
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
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        color: '#777',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },
    passwordWrap: {
        position: 'relative',
    },
    eye: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    button: {
        backgroundColor: '#FF6B35',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    error: {
        color: '#DC2626',
        marginBottom: 12,
        textAlign: 'center',
    },
    loginText: {
        textAlign: 'center',
        color: '#2563EB',
        fontSize: 16,
    },
});
