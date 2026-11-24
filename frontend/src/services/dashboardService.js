/**
 * Dashboard API Service
 * Interacts with backend metrics endpoints:
 * - GET /dashboard/summary
 * - GET /dashboard/low-stock
 */
import api from './api';

export const dashboardService = {
  /**
   * Fetch aggregated inventory metrics for the authenticated organization.
   * @returns {Promise<{ total_products: number, total_quantity: number, low_stock_count: number }>}
   */
  async getSummary() {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  /**
   * Fetch low-stock products for the authenticated organization.
   * @returns {Promise<{ items: Array<{ id: number, name: string, sku: string, quantity_on_hand: number, effective_threshold: number }>, total: number }>}
   */
  async getLowStock() {
    const response = await api.get('/dashboard/low-stock');
    return response.data;
  },
};

export default dashboardService;
