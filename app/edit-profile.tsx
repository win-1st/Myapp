import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const res = await authAPI.getMe();
        setForm(res.data);
    };

    const submit = async () => {
        try {
            await authAPI.updateMe(form);
            Alert.alert("Thành công", "Cập nhật thông tin thành công");
            router.back();
        } catch (e) {
            Alert.alert("Lỗi", "Không thể cập nhật");
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: form.imageUrl
                        ? `http://192.168.1.38:8080${form.imageUrl}`
                        : "https://via.placeholder.com/100",
                }}
                style={styles.avatar}
            />

            <TextInput
                placeholder="Họ tên"
                value={form.fullName}
                onChangeText={(v) => setForm({ ...form, fullName: v })}
                style={styles.input}
            />

            <TextInput
                placeholder="Email"
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                style={styles.input}
            />

            <TextInput
                placeholder="Số điện thoại"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                style={styles.input}
            />

            <TextInput
                placeholder="Địa chỉ"
                value={form.address}
                onChangeText={(v) => setForm({ ...form, address: v })}
                style={styles.input}
            />

            <TouchableOpacity style={styles.btn} onPress={submit}>
                <Text style={{ color: "#fff" }}>Lưu thay đổi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    btn: {
        backgroundColor: "#2563EB",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
});
