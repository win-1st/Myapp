import api from "./api";

export const orderAPI = {
    createOrder() {
        return api.post("/api/customer/orders", {}); // 🔥 BẮT BUỘC gửi object
    },
    addItemToOrder: (orderId, productId, quantity) =>
        api.post(`/api/customer/orders/${orderId}/items`, {
            productId,
            quantity
        }),

    getOrder: (orderId) =>
        api.get(`/api/customer/orders/${orderId}`)
};

