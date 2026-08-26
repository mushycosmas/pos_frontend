import api from './api';


const categoriesApi = {

  // Get all categories
  getAll: async (params = {}) => {
    const response = await api.get(
      '/categories/',
      {
        params,
      }
    );

    return response.data;
  },

  // Get single category
  getById: async (id) => {
    const response = await api.get(
      `/categories/${id}/`
    );

    return response.data;
  },

  // Create category
  create: async (data) => {
    const response = await api.post(
      '/categories/',
      data
    );

    return response.data;
  },

  // Update category
  update: async (id, data) => {
    const response = await api.put(
      `/categories/${id}/`,
      data
    );

    return response.data;
  },

  // Partial update
  patch: async (id, data) => {
    const response = await api.patch(
      `/categories/${id}/`,
      data
    );

    return response.data;
  },

  // Delete category
  delete: async (id) => {
    const response = await api.delete(
      `/categories/${id}/`
    );

    return response.data;
  },

};

export default categoriesApi;