
import api from "./api";

const userApi = {
  // Get all users
  getAll: async (params = {}) => {
    const response = await api.get("/users/", {
      params,
    });

    return response.data;
  },

  // Get a single user
  getById: async (id) => {
    const response = await api.get(`/users/${id}/`);

    return response.data;
  },

  // Create a new user
  create: async (userData) => {
    const response = await api.post("/users/", userData);

    return response.data;
  },

  // Update user
  update: async (id, userData) => {
    const response = await api.patch(`/users/${id}/`, userData);

    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}/`);

    return response.data;
  },

  // Activate user
  activate: async (id) => {
    const response = await api.patch(`/users/${id}/`, {
      is_active: true,
    });

    return response.data;
  },

  // Deactivate user
  deactivate: async (id) => {
    const response = await api.patch(`/users/${id}/`, {
      is_active: false,
    });

    return response.data;
  },

  // Change user password
  changePassword: async (id, passwordData) => {
    const response = await api.post(
      `/users/${id}/change-password/`,
      passwordData
    );

    return response.data;
  },
};

export default userApi;
