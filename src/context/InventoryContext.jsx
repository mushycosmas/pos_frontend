import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import inventoryApi from "../services/inventoryApi";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
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
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }, []);

  // =========================================================
  // NORMALIZE STOCK RECORD
  // =========================================================

  const normalizeStockRecord = useCallback(
    (record) => {
      if (!record) {
        return null;
      }

      const quantity = toNumber(record.quantity);
      const minQuantity = toNumber(
        record.min_quantity ?? record.minimum_stock ?? record.minimumStock
      );
      const maxQuantity = toNumber(
        record.max_quantity ?? record.maximum_stock ?? record.maximumStock
      );
      const reservedQuantity = toNumber(
        record.reserved_quantity ?? record.reservedQuantity
      );
      const costPrice = toNumber(record.cost_price ?? record.costPrice);
      const sellingPrice = toNumber(record.selling_price ?? record.sellingPrice);

      const productId =
        record.product ??
        record.product_id ??
        record.productId ??
        record.product?.id ??
        null;

      const stockId =
        record.id ?? record.stock_id ?? record.stockId ?? null;

      return {
        // PRODUCT
        id: productId,
        productId,
        name: record.product_name || record.name || record.product?.name || "Unnamed Product",
        sku: record.product_sku || record.sku || record.product?.sku || "",
        barcode: record.product_barcode || record.barcode || record.product?.barcode || "",

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
        categoryId: record.category_id ?? record.category?.id ?? null,
        categoryName: record.category_name || record.category?.name || "",

        // BRANCH
        branchId: record.branch_id ?? record.branch?.id ?? record.branch ?? null,
        branchName: record.branch_name || record.branch?.name || "",

        // PRICES
        costPrice,
        sellingPrice,
        buyingPrice: costPrice,

        // DATES
        lastUpdated: record.last_updated ?? record.lastUpdated ?? null,
        createdAt: record.created_at ?? record.createdAt ?? null,

        // RAW API RECORD
        raw: record,
      };
    },
    [toNumber]
  );

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
  // LOAD INVENTORY
  // =========================================================

  const loadInventory = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await inventoryApi.getAll(params);
        const records = extractResults(response);
        const normalizedProducts = records
          .map(normalizeStockRecord)
          .filter(Boolean);

        console.log("NORMALIZED INVENTORY:", normalizedProducts);

        setProducts(normalizedProducts);

        // BUILD CATEGORIES
        const categoryMap = new Map();
        normalizedProducts.forEach((product) => {
          if (product.categoryId && product.categoryName) {
            categoryMap.set(product.categoryId, {
              id: product.categoryId,
              name: product.categoryName,
            });
          }
        });
        setCategories(Array.from(categoryMap.values()));

        return normalizedProducts;
      } catch (err) {
        console.error("Failed to load inventory:", err);

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
    [extractResults, normalizeStockRecord]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // =========================================================
  // GET STOCK ID BY PRODUCT ID
  // =========================================================

  const getStockIdByProductId = useCallback(
    (productId) => {
      if (!productId) {
        return null;
      }

      const product = products.find(
        (item) => Number(item.productId) === Number(productId)
      );

      if (!product) {
        console.error("No stock record found for product:", productId);
        return null;
      }

      console.log("PRODUCT -> STOCK:", {
        productId: product.productId,
        stockId: product.stockId,
      });

      return product.stockId;
    },
    [products]
  );

  // =========================================================
  // LOAD STOCK MOVEMENTS - DEFINED BEFORE adjustStock
  // =========================================================

  const loadStockMovements = useCallback(
    async (params = {}) => {
      try {
        const response = await inventoryApi.getMovements(params);
        const movements = extractResults(response);
        setStockAdjustments(movements);
        return movements;
      } catch (err) {
        console.error("Failed to load stock movements:", err);
        throw err;
      }
    },
    [extractResults]
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
        const response = await inventoryApi.create(data);
        await loadInventory();
        return response;
      } catch (err) {
        console.error("Failed to create stock:", err);
        throw err;
      }
    },
    [loadInventory]
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
  // PATCH STOCK - Uses the /adjust/ endpoint
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

      if (!payload.reason) {
        throw new Error("Adjustment reason is required.");
      }

      console.log("PATCH STOCK:", {
        stockId,
        url: `/api/v1/inventory/stocks/${stockId}/adjust/`,
        payload,
      });

      try {
        const response = await inventoryApi.adjustStock(stockId, payload);
        await loadInventory();
        await loadStockMovements();
        return response;
      } catch (err) {
        console.error("Failed to patch stock:", err);
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
  // ADJUST STOCK - Main entry point for stock adjustments
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

      // VALIDATION
      if (qty <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }

      if (!type) {
        throw new Error("Adjustment type is required.");
      }

      const validTypes = ["ADD", "REMOVE"];
      const normalizedType = type.toUpperCase();
      if (!validTypes.includes(normalizedType)) {
        throw new Error(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
      }

      if (!reason?.trim()) {
        throw new Error("Adjustment reason is required.");
      }

      // Determine actual stock ID
      let actualStockId = stockId;

      if (!actualStockId && productId) {
        actualStockId = getStockIdByProductId(productId);
      }

      if (!actualStockId) {
        throw new Error(
          `No stock record found for product ID ${productId}.`
        );
      }

      // Build payload
      const payload = {
        quantity: qty,
        type: normalizedType,
        reason: reason.trim(),
        reference: reference?.trim() || "",
        notes: notes || reason.trim(),
      };

      console.log("ADJUST STOCK:", {
        productId,
        stockId: actualStockId,
        payload,
      });

      try {
        // Call the adjust endpoint
        const response = await inventoryApi.adjustStock(actualStockId, payload);

        // Refresh data
        await loadInventory();
        await loadStockMovements();

        return response;
      } catch (err) {
        console.error("Stock adjustment failed:", err);
        throw err;
      }
    },
    [getStockIdByProductId, loadInventory, loadStockMovements, toNumber]
  );

  // =========================================================
  // LOW STOCK
  // =========================================================

  const loadLowStock = useCallback(
    async () => {
      try {
        const response = await inventoryApi.getLowStock();
        const records = extractResults(response);
        return records.map(normalizeStockRecord).filter(Boolean);
      } catch (err) {
        console.error("Failed to load low stock:", err);
        throw err;
      }
    },
    [extractResults, normalizeStockRecord]
  );

  // =========================================================
  // OUT OF STOCK
  // =========================================================

  const loadOutOfStock = useCallback(
    async () => {
      try {
        const response = await inventoryApi.getOutOfStock();
        const records = extractResults(response);
        return records.map(normalizeStockRecord).filter(Boolean);
      } catch (err) {
        console.error("Failed to load out of stock:", err);
        throw err;
      }
    },
    [extractResults, normalizeStockRecord]
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
    (productId) => {
      return products.find(
        (product) => Number(product.productId) === Number(productId)
      );
    },
    [products]
  );

  // =========================================================
  // REFRESH INVENTORY
  // =========================================================

  const refreshInventory = useCallback(
    async (params = {}) => {
      return loadInventory(params);
    },
    [loadInventory]
  );

  // =========================================================
  // COMPUTED VALUES
  // =========================================================

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = toNumber(product.stock);
      const minimumStock = toNumber(product.minimumStock ?? product.minStock);
      return stock > 0 && stock <= minimumStock;
    });
  }, [products, toNumber]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((product) => toNumber(product.stock) <= 0);
  }, [products, toNumber]);

  const totalProducts = products.length;

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) => total + toNumber(product.stock),
      0
    );
  }, [products, toNumber]);

  const inventoryValue = useMemo(() => {
    return products.reduce((total, product) => {
      const stock = toNumber(product.stock);
      const costPrice = toNumber(product.costPrice);
      return total + stock * costPrice;
    }, 0);
  }, [products, toNumber]);

  const potentialSalesValue = useMemo(() => {
    return products.reduce((total, product) => {
      const stock = toNumber(product.stock);
      const sellingPrice = toNumber(product.sellingPrice);
      return total + stock * sellingPrice;
    }, 0);
  }, [products, toNumber]);

  const lowAndOutOfStock = lowStockProducts.length + outOfStockProducts.length;

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = useMemo(
    () => ({
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

      // STOCK ID
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