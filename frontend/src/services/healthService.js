import api from './api';

export const healthService = {
  /**
   * Check backend system health.
   * Endpoint: GET /api/health
   */
  checkHealth: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};
