import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suspicious_accounts: [],
  fraud_rings: [],
  summary: null,
  loading: false,
  error: null,
  analysisRun: false,  // true once real ML data has been received
};

const fraudSlice = createSlice({
  name: 'fraud',
  initialState,
  reducers: {
    // Called by UploadZone after a successful upload + ML response
    setFraudDataFromUpload(state, action) {
      const { suspicious_accounts, fraud_rings, summary } = action.payload;
      state.suspicious_accounts = suspicious_accounts ?? [];
      state.fraud_rings        = fraud_rings        ?? [];
      state.summary            = summary            ?? null;
      state.analysisRun        = true;
      state.loading            = false;
      state.error              = null;
    },
    setFraudLoading(state, action) {
      state.loading = action.payload;
    },
    setFraudError(state, action) {
      state.error   = action.payload;
      state.loading = false;
    },
    clearFraudData(state) {
      state.suspicious_accounts = [];
      state.fraud_rings         = [];
      state.summary             = null;
      state.error               = null;
      state.analysisRun         = false;
      state.loading             = false;
    },
    clearFraudError(state) {
      state.error = null;
    },
  },
});

export const {
  setFraudDataFromUpload,
  setFraudLoading,
  setFraudError,
  clearFraudData,
  clearFraudError,
} = fraudSlice.actions;

export default fraudSlice.reducer;
