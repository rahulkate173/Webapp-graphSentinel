import { PDFDocument } from 'pdf-lib';

/**
 * SAR PDF Generator
 * Uses pdf-lib to fill existing PDF form fields by key.
 * NO coordinate-based drawing. All field positions come from the PDF itself.
 */

const PAD = (n) => String(n).padStart(2, '0');

/**
 * Loads the SAR PDF template from the public folder and fills all form fields.
 * @param {Object} formData - All SAR form field values
 * @returns {Uint8Array} - Filled PDF bytes
 */
export const generateSARPdf = async (formData) => {
  // 1. Fetch the blank SAR PDF template
  const templateUrl = `${window.location.origin}/SAR.pdf`;
  const existingPdfBytes = await fetch(templateUrl).then((res) => {
    if (!res.ok) throw new Error('Failed to load SAR PDF template.');
    return res.arrayBuffer();
  });

  // 2. Load the document
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  // ── Helper: safely set a text field (skip if key doesn't exist in PDF) ──────
  const setText = (key, value) => {
    if (!value && value !== 0) return;
    try {
      const field = form.getTextField(key);
      field.setText(String(value));
    } catch {
      // Field doesn't exist in this PDF — silently skip
    }
  };

  // ── Helper: safely check a checkbox ─────────────────────────────────────────
  const checkBox = (key, shouldCheck) => {
    if (!shouldCheck) return;
    try {
      form.getCheckBox(key).check();
    } catch {
      // Field doesn't exist — skip
    }
  };

  // 3. Auto-fill: Current date ─────────────────────────────────────────────────
  // Use stored reportDate (DD/MM/YYYY) if available, else compute live
  const now = new Date();
  let day, month, year;
  if (formData.reportDate) {
    const parts = formData.reportDate.split('/');
    day = parts[0] || PAD(now.getDate());
    month = parts[1] || PAD(now.getMonth() + 1);
    year = parts[2] || String(now.getFullYear());
  } else {
    day = PAD(now.getDate());
    month = PAD(now.getMonth() + 1);
    year = String(now.getFullYear());
  }
  setText('Date1', day);
  setText('Month1', month);
  setText('Year', year);

  // 4. Bank / Branch Details (from IFSC API) ──────────────────────────────────
  setText('NameEntity', formData.NameEntity);
  setText('NameBranch', formData.NameBranch);
  setText('BranchAddress1', formData.BranchAddress1);
  setText('BranchCode', formData.BranchCode);

  // 5. Principal Officer ───────────────────────────────────────────────────────
  setText('NamePrincipalOfficer', formData.NamePrincipalOfficer);
  setText('DesignationPrincipal', formData.DesignationPrincipal);
  setText('PrincipalEmail', formData.PrincipalEmail);
  setText('PrincipalTel', formData.PrincipalTel);
  setText('PrincipalAddress1', formData.PrincipalAddress1);
  setText('PrincipalAddress2', formData.PrincipalAddress2);
  setText('PrincipalAddress3', formData.PrincipalAddress3);
  setText('PrincipalAddress4', formData.PrincipalAddress4);
  setText('PrincipalAddress5', formData.PrincipalAddress5);
  setText('PrincipalPIN', formData.PrincipalPIN);

  // 6. Branch Details (editable) ───────────────────────────────────────────────
  setText('BranchAddress2', formData.BranchAddress2);
  setText('BranchAddress3', formData.BranchAddress3);
  setText('BranchAddress4', formData.BranchAddress4);
  setText('BranchAddress5', formData.BranchAddress5);
  setText('BranchPIN', formData.BranchPIN);
  setText('BranchTel', formData.BranchTel);
  setText('BranchEmail', formData.BranchEmail);

  // 7. Suspicion Details ───────────────────────────────────────────────────────
  setText('GroundOfSuspicion1', formData.GroundOfSuspicion1);
  setText('ActionTaken', formData.ActionTaken);

  // 8. Suspicion category checkboxes ───────────────────────────────────────────
  checkBox('SuspicionCategoryA', formData.SuspicionCategoryA);
  checkBox('SuspicionCategoryB', formData.SuspicionCategoryB);
  checkBox('SuspicionCategoryC', formData.SuspicionCategoryC);
  checkBox('SuspicionCategoryD', formData.SuspicionCategoryD);
  checkBox('SuspicionCategoryE', formData.SuspicionCategoryE);

  // 9. Part 6 — Suspicious Account Numbers (dynamic, variable count) ───────────
  if (Array.isArray(formData.accountNumbers) && formData.accountNumbers.length > 0) {
    formData.accountNumbers.forEach((accNum, idx) => {
      if (accNum) {
        // The PDF template fields are named Account1, Account2, ... Account10
        setText(`Account${idx + 1}`, accNum);
      }
    });

    // If there are more accounts than the PDF can hold, check the additional sheets box
    if (formData.accountNumbers.length > 10) {
      setText('AccountAdditionalSheets', String(formData.accountNumbers.length - 10));
    }
  }

  // 10. Flatten & save ──────────────────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

/**
 * Triggers a browser download of the generated PDF bytes.
 */
export const downloadPDF = (pdfBytes, filename = 'SAR_Report.pdf') => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
