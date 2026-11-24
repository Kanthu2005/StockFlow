import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorPayload = {
      message: error.response?.data?.detail || error.message || 'Service unavailable',
      status: error.response?.status || 500,
      url: error.config?.url,
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
