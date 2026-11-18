import apiClient from './client';

// Patient changes the language their care assistant speaks.
export const updateLanguage = async (language) => {
  const response = await apiClient.post('/auth/language', { language });
  return response.data;
};
