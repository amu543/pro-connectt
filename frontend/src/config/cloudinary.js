// src/config/cloudinary.js
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'ds0sbms3i',
  baseUrl: process.env.REACT_APP_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/ds0sbms3i'
};

// Usage in component
<img 
  src={`${CLOUDINARY_CONFIG.baseUrl}/image/upload/${imagePublicId}`}
  alt="Service Provider"
/>