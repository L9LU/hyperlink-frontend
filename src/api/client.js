import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://hyperlink-backend-up65.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the login token to every request. AuthContext already stores the whole
// login response (which now includes `token`) in sessionStorage.
apiClient.interceptors.request.use((config) => {
  try {
    const stored = sessionStorage.getItem('hyperlink_user');
    const token = stored ? JSON.parse(stored).token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // unreadable storage: send the request without a token
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
      sessionStorage.removeItem('hyperlink_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
