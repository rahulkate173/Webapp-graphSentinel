import React, { useState } from 'react';
import {
  Download, RefreshCw, Trash2, AlertTriangle, CheckCircle2,
  Building2, User, MapPin, AlertOctagon, Shield, Save,
  Link2, PlusCircle, X, CalendarDays, CreditCard
} from 'lucide-react';
import PDFPreview from './PDFPreview';
import { FormField, TextInput, TextArea, CheckboxField, SectionDivider } from './FormFields';
import { generateSARPdf, downloadPDF } from '../services/sarPdf.service';
import { REQUIRED_FIELDS } from '../utils/sarForm.utils';

/**
 * Screen 2 — SAR Editor
 * Left: PDF Preview   Right: Complete form inputs (all parts including Part 6)
 */
const SAREditor = ({ formData, onChange, onChangeIFSC, onClear, onSaveDraft }) => {
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState('');
  const [genSuccess, setGenSuccess] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Field updater (scalar) ───────────────────────────────────────────────────
  const set = (key) => (value) => onChange({ ...formData, [key]: value });

  // ── Account number helpers ───────────────────────────────────────────────────
  const setAccount = (idx, value) => {
    const updated = [...(formData.accountNumbers || [])];
    updated[idx] = value;
    onChange({ ...formData, accountNumbers: updated });
  };

  const addAccount = () => {
    onChange({ ...formData, accountNumbers: [...(formData.accountNumbers || []), ''] });
  };

  const removeAccount = (idx) => {
    const updated = (formData.accountNumbers || []).filter((_, i) => i !== idx);
    onChange({ ...formData, accountNumbers: updated });
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const missingFields = REQUIRED_FIELDS.filter((f) => !formData[f]?.trim());

  // ── Download handler ─────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (missingFields.length) return;
    setGenError('');
    setGenSuccess(false);
    setGenerating(true);
    try {
      const pdfBytes = await generateSARPdf(formData);
      downloadPDF(pdfBytes, `SAR_${formData.BranchCode || 'Report'}.pdf`);
      setGenSuccess(true);
      setTimeout(() => setGenSuccess(false), 4000);
    } catch (err) {
      setGenError(err.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!onSaveDraft) return;
    setGenError('');
    setSaveSuccess(false);
    setSaving(true);
    const result = await onSaveDraft();
    setSaving(false);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setGenError(result.error);
    }
  };

  const accounts = formData.accountNumbers || [];

  return (
    <div className="sar-editor">
      {/* ── Top action bar ─────────────────────────────────────────────────── */}
      <div className="sar-editor__topbar">
        <div className="sar-editor__topbar-left">
          <Shield size={18} className="sar-editor__topbar-icon" />
          <div>
            <h2 className="sar-editor__topbar-title">SAR Form Editor</h2>
            <p className="sar-editor__topbar-date">
              Report Date: {formData.reportDate || '—'}
              {formData.ringId && (
                <span className="sar-ring-badge">
                  <Link2 size={11} /> Ring #{formData.ringId}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="sar-editor__topbar-actions">
          <button
            id="sar-change-ifsc-btn"
            className="sar-editor__btn sar-editor__btn--outline"
            onClick={onChangeIFSC}
            title="Go back and enter a different IFSC / Ring"
          >
            <RefreshCw size={15} />
            Change IFSC
          </button>
          <button
            id="sar-clear-btn"
            className="sar-editor__btn sar-editor__btn--ghost"
            onClick={onClear}
            title="Clear all editable fields"
          >
            <Trash2 size={15} />
            Clear Form
          </button>

          <button
            id="sar-save-btn"
            className="sar-editor__btn sar-editor__btn--outline"
            onClick={handleSave}
            disabled={saving}
            title="Save draft securely to encrypted database"
            style={{ borderColor: '#16a34a', color: '#16a34a' }}
          >
            {saving ? (
              <><RefreshCw size={15} className="spin" /> Saving…</>
            ) : (
              <><Save size={15} /> Save Draft</>
            )}
          </button>

          <button
            id="sar-download-btn"
            className="sar-editor__btn sar-editor__btn--primary"
            onClick={handleDownload}
            disabled={generating || missingFields.length > 0}
            title={missingFields.length ? `Fill required: ${missingFields.join(', ')}` : 'Download filled PDF'}
          >
            {generating ? (
              <><RefreshCw size={15} className="spin" /> Generating…</>
            ) : (
              <><Download size={15} /> Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ── Validation / success banners ────────────────────────────────────── */}
      {missingFields.length > 0 && (
        <div className="sar-editor__banner sar-editor__banner--warn" role="alert">
          <AlertTriangle size={15} />
          <span>
            Required fields missing:{' '}
            <strong>{missingFields.join(', ')}</strong>
          </span>
        </div>
      )}
      {genError && (
        <div className="sar-editor__banner sar-editor__banner--error" role="alert">
          <AlertTriangle size={15} />
          <span>{genError}</span>
        </div>
      )}
      {genSuccess && (
        <div className="sar-editor__banner sar-editor__banner--success" role="status">
          <CheckCircle2 size={15} />
          <span>PDF downloaded successfully!</span>
        </div>
      )}
      {saveSuccess && (
        <div className="sar-editor__banner sar-editor__banner--success" role="status">
          <CheckCircle2 size={15} />
          <span>Draft securely stored in encrypted database!</span>
        </div>
      )}

      {/* ── Two-column layout: Preview | Form ───────────────────────────────── */}
      <div className="sar-editor__body">
        {/* LEFT – PDF preview */}
        <div className="sar-editor__preview-col">
          <PDFPreview formData={formData} />
        </div>

        {/* RIGHT – Complete form fields */}
        <div className="sar-editor__form-col custom-scrollbar">
          <form className="sar-editor__form" onSubmit={(e) => e.preventDefault()} noValidate>

            {/* ── Report Date (read-only display) ───────────────────────────── */}
            <SectionDivider title="Report Date" icon={<CalendarDays size={14} />} />
            <div className="sar-date-display">
              <CalendarDays size={14} />
              <span>Auto-filled date:</span>
              <strong>{formData.reportDate || '—'}</strong>
              <span className="sar-date-display__note">(DD/MM/YYYY — set automatically on form creation)</span>
            </div>

            {/* ── Bank Details (auto-filled, editable) ──────────────────────── */}
            <SectionDivider title="Part 1–3 · Bank Details" icon={<Building2 size={14} />} />

            <div className="sar-form-row sar-form-row--two">
              <FormField id="NameEntity" label="Bank Name" required>
                <TextInput id="NameEntity" value={formData.NameEntity} onChange={set('NameEntity')} placeholder="Bank name" />
              </FormField>
              <FormField id="BranchCode" label="IFSC / Branch Code" required>
                <TextInput id="BranchCode" value={formData.BranchCode} onChange={set('BranchCode')} placeholder="IFSC code" maxLength={11} />
              </FormField>
            </div>

            <FormField id="NameBranch" label="Branch Name" required>
              <TextInput id="NameBranch" value={formData.NameBranch} onChange={set('NameBranch')} placeholder="Branch name" />
            </FormField>
            <FormField id="BranchAddress1" label="Branch Address Line 1">
              <TextInput id="BranchAddress1" value={formData.BranchAddress1} onChange={set('BranchAddress1')} placeholder="Address line 1" />
            </FormField>

            <div className="sar-form-row sar-form-row--two">
              <FormField id="BranchAddress2" label="Address Line 2">
                <TextInput id="BranchAddress2" value={formData.BranchAddress2} onChange={set('BranchAddress2')} placeholder="City / District" />
              </FormField>
              <FormField id="BranchAddress3" label="Address Line 3">
                <TextInput id="BranchAddress3" value={formData.BranchAddress3} onChange={set('BranchAddress3')} placeholder="State" />
              </FormField>
            </div>

            <div className="sar-form-row sar-form-row--three">
              <FormField id="BranchAddress4" label="Address Line 4">
                <TextInput id="BranchAddress4" value={formData.BranchAddress4} onChange={set('BranchAddress4')} placeholder="Country" />
              </FormField>
              <FormField id="BranchPIN" label="PIN Code">
                <TextInput id="BranchPIN" value={formData.BranchPIN} onChange={set('BranchPIN')} placeholder="PIN" maxLength={6} />
              </FormField>
              <FormField id="BranchTel" label="Branch Tel.">
                <TextInput id="BranchTel" value={formData.BranchTel} onChange={set('BranchTel')} placeholder="Phone number" />
              </FormField>
            </div>

            <FormField id="BranchEmail" label="Branch Email">
              <TextInput id="BranchEmail" type="email" value={formData.BranchEmail} onChange={set('BranchEmail')} placeholder="branch@bank.com" />
            </FormField>

            {/* ── Principal Officer ──────────────────────────────────────────── */}
            <SectionDivider title="Part 4 · Principal Officer" icon={<User size={14} />} />

            <div className="sar-form-row sar-form-row--two">
              <FormField id="NamePrincipalOfficer" label="Officer Name" required>
                <TextInput id="NamePrincipalOfficer" value={formData.NamePrincipalOfficer} onChange={set('NamePrincipalOfficer')} placeholder="Full name" />
              </FormField>
              <FormField id="DesignationPrincipal" label="Designation" required>
                <TextInput id="DesignationPrincipal" value={formData.DesignationPrincipal} onChange={set('DesignationPrincipal')} placeholder="e.g. Branch Manager" />
              </FormField>
            </div>

            <div className="sar-form-row sar-form-row--two">
              <FormField id="PrincipalEmail" label="Email">
                <TextInput id="PrincipalEmail" type="email" value={formData.PrincipalEmail} onChange={set('PrincipalEmail')} placeholder="officer@bank.com" />
              </FormField>
              <FormField id="PrincipalTel" label="Telephone">
                <TextInput id="PrincipalTel" value={formData.PrincipalTel} onChange={set('PrincipalTel')} placeholder="Phone number" />
              </FormField>
            </div>

            <SectionDivider title="Principal Officer Address" icon={<MapPin size={14} />} />

            <FormField id="PrincipalAddress1" label="Address Line 1">
              <TextInput id="PrincipalAddress1" value={formData.PrincipalAddress1} onChange={set('PrincipalAddress1')} placeholder="Address line 1" />
            </FormField>
            <div className="sar-form-row sar-form-row--two">
              <FormField id="PrincipalAddress2" label="Address Line 2">
                <TextInput id="PrincipalAddress2" value={formData.PrincipalAddress2} onChange={set('PrincipalAddress2')} placeholder="City / District" />
              </FormField>
              <FormField id="PrincipalAddress3" label="Address Line 3">
                <TextInput id="PrincipalAddress3" value={formData.PrincipalAddress3} onChange={set('PrincipalAddress3')} placeholder="State" />
              </FormField>
            </div>
            <div className="sar-form-row sar-form-row--three">
              <FormField id="PrincipalAddress4" label="Address Line 4">
                <TextInput id="PrincipalAddress4" value={formData.PrincipalAddress4} onChange={set('PrincipalAddress4')} placeholder="Country" />
              </FormField>
              <FormField id="PrincipalAddress5" label="Address Line 5">
                <TextInput id="PrincipalAddress5" value={formData.PrincipalAddress5} onChange={set('PrincipalAddress5')} placeholder="Additional" />
              </FormField>
              <FormField id="PrincipalPIN" label="PIN Code">
                <TextInput id="PrincipalPIN" value={formData.PrincipalPIN} onChange={set('PrincipalPIN')} placeholder="PIN" maxLength={6} />
              </FormField>
            </div>

            {/* ── Suspicion Section ──────────────────────────────────────────── */}
            <SectionDivider title="Part 5 · Suspicion Details" icon={<AlertOctagon size={14} />} />

            <FormField id="GroundOfSuspicion1" label="Grounds of Suspicion" required>
              <TextArea
                id="GroundOfSuspicion1"
                value={formData.GroundOfSuspicion1}
                onChange={set('GroundOfSuspicion1')}
                placeholder="Describe the grounds of suspicion in detail…"
                rows={4}
              />
            </FormField>

            <FormField id="ActionTaken" label="Action Taken">
              <TextArea
                id="ActionTaken"
                value={formData.ActionTaken}
                onChange={set('ActionTaken')}
                placeholder="Describe action taken by the reporting entity…"
                rows={3}
              />
            </FormField>

            {/* Suspicion categories */}
            <div className="sar-form-field">
              <span className="sar-form-field__label">Suspicion Categories</span>
              <div className="sar-form-checkboxes">
                {[
                  { key: 'SuspicionCategoryA', label: 'Category A — Structuring / Smurfing' },
                  { key: 'SuspicionCategoryB', label: 'Category B — Unusual Cash Activity' },
                  { key: 'SuspicionCategoryC', label: 'Category C — Trade-Based Laundering' },
                  { key: 'SuspicionCategoryD', label: 'Category D — Terrorist Financing' },
                  { key: 'SuspicionCategoryE', label: 'Category E — Other Suspicious Activity' },
                ].map(({ key, label }) => (
                  <CheckboxField
                    key={key}
                    id={key}
                    label={label}
                    checked={formData[key]}
                    onChange={set(key)}
                  />
                ))}
              </div>
            </div>

            {/* ── Part 6 — Fraud Ring & Suspicious Account Numbers ──────────── */}
            <SectionDivider title="Part 6 · Suspicious Account Numbers" icon={<CreditCard size={14} />} />

            {/* Ring ID field */}
            <FormField id="ringId" label="Fraud Ring ID">
              <TextInput
                id="ringId"
                value={formData.ringId}
                onChange={set('ringId')}
                placeholder="e.g. RING_001"
              />
            </FormField>

            {/* Account number rows — dynamic, variable count */}
            <div className="sar-form-field">
              <div className="sar-accounts-header">
                <span className="sar-form-field__label">
                  Account Numbers
                  <span className="sar-accounts-count">
                    {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                  </span>
                </span>
              </div>

              {accounts.length === 0 && (
                <p className="sar-accounts-empty">
                  No accounts added yet. Select a Ring ID on the first screen or add rows manually.
                </p>
              )}

              <div className="sar-accounts-list">
                {accounts.map((acc, idx) => (
                  <div className="sar-account-row" key={idx}>
                    <span className="sar-account-row__index">{idx + 1}</span>
                    <input
                      id={`account-number-${idx}`}
                      className="sar-account-row__input"
                      type="text"
                      value={acc}
                      onChange={(e) => setAccount(idx, e.target.value)}
                      placeholder={`Account number ${idx + 1}`}
                      autoComplete="off"
                      spellCheck={false}
                      aria-label={`Account number ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className="sar-account-row__remove"
                      onClick={() => removeAccount(idx)}
                      aria-label={`Remove account ${idx + 1}`}
                      title="Remove this account"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                id="sar-add-account-btn"
                className="sar-account-add-btn"
                onClick={addAccount}
              >
                <PlusCircle size={15} />
                Add Account Row
              </button>

              {accounts.length > 0 && (
                <p className="sar-accounts-note">
                  ℹ These will be filled into AccountNumber1, AccountNumber2… fields in the PDF.
                  Rows beyond the PDF's capacity are saved in the draft for reference.
                </p>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SAREditor;
