// src/constants/units.js
// Hospital units a doctor can belong to. Keep the codes in sync with UNITS in the
// backend routes/auth.py. To add a unit, add it in both places.
export const UNITS = [
  { code: 'cardiology', label: 'Cardiology' },
  { code: 'internal_medicine', label: 'Internal Medicine' },
  { code: 'family_medicine', label: 'Family Medicine / General Outpatients' },
  { code: 'nephrology', label: 'Nephrology' },
  { code: 'endocrinology', label: 'Endocrinology' },
  { code: 'neurology', label: 'Neurology' },
  { code: 'emergency', label: 'Emergency' },
  { code: 'geriatrics', label: 'Geriatrics' },
  { code: 'other', label: 'Other' },
];
