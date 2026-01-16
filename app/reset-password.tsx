import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ResetPassword() {
    const { token } = useLocalSearchParams();
    const [password, setPassword] = useState("");

    const handleReset = async () => {
        const res = await fetch("http://localhost:8080/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword: password })
        });

        if (res.ok) {
            Alert.alert("Thành công", "Mật khẩu đã đổi");
        } else {
            Alert.alert("Lỗi", "Token không hợp lệ hoặc hết hạn");
        }
    };

    return (
        <View style={{ padding: 30 }}>
            <Text>Nhập mật khẩu mới</Text>
            <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
            />
            <TouchableOpacity onPress={handleReset}>
                <Text>Đổi mật khẩu</Text>
            </TouchableOpacity>
        </View>
    );
}
