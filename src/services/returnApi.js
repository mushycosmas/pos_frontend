import api from "./api";

const returnApi = {
  // Get all returns
  getReturns: async (params = {}) => {
    const response = await api.get("/returns/", {
      params,
    });

    return response.data;
  },

  // Get single return
  getReturn: async (id) => {
    const response = await api.get(`/returns/${id}/`);

    return response.data;
  },

  // Create return
  createReturn: async (data) => {
    const response = await api.post(
      "/returns/",
      data
    );

    return response.data;
  },

  // Approve return
  approveReturn: async (id) => {
    const response = await api.post(
      `/returns/${id}/approve/`
    );

    return response.data;
  },

  // Complete return
  completeReturn: async (id) => {
    const response = await api.post(
      `/returns/${id}/complete/`
    );

    return response.data;
  },

  // Reject return
  rejectReturn: async (id) => {
    const response = await api.post(
      `/returns/${id}/reject/`
    );

    return response.data;
  },
};

export default returnApi;