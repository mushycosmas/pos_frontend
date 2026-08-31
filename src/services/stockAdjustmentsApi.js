import api from "./api";

const stockAdjustmentsApi = {
  // =========================================================
  // GET ALL STOCK ADJUSTMENTS
  // =========================================================

  getAll: async (params = {}) => {
    const response = await api.get(
      "/stock-adjustments/",
      {
        params,
      }
    );

    return response.data;
  },

  // =========================================================
  // GET ONE STOCK ADJUSTMENT
  // =========================================================

  getById: async (id) => {
    if (!id) {
      throw new Error(
        "Stock adjustment ID is required."
      );
    }

    const response = await api.get(
      `/stock-adjustments/${id}/`
    );

    return response.data;
  },

  // =========================================================
  // CREATE STOCK ADJUSTMENT
  //
  // This is the main method used for:
  //
  // ADD
  // REMOVE
  //
  // Example:
  //
  // {
  //   stock: 5,
  //   product: 9,
  //   type: "ADD",
  //   quantity: 10,
  //   reason: "Purchase",
  //   notes: ""
  // }
  //
  // IMPORTANT:
  //
  // The Django backend must update Stock.quantity
  // when this endpoint is called.
  // =========================================================

  create: async (data) => {
    if (!data) {
      throw new Error(
        "Stock adjustment data is required."
      );
    }

    const response = await api.post(
      "/stock-adjustments/",
      data
    );

    return response.data;
  },

  // =========================================================
  // ADJUST STOCK
  //
  // Dedicated helper for ADD / REMOVE operations.
  //
  // This is the method I recommend using from
  // InventoryContext.
  // =========================================================

  adjust: async ({
    stockId,
    productId,
    type,
    quantity,
    reason = "",
    notes = "",
    reference = "",
  }) => {
    // -------------------------------------------------------
    // STOCK ID
    // -------------------------------------------------------

    if (!stockId) {
      throw new Error(
        "Stock ID is required."
      );
    }

    // -------------------------------------------------------
    // PRODUCT ID
    // -------------------------------------------------------

    if (!productId) {
      throw new Error(
        "Product ID is required."
      );
    }

    // -------------------------------------------------------
    // TYPE
    // -------------------------------------------------------

    if (
      type !== "ADD" &&
      type !== "REMOVE"
    ) {
      throw new Error(
        "Adjustment type must be ADD or REMOVE."
      );
    }

    // -------------------------------------------------------
    // QUANTITY
    // -------------------------------------------------------

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      !Number.isInteger(
        numericQuantity
      ) ||
      numericQuantity <= 0
    ) {
      throw new Error(
        "Quantity must be a whole number greater than zero."
      );
    }

    // -------------------------------------------------------
    // PREPARE PAYLOAD
    // -------------------------------------------------------

    const payload = {
      stock: Number(stockId),

      product: Number(productId),

      type,

      quantity:
        numericQuantity,

      reason:
        String(reason || "").trim(),

      notes:
        String(notes || "").trim(),

      reference:
        String(reference || "").trim(),
    };

    console.log(
      "STOCK ADJUSTMENT REQUEST:",
      payload
    );

    // -------------------------------------------------------
    // SEND TO DJANGO
    // -------------------------------------------------------

    const response =
      await api.post(
        "/stock-adjustments/",
        payload
      );

    console.log(
      "STOCK ADJUSTMENT RESPONSE:",
      response.data
    );

    return response.data;
  },

  // =========================================================
  // UPDATE STOCK ADJUSTMENT
  //
  // PUT should normally be used carefully because changing
  // an existing stock movement can affect stock history.
  // =========================================================

  update: async (
    id,
    data
  ) => {
    if (!id) {
      throw new Error(
        "Stock adjustment ID is required."
      );
    }

    if (!data) {
      throw new Error(
        "Stock adjustment data is required."
      );
    }

    const response =
      await api.put(
        `/stock-adjustments/${id}/`,
        data
      );

    return response.data;
  },

  // =========================================================
  // PARTIAL UPDATE
  // =========================================================

  patch: async (
    id,
    data
  ) => {
    if (!id) {
      throw new Error(
        "Stock adjustment ID is required."
      );
    }

    if (!data) {
      throw new Error(
        "Stock adjustment data is required."
      );
    }

    const response =
      await api.patch(
        `/stock-adjustments/${id}/`,
        data
      );

    return response.data;
  },

  // =========================================================
  // DELETE STOCK ADJUSTMENT
  // =========================================================

  delete: async (id) => {
    if (!id) {
      throw new Error(
        "Stock adjustment ID is required."
      );
    }

    await api.delete(
      `/stock-adjustments/${id}/`
    );

    return true;
  },
};

export default stockAdjustmentsApi;
