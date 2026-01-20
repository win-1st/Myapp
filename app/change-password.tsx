import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { authAPI } from "../services/authAPI";

export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            await authAPI.changePassword({
                oldPassword,
                newPassword,
            });

            Alert.alert("Thành công", "Đổi mật khẩu thành công", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert(
                "Lỗi",
                err?.response?.data || "Đổi mật khẩu thất bại"
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Đổi mật khẩu</Text>

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu hiện tại"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#2563EB",
        padding: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
});
