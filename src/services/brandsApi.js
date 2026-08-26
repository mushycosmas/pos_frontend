import api from './api';

const brandsApi = {
  // ==========================================
  // GET ALL BRANDS
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get('/brands/', {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE BRAND
  // ==========================================
  getById: async (id) => {
    const response = await api.get(`/brands/${id}/`);

    return response.data;
  },

  // ==========================================
  // CREATE BRAND
  // ==========================================
  create: async (data) => {
    const response = await api.post(
      '/brands/',
      data
    );

    return response.data;
  },

  // ==========================================
  // UPDATE BRAND
  // ==========================================
  update: async (id, data) => {
    const response = await api.put(
      `/brands/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // PARTIAL UPDATE
  // ==========================================
  patch: async (id, data) => {
    const response = await api.patch(
      `/brands/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // DELETE BRAND
  // ==========================================
  delete: async (id) => {
    await api.delete(`/brands/${id}/`);

    return true;
  },
};

export default brandsApi;