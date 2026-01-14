import axios from "axios";
import Constants from "expo-constants";

function getBaseUrl() {
    const host = Constants.expoConfig?.hostUri?.split(":")[0];
    if (!host) return "http://localhost:8080";
    return `http://${host}:8080`;  // Sửa: dùng backticks thay vì string thường
}

export const API_BASE = getBaseUrl();
console.log("🌍 API BASE =", API_BASE);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Debug interceptors
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        console.log('📦 Request Data:', config.data);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`✅ Response ${response.status}: ${response.config.url}`);
        console.log('📊 Response Data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
        });
        return Promise.reject(error);
    }
);

export default api;