import axios from 'axios';
import { readUser, clearUser } from '../context/authStorage.js';

const apiClient = axios.create({
  baseURL: 'https://hyperlink-backend-up65.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the login token to every request. AuthContext stores the whole login
// response (which includes `token`); authStorage knows where it is kept.
apiClient.interceptors.request.use((config) => {
  const token = readUser()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server says the session is missing or expired, clear it and go to login.
// Login and register themselves are skipped, so a wrong password just shows its error.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      clearUser();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
