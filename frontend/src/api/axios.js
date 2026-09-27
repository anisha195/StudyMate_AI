import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studymate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("studymate_token");
      localStorage.removeItem("studymate_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
