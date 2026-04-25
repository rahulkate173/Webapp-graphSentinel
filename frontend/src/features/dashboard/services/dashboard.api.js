import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// withCredentials ensures the browser sends the httpOnly cookie automatically
const apiClient = axios.create({
  baseURL: `${API_URL}/dashboard`,
  withCredentials: true,
});

export const fetchDashboardStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data.data;
};
