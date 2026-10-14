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

  // PUT /products/{id}/?branch=ID
  update: async (id, data, branchId = null) => {
    const response = await api.put(
      `/products/${id}/`,
      data,
      {
        params: branchId ? { branch: branchId } : {},
      }
    );
    return response.data;
  },

  // PATCH /products/{id}/?branch=ID
  patch: async (id, data, branchId = null) => {
    const response = await api.patch(
      `/products/${id}/`,
      data,
      {
        params: branchId ? { branch: branchId } : {},
      }
    );
    return response.data;
  },

  // DELETE /products/{id}/
 delete: async (id, branchId = null) => {
  const response = await api.delete(
    `/products/${id}/`,
    {
      params: branchId
        ? { branch: branchId }
        : {},
    }
  );

  return response.data;
},

  // Search within the selected branch
  search: async (query, branchId) => {
    const response = await api.get("/products/", {
      params: {
        search: query,
        ...(branchId ? { branch: branchId } : {}),
      },
    });
    return response.data;
  },

  // Active products within the selected branch
  getActive: async (branchId) => {
    const response = await api.get("/products/", {
      params: {
        is_active: true,
        ...(branchId ? { branch: branchId } : {}),
      },
    });
    return response.data;
  },

  // Products by category
  getByCategory: async (categoryId, branchId) => {
    const response = await api.get("/products/", {
      params: {
        category: categoryId,
        ...(branchId ? { branch: branchId } : {}),
      },
    });
    return response.data;
  },

  // Products by brand
  getByBrand: async (brandId, branchId) => {
    const response = await api.get("/products/", {
      params: {
        brand: brandId,
        ...(branchId ? { branch: branchId } : {}),
      },
    });
    return response.data;
  },
};

export default productsApi;