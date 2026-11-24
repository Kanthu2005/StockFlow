/**
 * Authentication Service
 * Interacts directly with the StockFlow FastAPI backend endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - GET /auth/me
 */
import api from './api';

export const authService = {
  /**
   * Register a new organization and administrator account.
   * @param {Object} payload - { email, password, organization_name }
   * @returns {Promise<{ access_token: string, token_type: string, user: Object }>}
   */
  async register({ email, password, organization_name }) {
    const response = await api.post('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      organization_name: organization_name.trim(),
    });
    return response.data;
  },

  /**
   * Authenticate user credentials and receive JWT access token.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ access_token: string, token_type: string, user: Object }>}
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  /**
   * Fetch current authenticated user and organization profile.
   * @returns {Promise<{ id: number, email: string, organization_id: number, organization_name: string, created_at: string }>}
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
