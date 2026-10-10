
/**
 * Purchase Utilities
 *
 * Shared helpers for:
 * - API response normalization
 * - Backend error handling
 * - Currency and date formatting
 * - Purchase, supplier, branch, and item handling
 * - Purchase status and receiving calculations
 * - Purchase payload preparation and validation
 */

// ============================================================
// API RESPONSE HELPERS
// ============================================================

/**
 * Normalize Django REST Framework list responses.
 * Supports arrays and paginated responses containing results.
 */
export const normalizeResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ============================================================
// NUMBER HELPERS
// ============================================================

/**
 * Safely convert a value into a finite number.
 */
export const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ============================================================
// BACKEND ERROR HANDLING
// ============================================================

/**
 * Extract a readable error message from an API or validation error.
 */
export const getBackendError = (
  err,
  fallback = "Something went wrong."
) => {
  const data = err?.response?.data;

  if (!data) {
    return err?.message || fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data === "object" && !Array.isArray(data)) {
    const messages = Object.entries(data).map(
      ([field, value]) => {
        const message = Array.isArray(value)
          ? value.map(String).join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);

        return `${field}: ${message}`;
      }
    );

    return messages.length > 0
      ? messages.join("\n")
      : fallback;
  }

  return fallback;
};

// ============================================================
// CURRENCY AND DATE FORMATTING
// ============================================================

/**
 * Format amounts using Tanzanian shillings.
 */
