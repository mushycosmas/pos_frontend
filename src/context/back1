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

export const InventoryProvider = ({ children }) => {
  // =========================================================
  // CURRENT BRANCH
  // =========================================================

  const { currentBranch } = useBranch();

  const currentBranchId = currentBranch?.id ?? null;

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockAdjustments, setStockAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================================================
  // SAFE NUMBER
  // =========================================================

  const toNumber = useCallback((value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }, []);

  // =========================================================
  // EXTRACT API RESULTS
  // =========================================================

  const extractResults = useCallback((response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }, []);

  // =========================================================
  // NORMALIZE STOCK RECORD
  // =========================================================

  const normalizeStockRecord = useCallback(
    (record) => {
      if (!record) {
        return null;
      }

      const nestedProduct =
        record.product && typeof record.product === "object"
          ? record.product
          : null;

      const productId =
        nestedProduct?.id ??
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
        null;

      const quantity = toNumber(
        record.quantity ??
          record.current_stock ??
          record.currentStock ??
          record.stock
      );

      const minQuantity = toNumber(
        record.min_quantity ??
          record.minimum_stock ??
          record.minimumStock ??
          record.min_stock ??
          record.minStock
      );

      const maxQuantity = toNumber(
        record.max_quantity ??
          record.maximum_stock ??
          record.maximumStock
      );

      const reservedQuantity = toNumber(
        record.reserved_quantity ??
          record.reservedQuantity
      );

      const costPrice = toNumber(
        record.cost_price ??
          record.costPrice ??
          nestedProduct?.cost_price ??
          nestedProduct?.costPrice
      );

      const sellingPrice = toNumber(
        record.selling_price ??
          record.sellingPrice ??
          nestedProduct?.selling_price ??
          nestedProduct?.sellingPrice
      );

      const category =
        record.category && typeof record.category === "object"
          ? record.category
          : null;

      const branch =
        record.branch && typeof record.branch === "object"
          ? record.branch
          : null;

      return {
        // PRODUCT
        id: productId,
        productId,
        name:
          record.product_name ??
          nestedProduct?.name ??
          record.name ??
          "Unnamed Product",
        sku:
          record.product_sku ??
          nestedProduct?.sku ??
          record.sku ??
          "",
        barcode:
          record.product_barcode ??
          nestedProduct?.barcode ??
          record.barcode ??
          "",

        // STOCK
        stockId,
        stock: quantity,
        currentStock: quantity,
        quantity,
        reservedQuantity,
        minStock: minQuantity,
        minimumStock: minQuantity,
        minQuantity,
        maxStock: maxQuantity,
        maxQuantity,

        // CATEGORY
        categoryId:
          record.category_id ??
          category?.id ??
          nestedProduct?.category_id ??
          nestedProduct?.category?.id ??
          null,
        categoryName:
          record.category_name ??
          category?.name ??
          nestedProduct?.category_name ??
          nestedProduct?.category?.name ??
          "",

        // BRANCH
        branchId:
          record.branch_id ??
          branch?.id ??
          (typeof record.branch === "number" ||
          typeof record.branch === "string"
            ? record.branch
            : null),
        branchName:
          record.branch_name ??
          branch?.name ??
          "",

        // PRICES
        costPrice,
        sellingPrice,
        buyingPrice: costPrice,

        // DATES
        lastUpdated:
          record.last_updated ??
          record.lastUpdated ??
          null,
        createdAt:
          record.created_at ??
          record.createdAt ??
          null,

        // RAW API RECORD
        raw: record,
      };
    },
    [toNumber]
  );

  // =========================================================
  // LOAD INVENTORY FOR SELECTED BRANCH
  // =========================================================

  const loadInventory = useCallback(
    async (params = {}) => {
      if (currentBranchId === null || currentBranchId === "") {
        setProducts([]);
        setCategories([]);
        setError(null);
        setLoading(false);

        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const response = await inventoryApi.getAll(
          params,
          currentBranchId
        );

        const records = extractResults(response);

        const normalizedProducts = records
          .map(normalizeStockRecord)
          .filter(Boolean);

        console.log("Selected branch ID:", currentBranchId);
        console.log("Inventory API response:", response);
        console.log("Normalized inventory:", normalizedProducts);

        setProducts(normalizedProducts);

        // BUILD CATEGORIES FROM SELECTED BRANCH INVENTORY
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

        setCategories(Array.from(categoryMap.values()));

        return normalizedProducts;
      } catch (err) {
        console.error("Failed to load inventory:", err);
        console.error("Inventory API error:", err?.response?.data);

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load inventory.";

        setError(message);
        setProducts([]);
        setCategories([]);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      currentBranchId,
      extractResults,
      normalizeStockRecord,
    ]
  );

  // =========================================================
  // RELOAD WHEN SELECTED BRANCH CHANGES
  // =========================================================

  useEffect(() => {
    loadInventory().catch(() => {});
  }, [loadInventory]);

  // =========================================================
  // GET STOCK ID BY PRODUCT ID
  // =========================================================

  const getStockIdByProductId = useCallback(
    (productId) => {
      if (productId === null || productId === undefined) {
        return null;
      }

      const product = products.find(
        (item) => Number(item.productId) === Number(productId)
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

  // =========================================================
  // LOAD STOCK MOVEMENTS FOR SELECTED BRANCH
  // =========================================================

  const loadStockMovements = useCallback(
    async (params = {}) => {
      if (currentBranchId === null || currentBranchId === "") {
        setStockAdjustments([]);
        return [];
      }

      try {
        const response = await inventoryApi.getMovements(
          params,
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
    [currentBranchId, extractResults]
  );

  // =========================================================
  // GET STOCK BY STOCK ID
  // =========================================================

  const getStock = useCallback(
    async (stockId) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      try {
        const response = await inventoryApi.getById(stockId);
        return normalizeStockRecord(response);
      } catch (err) {
        console.error("Failed to get stock:", err);
        throw err;
      }
    },
    [normalizeStockRecord]
  );

  // =========================================================
  // CREATE STOCK
  // =========================================================

  const createStock = useCallback(
    async (data) => {
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

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  const updateStock = useCallback(
    async (stockId, data) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      try {
        const response = await inventoryApi.update(stockId, data);

        await loadInventory();

        return response;
      } catch (err) {
        console.error("Failed to update stock:", err);
        throw err;
      }
    },
    [loadInventory]
  );

  // =========================================================
  // PATCH STOCK
  // =========================================================

  const patchStock = useCallback(
    async (stockId, data) => {
      if (!stockId) {
        throw new Error("Stock ID is required.");
      }

      const payload = {
        quantity: toNumber(data?.quantity),
        type: data?.type,
        reason: data?.reason || "",
        reference: data?.reference || "",
        notes: data?.notes || data?.reason || "",
      };

      if (payload.quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (!payload.type) {
        throw new Error("Adjustment type is required.");
      }

      if (!payload.reason.trim()) {
        throw new Error("Adjustment reason is required.");
      }

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
    [loadInventory, loadStockMovements, toNumber]
  );

  // =========================================================
  // DELETE STOCK
  // =========================================================

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

  // =========================================================
  // DELETE STOCK ADJUSTMENT
  // =========================================================

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
        console.error("Failed to delete stock adjustment:", err);
        throw err;
      }
    },
    [loadStockMovements, loadInventory]
  );

  // =========================================================
  // INCREASE STOCK
  // =========================================================

  const increaseStock = useCallback(
    async (stockId, quantity, reason = "", reference = "") => {
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
    [patchStock, toNumber]
  );

  // =========================================================
  // DECREASE STOCK
  // =========================================================

  const decreaseStock = useCallback(
    async (stockId, quantity, reason = "", reference = "") => {
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
    [patchStock, toNumber]
  );

  // =========================================================
  // ADJUST STOCK
  // =========================================================

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

      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (!type) {
        throw new Error("Adjustment type is required.");
      }

      const normalizedType = String(type).toUpperCase();
      const validTypes = ["ADD", "REMOVE"];

      if (!validTypes.includes(normalizedType)) {
        throw new Error(
          `Invalid type. Must be one of: ${validTypes.join(", ")}`
        );
      }

      if (!reason?.trim()) {
        throw new Error("Adjustment reason is required.");
      }

      const actualStockId =
        stockId || getStockIdByProductId(productId);

      if (!actualStockId) {
        throw new Error(
          `No stock record found for product ID ${productId} in the selected branch.`
        );
      }

      const payload = {
        quantity: qty,
        type: normalizedType,
        reason: reason.trim(),
        reference: reference?.trim() || "",
        notes: notes?.trim() || reason.trim(),
      };

      try {
        const response = await inventoryApi.adjustStock(
          actualStockId,
          payload
        );

        await loadInventory();
        await loadStockMovements();

        return response;
      } catch (err) {
        console.error("Stock adjustment failed:", err);
        throw err;
      }
    },
    [
      getStockIdByProductId,
      loadInventory,
      loadStockMovements,
      toNumber,
    ]
  );

  // =========================================================
  // LOW STOCK FOR SELECTED BRANCH
  // =========================================================

  const loadLowStock = useCallback(
    async () => {
      if (currentBranchId === null || currentBranchId === "") {
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
    },
    [currentBranchId, extractResults, normalizeStockRecord]
  );

  // =========================================================
  // OUT OF STOCK FOR SELECTED BRANCH
  // =========================================================

  const loadOutOfStock = useCallback(
    async () => {
      if (currentBranchId === null || currentBranchId === "") {
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
    },
    [currentBranchId, extractResults, normalizeStockRecord]
  );

  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

  const searchProducts = useCallback(
    (searchTerm = "") => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) {
        return products;
      }

      return products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const sku = product.sku?.toLowerCase() || "";
        const barcode = product.barcode?.toLowerCase() || "";
        const category = product.categoryName?.toLowerCase() || "";

        return (
          name.includes(term) ||
          sku.includes(term) ||
          barcode.includes(term) ||
          category.includes(term)
        );
      });
    },
    [products]
  );

  // =========================================================
  // GET PRODUCT
  // =========================================================

  const getProduct = useCallback(
    (productId) =>
      products.find(
        (product) => Number(product.productId) === Number(productId)
      ),
    [products]
  );

  // =========================================================
  // REFRESH INVENTORY
  // =========================================================

  const refreshInventory = useCallback(
    async (params = {}) => loadInventory(params),
    [loadInventory]
  );

  // =========================================================
  // COMPUTED VALUES
  // =========================================================

  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => {
        const stock = toNumber(product.stock);
        const minimumStock = toNumber(
          product.minimumStock ?? product.minStock
        );

        return stock > 0 && stock <= minimumStock;
      }),
    [products, toNumber]
  );

  const outOfStockProducts = useMemo(
    () =>
      products.filter(
        (product) => toNumber(product.stock) <= 0
      ),
    [products, toNumber]
  );

  const totalProducts = products.length;

  const totalStock = useMemo(
    () =>
      products.reduce(
        (total, product) => total + toNumber(product.stock),
        0
      ),
    [products, toNumber]
  );

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          toNumber(product.stock) * toNumber(product.costPrice),
        0
      ),
    [products, toNumber]
  );

  const potentialSalesValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          toNumber(product.stock) * toNumber(product.sellingPrice),
        0
      ),
    [products, toNumber]
  );

  const lowAndOutOfStock =
    lowStockProducts.length + outOfStockProducts.length;

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = useMemo(
    () => ({
      // BRANCH
      currentBranch,
      currentBranchId,

      // DATA
      products,
      categories,
      stockAdjustments,

      // LOADING / ERROR
      loading,
      error,

      // INVENTORY
      loadInventory,
      refreshInventory,

      // STOCK
      getStock,
      createStock,
      updateStock,
      patchStock,
      deleteStock,
      getStockIdByProductId,

      // ADJUSTMENTS
      increaseStock,
      decreaseStock,
      adjustStock,

      // MOVEMENTS
      loadStockMovements,
      deleteStockAdjustment,

      // QUERIES
      loadLowStock,
      loadOutOfStock,

      // HELPERS
      getProduct,
      searchProducts,

      // STATISTICS
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

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// =============================================================
// CUSTOM HOOK
// =============================================================

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
