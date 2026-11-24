import api from './api';

export const inventoryService = {
  checkHealth: async () => {
    const response = await api.get('/api/v1/health');
    return response.data;
  },

  getItems: async (skip = 0, limit = 100) => {
    const response = await api.get('/api/v1/items', {
      params: { skip, limit },
    });
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await api.post('/api/v1/items', itemData);
    return response.data;
  },

  getItemById: async (id) => {
    const response = await api.get(`/api/v1/items/${id}`);
    return response.data;
  },
};
