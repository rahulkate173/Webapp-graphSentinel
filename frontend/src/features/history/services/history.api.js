import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com/api';

const apiClient = axios.create({
  baseURL: `${API_URL}/history`,
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
