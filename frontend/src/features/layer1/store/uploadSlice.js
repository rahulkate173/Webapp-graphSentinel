import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadCsvFiles } from '../services/upload.api.js';

/* ── Async thunk ─────────────────────────────────────────────────────────────
   Accepts { transactionsFile, accountsFile } and sends both to the backend.
   Returns the full backend response on success.
────────────────────────────────────────────────────────────────────────────── */
export const submitCsvFiles = createAsyncThunk(
  'upload/submitCsvFiles',
  async ({ transactionsFile, accountsFile }, { rejectWithValue }) => {
    try {
      const result = await uploadCsvFiles(transactionsFile, accountsFile);
      return result;
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        'Upload failed. Please try again.';
      return rejectWithValue(serverMsg);
    }
  }
);

/* ── Slice ───────────────────────────────────────────────────────────────────*/
const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    transactionsFile: null,   // { name, size }
    accountsFile: null,       // { name, size }
    isUploading: false,
    error: null,
    result: null,             // full backend + ML response
  },
  reducers: {
    setTransactionsFile(state, action) {
      state.transactionsFile = action.payload; // { name, size }
      state.error = null;
    },
    setAccountsFile(state, action) {
      state.accountsFile = action.payload;     // { name, size }
      state.error = null;
    },
    setCsvError(state, action) {
      state.error = action.payload;
    },
    clearUpload(state) {
      state.transactionsFile = null;
      state.accountsFile = null;
      state.isUploading = false;
      state.error = null;
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCsvFiles.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.result = null;
      })
      .addCase(submitCsvFiles.fulfilled, (state, action) => {
        state.isUploading = false;
        state.result = action.payload;
      })
      .addCase(submitCsvFiles.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload ?? 'Upload failed.';
      });
  },
});

export const {
  setTransactionsFile,
  setAccountsFile,
  setCsvError,
  clearUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;
