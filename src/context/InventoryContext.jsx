import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import inventoryApi from "../services/inventoryApi";
import { useBranch } from "./BranchContext";

const InventoryContext = createContext(null);

/* =========================================================
   GENERAL HELPERS
========================================================= */

const toText = (value) =>
  value === null || value === undefined
    ? ""
    : String(value).trim();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const getRelationId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (isObject(value)) {
      const id = value.id ?? value.pk;

      if (id !== null && id !== undefined && id !== "") {
        return id;
      }

      continue;
    }

    return value;
  }

  return null;
};

const getRelationName = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (isObject(value)) {
      const name =
        value.name ??
        value.brand_name ??
        value.category_name ??
        value.display_name ??
        value.label ??
        value.title;

      if (name !== null && name !== undefined && toText(name)) {
        return toText(name);
      }

      continue;
    }

    // A plain numeric ID is not a display name.
    if (typeof value === "number") {
      continue;
    }

    const text = toText(value);

    if (text && !/^\d+$/.test(text)) {
      return text;
    }
  }

  return "";
};

const extractResults = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.results)) {
    return response.data.results;
  }

  if (Array.isArray(response?.stocks)) {
    return response.stocks;
  }

  if (Array.isArray(response?.inventory)) {
    return response.inventory;
  }

  return [];
};

/* =========================================================
   INVENTORY PROVIDER
========================================================= */

