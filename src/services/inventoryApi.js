
import api from "./api";

const inventoryApi = {
  // =========================================================
  // GET ALL STOCK
  // GET /inventory/stocks/
  // =========================================================

  getAll: async (params = {}) => {
    const response = await api.get(
      "/inventory/stocks/",
      {
        params,
      }
    );

    return response.data;
  },

  // =========================================================
  // GET SINGLE STOCK
  // GET /inventory/stocks/{id}/
  // =========================================================

  getById: async (id) => {
    const response = await api.get(
      `/inventory/stocks/${id}/`
    );

    return response.data;
  },

  // =========================================================
  // CREATE STOCK
  // POST /inventory/stocks/
  // =========================================================

  create: async (data) => {
    const response = await api.post(
      "/inventory/stocks/",
      data
    );

    return response.data;
  },

  // =========================================================
  // UPDATE STOCK
  // PUT /inventory/stocks/{id}/
  // =========================================================

  update: async (id, data) => {
    const response = await api.put(
      `/inventory/stocks/${id}/`,
      data
    );

    return response.data;
  },

  // =========================================================
  // PARTIAL UPDATE STOCK
  // PATCH /inventory/stocks/{id}/
  // =========================================================

  patch: async (id, data) => {
    const response = await api.patch(
      `/inventory/stocks/${id}/`,
      data
    );

    return response.data;
  },

  // =========================================================
  // DELETE STOCK
  // DELETE /inventory/stocks/{id}/
  // =========================================================

  delete: async (id) => {
    const response = await api.delete(
      `/inventory/stocks/${id}/`
    );

    return response.data;
  },

  // =========================================================
  // STOCK MOVEMENTS
  // GET /inventory/stock-movements/
  // =========================================================

  getMovements: async (params = {}) => {
    const response = await api.get(
      "/inventory/stock-movements/",
      {
        params,
      }
    );

    return response.data;
  },

  // =========================================================
  // GET SINGLE STOCK MOVEMENT
  // GET /inventory/stock-movements/{id}/
  // =========================================================

  getMovementById: async (id) => {
    const response = await api.get(
      `/inventory/stock-movements/${id}/`
    );

    return response.data;
  },

  // =========================================================
  // CREATE STOCK MOVEMENT
  // POST /inventory/stock-movements/
  // =========================================================

  createMovement: async (data) => {
    const response = await api.post(
      "/inventory/stock-movements/",
      data
    );

    return response.data;
  },

  // =========================================================
  // LOW STOCK
  //
  // IMPORTANT:
  // This endpoint only exists if your StockViewSet
  // has a @action for low-stock.
  // =========================================================

  getLowStock: async () => {
    const response = await api.get(
      "/inventory/stocks/low-stock/"
    );

    return response.data;
  },

  // =========================================================
  // OUT OF STOCK
  //
  // IMPORTANT:
  // This endpoint only exists if your StockViewSet
  // has a @action for out-of-stock.
  // =========================================================

  getOutOfStock: async () => {
    const response = await api.get(
      "/inventory/stocks/out-of-stock/"
    );

    return response.data;
  },

adjustStock: (stockId, data) => {
    return api.patch(`/inventory/stocks/${stockId}/adjust/`, data);
  },

};

export default inventoryApi;
