import crypto from 'crypto';
import CONFIG from '../config/config.js';

const ALGORITHM = 'aes-256-cbc';
// Ensure the key is exactly 32 bytes (256 bits). If it's a hex string, parse it to a buffer.
// If it's a raw string, we'll format it so it's 32 bytes.
const ENCRYPTION_KEY = Buffer.from(
  CONFIG.SAR_ENCRYPTION_KEY.length === 64
    ? Buffer.from(CONFIG.SAR_ENCRYPTION_KEY, 'hex')
    : String(CONFIG.SAR_ENCRYPTION_KEY).padEnd(32).slice(0, 32)
);

/**
 * Encrypts a JSON object securely using AES-256-CBC.
 * @param {Object} dataObj The form data to encrypt
 * @returns {{ iv: string, encryptedData: string }} The payload for the DB
 */
export const encryptSAR = (dataObj) => {
  const iv = crypto.randomBytes(16); // Random initialization vector for every draft
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  const textBody = JSON.stringify(dataObj);
  let encrypted = cipher.update(textBody, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
};

/**
 * Decrypts the SAR payload back into a JSON object.
 * @param {string} encryptedHex The encrypted hex string
 * @param {string} ivHex The initialization vector used
 * @returns {Object} The original parsed JSON
 */
export const decryptSAR = (encryptedHex, ivHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};
