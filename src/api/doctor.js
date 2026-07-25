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