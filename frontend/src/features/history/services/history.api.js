import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/history`,
  withCredentials: true,
});

export const fetchHistory = async () => {
  const response = await apiClient.get('/');
  // Backend returns { history: [...] }
  return response.data.history;
};

export const fetchHistoryDetails = async (id) => {
  const response = await apiClient.get(`/${id}`);
  // Backend returns { record: {...} }
  return response.data.record;
};
