
import api from "./api";

/**
 * Sales API
 *
 * Backend base endpoint:
 * /api/v1/sales/
 *
 * This service assumes your Django REST Framework
 * SaleViewSet is registered with:
 *
 * router.register(
 *   r"sales",
 *   SaleViewSet,
 *   basename="sales"
 * );
 */

const salesApi = {
  // =========================================================
  // GET ALL SALES
  // =========================================================
  //
  // Optional query parameters:
  //
  // {
  //   page: 1,
  //   search: "customer",
  //   status: "COMPLETED",
  //   payment_status: "PAID",
  //   date_from: "2026-08-01",
  //   date_to: "2026-08-31"
  // }
  //
  // =========================================================

  getAll: async (params = {}) => {
    const response = await api.get("/sales/", {
      params,
    });

    return response.data;
  },

  // =========================================================
  // GET ONE SALE
  // =========================================================

  getById: async (id) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    const response = await api.get(`/sales/${id}/`);

    return response.data;
  },

  // =========================================================
  // CREATE SALE
  // =========================================================
  //
  // Example:
  //
  // {
  //   customer: 1,
  //   branch: 1,
  //   items: [
  //     {
  //       product: 5,
  //       quantity: 2,
  //       unit_price: 15000
  //     }
  //   ],
  //   payment_method: "CASH"
  // }
  //
  // =========================================================

  create: async (data) => {
    if (!data) {
      throw new Error("Sale data is required.");
    }

    const response = await api.post("/sales/", data);

    return response.data;
  },

  // =========================================================
  // UPDATE SALE
  // =========================================================

  update: async (id, data) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    if (!data) {
      throw new Error("Sale data is required.");
    }

    const response = await api.put(
      `/sales/${id}/`,
      data
    );

    return response.data;
  },

  // =========================================================
  // PARTIAL UPDATE SALE
  // =========================================================

  patch: async (id, data) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    if (!data) {
      throw new Error("Sale data is required.");
    }

    const response = await api.patch(
      `/sales/${id}/`,
      data
    );

    return response.data;
  },

  // =========================================================
  // DELETE SALE
  // =========================================================

  delete: async (id) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    await api.delete(`/sales/${id}/`);

    return true;
  },

  // =========================================================
  // SEARCH SALES
  // =========================================================
  //
  // Example:
  //
  // salesApi.search("INV-0001")
  //
  // =========================================================

  search: async (query) => {
    const response = await api.get("/sales/", {
      params: {
        search: query,
      },
    });

    return response.data;
  },

  // =========================================================
  // GET SALES BY STATUS
  // =========================================================

  getByStatus: async (status) => {
    if (!status) {
      throw new Error("Sale status is required.");
    }

    const response = await api.get("/sales/", {
      params: {
        status,
      },
    });

    return response.data;
  },

  // =========================================================
  // GET SALES BY PAYMENT STATUS
  // =========================================================

  getByPaymentStatus: async (paymentStatus) => {
    if (!paymentStatus) {
      throw new Error(
        "Payment status is required."
      );
    }

    const response = await api.get("/sales/", {
      params: {
        payment_status: paymentStatus,
      },
    });

    return response.data;
  },

  // =========================================================
  // GET SALES BY DATE RANGE
  // =========================================================

  getByDateRange: async (
    dateFrom,
    dateTo,
    additionalParams = {}
  ) => {
    const params = {
      ...additionalParams,
    };

    if (dateFrom) {
      params.date_from = dateFrom;
    }

    if (dateTo) {
      params.date_to = dateTo;
    }

    const response = await api.get("/sales/", {
      params,
    });

    return response.data;
  },

  // =========================================================
  // GET TODAY'S SALES
  // =========================================================

  getToday: async () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    const response = await api.get("/sales/", {
      params: {
        date_from: today,
        date_to: today,
      },
    });

    return response.data;
  },

  // =========================================================
  // GET SALES BY CUSTOMER
  // =========================================================

  getByCustomer: async (customerId) => {
    if (!customerId) {
      throw new Error(
        "Customer ID is required."
      );
    }

    const response = await api.get("/sales/", {
      params: {
        customer: customerId,
      },
    });

    return response.data;
  },

  // =========================================================
  // GET SALES BY BRANCH
  // =========================================================

  getByBranch: async (branchId) => {
    if (!branchId) {
      throw new Error(
        "Branch ID is required."
      );
    }

    const response = await api.get("/sales/", {
      params: {
        branch: branchId,
      },
    });

    return response.data;
  },

  // =========================================================
  // COMPLETE SALE
  // =========================================================
  //
  // This requires the backend SaleViewSet to expose:
  //
  // POST /sales/{id}/complete/
  //
  // =========================================================

  complete: async (id) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    const response = await api.post(
      `/sales/${id}/complete/`
    );

    return response.data;
  },

  // =========================================================
  // CANCEL SALE
  // =========================================================
  //
  // Requires:
  //
  // POST /sales/{id}/cancel/
  //
  // =========================================================

  cancel: async (id, reason = "") => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    const payload = {};

    if (reason?.trim()) {
      payload.reason = reason.trim();
    }

    const response = await api.post(
      `/sales/${id}/cancel/`,
      payload
    );

    return response.data;
  },

  // =========================================================
  // REFUND SALE
  // =========================================================
  //
  // Requires backend endpoint:
  //
  // POST /sales/{id}/refund/
  //
  // =========================================================

  refund: async (id, data = {}) => {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    const response = await api.post(
      `/sales/${id}/refund/`,
      data
    );

    return response.data;
  },

  // =========================================================
  // GET SALE SUMMARY
  // =========================================================
  //
  // Requires backend endpoint:
  //
  // GET /sales/summary/
  //
  // =========================================================

  getSummary: async (params = {}) => {
    const response = await api.get(
      "/sales/summary/",
      {
        params,
      }
    );

    return response.data;
  },

  // =========================================================
  // GET SALES STATISTICS
  // =========================================================

  getStatistics: async (params = {}) => {
    const response = await api.get(
      "/sales/statistics/",
      {
        params,
      }
    );

    return response.data;
  },
};

export default salesApi;
