import api from "./api";

export const authAPI = {
    getMe: () => api.get("/api/auth/me"),
    updateMe: (data: any) => api.put("/api/auth/me", data),

    sendOtp: (email: string) =>
        api.post("/api/auth/forgot-password", { email }),

    resetPasswordOtp: (data: {
        email: string;
        otp: string;
        newPassword: string;
    }) =>
        api.post("/api/auth/reset-password-otp", data),
};

