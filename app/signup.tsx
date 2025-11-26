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
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);

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

    const handleContinue = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Xử lý đăng ký
        Alert.alert('Success', 'Account created successfully!', [
            {
                text: 'OK',
                onPress: () => router.replace('/(tabs)')
            }
        ]);
    };

    const handleGoBack = () => {
        router.back();
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
                    {/* Header với nút back */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Sign Up</Text>
                            <Text style={styles.subtitle}>Register and eat</Text>
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
                                    <Text style={styles.avatarText}>Add</Text>
                                    <Text style={styles.avatarText}>Photo</Text>
                                </>
                            )}
                        </TouchableOpacity>
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

                        {/* Continue Button */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
                            <Text style={styles.primaryButtonText}>Continue</Text>
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
    primaryButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});