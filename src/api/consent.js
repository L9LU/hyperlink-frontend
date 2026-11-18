// src/api/consent.js
import apiClient from './client';

// Which consent text has this patient accepted, and which one is current?
export const getConsent = async () => {
  const response = await apiClient.get('/auth/consent');
  return response.data;
};

// The patient agrees to the current text. `version` is the version they were shown.
export const acceptConsent = async (version) => {
  const response = await apiClient.post('/auth/consent', { version });
  return response.data;
};
