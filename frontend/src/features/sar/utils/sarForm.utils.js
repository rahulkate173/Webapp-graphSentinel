/**
 * SAR Form — default empty state.
 * Keeps all field keys centralised so the UI and PDF service stay in sync.
 */
export const DEFAULT_FORM_STATE = {
  // Bank details (auto-filled from IFSC API)
  NameEntity:     '',
  NameBranch:     '',
  BranchAddress1: '',
  BranchCode:     '',

  // Principal Officer
  NamePrincipalOfficer: '',
  DesignationPrincipal: '',
  PrincipalEmail:       '',
  PrincipalTel:         '',
  PrincipalAddress1:    '',
  PrincipalAddress2:    '',
  PrincipalAddress3:    '',
  PrincipalAddress4:    '',
  PrincipalAddress5:    '',
  PrincipalPIN:         '',

  // Branch Details (editable)
  BranchAddress2: '',
  BranchAddress3: '',
  BranchAddress4: '',
  BranchAddress5: '',
  BranchPIN:      '',
  BranchTel:      '',
  BranchEmail:    '',

  // Suspicion
  GroundOfSuspicion1:  '',
  ActionTaken:         '',
  SuspicionCategoryA:  false,
  SuspicionCategoryB:  false,
  SuspicionCategoryC:  false,
  SuspicionCategoryD:  false,
  SuspicionCategoryE:  false,

  // Part 6 — Fraud Ring & Suspicious Accounts (auto-filled from Redux ML data)
  ringId:         '',   // Selected fraud ring ID
  reportDate:     '',   // Auto-set to today's date (DD/MM/YYYY)
  accountNumbers: [],   // Dynamic array of account number strings
};

/** Required fields that must be non-empty before PDF download. */
export const REQUIRED_FIELDS = [
  'NameEntity',
  'NameBranch',
  'BranchCode',
  'NamePrincipalOfficer',
  'DesignationPrincipal',
  'GroundOfSuspicion1',
];

/**
 * Maps IFSC API response fields → SAR form keys.
 * @param {Object} apiData - Response from https://ifsc.razorpay.com/{IFSC}
 * @returns {Partial<typeof DEFAULT_FORM_STATE>}
 */
export const mapIFSCToForm = (apiData) => ({
  NameEntity:     apiData.BANK     || '',
  NameBranch:     apiData.BRANCH   || '',
  BranchAddress1: apiData.ADDRESS  || '',
  BranchCode:     apiData.IFSC     || '',
});
