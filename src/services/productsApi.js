import api from './api';

const productsApi = {

  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get('/products/', {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE PRODUCT
  // ==========================================
  getById: async (id) => {
    const response = await api.get(
      `/products/${id}/`
    );

    return response.data;
  },

  // ==========================================
  // CREATE PRODUCT
  // ==========================================
  create: async (data) => {
    const response = await api.post(
      '/products/',
      data
    );

    return response.data;
  },

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================
  update: async (id, data) => {
    const response = await api.put(
      `/products/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // PARTIAL UPDATE PRODUCT
  // ==========================================
  patch: async (id, data) => {
    const response = await api.patch(
      `/products/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  delete: async (id) => {
    await api.delete(
      `/products/${id}/`
    );

    return true;
  },

  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================
  search: async (query) => {
    const response = await api.get(
      '/products/',
      {
        params: {
          search: query,
        },
      }
    );

    return response.data;
  },

  // ==========================================
  // GET ACTIVE PRODUCTS
  // ==========================================
  getActive: async () => {
    const response = await api.get(
      '/products/',
      {
        params: {
          is_active: true,
        },
      }
    );

    return response.data;
  },

  // ==========================================
  // GET PRODUCTS BY CATEGORY
  // ==========================================
  getByCategory: async (categoryId) => {
    const response = await api.get(
      '/products/',
      {
        params: {
          category: categoryId,
        },
      }
    );

    return response.data;
  },

  // ==========================================
  // GET PRODUCTS BY BRAND
  // ==========================================
  getByBrand: async (brandId) => {
    const response = await api.get(
      '/products/',
      {
        params: {
          brand: brandId,
        },
      }
    );

    return response.data;
  },

};

export default productsApi;