export const formatCurrency = (value) => {
  return `TSh ${toNumber(value).toLocaleString("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format dates for the purchases table.
 */
export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

// ============================================================
// PURCHASE ITEM HELPERS
// ============================================================

/**
 * Retrieve purchase items regardless of the API field name.
 */
export const getItems = (purchase) => {
  if (Array.isArray(purchase?.items)) {
    return purchase.items;
  }

  if (Array.isArray(purchase?.purchase_items)) {
    return purchase.purchase_items;
  }

  return [];
};

/**
 * Calculate the total quantity across purchase items.
 */
export const getTotalItemQuantity = (purchase) => {
  return getItems(purchase).reduce(
    (total, item) => total + toNumber(item?.quantity),
    0
  );
};

/**
 * Retrieve the purchase total from supported API fields.
 */
export const getPurchaseTotal = (purchase) => {
  return toNumber(
    purchase?.total ??
    purchase?.total_amount ??
    purchase?.grand_total
  );
};

/**
 * Retrieve the purchase reference number.
 */
export const getPurchaseNumber = (purchase) => {
  return (
    purchase?.purchase_number ||
    purchase?.purchaseNumber ||
    "-"
  );
};

// ============================================================
// SUPPLIER HELPERS
// ============================================================

/**
 * Resolve a purchase supplier from either a nested object,
 * a supplier name, or the supplied supplier list.
 */
export const getSupplier = (purchase, suppliers = []) => {
  if (purchase?.supplier_name) {
    return {
      name: purchase.supplier_name,
    };
  }

  if (
    purchase?.supplier &&
    typeof purchase.supplier === "object"
  ) {
    return purchase.supplier;
  }

  const supplierId =
    purchase?.supplier_id ??
    purchase?.supplierId ??
    purchase?.supplier;

  return suppliers.find(
    (supplier) =>
      Number(supplier.id) === Number(supplierId)
  );
};

// ============================================================
// BRANCH HELPERS
// ============================================================

/**
 * Resolve a purchase branch from either a nested object,
 * a branch name, or the supplied branch list.
 */
export const getBranch = (purchase, branches = []) => {
  if (purchase?.branch_name) {
    return {
      name: purchase.branch_name,
    };
  }

  if (
    purchase?.branch &&
    typeof purchase.branch === "object"
  ) {
    return purchase.branch;
  }

  const branchId =
    purchase?.branch_id ??
    purchase?.branchId ??
    purchase?.branch;

  return branches.find(
    (branch) =>
      Number(branch.id) === Number(branchId)
  );
};

// ============================================================
// PURCHASE STATUS HELPERS
// ============================================================

/**
 * Return the purchase status, defaulting to draft.
 */
export const getStatus = (purchase) => {
  return purchase?.status || "draft";
};

/**
 * Convert a status code into a user-friendly label.
 */
export const getStatusLabel = (status) => {
  const labels = {
    draft: "Draft",
    ordered: "Ordered",
    received: "Received",
    partially_received: "Partially Received",
    cancelled: "Cancelled",
  };

  return labels[status] || status || "Unknown";
};

/**
 * Return the Bootstrap badge variant for a purchase status.
 */
export const getStatusVariant = (status) => {
  const variants = {
    draft: "secondary",
    ordered: "info",
    received: "success",
    partially_received: "warning",
    cancelled: "danger",
  };

  return variants[status] || "secondary";
};

// ============================================================
// STOCK RECEIVING HELPERS
// ============================================================

/**
 * Determine whether all ordered quantities have been received.
 *
 * Prefer the backend's explicit boolean when available.
 * Otherwise, compare the ordered and received quantities.
 */
export const isFullyReceived = (purchase) => {
  if (purchase?.is_fully_received !== undefined &&
      purchase?.is_fully_received !== null) {
    return (
      purchase.is_fully_received === true ||
      purchase.is_fully_received === 1 ||
      purchase.is_fully_received === "true"
    );
  }

  const ordered = toNumber(
    purchase?.total_ordered_quantity
  );

  const received = toNumber(
    purchase?.total_received_quantity
  );

  return ordered > 0 && received >= ordered;
};

// ============================================================
// PURCHASE PAYLOAD PREPARATION
// ============================================================

/**
 * Prepare the purchase data expected by the Django API.
 *
 * Calculated fields such as subtotal and total are deliberately
 * excluded because the backend is responsible for calculating them.
 */
export const buildPurchasePayload = (data) => {
  const payload = {
    supplier: toNumber(data?.supplier),
    branch: toNumber(data?.branch),

    order_date: data?.order_date || null,

    expected_delivery_date:
      data?.expected_delivery_date || null,

    discount: toNumber(data?.discount),

    shipping_cost: toNumber(data?.shipping_cost),

    status: data?.status || "draft",

    payment_status: data?.payment_status || "unpaid",

    notes: data?.notes || "",

    items: Array.isArray(data?.items)
      ? data.items.map((item) => ({
          product: toNumber(item?.product),
          quantity: toNumber(item?.quantity),
          unit_cost: toNumber(item?.unit_cost),
          discount: toNumber(item?.discount),
          tax: toNumber(item?.tax),
        }))
      : [],
  };

  if (
    data?.company !== null &&
    data?.company !== undefined &&
    data?.company !== ""
  ) {
    payload.company = toNumber(data.company);
  }

  validatePurchase(payload);

  return payload;
};

// ============================================================
// PURCHASE VALIDATION
// ============================================================

/**
 * Validate the prepared payload before sending it to the API.
 * Throws an Error when a required field or numeric value is invalid.
 */
export const validatePurchase = (payload) => {
  if (!Number.isInteger(payload.supplier) || payload.supplier <= 0) {
    throw new Error("Please select a valid supplier.");
  }

  if (!Number.isInteger(payload.branch) || payload.branch <= 0) {
    throw new Error("Please select a valid branch.");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("At least one purchase item is required.");
  }

  if (
    payload.company !== undefined &&
    (!Number.isInteger(payload.company) || payload.company <= 0)
  ) {
    throw new Error("Please select a valid company.");
  }

  if (payload.discount < 0) {
    throw new Error("Purchase discount cannot be negative.");
  }

  if (payload.shipping_cost < 0) {
    throw new Error("Shipping cost cannot be negative.");
  }

  payload.items.forEach((item, index) => {
    const itemLabel = `Purchase item ${index + 1}`;

    if (!Number.isInteger(item.product) || item.product <= 0) {
      throw new Error(`${itemLabel}: Please select a valid product.`);
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error(`${itemLabel}: Quantity must be greater than 0.`);
    }

    if (!Number.isFinite(item.unit_cost) || item.unit_cost < 0) {
      throw new Error(`${itemLabel}: Unit cost cannot be negative.`);
    }

    if (
      !Number.isFinite(item.discount) ||
      item.discount < 0 ||
      item.discount > 100
    ) {
      throw new Error(
        `${itemLabel}: Discount must be between 0 and 100.`
      );
    }

    if (
      !Number.isFinite(item.tax) ||
      item.tax < 0 ||
      item.tax > 100
    ) {
      throw new Error(
        `${itemLabel}: Tax must be between 0 and 100.`
      );
    }
  });
};
