import api from "./api";

const paymentMethodApi = {
  // ==========================================
  // GET ALL PAYMENT METHODS
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get("/payment-methods/", {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET ACTIVE PAYMENT METHODS
  // Used by POS Checkout
  // ==========================================
  getActive: async () => {
    const response = await api.get("/payment-methods/active/");

    return response.data;
  },

  // ==========================================
  // GET SINGLE PAYMENT METHOD
  // ==========================================
  getById: async (id) => {
    const response = await api.get(
      `/payment-methods/${id}/`
    );

    return response.data;
  },

  // ==========================================
  // CREATE PAYMENT METHOD
  // ==========================================
  create: async (data) => {
    const response = await api.post(
      "/payment-methods/",
      data
    );

    return response.data;
  },

  // ==========================================
  // UPDATE PAYMENT METHOD
  // ==========================================
  update: async (id, data) => {
    const response = await api.patch(
      `/payment-methods/${id}/`,
      data
    );

    return response.data;
  },

  // ==========================================
  // DELETE PAYMENT METHOD
  // ==========================================
  delete: async (id) => {
    const response = await api.delete(
      `/payment-methods/${id}/`
    );

    return response.data;
  },

  // ==========================================
  // ACTIVATE PAYMENT METHOD
  // ==========================================
  activate: async (id) => {
    const response = await api.post(
      `/payment-methods/${id}/activate/`
    );

    return response.data;
  },

  // ==========================================
  // DEACTIVATE PAYMENT METHOD
  // ==========================================
  deactivate: async (id) => {
    const response = await api.post(
      `/payment-methods/${id}/deactivate/`
    );

    return response.data;
  },

  // ==========================================
  // FILTER BY PAYMENT TYPE
  // Example: cash, mobile_money, card, bank
  // ==========================================
  getByType: async (paymentType) => {
    const response = await api.get(
      "/payment-methods/",
      {
        params: {
          payment_type: paymentType,
        },
      }
    );

    return response.data;
  },
};

export default paymentMethodApi;