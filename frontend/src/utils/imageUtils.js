src/utils/imageUtils.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};