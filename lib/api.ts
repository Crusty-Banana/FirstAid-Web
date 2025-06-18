import axios from "axios";

const api = axios.create({
    baseURL: "https://medbot-backend.fly.dev/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // The backend also expects X-API-Auth for conversation endpoints
                config.headers["X-API-Auth"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;