
import api from "./api";

const expensesApi = {
  // =========================================================
  // EXPENSES
  // =========================================================

  getAll: async (params = {}) => {
    const response = await api.get("/expenses/", {
      params,
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}/`);

    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/expenses/", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(
      `/expenses/${id}/`,
      data
    );

    return response.data;
  },

  patch: async (id, data) => {
    const response = await api.patch(
      `/expenses/${id}/`,
      data
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(
      `/expenses/${id}/`
    );

    return response.data;
  },

  // =========================================================
  // EXPENSE CATEGORIES
  // =========================================================

  getCategories: async (params = {}) => {
    const response = await api.get(
      "/expense-categories/",
      {
        params,
      }
    );

    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(
      `/expense-categories/${id}/`
    );

    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post(
      "/expense-categories/",
      data
    );

    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(
      `/expense-categories/${id}/`,
      data
    );

    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(
      `/expense-categories/${id}/`
    );

    return response.data;
  },
};

export default expensesApi;

