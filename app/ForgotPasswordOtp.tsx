import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { authAPI } from "../services/authAPI";

export default function ForgotPasswordOtp() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const sendOtp = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email");
            return;
        }

        try {
            setLoading(true);
            await authAPI.sendOtp(email);
            Alert.alert("Thành công", "OTP đã được gửi");
            setStep(2);
        } catch (e: any) {
            Alert.alert("Lỗi", e.response?.data || "Gửi OTP thất bại");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!otp || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ OTP và mật khẩu");
            return;
        }

        try {
            setLoading(true);
            await authAPI.resetPasswordOtp({
                email,
                otp,
                newPassword: password,
            });
            Alert.alert("Thành công", "Đổi mật khẩu thành công");
        } catch (e: any) {
            Alert.alert("Lỗi", e.response?.data || "OTP sai hoặc hết hạn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {step === 1 && (
                <>
                    <Text style={styles.title}>Quên mật khẩu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.button} onPress={sendOtp}>
                        <Text style={styles.buttonText}>Gửi OTP</Text>
                    </TouchableOpacity>
                </>
            )}

            {step === 2 && (
                <>
                    <Text style={styles.title}>Nhập OTP</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu mới"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={resetPassword}>
                        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                </>
            )}

            {loading && <ActivityIndicator size="large" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#4A6FFF",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
