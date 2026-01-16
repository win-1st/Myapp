import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthData {
  token: string;
  user: {
    id: number;
    username: string;
    fullName?: string;
    email: string;
    roles: string[];
  };
}

// Lưu đăng nhập
export const saveAuth = async (authData: AuthData): Promise<AuthData> => {
  try {
    await AsyncStorage.removeItem("currentOrderId");
    await AsyncStorage.setItem("auth", JSON.stringify(authData));

    console.log("✅ Auth saved:", authData);
    return authData;
  } catch (error) {
    console.error("❌ Error saving auth:", error);
    throw error;
  }
};



// Lấy auth
export const getAuth = async (): Promise<AuthData | null> => {
  try {
    const authString = await AsyncStorage.getItem("auth");
    return authString ? JSON.parse(authString) : null;
  } catch (error) {
    console.error("❌ Error getting auth:", error);
    return null;
  }
};

// Xóa auth (Logout)
export const clearAuth = async () => {
  try {
    await AsyncStorage.removeItem("auth");
    await AsyncStorage.removeItem("currentOrderId"); // 🔥 xóa order đang dùng
    console.log("🗑 Auth & Cart cleared");
  } catch (error) {
    console.error("❌ Error clearing auth:", error);
  }
};

