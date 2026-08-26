import api from './api';



const inventoryApi = {

  // Get all stock
  getAll: async (params = {}) => {
    const response = await api.get('/inventory/stock/', {
      params,
    });

    return response.data;
  },

  // Get single stock record
  getById: async (id) => {
    const response = await api.get(`/inventory/stock/${id}/`);

    return response.data;
  },

  // Create stock record
  create: async (data) => {
    const response = await api.post(
      '/inventory/stock/',
      data
    );

    return response.data;
  },

  // Update stock record
  update: async (id, data) => {
    const response = await api.put(
      `/inventory/stock/${id}/`,
      data
    );

    return response.data;
  },

  // Partial update
  patch: async (id, data) => {
    const response = await api.patch(
      `/inventory/stock/${id}/`,
      data
    );

    return response.data;
  },

  // Delete stock record
  delete: async (id) => {
    const response = await api.delete(
      `/inventory/stock/${id}/`
    );

    return response.data;
  },

  // Get stock movements
  getMovements: async (params = {}) => {
    const response = await api.get(
      '/inventory/stock-movements/',
      {
        params,
      }
    );

    return response.data;
  },

  // Get one stock movement
  getMovementById: async (id) => {
    const response = await api.get(
      `/inventory/stock-movements/${id}/`
    );

    return response.data;
  },

  // Create stock movement
  createMovement: async (data) => {
    const response = await api.post(
      '/inventory/stock-movements/',
      data
    );

    return response.data;
  },

  // Low stock
  getLowStock: async () => {
    const response = await api.get(
      '/inventory/stock/low-stock/'
    );

    return response.data;
  },

  // Out of stock
  getOutOfStock: async () => {
    const response = await api.get(
      '/inventory/stock/out-of-stock/'
    );

    return response.data;
  },

};

export default inventoryApi;