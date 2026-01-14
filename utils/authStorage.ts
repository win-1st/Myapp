import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveAuth = async (data: any) => {
  const auth = {
    token: data.token || data.accessToken,
    user: {
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles,
    },
  };

  await AsyncStorage.setItem("auth", JSON.stringify(auth));
  return auth;
};

export const getAuth = async () => {
  const s = await AsyncStorage.getItem("auth");
  return s ? JSON.parse(s) : null;
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem("auth");
};
