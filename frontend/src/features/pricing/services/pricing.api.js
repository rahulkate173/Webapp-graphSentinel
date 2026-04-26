import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const submitPricingRequest = async (pricingData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/pricing`, pricingData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Network error. Please try again later.');
  }
};
