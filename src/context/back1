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

  const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // =========================================================
  // NORMALIZE STOCK RECORD
  //
  // This allows the frontend to work whether your API returns:
  //
  // product.current_stock
  // product.stock
  // current_stock
  //
  // and snake_case/camelCase variations.
  // =========================================================

  const normalizeStockRecord = useCallback((record) => {
  if (!record) {
    return null;
  }

  const quantity = toNumber(record.quantity);
  const minQuantity = toNumber(record.min_quantity);
  const maxQuantity = toNumber(record.max_quantity);
  const reservedQuantity = toNumber(record.reserved_quantity);

  const costPrice = toNumber(record.cost_price);
  const sellingPrice = toNumber(record.selling_price);

  return {
    // =====================================================
    // STOCK
    // =====================================================

    stockId: record.id,
    id: record.product,
    productId: record.product,

    // =====================================================
    // PRODUCT
    // =====================================================

    name: record.product_name || "Unnamed Product",

    sku: record.product_sku || "",

    // =====================================================
    // CATEGORY
    // =====================================================

    categoryId: record.category_id,
    categoryName: record.category_name || "",

    // =====================================================
    // BRANCH
    // =====================================================

    branchId: record.branch,
    branchName: record.branch_name || "",

    // =====================================================
    // STOCK
    // =====================================================

    stock: quantity,

    currentStock: quantity,

    quantity,

    reservedQuantity,

    minStock: minQuantity,

    minimumStock: minQuantity,

    minQuantity,

    maxStock: maxQuantity,

    maxQuantity,

    // =====================================================
    // PRICES
    // =====================================================

    costPrice,

    sellingPrice,

    // Backward compatibility
    buyingPrice: costPrice,

    // =====================================================
    // DATES
    // =====================================================

    lastUpdated: record.last_updated,

    createdAt: record.created_at,

    // =====================================================
    // ORIGINAL API RECORD
    // =====================================================

    raw: record,
  };
}, []);

  // =========================================================
  // EXTRACT API RESULTS
  //
  // Supports DRF pagination:
  //
  // {
  //   count: 10,
  //   results: [...]
  // }
  //
  // And normal arrays:
  //
  // [...]
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
        const response =
          await inventoryApi.getAll(params);

        const records =
          extractResults(response);

        const normalizedProducts =
          records.map(normalizeStockRecord);

        setProducts(normalizedProducts);

        // ===================================================
        // BUILD CATEGORIES FROM API DATA
        //
        // This avoids hardcoded categories.
        // ===================================================

        const categoryMap = new Map();

        normalizedProducts.forEach((product) => {
          if (
            product.category &&
            product.category.id
          ) {
            categoryMap.set(
              product.category.id,
              product.category
            );
          } else if (
            product.categoryId &&
            product.categoryName
          ) {
            categoryMap.set(
              product.categoryId,
              {
                id: product.categoryId,
                name: product.categoryName,
              }
            );
          }
        });

        setCategories(
          Array.from(categoryMap.values())
        );

        return normalizedProducts;
      } catch (err) {
        console.error(
          "Failed to load inventory:",
          err
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
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
      extractResults,
      normalizeStockRecord,
    ]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // =========================================================
  // GET SINGLE STOCK
  // =========================================================

  const getStock = useCallback(async (id) => {
    try {
      const response =
        await inventoryApi.getById(id);

      return normalizeStockRecord(response);
    } catch (err) {
      console.error(
        "Failed to get stock:",
        err
      );

      throw err;
    }
  }, [normalizeStockRecord]);

  // =========================================================
  // CREATE STOCK
  //
  // NOTE:
  // This should only be used if your backend
  // allows creating stock records directly.
  // =========================================================

  const createStock = useCallback(
    async (data) => {
      try {
        const response =
          await inventoryApi.create(data);

        await loadInventory();

        return response;
      } catch (err) {
        console.error(
          "Failed to create stock:",
          err
        );

        throw err;
      }
    },
    [loadInventory]
  );

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  const updateStock = useCallback(
    async (id, data) => {
      try {
        const response =
          await inventoryApi.update(
            id,
            data
          );

        await loadInventory();

        return response;
      } catch (err) {
        console.error(
          "Failed to update stock:",
          err
        );

        throw err;
      }
    },
    [loadInventory]
  );

  // =========================================================
  // PATCH STOCK
  // =========================================================

  const patchStock = useCallback(
    async (id, data) => {
      try {
        const response =
          await inventoryApi.patch(
            id,
            data
          );

        await loadInventory();

        return response;
      } catch (err) {
        console.error(
          "Failed to patch stock:",
          err
        );

        throw err;
      }
    },
    [loadInventory]
  );

  // =========================================================
  // DELETE STOCK
  // =========================================================

  const deleteStock = useCallback(
    async (id) => {
      try {
        const response =
          await inventoryApi.delete(id);

        await loadInventory();

        return response;
      } catch (err) {
        console.error(
          "Failed to delete stock:",
          err
        );

        throw err;
      }
    },
    [loadInventory]
  );

  // =========================================================
  // INCREASE STOCK
  //
  // Uses backend API instead of localStorage.
  //
  // The exact payload depends on your Django serializer.
  // =========================================================

  const increaseStock = useCallback(
    async (stockId, quantity, reason = "") => {
      const qty = toNumber(quantity);

      if (qty <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

      return patchStock(stockId, {
        quantity: qty,
        type: "increase",
        reason,
      });
    },
    [patchStock]
  );

  // =========================================================
  // DECREASE STOCK
  // =========================================================

  const decreaseStock = useCallback(
    async (stockId, quantity, reason = "") => {
      const qty = toNumber(quantity);

      if (qty <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

      return patchStock(stockId, {
        quantity: qty,
        type: "decrease",
        reason,
      });
    },
    [patchStock]
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
    }) => {
      const qty = toNumber(quantity);

      if (qty <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

      const id =
        stockId ?? productId;

      if (!id) {
        throw new Error(
          "Stock ID is required."
        );
      }

      return patchStock(id, {
        quantity: qty,
        type,
        reason,
        reference,
      });
    },
    [patchStock]
  );

  // =========================================================
  // LOAD STOCK MOVEMENTS
  // =========================================================

  const loadStockMovements =
    useCallback(async (params = {}) => {
      try {
        const response =
          await inventoryApi.getMovements(
            params
          );

        const movements =
          extractResults(response);

        setStockAdjustments(movements);

        return movements;
      } catch (err) {
        console.error(
          "Failed to load stock movements:",
          err
        );

        throw err;
      }
    }, [extractResults]);

  // =========================================================
  // LOW STOCK FROM API
  // =========================================================

  const loadLowStock =
    useCallback(async () => {
      try {
        const response =
          await inventoryApi.getLowStock();

        const records =
          extractResults(response);

        return records.map(
          normalizeStockRecord
        );
      } catch (err) {
        console.error(
          "Failed to load low stock:",
          err
        );

        throw err;
      }
    }, [
      extractResults,
      normalizeStockRecord,
    ]);

  // =========================================================
  // OUT OF STOCK FROM API
  // =========================================================

  const loadOutOfStock =
    useCallback(async () => {
      try {
        const response =
          await inventoryApi.getOutOfStock();

        const records =
          extractResults(response);

        return records.map(
          normalizeStockRecord
        );
      } catch (err) {
        console.error(
          "Failed to load out of stock:",
          err
        );

        throw err;
      }
    }, [
      extractResults,
      normalizeStockRecord,
    ]);

  // =========================================================
  // LOW STOCK PRODUCTS
  // =========================================================

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = toNumber(
        product.stock
      );

      const minimumStock = toNumber(
        product.minimumStock ??
          product.minStock
      );

      return (
        stock > 0 &&
        stock <= minimumStock
      );
    });
  }, [products]);

  // =========================================================
  // OUT OF STOCK PRODUCTS
  // =========================================================

  const outOfStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        toNumber(product.stock) <= 0
    );
  }, [products]);

  // =========================================================
  // TOTAL PRODUCTS
  // =========================================================

  const totalProducts =
    products.length;

  // =========================================================
  // TOTAL STOCK
  // =========================================================

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        toNumber(product.stock),
      0
    );
  }, [products]);

  // =========================================================
  // INVENTORY VALUE
  //
  // Stock × Cost Price
  // =========================================================

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (total, product) => {
        const stock =
          toNumber(product.stock);

        const costPrice =
          toNumber(product.costPrice);

        return (
          total +
          stock * costPrice
        );
      },
      0
    );
  }, [products]);

  // =========================================================
  // POTENTIAL SALES VALUE
  //
  // Stock × Selling Price
  // =========================================================

  const potentialSalesValue =
    useMemo(() => {
      return products.reduce(
        (total, product) => {
          const stock =
            toNumber(product.stock);

          const sellingPrice =
            toNumber(
              product.sellingPrice
            );

          return (
            total +
            stock * sellingPrice
          );
        },
        0
      );
    }, [products]);

  // =========================================================
  // LOW + OUT OF STOCK COUNT
  // =========================================================

  const lowAndOutOfStock =
    lowStockProducts.length +
    outOfStockProducts.length;

  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

  const searchProducts = useCallback(
    (searchTerm = "") => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return products;
      }

      return products.filter(
        (product) => {
          const name =
            product.name
              ?.toLowerCase() || "";

          const sku =
            product.sku
              ?.toLowerCase() || "";

          const barcode =
            product.barcode
              ?.toLowerCase() || "";

          const category =
            product.categoryName
              ?.toLowerCase() || "";

          return (
            name.includes(term) ||
            sku.includes(term) ||
            barcode.includes(term) ||
            category.includes(term)
          );
        }
      );
    },
    [products]
  );

  // =========================================================
  // GET PRODUCT
  // =========================================================

  const getProduct = useCallback(
    (id) => {
      return products.find(
        (product) =>
          Number(product.id) ===
          Number(id)
      );
    },
    [products]
  );

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshInventory =
    useCallback(
      async (params = {}) => {
        return loadInventory(params);
      },
      [loadInventory]
    );

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = useMemo(
    () => ({
      // -----------------------------------------------------
      // DATA
      // -----------------------------------------------------

      products,
      categories,
      stockAdjustments,

      // -----------------------------------------------------
      // LOADING / ERROR
      // -----------------------------------------------------

      loading,
      error,

      // -----------------------------------------------------
      // REFRESH
      // -----------------------------------------------------

      loadInventory,
      refreshInventory,

      // -----------------------------------------------------
      // STOCK
      // -----------------------------------------------------

      getStock,
      createStock,
      updateStock,
      patchStock,
      deleteStock,

      increaseStock,
      decreaseStock,
      adjustStock,

      // -----------------------------------------------------
      // API QUERIES
      // -----------------------------------------------------

      loadLowStock,
      loadOutOfStock,
      loadStockMovements,

      // -----------------------------------------------------
      // HELPERS
      // -----------------------------------------------------

      getProduct,
      searchProducts,

      // -----------------------------------------------------
      // STATISTICS
      // -----------------------------------------------------

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

      increaseStock,
      decreaseStock,
      adjustStock,

      loadLowStock,
      loadOutOfStock,
      loadStockMovements,

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
    <InventoryContext.Provider
      value={value}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// =============================================================
// CUSTOM HOOK
// =============================================================

export const useInventory = () => {
  const context =
    useContext(InventoryContext);

  if (!context) {
    throw new Error(
      "useInventory must be used inside InventoryProvider"
    );
  }

  return context;
};

export default InventoryContext;
