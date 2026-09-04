import api from "./api";

const roleApi = {
  // ==========================================
  // GET ALL ROLES
  // ==========================================
  getAll: async (params = {}) => {
    const response = await api.get("/roles/", {
      params,
    });

    return response.data;
  },

  // ==========================================
  // GET SINGLE ROLE
  // ==========================================
  getById: async (id) => {
    const response = await api.get(`/roles/${id}/`);

    return response.data;
  },

  // ==========================================
  // CREATE ROLE
  // ==========================================
  create: async (data) => {
    const response = await api.post("/roles/", data);

    return response.data;
  },

  // ==========================================
  // UPDATE ROLE
  // ==========================================
  update: async (id, data) => {
    const response = await api.patch(`/roles/${id}/`, data);

    return response.data;
  },

  // ==========================================
  // DELETE ROLE
  // ==========================================
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}/`);

    return response.data;
  },

  // ==========================================
  // GET ROLE PERMISSIONS
  // ==========================================
  getPermissions: async (id) => {
    const response = await api.get(`/roles/${id}/permissions/`);

    return response.data;
  },

  // ==========================================
  // ASSIGN PERMISSIONS TO ROLE
  // ==========================================
  assignPermissions: async (id, permissionIds) => {
    const response = await api.post(
      `/roles/${id}/permissions/`,
      {
        permission_ids: permissionIds,
      }
    );

    return response.data;
  },

  // ==========================================
  // REMOVE PERMISSION FROM ROLE
  // ==========================================
  removePermission: async (roleId, permissionId) => {
    const response = await api.delete(
      `/roles/${roleId}/permissions/${permissionId}/`
    );

    return response.data;
  },

  // ==========================================
  // GET USERS ASSIGNED TO ROLE
  // ==========================================
  getUsers: async (id, params = {}) => {
    const response = await api.get(`/roles/${id}/users/`, {
      params,
    });

    return response.data;
  },

  // ==========================================
  // ACTIVATE ROLE
  // ==========================================
  activate: async (id) => {
    const response = await api.post(`/roles/${id}/activate/`);

    return response.data;
  },

  // ==========================================
  // DEACTIVATE ROLE
  // ==========================================
  deactivate: async (id) => {
    const response = await api.post(`/roles/${id}/deactivate/`);

    return response.data;
  },

  // ==========================================
  // SEARCH ROLES
  // ==========================================
  search: async (search) => {
    const response = await api.get("/roles/", {
      params: {
        search,
      },
    });

    return response.data;
  },
};

export default roleApi;