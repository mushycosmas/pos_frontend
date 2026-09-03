
import api from './api';

const customerApi = {
  // Get all customers
  getAll: async (params = {}) => {
    const response = await api.get('/customers/', {
      params,
    });
    return response.data;
  },

  // Get a single customer by ID
  getById: async (id) => {
    const response = await api.get(`/customers/${id}/`);
    return response.data;
  },

  // Create a new customer
  create: async (customerData) => {
    const response = await api.post('/customers/', customerData);
    return response.data;
  },

  // Update a customer completely
  update: async (id, customerData) => {
    const response = await api.put(
      `/customers/${id}/`,
      customerData
    );
    return response.data;
  },

  // Partially update a customer
  patch: async (id, customerData) => {
    const response = await api.patch(
      `/customers/${id}/`,
      customerData
    );
    return response.data;
  },

  // Delete a customer
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}/`);
    return response.data;
  },

  // Search customers
  search: async (query) => {
    const response = await api.get('/customers/', {
      params: {
        search: query,
      },
    });
    return response.data;
  },

  // Get active customers
  getActive: async () => {
    const response = await api.get('/customers/', {
      params: {
        is_active: true,
      },
    });
    return response.data;
  },
};

export default customerApi;
