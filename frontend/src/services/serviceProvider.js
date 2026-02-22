import api from '../api'; // import the axios instance from api/index.js

// Register a service provider
export const registerServiceProvider = (payload) =>
  api.post('/api/service-providers/register', payload);

// Login a service provider
export const loginServiceProvider = (payload) =>
  api.post('/api/service-providers/login', payload);

// Get the currently logged-in service provider
export const getServiceProviderMe = () =>
  api.get('/api/service-providers/me');

// Ping endpoint (optional, to test backend)
export const pingServiceProvider = () =>
  api.get('/api/service-providers/ping');
