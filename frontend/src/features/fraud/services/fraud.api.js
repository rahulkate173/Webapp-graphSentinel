import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://webapp-graphsentinel-1.onrender.com';

/**
 * Calls the backend upload endpoint which:
 *  1. Uploads both CSVs to Cloudinary
 *  2. Sends URLs to the real ML API at https://webapp-graphsentinel.onrender.com
 *  3. Returns the full analysis result
 *
 * This is now the single source of truth for ML results — NO dummy data.
 *
 * @param {string} transactionsUrl  Cloudinary URL of transactions CSV
 * @param {string} accountsUrl      Cloudinary URL of accounts CSV
 * @returns {Promise<object>}        ml_response from backend
 */
export const runMlAnalysis = async (transactionsUrl, accountsUrl) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/api/ml/analyze`,
    {
      transactions_file_url: transactionsUrl,
      accounts_file_url: accountsUrl,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return response;
};
