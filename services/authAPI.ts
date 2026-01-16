import api from "./api";

export const authAPI = {
    getMe: () => api.get("/api/auth/me"),
    updateMe: (data: any) => api.put("/api/auth/me", data),
    updateQuantity(orderId: number, productId: number, quantity: number) {
        return api.put(
            `/api/customer/orders/${orderId}/items/${productId}?quantity=${quantity}`
        );
    }
};