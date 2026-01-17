import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { authAPI } from "../services/authAPI";

export default function EditProfileScreen() {
    const [form, setForm] = useState<any>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        imageUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await authAPI.getMe();
            setForm(res.data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải thông tin cá nhân");
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        // Validation
        if (!form.fullName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập họ tên");
            return;
        }

        if (!form.email.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }

        if (!form.phone.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
            return;
        }

        // Phone validation (basic)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(form.phone.replace(/\D/g, ''))) {
            Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
            return;
        }

        try {
            setLoading(true);
            await authAPI.updateMe(form);
            Alert.alert(
                "Thành công",
                "Cập nhật thông tin thành công",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (e) {
            Alert.alert("Lỗi", "Không thể cập nhật thông tin");
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = () => {
        setImageLoading(false);
        // Có thể set một fallback image ở đây
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A6FFF" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {imageLoading && (
                                <View style={styles.avatarPlaceholder}>
                                    <ActivityIndicator size="small" color="#4A6FFF" />
                                </View>
                            )}
                            <Image
                                source={{
                                    uri: form.imageUrl
                                        ? `http://192.168.1.38:8080${form.imageUrl}`
                                        : "https://via.placeholder.com/150/4A6FFF/FFFFFF?text=User",
                                }}
                                style={styles.avatar}
                                onLoad={() => setImageLoading(false)}
                                onError={handleImageError}
                            />
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons name="camera" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarHint}>
                            Chạm để thay đổi ảnh đại diện
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="person-outline" size={20} color="#666" />
                                <Text style={styles.label}>Họ và tên</Text>
                            </View>
                            <TextInput
                                placeholder="Nhập họ và tên của bạn"
                                value={form.fullName}
                                onChangeText={(v) => setForm({ ...form, fullName: v })}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="mail-outline" size={20} color="#666" />
                                <Text style={styles.label}>Email</Text>
                            </View>
                            <TextInput
                                placeholder="example@email.com"
                                value={form.email}
                                onChangeText={(v) => setForm({ ...form, email: v })}
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="call-outline" size={20} color="#666" />
                                <Text style={styles.label}>Số điện thoại</Text>
                            </View>
                            <TextInput
                                placeholder="Nhập số điện thoại"
                                value={form.phone}
                                onChangeText={(v) => setForm({ ...form, phone: v })}
                                style={styles.input}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Address */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="location-outline" size={20} color="#666" />
                                <Text style={styles.label}>Địa chỉ</Text>
                            </View>
                            <TextInput
                                placeholder="Nhập địa chỉ của bạn"
                                value={form.address}
                                onChangeText={(v) => setForm({ ...form, address: v })}
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            loading && styles.saveButtonDisabled
                        ]}
                        onPress={submit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="#FFF" />
                                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    avatarSection: {
        alignItems: "center",
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    editAvatarButton: {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: "#4A6FFF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarHint: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginLeft: 8,
    },
    input: {
        backgroundColor: "#FAFAFA",
        borderWidth: 1,
        borderColor: "#E8E8E8",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#1A1A1A",
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    saveButton: {
        backgroundColor: "#4A6FFF",
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4A6FFF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFF",
        marginLeft: 8,
    },
    cancelButton: {
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
});