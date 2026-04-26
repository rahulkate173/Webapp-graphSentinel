import axios from 'axios';

// Assuming baseURL is configured globally or configure here if needed
const BASE_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com';
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

// Removed localstorage interceptor as we now use httpOnly cookies

export const loginUser = async (data) => {
  return await api.post('/auth/login', data);
};

export const registerUser = async (data) => {
  return await api.post('/auth/register', data);
};

export const logoutUser = async () => {
  // Can be used if there's a server-side logout, e.g. token invalidation
  return await api.post('/auth/logout');
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};
