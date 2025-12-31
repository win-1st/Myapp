import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        // Open image picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const validatePasswords = () => {
        if (password !== confirmPassword) {
            setPasswordError('Mật khẩu không khớp');
            return false;
        }

        if (password.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleContinue = () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (!validatePasswords()) {
            return;
        }

        // Xử lý đăng ký
        Alert.alert('Thành công', 'Tài khoản đã được tạo thành công!', [
            {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
            }
        ]);
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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
                    {/* Header với nút back */}
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Đăng ký</Text>
                        </View>
                        <View style={styles.backButtonPlaceholder} />
                    </View>

                    {/* Avatar Section - Có thể chọn ảnh */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.avatarImage} />
                            ) : (
                                <>
                                    <Text style={styles.avatarText}>Thêm</Text>
                                    <Text style={styles.avatarText}>Hình</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập địa chỉ email của bạn"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mật Khẩu</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Nhập mật khẩu của bạn"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (confirmPassword && text !== confirmPassword) {
                                            setPasswordError('Mật khẩu không khớp');
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={toggleShowPassword}
                                >
                                    <Text style={styles.eyeButtonText}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.passwordHint}>Mật khẩu phải có ít nhất 6 ký tự</Text>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nhập Lại Mật Khẩu</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Nhập lại mật khẩu của bạn"
                                    placeholderTextColor="#999"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (password !== text) {
                                            setPasswordError('Mật khẩu không khớp');
                                        } else {
                                            setPasswordError('');
                                        }
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={toggleShowConfirmPassword}
                                >
                                    <Text style={styles.eyeButtonText}>
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {passwordError ? (
                                <Text style={styles.errorText}>{passwordError}</Text>
                            ) : null}
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                (!email || !password || !confirmPassword || passwordError) && styles.disabledButton
                            ]}
                            onPress={handleContinue}
                            disabled={!email || !password || !confirmPassword || !!passwordError}
                        >
                            <Text style={styles.primaryButtonText}>Đăng Ký</Text>
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        fontSize: 14,
        color: '#666',
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
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        color: '#000',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        padding: 8,
    },
    eyeButtonText: {
        fontSize: 20,
    },
    passwordHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        marginTop: 4,
        marginLeft: 4,
    },
    primaryButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#FF9C7D',
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});