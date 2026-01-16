import api from "./api";

export const authAPI = {
    getMe: () => api.get("/api/auth/me"),
};