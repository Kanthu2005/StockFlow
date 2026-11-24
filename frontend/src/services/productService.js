/**
 * Product API Service
 * Interacts with backend inventory endpoints:
 * - GET /products
 * - GET /products/{id}
 * - POST /products
 * - PUT /products/{id}
 * - DELETE /products/{id}
 */
import api from './api';

export const productService = {
  /**
   * Fetch paginated list of products for the authenticated organization.
   * @param {Object} options - { search, page, page_size }
   * @returns {Promise<{ items: Array, total: number, page: number, page_size: number, total_pages: number }>}
   */
  async getProducts({ search = '', page = 1, page_size = 20 } = {}) {
    const params = { page, page_size };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Fetch single product by ID.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getProduct(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product.
   * @param {Object} data - Form data
   * @returns {Promise<Object>}
   */
  async createProduct(data) {
    const payload = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      description: data.description && data.description.trim() ? data.description.trim() : null,
      quantity_on_hand: parseInt(data.quantity_on_hand ?? data.quantity ?? 0, 10),
      cost_price:
        data.cost_price !== '' && data.cost_price !== null && data.cost_price !== undefined
          ? parseFloat(data.cost_price)
          : null,
      selling_price:
        data.selling_price !== '' && data.selling_price !== null && data.selling_price !== undefined
          ? parseFloat(data.selling_price)
          : null,
      low_stock_threshold:
        data.low_stock_threshold !== '' && data.low_stock_threshold !== null && data.low_stock_threshold !== undefined
          ? parseInt(data.low_stock_threshold, 10)
          : null,
    };

    const response = await api.post('/products', payload);
    return response.data;
  },

  /**
   * Update an existing product.
   * @param {number|string} id
   * @param {Object} data - Form data
   * @returns {Promise<Object>}
   */
  async updateProduct(id, data) {
    const payload = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      description: data.description && data.description.trim() ? data.description.trim() : null,
      quantity_on_hand: parseInt(data.quantity_on_hand ?? data.quantity ?? 0, 10),
      cost_price:
        data.cost_price !== '' && data.cost_price !== null && data.cost_price !== undefined
          ? parseFloat(data.cost_price)
          : null,
      selling_price:
        data.selling_price !== '' && data.selling_price !== null && data.selling_price !== undefined
          ? parseFloat(data.selling_price)
          : null,
      low_stock_threshold:
        data.low_stock_threshold !== '' && data.low_stock_threshold !== null && data.low_stock_threshold !== undefined
          ? parseInt(data.low_stock_threshold, 10)
          : null,
    };

    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Delete product by ID.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
  },
};

export default productService;
