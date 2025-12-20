import axios from "axios";

/**
 * 🔥 Render backend base URL
 * change only here in future
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Attach token automatically
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
