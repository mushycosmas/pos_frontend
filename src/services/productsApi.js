
import api from "./api";

const productsApi = {
  // GET /products/?branch=ID
  getAll: async (params = {}) => {
    const response = await api.get("/products/", {
      params,
    });
    return response.data;
  },

  // GET /products/{id}/
  getById: async (id) => {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  },

  // POST /products/
  create: async (data) => {
    const response = await api.post("/products/", data);
    return response.data;
  },

  // PUT /products/{id}/
  update: async (id, data) => {
    const response = await api.put(`/products/${id}/`, data);
    return response.data;
  },

  // PATCH /products/{id}/
  patch: async (id, data) => {
    const response = await api.patch(`/products/${id}/`, data);
    return response.data;
  },

  // DELETE /products/{id}/
  delete: async (id) => {
    await api.delete(`/products/${id}/`);
    return true;
  },

  // Search within the selected branch.
  search: async (query, branchId) => {
    const response = await api.get("/products/", {
      params: {
        search: query,
        branch: branchId,
      },
    });
    return response.data;
  },

  // Active products within the selected branch.
  getActive: async (branchId) => {
    const response = await api.get("/products/", {
      params: {
        is_active: true,
        branch: branchId,
      },
    });
    return response.data;
  },

  // Products by category within the selected branch.
  getByCategory: async (categoryId, branchId) => {
    const response = await api.get("/products/", {
      params: {
        category: categoryId,
        branch: branchId,
      },
    });
    return response.data;
  },

  // Products by brand within the selected branch.
  getByBrand: async (brandId, branchId) => {
    const response = await api.get("/products/", {
      params: {
        brand: brandId,
        branch: branchId,
      },
    });
    return response.data;
  },
};

export default productsApi;
