import apiClient from './client';

export const linkPatient = async (linkData) => {
  const response = await apiClient.post('/doctor/link-patient', linkData);
  return response.data;
};

export const getDoctorPatients = async (doctorId) => {
  const response = await apiClient.get(`/doctor/patients?doctor_id=${doctorId}`);
  return response.data;
};

export const getPatientDetail = async (patientId, doctorId) => {
  const response = await apiClient.get(`/doctor/patient/${patientId}?doctor_id=${doctorId}`);
  return response.data;
};

export const markFollowupDone = async ({ doctor_id, patient_id, note }) => {
  const response = await apiClient.post('/doctor/followup-done', { doctor_id, patient_id, note });
  return response.data;
};

export const reviewReading = async ({ doctor_id, patient_id, reading_id, outcome }) => {
  const response = await apiClient.post('/doctor/review-reading', {
    doctor_id,
    patient_id,
    reading_id,
    outcome,
  });
  return response.data;
};
