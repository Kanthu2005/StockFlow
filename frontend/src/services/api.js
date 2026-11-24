/**
 * Centralized Axios HTTP Client
 * - Configured with base URL from VITE_API_BASE_URL (defaults to http://127.0.0.1:8000/api)
 * - Automatic Authorization: Bearer <token> request injection
 * - Unified response error formatting
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
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
