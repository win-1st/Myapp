import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Thử dùng push thay vì replace
        router.push('/(tabs)');

        // Hoặc nếu vẫn dùng Alert, đảm bảo không có lỗi
        // Alert.alert('Success', 'Signed in successfully!', [
        //     {
        //         text: 'OK',
        //         onPress: () => router.push('/(tabs)')
        //     }
        // ]);
    };

    const handleCreateAccount = () => {
        // Chuyển đến trang đăng ký
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
                    {/* Header - Không có nút back */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Sign In</Text>
                        <Text style={styles.subtitle}>Find your best ever meal</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your email address"
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
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                            />
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
                            <Text style={styles.primaryButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        {/* Create New Account Button */}
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleCreateAccount}>
                            <Text style={styles.secondaryButtonText}>Create New Account</Text>
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
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
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
        marginBottom: 28,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
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
    primaryButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16,
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