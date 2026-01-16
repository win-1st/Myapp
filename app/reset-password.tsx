import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import api from "../services/api";

export default function ResetPassword() {
    const { token } = useLocalSearchParams<{ token?: string }>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleReset = async () => {
        console.log("🔥 CLICK RESET", { password, confirmPassword, token });
        if (!password.trim() || !confirmPassword.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu không khớp");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (!token) {
            Alert.alert("Lỗi", "Token không tồn tại hoặc đã hết hạn");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/auth/reset-password", {
                token,
                newPassword: password,
            });

            Alert.alert(
                "Thành công",
                "Mật khẩu đã được đặt lại thành công!",
                [{
                    text: "OK", onPress: () => {
                        // Có thể navigation về trang đăng nhập ở đây
                    }
                }]
            );
        } catch (err: any) {
            console.log("❌ RESET PASSWORD ERROR:", err.response?.data || err.message);
            Alert.alert(
                "Lỗi",
                err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Ionicons name="lock-closed" size={80} color="#4A6FFF" />
                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>
                        Nhập mật khẩu mới của bạn để tiếp tục
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Mật khẩu mới */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Nhập mật khẩu mới"
                                placeholderTextColor="#999"
                                style={styles.input}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                        {password.length > 0 && password.length < 6 && (
                            <Text style={styles.errorText}>
                                Mật khẩu phải có ít nhất 6 ký tự
                            </Text>
                        )}
                    </View>

                    {/* Xác nhận mật khẩu */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Nhập lại mật khẩu"
                                placeholderTextColor="#999"
                                style={styles.input}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                            <Text style={styles.errorText}>
                                Mật khẩu không khớp
                            </Text>
                        )}
                    </View>

                    {/* Yêu cầu mật khẩu */}
                    <View style={styles.requirementsContainer}>
                        <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
                        <View style={styles.requirementItem}>
                            <Ionicons
                                name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={password.length >= 6 ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.requirementText,
                                password.length >= 6 && styles.requirementMet
                            ]}>
                                Ít nhất 6 ký tự
                            </Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons
                                name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={password === confirmPassword && password.length > 0 ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.requirementText,
                                password === confirmPassword && password.length > 0 && styles.requirementMet
                            ]}>
                                Mật khẩu khớp nhau
                            </Text>
                        </View>
                    </View>

                    {/* Nút đổi mật khẩu */}
                    <TouchableOpacity
                        onPress={handleReset}
                        style={[
                            styles.button,
                            (!password || !confirmPassword || password !== confirmPassword || password.length < 6) && styles.buttonDisabled
                        ]}
                        disabled={!password || !confirmPassword || password !== confirmPassword || password.length < 6 || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="key" size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    passwordContainer: {
        position: "relative",
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
        paddingRight: 50, // Chừa chỗ cho icon eye
    },
    eyeIcon: {
        position: "absolute",
        right: 16,
        top: 14,
    },
    errorText: {
        color: "#FF4757",
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
    requirementsContainer: {
        backgroundColor: "#F8F9FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4A6FFF",
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
    requirementMet: {
        color: "#4CAF50",
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#4A6FFF",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4A6FFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: "#A0B4FF",
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 8,
    },
    tokenInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        padding: 12,
        backgroundColor: "#F0F4FF",
        borderRadius: 8,
    },
    tokenText: {
        fontSize: 14,
        color: "#4A6FFF",
        marginLeft: 8,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: "#666",
    },

});