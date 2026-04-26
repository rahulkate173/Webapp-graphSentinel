import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../layer1/components/Layout';
import IFSCScreen from '../components/IFSCScreen';
import SAREditor from '../components/SAREditor';
import { DEFAULT_FORM_STATE } from '../utils/sarForm.utils';
import { fetchSARDraft, saveSARDraft } from '../services/sarDraft.api';
import '../styles/sar.css';

/**
 * SARPage — root page component
 * Manages the two-step flow:
 *   Step 1: IFSC + Ring ID input  → IFSCScreen
 *   Step 2: SAR editor            → SAREditor
 *
 * sessionStorage is used as a highly responsive temporary fallback,
 * while MongoDB AES-256 securely acts as the single source of truth context.
 */

const DRAFT_KEY = 'sar_draft';

/* Format today's date as DD/MM/YYYY */
const todayString = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${now.getFullYear()}`;
};

/* Load local volatile session fallback */
const loadLocalDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const SARPage = () => {
  const [step, setStep]         = useState(1);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [loadingDraft, setLoadingDraft] = useState(true);

  // Read fraud_rings from Redux so we can look up accounts by ring ID
  const fraudRings = useSelector((state) => state.fraud.fraud_rings);

  // ── Database Mount Lifecycle ───────────────────────────────────────────
  useEffect(() => {
    const initDraft = async () => {
      try {
        const dbDraft    = await fetchSARDraft();
        const localDraft = loadLocalDraft();

        // Secure DB draft takes strict priority if it exists
        if (dbDraft && dbDraft.formData) {
          setFormData(dbDraft.formData);
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(dbDraft.formData));
          setStep(2);
        } else if (localDraft) {
          setFormData(localDraft);
        }
      } catch (err) {
        console.error('Failed to load secure database draft:', err);
        const localDraft = loadLocalDraft();
        if (localDraft) setFormData(localDraft);
      } finally {
        setLoadingDraft(false);
      }
    };

    initDraft();
  }, []);

  // ── Called when IFSC lookup succeeds ────────────────────────────────────────
  // bankFields: mapped IFSC data
  // rawData   : raw API response (unused but kept for extensibility)
  // ringId    : the ring ID the user selected / typed
  const handleIFSCSuccess = useCallback((bankFields, rawData, ringId = '') => {
    // Resolve account numbers from Redux fraud_rings using the chosen ring ID
    let accountNumbers = [];
    if (ringId && Array.isArray(fraudRings) && fraudRings.length > 0) {
      // Support both numeric indices and string ring_id values
      const matched =
        fraudRings.find((r) => String(r.ring_id) === String(ringId)) ||
        fraudRings[Number(ringId)] ||
        null;

      if (matched) {
        if (Array.isArray(matched.accounts) && matched.accounts.length > 0) {
          // New ML API: accounts are objects with account_id field
          accountNumbers = matched.accounts.map((a) => String(a.account_id || a));
        } else if (Array.isArray(matched.member_accounts)) {
          // Old API fallback: member_accounts is a plain string array
          accountNumbers = matched.member_accounts.map(String);
        }
      }
    }

    const next = {
      ...DEFAULT_FORM_STATE,
      ...bankFields,
      ringId,
      reportDate: todayString(),
      accountNumbers,
    };

    setFormData(next);
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setStep(2);
  }, [fraudRings]);

  // ── Called continuously when any form field strictly changes ────────────────
  const handleFormChange = useCallback((updated) => {
    setFormData(updated);
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  // ── Go back to IFSC screen ───────────────────────────────────────────────────
  const handleChangeIFSC = useCallback(() => {
    setStep(1);
  }, []);

  // ── Clear editable form data ──────────────────────────
  const handleClear = useCallback(() => {
    const cleared = {
      ...DEFAULT_FORM_STATE,
      NameEntity:     formData.NameEntity,
      NameBranch:     formData.NameBranch,
      BranchAddress1: formData.BranchAddress1,
      BranchCode:     formData.BranchCode,
      // Preserve ring + date + accounts on clear
      ringId:         formData.ringId,
      reportDate:     formData.reportDate,
      accountNumbers: formData.accountNumbers,
    };
    setFormData(cleared);
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(cleared)); } catch { /* ignore */ }
  }, [formData]);

  // ── Explicit Manual DB Sync ────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    try {
      await saveSARDraft(formData);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Database network error: Failed to encrypt and save securely.' };
    }
  }, [formData]);

  if (loadingDraft) {
    return (
      <Layout>
        <div className="sar-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: '#64748b' }}>Decrypting secure workspace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sar-page custom-scrollbar">
        {step === 1 ? (
          <IFSCScreen onSuccess={handleIFSCSuccess} />
        ) : (
          <SAREditor
            formData={formData}
            onChange={handleFormChange}
            onChangeIFSC={handleChangeIFSC}
            onClear={handleClear}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </Layout>
  );
};

export default SARPage;
