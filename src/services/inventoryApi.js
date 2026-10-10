import api from "./api";

const withBranch = (params = {}, branchId) => {
  const id = Number(
    branchId?.id ?? branchId ?? params.branch ?? params.branch_id
  );

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "A valid branch ID is required to load branch inventory."
    );
  }

  return {
    ...params,
    branch: id,
  };
};

const inventoryApi = {
  // GET /inventory/stocks/
  getAll: async (params = {}, branchId) => {
    const queryParams = branchId
      ? withBranch(params, branchId)
      : params;

    const response = await api.get("/inventory/stocks/", {
      params: queryParams,
    });

    return response.data;
  },

  // GET /inventory/stocks/{id}/
  getById: async (id) => {
    const response = await api.get(`/inventory/stocks/${id}/`);
    return response.data;
  },

  // POST /inventory/stocks/
  create: async (data) => {
    const response = await api.post("/inventory/stocks/", data);
    return response.data;
  },

  // PUT /inventory/stocks/{id}/
  update: async (id, data) => {
    const response = await api.put(`/inventory/stocks/${id}/`, data);
    return response.data;
  },

  // PATCH /inventory/stocks/{id}/
  patch: async (id, data) => {
    const response = await api.patch(`/inventory/stocks/${id}/`, data);
    return response.data;
  },

  // DELETE /inventory/stocks/{id}/
  delete: async (id) => {
    const response = await api.delete(`/inventory/stocks/${id}/`);
    return response.data;
  },

  // GET /inventory/stock-movements/
  getMovements: async (params = {}, branchId) => {
    const queryParams = branchId
      ? withBranch(params, branchId)
      : params;

    const response = await api.get("/inventory/stock-movements/", {
      params: queryParams,
    });

    return response.data;
  },

  // GET /inventory/stock-movements/{id}/
  getMovementById: async (id) => {
    const response = await api.get(`/inventory/stock-movements/${id}/`);
    return response.data;
  },

  // POST /inventory/stock-movements/
  createMovement: async (data) => {
    const response = await api.post("/inventory/stock-movements/", data);
    return response.data;
  },

  // DELETE /inventory/stock-movements/{id}/
  deleteMovement: async (id) => {
    const response = await api.delete(`/inventory/stock-movements/${id}/`);
    return response.data;
  },

  // PATCH /inventory/stocks/{stockId}/adjust/
  adjustStock: async (stockId, data) => {
    const response = await api.patch(
      `/inventory/stocks/${stockId}/adjust/`,
      data
    );
    return response.data;
  },

  // GET /inventory/stocks/low-stock/
  getLowStock: async (branchId) => {
    const params = branchId ? withBranch({}, branchId) : {};
    const response = await api.get("/inventory/stocks/low-stock/", {
      params,
    });
    return response.data;
  },

  // GET /inventory/stocks/out-of-stock/
  getOutOfStock: async (branchId) => {
    const params = branchId ? withBranch({}, branchId) : {};
    const response = await api.get("/inventory/stocks/out-of-stock/", {
      params,
    });
    return response.data;
  },
};

export default inventoryApi;