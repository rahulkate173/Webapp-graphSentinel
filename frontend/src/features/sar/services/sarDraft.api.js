import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com/api';

const apiClient = axios.create({
  baseURL: `${API_URL}/sar`,
  withCredentials: true,
});

export const saveSARDraft = async (formData) => {
  try {
    const response = await apiClient.post('/draft', { formData });
    return response.data;
  } catch (error) {
    console.error("Failed to save SAR draft to DB:", error);
    throw error;
  }
};

export const fetchSARDraft = async () => {
  try {
    const response = await apiClient.get('/draft');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch SAR draft from DB:", error);
    throw error;
  }
};

export const clearSARDraft = async () => {
  try {
    const response = await apiClient.delete('/draft');
    return response.data;
  } catch (error) {
    console.error("Failed to clear SAR draft from DB:", error);
    throw error;
  }
};
