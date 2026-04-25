import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  submitCsvFiles,
  setTransactionsFile,
  setAccountsFile,
  setCsvError,
  clearUpload,
} from '../store/uploadSlice.js';
import { setFraudDataFromUpload } from '../../fraud/fraud.slice.js';
import '../styles/upload.css';

const CSV_MIME = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];

function isValidCsv(file) {
  return file.name.toLowerCase().endsWith('.csv') || CSV_MIME.includes(file.type);
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

/* ────────────────────────────────────────────────────────────
   Reusable single-file drop slot
───────────────────────────────────────────────────────────── */
function FileSlot({ id, label, description, icon: Icon, file, onFileChange, disabled }) {
  const inputRef    = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileChange(f);
  };
  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileChange(f);
    e.target.value = '';
  };

  return (
    <div className="file-slot">
      {/* Slot label header */}
      <div className="file-slot__header">
        <span className="file-slot__tag">
          <Icon size={13} />
          {label}
        </span>
        <span className="file-slot__desc">{description}</span>
      </div>

      {/* Drop / click area */}
      <div
        className={[
          'file-slot__area',
          isDragActive       ? 'file-slot__area--drag'   : '',
          file               ? 'file-slot__area--filled' : '',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label} CSV`}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      >
        <input
          id={id}
          type="file"
          ref={inputRef}
          accept=".csv"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled}
          aria-label={`${label} file input`}
        />

        {file ? (
          <div className="file-slot__filled">
            <CheckCircle2 size={20} className="file-slot__check" />
            <div>
              <p className="file-slot__filename">{file.name}</p>
              <p className="file-slot__filesize">{formatSize(file.size)} · click to replace</p>
            </div>
          </div>
        ) : (
          <div className="file-slot__empty">
            <UploadCloud size={22} className="file-slot__cloud" />
            <p className="file-slot__prompt">
              Drag &amp; drop or <span className="file-slot__link">browse</span>
            </p>
            <p className="file-slot__format">CSV only · .csv</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main UploadZone
───────────────────────────────────────────────────────────── */
const UploadZone = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { transactionsFile, accountsFile, isUploading, error, result } =
    useSelector((state) => state.upload);

  /* Hold raw File objects locally — Redux only stores serialisable meta */
  const [txRaw, setTxRaw] = useState(null);
  const [acRaw, setAcRaw] = useState(null);

  /* ── File selection handlers ─────────────────────────── */
  const handleTransactions = (file) => {
    if (!isValidCsv(file)) {
      dispatch(setCsvError(`"${file.name}" is not a valid CSV file.`));
      return;
    }
    dispatch(setCsvError(null));
    dispatch(setTransactionsFile({ name: file.name, size: file.size }));
    setTxRaw(file);
  };

  const handleAccounts = (file) => {
    if (!isValidCsv(file)) {
      dispatch(setCsvError(`"${file.name}" is not a valid CSV file.`));
      return;
    }
    dispatch(setCsvError(null));
    dispatch(setAccountsFile({ name: file.name, size: file.size }));
    setAcRaw(file);
  };

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!txRaw || !acRaw) {
      dispatch(setCsvError('Please select both a transactions CSV and an accounts CSV before submitting.'));
      return;
    }

    try {
      // submitCsvFiles returns the unwrapped backend response
      const backendResponse = await dispatch(
        submitCsvFiles({ transactionsFile: txRaw, accountsFile: acRaw })
      ).unwrap();

      // Populate fraud slice with real ML data
      const mlData = backendResponse.ml_response;
      if (mlData) {
        dispatch(setFraudDataFromUpload({
          suspicious_accounts: mlData.suspicious_accounts ?? [],
          fraud_rings:         mlData.fraud_rings         ?? [],
          summary:             mlData.summary             ?? null,
        }));
      }

      // Navigate to fraud dashboard automatically
      navigate('/fraud-rings');
    } catch {
      // Error is already in Redux state via rejected case — no extra handling needed
    }
  };

  /* ── Reset ───────────────────────────────────────────── */
  const handleReset = () => {
    dispatch(clearUpload());
    setTxRaw(null);
    setAcRaw(null);
  };

  const bothSelected = !!transactionsFile && !!accountsFile;

  return (
    <div className="upload-zone">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="upload-zone__header">
        <div className="upload-zone__icon-box">
          <UploadCloud size={28} strokeWidth={2} />
        </div>
        <div>
          <h2 className="upload-zone__title">Upload CSV Files</h2>
          <p className="upload-zone__subtitle">
            Provide your transactions and accounts CSV files to run fraud analysis.
          </p>
        </div>
      </div>

      {/* ── Success banner (shown after ML response) ────── */}
      {result && (
        <div className="upload-zone__result">
          <CheckCircle2 size={18} className="upload-zone__result-icon" />
          <div style={{ flex: 1 }}>
            <p className="upload-zone__result-title">{result.message}</p>
            <p className="upload-zone__result-urls">
              <span>Transactions:</span>{' '}
              <a href={result.cloudinary_urls?.transactions} target="_blank" rel="noreferrer">
                {result.cloudinary_urls?.transactions}
              </a>
            </p>
            <p className="upload-zone__result-urls">
              <span>Accounts:</span>{' '}
              <a href={result.cloudinary_urls?.accounts} target="_blank" rel="noreferrer">
                {result.cloudinary_urls?.accounts}
              </a>
            </p>
          </div>
          <div className="upload-zone__result-actions">
            <button
              className="upload-zone__btn-fraud"
              onClick={() => navigate('/fraud-rings')}
              aria-label="View fraud dashboard"
            >
              View Dashboard
            </button>
            <button
              className="upload-zone__reset"
              onClick={handleReset}
              aria-label="Upload new files"
            >
              New Analysis
            </button>
          </div>
        </div>
      )}

      {/* ── File slots ─────────────────────────────────── */}
      {!result && (
        <>
          <div className="upload-zone__slots">
            {/* Slot 1 — Transactions */}
            <FileSlot
              id="transactions-input"
              label="Transactions CSV"
              description="Upload your transactions data file here"
              icon={FileText}
              file={transactionsFile}
              onFileChange={handleTransactions}
              disabled={isUploading}
            />

            {/* Arrow separator */}
            <div className="upload-zone__arrow" aria-hidden="true">
              <ArrowRight size={20} />
            </div>

            {/* Slot 2 — Accounts */}
            <FileSlot
              id="accounts-input"
              label="Accounts CSV"
              description="Upload your accounts data file here"
              icon={FileText}
              file={accountsFile}
              onFileChange={handleAccounts}
              disabled={isUploading}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="upload-zone__error" role="alert">
              <AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="analyse-btn"
            className={`upload-zone__button${bothSelected && !isUploading ? ' upload-zone__button--ready' : ''}`}
            onClick={handleSubmit}
            disabled={isUploading || !bothSelected}
            aria-label="Run fraud analysis"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                Uploading &amp; Analysing…
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                {bothSelected ? 'Run Fraud Analysis' : 'Select Both Files to Continue'}
              </>
            )}
          </button>

          <p className="upload-zone__hint">
            Transactions CSV is sent first · Accounts CSV second · Both required
          </p>
        </>
      )}
    </div>
  );
};

export default UploadZone;
