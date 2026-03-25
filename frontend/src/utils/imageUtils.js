// src/utils/imageUtils.js
// For Vite - use import.meta.env
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

export const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath;
  
  let cleanPath = photoPath.replace(/\\/g, '/').replace(/\/+/g, '/');
  cleanPath = cleanPath.replace(/^\.+/, '');
  
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  return `${API_BASE_URL}${cleanPath}`;
};

export const getInitials = (name) => {
  if (!name) return "CU";
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
};