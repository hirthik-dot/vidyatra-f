// src/config/api.js

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://vidyatra-f-1-4obq.onrender.com";

// Helper for fetch
export const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
};