export const InventoryProvider = ({ children }) => {
  /* -------------------------------------------------------
     CURRENT BRANCH
  ------------------------------------------------------- */

  const branchContext = useBranch();

  const currentBranch =
    branchContext?.currentBranch ??
    branchContext?.selectedBranch ??
    branchContext?.activeBranch ??
    branchContext?.branch ??
    null;

  const currentBranchId =
    currentBranch?.id ??
    currentBranch?.branch_id ??
    currentBranch?.branchId ??
    null;

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =======================================================
     NORMALIZE STOCK RECORD

     The API may return:
     1. A stock record with product details nested in product.
     2. A stock record with product_name, brand_id, etc.
     3. A product relation containing only its numeric ID.

     Keep normalized fields consistent for POS and inventory.
  ======================================================= */

  const normalizeStockRecord = useCallback((record) => {
    if (!record || !isObject(record)) {
      return null;
    }

    const nestedProduct = isObject(record.product)
      ? record.product
      : isObject(record.product_detail)
        ? record.product_detail
        : null;

    const rawProduct = nestedProduct ?? {};

    /* PRODUCT ID */

    const productId =
      rawProduct.id ??
      rawProduct.pk ??
      record.product_id ??
      record.productId ??
      (typeof record.product === "number" ||
      typeof record.product === "string"
        ? record.product
        : null);

    const stockId =
      record.id ??
      record.stock_id ??
      record.stockId ??
      record.inventory_id ??
      null;

    /* BRAND RELATION */

    const brandId = getRelationId(
      record.brand_id,
      record.brandId,
      record.brand,
      record.brand_detail,
      rawProduct.brand_id,
      rawProduct.brandId,
      rawProduct.brand,
      rawProduct.brand_detail
    );

    const brandName = getRelationName(
      record.brand_name,
      record.brandName,
      record.brand_detail,
      record.brand,
      rawProduct.brand_name,
      rawProduct.brandName,
      rawProduct.brand_detail,
      rawProduct.brand
    );

    /* CATEGORY RELATION */

    const categoryId = getRelationId(
      record.category_id,
      record.categoryId,
      record.category,
      record.category_detail,
      rawProduct.category_id,
      rawProduct.categoryId,
      rawProduct.category,
      rawProduct.category_detail
    );

    const categoryName = getRelationName(
      record.category_name,
      record.categoryName,
      record.category_detail,
      record.category,
      rawProduct.category_name,
      rawProduct.categoryName,
      rawProduct.category_detail,
      rawProduct.category
    );

    /* BRANCH RELATION */

    const branchId =
      record.branch_id ??
      record.branchId ??
      (isObject(record.branch)
        ? record.branch.id ?? record.branch.pk
        : record.branch) ??
      rawProduct.branch_id ??
      null;

    const branchName =
      getRelationName(
        record.branch_name,
        record.branchName,
        record.branch,
        rawProduct.branch_name,
        rawProduct.branch
      );

    /* QUANTITIES */

    const quantity = toNumber(
      record.quantity ??
        record.current_stock ??
        record.currentStock ??
        record.stock ??
        record.stock_quantity ??
        record.available_quantity
    );

    const minQuantity = toNumber(
      record.min_quantity ??
        record.minimum_stock ??
        record.minimumStock ??
        record.min_stock ??
        record.minStock ??
        rawProduct.min_quantity ??
        rawProduct.minimum_stock
    );

    const maxQuantity = toNumber(
      record.max_quantity ??
        record.maximum_stock ??
        record.maximumStock ??
        record.max_stock ??
        rawProduct.max_quantity
    );

    const reservedQuantity = toNumber(
      record.reserved_quantity ??
        record.reservedQuantity
    );

    /* PRICES */

    const costPrice = toNumber(
      record.cost_price ??
        record.costPrice ??
        record.buying_price ??
        record.buyingPrice ??
        rawProduct.cost_price ??
        rawProduct.costPrice ??
        rawProduct.buying_price
    );

    const sellingPrice = toNumber(
      record.selling_price ??
        record.sellingPrice ??
        record.sale_price ??
        record.price ??
        rawProduct.selling_price ??
        rawProduct.sellingPrice ??
        rawProduct.sale_price ??
        rawProduct.price
    );

    /* PRODUCT DETAILS */

    const name =
      toText(
        record.product_name ??
          record.name ??
          record.productName ??
          rawProduct.name ??
          rawProduct.product_name ??
          rawProduct.title
      ) || "Unnamed Product";

    const sku = toText(
      record.product_sku ??
        record.sku ??
        record.productSku ??
        rawProduct.sku ??
        rawProduct.product_sku ??
        rawProduct.code ??
        rawProduct.product_code
    );

    const barcode = toText(
      record.product_barcode ??
        record.barcode ??
        record.barcode_number ??
        rawProduct.barcode ??
        rawProduct.barcode_number ??
        rawProduct.bar_code
    );

    /* RETURN NORMALIZED PRODUCT */

    return {
      // Product identity
      id: productId,
      productId,
      name,
      product_name: name,
      title: name,
      sku,
      product_sku: sku,
      barcode,

      // Brand — important for POS filtering
      brandId,
      brand_id: brandId,
      brandName,
      brand_name: brandName,

      // Keep normalized relations available to components.
      brand: brandId,
      brand_detail: brandName
        ? { id: brandId, name: brandName }
        : null,

      // Category — important for POS filtering
      categoryId,
      category_id: categoryId,
      categoryName,
      category_name: categoryName,

      category: categoryId,
      category_detail: categoryName
        ? { id: categoryId, name: categoryName }
        : null,

      // Stock identity and quantity
      stockId,
      stock_id: stockId,
      stock: quantity,
      currentStock: quantity,
      current_stock: quantity,
      quantity,
      reservedQuantity,
      reserved_quantity: reservedQuantity,

      // Stock thresholds
      minStock: minQuantity,
      minQuantity,
      minimumStock: minQuantity,
      min_quantity: minQuantity,
      maxStock: maxQuantity,
      maxQuantity,
      max_quantity: maxQuantity,

      // Branch
      branchId,
      branch_id: branchId,
      branchName,

      // Prices
      costPrice,
      cost_price: costPrice,
      buyingPrice: costPrice,
      sellingPrice,
      selling_price: sellingPrice,

      // Dates
      lastUpdated:
        record.last_updated ??
        record.lastUpdated ??
        null,

      createdAt:
        record.created_at ??
        record.createdAt ??
        null,

      // Preserve original backend data
      raw: record,
      rawProduct,
    };
  }, []);

  /* =======================================================
     LOAD INVENTORY FOR CURRENT BRANCH

     IMPORTANT:
     loadInventory accepts query params, not a branch ID.
     The branch ID is supplied as the second API argument.
  ======================================================= */

  const loadInventory = useCallback(
    async (params = {}) => {
      if (
        currentBranchId === null ||
        currentBranchId === undefined ||
        currentBranchId === ""
      ) {
        setProducts([]);
        setCategories([]);
        setStockAdjustments([]);
        setError(null);
        setLoading(false);

        return [];
      }

      // Protect against older calls such as loadInventory(branchId).
      const queryParams = isObject(params) ? params : {};

      setLoading(true);
      setError(null);

      try {
        const response = await inventoryApi.getAll(
          queryParams,
          currentBranchId
        );

        const records = extractResults(response);

        const normalizedProducts = records
          .map(normalizeStockRecord)
          .filter(Boolean);

        setProducts(normalizedProducts);

        // Build categories from the selected branch inventory.
        const categoryMap = new Map();

        normalizedProducts.forEach((product) => {
          if (
            product.categoryId !== null &&
            product.categoryId !== undefined &&
            product.categoryName
          ) {
            categoryMap.set(String(product.categoryId), {
              id: product.categoryId,
              name: product.categoryName,
            });
          }
        });

        setCategories([...categoryMap.values()]);

        console.log("Inventory branch:", currentBranchId);
        console.log("Inventory records:", records.length);
        console.log(
          "Normalized products:",
          normalizedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            brandId: product.brandId,
            brandName: product.brandName,
            categoryId: product.categoryId,
            categoryName: product.categoryName,
            sku: product.sku,
            barcode: product.barcode,
          }))
        );

        return normalizedProducts;
      } catch (err) {
        console.error("Failed to load inventory:", err);
        console.error(
          "Inventory API error:",
          err?.response?.data
        );

        const message =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.response?.data?.error ??
          err?.message ??
          "Failed to load inventory.";

        setError(message);
        setProducts([]);
        setCategories([]);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBranchId, normalizeStockRecord]
  );

  /* =======================================================
     RELOAD WHEN BRANCH CHANGES
  ======================================================= */

  useEffect(() => {
    loadInventory().catch(() => {});
  }, [loadInventory]);

  /* =======================================================
     GET STOCK ID BY PRODUCT ID
  ======================================================= */

  const getStockIdByProductId = useCallback(
    (productId) => {
      if (
        productId === null ||
        productId === undefined
      ) {
        return null;
      }

      const product = products.find(
        (item) =>
          String(item.productId) === String(productId)
      );

      if (!product) {
        console.error(
          "No stock record found for product:",
          productId,
          "in branch:",
          currentBranchId
        );

        return null;
      }

      return product.stockId;
    },
    [products, currentBranchId]
  );

  /* =======================================================
     LOAD STOCK MOVEMENTS
  ======================================================= */

  const loadStockMovements = useCallback(
    async (params = {}) => {
      if (
        currentBranchId === null ||
        currentBranchId === undefined ||
        currentBranchId === ""
      ) {
        setStockAdjustments([]);
        return [];
      }

      try {
        const queryParams = isObject(params) ? params : {};

        const response = await inventoryApi.getMovements(
          queryParams,
          currentBranchId
        );

        const movements = extractResults(response);

        setStockAdjustments(movements);

        return movements;
      } catch (err) {
        console.error("Failed to load stock movements:", err);
        throw err;
      }
    },
    [currentBranchId]
  );

  /* =======================================================
     GET STOCK BY STOCK ID
  ======================================================= */

  const getStock = useCallback(
    async (stockId) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      try {
        const response = await inventoryApi.getById(stockId);

        const record =
          response?.data ?? response;

        return normalizeStockRecord(record);
      } catch (err) {
        console.error("Failed to get stock:", err);
        throw err;
      }
    },
    [normalizeStockRecord]
  );

  /* =======================================================
     CREATE STOCK
  ======================================================= */

  const createStock = useCallback(
    async (data) => {
      if (!currentBranchId) {
        throw new Error("Please select a branch first.");
      }

      try {
        const payload = {
          ...data,
          branch: currentBranchId,
        };

        const response = await inventoryApi.create(payload);

        await loadInventory();

        return response;
      } catch (err) {
        console.error("Failed to create stock:", err);
        throw err;
      }
    },
    [currentBranchId, loadInventory]
  );

  /* =======================================================
     UPDATE STOCK
  ======================================================= */

  const updateStock = useCallback(
    async (stockId, data) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      try {
        const response = await inventoryApi.update(
          stockId,
          data
        );

        await loadInventory();

        return response;
      } catch (err) {
        console.error("Failed to update stock:", err);
        throw err;
      }
    },
    [loadInventory]
  );

  /* =======================================================
     PATCH / ADJUST STOCK
  ======================================================= */

  const patchStock = useCallback(
    async (stockId, data) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      const quantity = toNumber(data?.quantity);
      const type = toText(data?.type).toUpperCase();
      const reason = toText(data?.reason);

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (!type) {
        throw new Error("Adjustment type is required.");
      }

      if (!reason) {
        throw new Error("Adjustment reason is required.");
      }

      const payload = {
        quantity,
        type,
        reason,
        reference: toText(data?.reference),
        notes: toText(data?.notes) || reason,
      };

      try {
        const response = await inventoryApi.adjustStock(
          stockId,
          payload
        );

        await loadInventory();
        await loadStockMovements();

        return response;
      } catch (err) {
        console.error("Failed to adjust stock:", err);
        throw err;
      }
    },
    [loadInventory, loadStockMovements]
  );

  /* =======================================================
     DELETE STOCK
  ======================================================= */

  const deleteStock = useCallback(
    async (stockId) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      try {
        const response = await inventoryApi.delete(stockId);

        await loadInventory();

        return response;
      } catch (err) {
        console.error("Failed to delete stock:", err);
        throw err;
      }
    },
    [loadInventory]
  );

  /* =======================================================
     DELETE STOCK ADJUSTMENT
  ======================================================= */

  const deleteStockAdjustment = useCallback(
    async (id) => {
      if (!id) {
        throw new Error("Stock movement ID is required.");
      }

      try {
        const response = await inventoryApi.deleteMovement(id);

        await loadStockMovements();
        await loadInventory();

        return response;
      } catch (err) {
        console.error(
          "Failed to delete stock adjustment:",
          err
        );

        throw err;
      }
    },
    [loadStockMovements, loadInventory]
  );

  /* =======================================================
     INCREASE STOCK
  ======================================================= */

  const increaseStock = useCallback(
    async (
      stockId,
      quantity,
      reason = "",
      reference = ""
    ) => {
      const qty = toNumber(quantity);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      return patchStock(stockId, {
        quantity: qty,
        type: "ADD",
        reason,
        reference,
      });
    },
    [patchStock]
  );

  /* =======================================================
     DECREASE STOCK
  ======================================================= */

  const decreaseStock = useCallback(
    async (
      stockId,
      quantity,
      reason = "",
      reference = ""
    ) => {
      const qty = toNumber(quantity);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      return patchStock(stockId, {
        quantity: qty,
        type: "REMOVE",
        reason,
        reference,
      });
    },
    [patchStock]
  );

  /* =======================================================
     ADJUST STOCK BY STOCK ID OR PRODUCT ID
  ======================================================= */

  const adjustStock = useCallback(
    async ({
      stockId,
      productId,
      quantity,
      type,
      reason = "",
      reference = "",
      notes = "",
    }) => {
      const qty = toNumber(quantity);
      const normalizedType = toText(type).toUpperCase();
      const normalizedReason = toText(reason);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (!["ADD", "REMOVE"].includes(normalizedType)) {
        throw new Error("Adjustment type must be ADD or REMOVE.");
      }

      if (!normalizedReason) {
        throw new Error("Adjustment reason is required.");
      }

      const actualStockId =
        stockId || getStockIdByProductId(productId);

      if (!actualStockId) {
        throw new Error(
          `No stock record found for product ID ${productId} in the selected branch.`
        );
      }

      return patchStock(actualStockId, {
        quantity: qty,
        type: normalizedType,
        reason: normalizedReason,
        reference,
        notes: toText(notes) || normalizedReason,
      });
    },
    [getStockIdByProductId, patchStock]
  );

  /* =======================================================
     LOW STOCK
  ======================================================= */

  const loadLowStock = useCallback(async () => {
    if (!currentBranchId) {
      return [];
    }

    try {
      const response = await inventoryApi.getLowStock(
        currentBranchId
      );

      return extractResults(response)
        .map(normalizeStockRecord)
        .filter(Boolean);
    } catch (err) {
      console.error("Failed to load low stock:", err);
      throw err;
    }
  }, [currentBranchId, normalizeStockRecord]);

  /* =======================================================
     OUT OF STOCK
  ======================================================= */

  const loadOutOfStock = useCallback(async () => {
    if (!currentBranchId) {
      return [];
    }

    try {
      const response = await inventoryApi.getOutOfStock(
        currentBranchId
      );

      return extractResults(response)
        .map(normalizeStockRecord)
        .filter(Boolean);
    } catch (err) {
      console.error("Failed to load out of stock:", err);
      throw err;
    }
  }, [currentBranchId, normalizeStockRecord]);

  /* =======================================================
     SEARCH PRODUCTS
  ======================================================= */

  const searchProducts = useCallback(
    (searchTerm = "") => {
      const term = normalizeSearchTerm(searchTerm);

      if (!term) {
        return products;
      }

      return products.filter((product) => {
        const name = toText(product.name).toLowerCase();
        const sku = toText(product.sku).toLowerCase();
        const barcode = toText(product.barcode).toLowerCase();
        const brand = toText(product.brandName).toLowerCase();
        const category = toText(product.categoryName).toLowerCase();

        return (
          name.includes(term) ||
          sku.includes(term) ||
          barcode.includes(term) ||
          brand.includes(term) ||
          category.includes(term)
        );
      });
    },
    [products]
  );

  /* =======================================================
     GET PRODUCT BY PRODUCT ID
  ======================================================= */

  const getProduct = useCallback(
    (productId) =>
      products.find(
        (product) =>
          String(product.productId) === String(productId)
      ) ?? null,
    [products]
  );

  /* =======================================================
     REFRESH INVENTORY
  ======================================================= */

  const refreshInventory = useCallback(
    async (params = {}) => loadInventory(params),
    [loadInventory]
  );

  /* =======================================================
     COMPUTED INVENTORY STATISTICS
  ======================================================= */

  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => {
        const stock = toNumber(product.stock);
        const minimumStock = toNumber(
          product.minimumStock ?? product.minStock
        );

        return stock > 0 && stock <= minimumStock;
      }),
    [products]
  );

  const outOfStockProducts = useMemo(
    () =>
      products.filter(
        (product) => toNumber(product.stock) <= 0
      ),
    [products]
  );

  const totalProducts = products.length;

  const totalStock = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total + toNumber(product.stock),
        0
      ),
    [products]
  );

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          toNumber(product.stock) *
            toNumber(product.costPrice),
        0
      ),
    [products]
  );

  const potentialSalesValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          toNumber(product.stock) *
            toNumber(product.sellingPrice),
        0
      ),
    [products]
  );

  const lowAndOutOfStock =
    lowStockProducts.length + outOfStockProducts.length;

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      // Branch
      currentBranch,
      currentBranchId,

      // Data
      products,
      categories,
      stockAdjustments,

      // Loading and errors
      loading,
      error,

      // Inventory operations
      loadInventory,
      refreshInventory,
      getStock,
      createStock,
      updateStock,
      patchStock,
      deleteStock,
      getStockIdByProductId,

      // Stock adjustments
      increaseStock,
      decreaseStock,
      adjustStock,

      // Stock movements
      loadStockMovements,
      deleteStockAdjustment,

      // Inventory queries
      loadLowStock,
      loadOutOfStock,

      // Product helpers
      getProduct,
      searchProducts,

      // Statistics
      totalProducts,
      totalStock,
      inventoryValue,
      potentialSalesValue,
      lowStockProducts,
      outOfStockProducts,
      lowAndOutOfStock,
    }),
    [
      currentBranch,
      currentBranchId,
      products,
      categories,
      stockAdjustments,
      loading,
      error,
      loadInventory,
      refreshInventory,
      getStock,
      createStock,
      updateStock,
      patchStock,
      deleteStock,
      getStockIdByProductId,
      increaseStock,
      decreaseStock,
      adjustStock,
      loadStockMovements,
      deleteStockAdjustment,
      loadLowStock,
      loadOutOfStock,
      getProduct,
      searchProducts,
      totalProducts,
      totalStock,
      inventoryValue,
      potentialSalesValue,
      lowStockProducts,
      outOfStockProducts,
      lowAndOutOfStock,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

/* =========================================================
   SEARCH HELPER
========================================================= */

const normalizeSearchTerm = (value) =>
  toText(value).toLowerCase();

/* =========================================================
   CUSTOM HOOK
========================================================= */

export const useInventory = () => {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error(
      "useInventory must be used inside InventoryProvider"
    );
  }

  return context;
};

export default InventoryContext;
