import apiClient from './client';

export const updateMeasurements = async ({ patient_id, height_cm, weight_kg }) => {
  const response = await apiClient.post('/patient/update-measurements', {
    patient_id,
    height_cm,
    weight_kg,
  });
  return response.data;
};