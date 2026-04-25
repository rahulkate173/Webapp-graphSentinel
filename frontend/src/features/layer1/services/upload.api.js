import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Upload exactly 2 CSV files to the backend.
 * @param {File} transactionsFile  – the transactions CSV (first)
 * @param {File} accountsFile      – the accounts CSV (second)
 * @returns {Promise<object>}       – full backend response
 */
export async function uploadCsvFiles(transactionsFile, accountsFile) {
  const formData = new FormData();
  // Strict order: transactions first, accounts second
  formData.append("files", transactionsFile);
  formData.append("files", accountsFile);

  const res = await axios.post(`${BASE_URL}/api/files/upload-csv`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true, // sends httpOnly cookie automatically
  });

  return res.data;
}