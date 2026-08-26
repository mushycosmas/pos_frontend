import api from './api';

const stockAdjustmentsApi = {
  // Get all stock adjustments
  getAll: async () => {
    const response = await api.get('/stock-adjustments/');
    return response.data;
  },

  // Get one adjustment
  getById: async (id) => {
    const response = await api.get(`/stock-adjustments/${id}/`);
    return response.data;
  },

  // Create adjustment
  create: async (data) => {
    const response = await api.post(
      '/stock-adjustments/',
      data
    );

    return response.data;
  },

  // Update adjustment
  update: async (id, data) => {
    const response = await api.put(
      `/stock-adjustments/${id}/`,
      data
    );

    return response.data;
  },

  // Partial update
  patch: async (id, data) => {
    const response = await api.patch(
      `/stock-adjustments/${id}/`,
      data
    );

    return response.data;
  },

  // Delete adjustment
  delete: async (id) => {
    await api.delete(
      `/stock-adjustments/${id}/`
    );

    return true;
  },
};

export default stockAdjustmentsApi;