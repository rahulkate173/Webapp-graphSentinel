import { useDispatch, useSelector } from 'react-redux';
import {
  uploadCsvFile,
  setFileSelected,
  setCsvError,
  clearUpload,
} from '../store/uploadSlice.js';

/**
 * useEdiDashboard
 * Wraps the Redux upload slice and exposes a stable API
 * that IngestionLayout and its children rely on.
 */
export function useEdiDashboard() {
  const dispatch = useDispatch();
  const { file, isUploading, error } = useSelector(
    (state) => state.upload
  );

  /**
   * handleFileUpload — called by UploadZone with the raw File object.
   * Validates CSV before dispatching the async thunk.
   */
  const handleFileUpload = (rawFile) => {
    if (!rawFile) return;

    const isCSV =
      rawFile.name.toLowerCase().endsWith('.csv') ||
      rawFile.type === 'text/csv' ||
      rawFile.type === 'application/vnd.ms-excel';

    if (!isCSV) {
      dispatch(setCsvError('Only CSV files are accepted. Please select a .csv file.'));
      return;
    }

    // Store lightweight file info in Redux state
    dispatch(setFileSelected({ name: rawFile.name, size: rawFile.size }));

    // Fire the upload thunk
    dispatch(uploadCsvFile(rawFile));
  };

  const reset = () => dispatch(clearUpload());

  return { file, isUploading, error, handleFileUpload, reset };
}
