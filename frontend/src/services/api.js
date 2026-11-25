/**
 * Centralized Axios HTTP Client
 * - Configured with base URL from VITE_API_BASE_URL (defaults to http://127.0.0.1:8000/api)
 * - Guarantees /api prefix resolution
 * - Automatic Authorization: Bearer <token> request injection
 * - Unified response error formatting
 */
import axios from 'axios';

// Normalize base URL to ensure trailing /api is always present
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    // If deployed on Vercel or any non-localhost domain, automatically fallback to production Render backend
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://stockflow-bfm1.onrender.com/api';
    }
    return 'http://127.0.0.1:8000/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach stored JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean backend error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        // FastAPI / Pydantic validation error array
        message = detail.map((err) => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else if (typeof detail === 'object') {
        message = JSON.stringify(detail);
      }
    } else if (error.message === 'Network Error' || !error.response) {
      message = 'Unable to reach StockFlow backend server. Please verify your connection.';
    } else if (error.response?.status === 401) {
      message = 'Invalid credentials or session expired. Please sign in again.';
    }

    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.raw = error;

    return Promise.reject(formattedError);
  }
);

export default api;
