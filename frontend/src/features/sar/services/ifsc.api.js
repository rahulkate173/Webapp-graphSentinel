/**
 * IFSC API Service
 * Fetches bank/branch details from Razorpay's public IFSC lookup API.
 * No sensitive data is logged.
 */
export const fetchIFSCDetails = async (ifsc) => {
  const code = ifsc.trim().toUpperCase();
  
  // Standard IFSC format: 4 letters, 1 zero, 6 alphanumeric characters.
  // This also strictly ensures only standard Latin A-Z and 0-9 are used,
  // preventing issues with lookalike unicode characters (e.g. Cyrillic 'В' instead of Latin 'B').
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!code || code.length !== 11) {
    throw new Error('IFSC code must be exactly 11 characters.');
  }

  if (!ifscRegex.test(code)) {
    throw new Error('Invalid IFSC format. Expected 4 letters, a zero, and 6 alphanumeric characters (e.g. SBIN0001234).');
  }
  const response = await fetch(`https://ifsc.razorpay.com/${code}`);
  if (response.status === 404) {
    throw new Error(`IFSC code "${code}" not found. Please verify and try again.`);
  }
  if (!response.ok) {
    throw new Error(`API error (${response.status}). Please try again.`);
  }
  const data = await response.json();
  return data;
};
