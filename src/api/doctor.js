// Add these to src/api/doctor.js, using the same fetch/axios helper and base URL
// as your existing getPatientDetail. Example assumes an axios-style `api` instance;
// adapt to however getPatientDetail is written.

export const markFollowupDone = async ({ doctor_id, patient_id, note }) => {
  const res = await api.post('/doctor/followup-done', { doctor_id, patient_id, note });
  return res.data;
};

export const reviewReading = async ({ doctor_id, patient_id, reading_id, outcome }) => {
  const res = await api.post('/doctor/review-reading', { doctor_id, patient_id, reading_id, outcome });
  return res.data;
};
