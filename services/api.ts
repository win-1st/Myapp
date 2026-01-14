import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

function getBaseUrl() {
    const debuggerHost = Constants.expoConfig?.hostUri;

    if (!debuggerHost) return "http://localhost:8080";

    const host = debuggerHost.split(":")[0];

    if (host === "localhost" || host === "127.0.0.1") {
        return "http://10.0.2.2:8080";
    }

    return `http://${host}:8080`;
}

export const API_BASE = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// 🔥 GẮN TOKEN TẠI ĐÂY
api.interceptors.request.use(async (config) => {
    const authString = await AsyncStorage.getItem("auth");

    if (authString) {
        const auth = JSON.parse(authString);
        if (auth.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
        }
    }

    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log("📦 Request Data:", config.data);

    return config;
});

export default api;
