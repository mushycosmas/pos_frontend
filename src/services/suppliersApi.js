import api from './api';

const suppliersApi = {

  // ==========================================
  // GET ALL SUPPLIERS
  // ==========================================
  getAll: async () => {
    const response = await api.get('/suppliers/');
    return response.data;
  },

  // ==========================================
  // GET SINGLE SUPPLIER
  // ==========================================
  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}/`);
    return response.data;
  },

  // ==========================================
  // CREATE SUPPLIER
  // ==========================================
  create: async (data) => {
    const response = await api.post(
      '/suppliers/',
      data
    );

    return response.data;
  },

  // ==========================================
  // UPDATE SUPPLIER
  // ==========================================
  update: async (id, data) => {
    const response = await api.put(
      `/suppliers/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // PARTIAL UPDATE
  // ==========================================
  patch: async (id, data) => {
    const response = await api.patch(
      `/suppliers/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // DELETE SUPPLIER
  // ==========================================
  delete: async (id) => {
    await api.delete(
      `/suppliers/${id}/`
    );

    return true;
  },

};

export default suppliersApi;