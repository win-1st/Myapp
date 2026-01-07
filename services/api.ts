// services/api.ts - SỬA LẠI HOÀN TOÀN
import axios from 'axios';

// SPRING BOOT API BASE URL
const SPRING_BOOT_API = 'https://javatest-production-2db4.up.railway.app';

// Tạo axios instance
const api = axios.create({
    baseURL: SPRING_BOOT_API,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Debug interceptors
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 Request: ${config.baseURL}${config.url}`);
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
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

// Product API - DÙNG ĐÚNG ENDPOINT /api/admin/products
export const productAPI = {
    // Lấy tất cả sản phẩm từ ADMIN endpoint
    getAllProducts: () => api.get('/api/admin/products'),

    // Lấy sản phẩm theo ID
    getProductById: (id: number) => api.get(`/api/admin/products/${id}`),

    // Các API khác
    searchProducts: (keyword: string) =>
        api.get(`/api/admin/products/search?keyword=${keyword}`),

    getProductsByCategory: (categoryId: number) =>
        api.get(`/api/admin/products/category/${categoryId}`),

    // Tạo sản phẩm mới (nếu cần)
    createProduct: (productData: any) =>
        api.post('/api/admin/products', productData),

    // Cập nhật sản phẩm
    updateProduct: (id: number, productData: any) =>
        api.put(`/api/admin/products/${id}`, productData),

    // Xóa sản phẩm
    deleteProduct: (id: number) =>
        api.delete(`/api/admin/products/${id}`),
};

// Category API
export const categoryAPI = {
    getAllCategories: () => api.get('/api/admin/categories'),
    getCategoryById: (id: number) => api.get(`/api/admin/categories/${id}`),
};

// Order API
export const orderAPI = {
    createOrder: (orderData: any) => api.post('/orders', orderData),
    getAllOrders: () => api.get('/orders'),
    getOrderById: (id: number) => api.get(`/orders/${id}`),
};

// Test connection
export const testConnection = async () => {
    console.log('🔍 Testing Spring Boot connection...');

    const endpoints = [
        '/api/admin/products',      // Chính xác endpoint của bạn
        '/api/admin/categories',    // Categories endpoint
        '/',                       // Root endpoint
        '/actuator/health',        // Health check
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await api.get(endpoint);
            console.log(`✅ ${endpoint} - Status: ${response.status}`);
            if (endpoint === '/api/admin/products') {
                console.log('📦 Products data sample:', response.data?.slice(0, 2));
            }
        } catch (err: any) {
            console.log(`❌ ${endpoint} - Error: ${err.response?.status || err.message}`);
        }
    }
};

export default api;