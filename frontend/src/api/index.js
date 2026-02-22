import axios from "axios";

// Base URL for backend (make sure your backend is running)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to headers if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
