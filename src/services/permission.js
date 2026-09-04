import api from "./api";

const permissionApi = {
  // ==========================================
  // GET ALL PERMISSIONS
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get("/permissions/", {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE PERMISSION
  // ==========================================
  getById: async (id) => {
    const response = await api.get(`/permissions/${id}/`);

    return response.data;
  },

  // ==========================================
  // CREATE PERMISSION
  // ==========================================
  create: async (data) => {
    const response = await api.post("/permissions/", data);

    return response.data;
  },

  // ==========================================
  // UPDATE PERMISSION
  // ==========================================
  update: async (id, data) => {
    const response = await api.patch(`/permissions/${id}/`, data);

    return response.data;
  },

  // ==========================================
  // DELETE PERMISSION
  // ==========================================
  delete: async (id) => {
    const response = await api.delete(`/permissions/${id}/`);

    return response.data;
  },

  // ==========================================
  // GET ACTIVE PERMISSIONS
  // ==========================================
  getActive: async () => {
    const response = await api.get("/permissions/active/");

    return response.data;
  },

  // ==========================================
  // GET PERMISSIONS BY MODULE
  // ==========================================
  getByModule: async (module) => {
    const response = await api.get("/permissions/", {
      params: {
        module,
      },
    });

    return response.data;
  },

  // ==========================================
  // GET PERMISSIONS BY ACTION
  // ==========================================
  getByAction: async (action) => {
    const response = await api.get("/permissions/", {
      params: {
        action,
      },
    });

    return response.data;
  },

  // ==========================================
  // SEARCH PERMISSIONS
  // ==========================================
  search: async (search) => {
    const response = await api.get("/permissions/", {
      params: {
        search,
      },
    });

    return response.data;
  },

  // ==========================================
  // ACTIVATE PERMISSION
  // ==========================================
  activate: async (id) => {
    const response = await api.post(
      `/permissions/${id}/activate/`
    );

    return response.data;
  },

  // ==========================================
  // DEACTIVATE PERMISSION
  // ==========================================
  deactivate: async (id) => {
    const response = await api.post(
      `/permissions/${id}/deactivate/`
    );

    return response.data;
  },
};

export default permissionApi;