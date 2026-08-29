import api from "./api";

const purchasesApi = {
  // ==========================================================
  // GET ALL PURCHASES
  // ==========================================================
  getAll: async (params = {}) => {
    const response = await api.get("/purchases/", {
      params,
    });

    return response.data;
  },

  // ==========================================================
  // GET SINGLE PURCHASE
  // ==========================================================
  getById: async (id) => {
    const response = await api.get(`/purchases/${id}/`);

    return response.data;
  },

  // ==========================================================
  // CREATE PURCHASE
  // ==========================================================
  create: async (data) => {
    const response = await api.post(
      "/purchases/",
      data
    );

    return response.data;
  },

  // ==========================================================
  // UPDATE PURCHASE
  // ==========================================================
  update: async (id, data) => {
    const response = await api.put(
      `/purchases/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================================
  // PARTIAL UPDATE PURCHASE
  // ==========================================================
  patch: async (id, data) => {
    const response = await api.patch(
      `/purchases/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================================
  // DELETE PURCHASE
  // ==========================================================
  delete: async (id) => {
    await api.delete(`/purchases/${id}/`);

    return true;
  },
};

export default purchasesApi;