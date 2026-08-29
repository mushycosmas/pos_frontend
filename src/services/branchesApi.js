import api from "./api";

const branchesApi = {
  // ==========================================
  // GET ALL BRANCHES
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get("/branches/", {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE BRANCH
  // ==========================================
  getById: async (id) => {
    const response = await api.get(
      `/branches/${id}/`
    );

    return response.data;
  },

  // ==========================================
  // CREATE BRANCH
  // ==========================================
  create: async (data) => {
    const response = await api.post(
      "/branches/",
      data
    );

    return response.data;
  },

  // ==========================================
  // UPDATE BRANCH
  // ==========================================
  update: async (id, data) => {
    const response = await api.put(
      `/branches/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // PARTIAL UPDATE
  // ==========================================
  patch: async (id, data) => {
    const response = await api.patch(
      `/branches/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // DELETE BRANCH
  // ==========================================
  delete: async (id) => {
    await api.delete(
      `/branches/${id}/`
    );

    return true;
  },
};

export default branchesApi;