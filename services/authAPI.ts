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

    uploadImage: (formData: FormData) =>
        api.post("/api/auth/upload-avatar", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),

    changePassword: (data: {
        oldPassword: string;
        newPassword: string;
    }) => api.put("/api/auth/change-password", data),
};



