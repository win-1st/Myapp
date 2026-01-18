import api from "./api";

export const orderAPI = {
    // Tạo order
    createOrder() {
        return api.post("/api/customer/orders", {});
    },

    // Thêm món
    addItemToOrder: (orderId, productId, quantity) =>
        api.post(`/api/customer/orders/${orderId}/items`, {
            productId,
            quantity
        }),

    // Lấy chi tiết order
    getOrder: (orderId) =>
        api.get(`/api/customer/orders/${orderId}`),

    // ✅ Xác nhận order (bắt buộc trước khi thanh toán)
    confirm: (orderId) =>
        api.post(`/api/customer/orders/${orderId}/confirm`),

    // ✅ Thanh toán → tạo Bill
    pay: (orderId, paymentMethod) =>
        api.post(`/api/customer/orders/${orderId}/pay`, {
            paymentMethod
        }),

    removeItem: (orderId, productId) =>
        api.delete(`/api/customer/orders/${orderId}/items/${productId}`),

    getHistory() {
        return api.get("/api/customer/orders");
    },

    updateQuantity(orderId, productId, quantity) {
        return api.put(
            `/api/customer/orders/${orderId}/items/${productId}`,
            null,
            {
                params: { quantity },
            }
        );
    },

};
