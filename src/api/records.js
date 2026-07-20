import apiClient from './client';

export const logReading = async (readingData) => {
  const response = await apiClient.post('/records/log', readingData);
  return response.data;
};

export const getHistory = async (patientId) => {
  const response = await apiClient.get(`/records/history?patient_id=${patientId}`);
  return response.data;
};

export const getPrediction = async (predictionData) => {
  const response = await apiClient.post('/predict', predictionData);
  return response.data;
};