// src/utils/imageUtils.js
// For Vite - use import.meta.env
import { API_BASE_URL } from "../Constants";

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