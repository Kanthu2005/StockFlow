import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
