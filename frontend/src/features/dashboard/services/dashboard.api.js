import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com/api';

// withCredentials ensures the browser sends the httpOnly cookie automatically
const apiClient = axios.create({
  baseURL: `${API_URL}/dashboard`,
  withCredentials: true,
});

export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data.data;
};
