import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://hyperlink-backend-up65.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;