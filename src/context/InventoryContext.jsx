import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("pos_products");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            sku: "USB-001",
            name: "USB-C Charger",
            categoryId: 1,
            categoryName: "Chargers",
            supplierId: 1,
            supplierName: "Tech Supplier Ltd",
            buyingPrice: 8000,
            sellingPrice: 15000,
            stock: 5,
            minStock: 10,
            unit: "pcs",
            status: "active",
          },
          {
            id: 2,
            sku: "CASE-001",
            name: "iPhone Case",
            categoryId: 2,
            categoryName: "Phone Cases",
            supplierId: 1,
            supplierName: "Tech Supplier Ltd",
            buyingPrice: 10000,
            sellingPrice: 25000,
            stock: 25,
            minStock: 10,
            unit: "pcs",
            status: "active",
          },
          {
            id: 3,
            sku: "PB-001",
            name: "Power Bank",
            categoryId: 3,
            categoryName: "Power Banks",
            supplierId: 2,
            supplierName: "Mobile World",
            buyingPrice: 20000,
            sellingPrice: 35000,
            stock: 3,
            minStock: 10,
            unit: "pcs",
            status: "active",
          },
        ];
  });

  // =========================================================
  // CATEGORIES
  // =========================================================

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("pos_categories");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Chargers",
            description: "Phone chargers and adapters",
            status: "active",
          },
          {
            id: 2,
            name: "Phone Cases",
            description: "Phone covers and protective cases",
            status: "active",
          },
          {
            id: 3,
            name: "Power Banks",
            description: "Portable power banks",
            status: "active",
          },
        ];
  });

  // =========================================================
  // SUPPLIERS
  // =========================================================

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem("pos_suppliers");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Tech Supplier Ltd",
            phone: "0712345678",
            email: "sales@techsupplier.com",
            address: "Dar es Salaam",
            status: "active",
          },
          {
            id: 2,
            name: "Mobile World",
            phone: "0755555555",
            email: "info@mobileworld.com",
            address: "Kariakoo",
            status: "active",
          },
        ];
  });

  // =========================================================
  // PURCHASES
  // =========================================================

  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("pos_purchases");

    return saved ? JSON.parse(saved) : [];
  });

  // =========================================================
  // STOCK ADJUSTMENTS
  // =========================================================

  const [stockAdjustments, setStockAdjustments] = useState(() => {
    const saved = localStorage.getItem("pos_stock_adjustments");

    return saved ? JSON.parse(saved) : [];
  });

  // =========================================================
  // SAVE TO LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    localStorage.setItem("pos_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("pos_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("pos_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("pos_purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(
      "pos_stock_adjustments",
      JSON.stringify(stockAdjustments)
    );
  }, [stockAdjustments]);

  // =========================================================
  // PRODUCTS CRUD
  // =========================================================

  const addProduct = (product) => {
    const category = categories.find(
      (item) => Number(item.id) === Number(product.categoryId)
    );

    const supplier = suppliers.find(
      (item) => Number(item.id) === Number(product.supplierId)
    );

    const newProduct = {
      ...product,
      id: Date.now(),
      categoryName: category?.name || "",
      supplierName: supplier?.name || "",
      stock: Number(product.stock || 0),
      buyingPrice: Number(product.buyingPrice || 0),
      sellingPrice: Number(product.sellingPrice || 0),
      minStock: Number(product.minStock || 0),
      status: product.status || "active",
    };

    setProducts((prev) => [...prev, newProduct]);

    return newProduct;
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...updatedProduct,
            }
          : product
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  };

  const getProduct = (id) => {
    return products.find(
      (product) => Number(product.id) === Number(id)
    );
  };

  // =========================================================
  // STOCK OPERATIONS
  // =========================================================

  const increaseStock = (productId, quantity) => {
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return;
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock: Number(product.stock) + qty,
            }
          : product
      )
    );
  };

  const decreaseStock = (productId, quantity) => {
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return;
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock: Math.max(
                0,
                Number(product.stock) - qty
              ),
            }
          : product
      )
    );
  };

  const adjustStock = ({
    productId,
    quantity,
    type,
    reason,
    reference,
  }) => {
    const product = products.find(
      (item) => item.id === Number(productId)
    );

    if (!product) {
      return;
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return;
    }

    let newStock = Number(product.stock);

    if (type === "increase") {
      newStock += qty;
    }

    if (type === "decrease") {
      newStock = Math.max(0, newStock - qty);
    }

    if (type === "set") {
      newStock = qty;
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              stock: newStock,
            }
          : item
      )
    );

    const adjustment = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      previousStock: product.stock,
      quantity: qty,
      newStock,
      type,
      reason: reason || "",
      reference: reference || "",
      date: new Date().toISOString(),
    };

    setStockAdjustments((prev) => [
      adjustment,
      ...prev,
    ]);

    return adjustment;
  };

  // =========================================================
  // CATEGORY CRUD
  // =========================================================

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now(),
      status: category.status || "active",
    };

    setCategories((prev) => [
      ...prev,
      newCategory,
    ]);

    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              ...updatedCategory,
            }
          : category
      )
    );

    // Update category name on products
    if (updatedCategory.name) {
      setProducts((prev) =>
        prev.map((product) =>
          Number(product.categoryId) === Number(id)
            ? {
                ...product,
                categoryName: updatedCategory.name,
              }
            : product
        )
      );
    }
  };

  const deleteCategory = (id) => {
    const hasProducts = products.some(
      (product) =>
        Number(product.categoryId) === Number(id)
    );

    if (hasProducts) {
      return {
        success: false,
        message:
          "Cannot delete category because it contains products.",
      };
    }

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );

    return {
      success: true,
    };
  };

  // =========================================================
  // SUPPLIER CRUD
  // =========================================================

  const addSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: Date.now(),
      status: supplier.status || "active",
    };

    setSuppliers((prev) => [
      ...prev,
      newSupplier,
    ]);

    return newSupplier;
  };

  const updateSupplier = (id, updatedSupplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === id
          ? {
              ...supplier,
              ...updatedSupplier,
            }
          : supplier
      )
    );

    // Update supplier name on products
    if (updatedSupplier.name) {
      setProducts((prev) =>
        prev.map((product) =>
          Number(product.supplierId) === Number(id)
            ? {
                ...product,
                supplierName: updatedSupplier.name,
              }
            : product
        )
      );
    }
  };

  const deleteSupplier = (id) => {
    const hasProducts = products.some(
      (product) =>
        Number(product.supplierId) === Number(id)
    );

    if (hasProducts) {
      return {
        success: false,
        message:
          "Cannot delete supplier because products are linked to this supplier.",
      };
    }

    setSuppliers((prev) =>
      prev.filter((supplier) => supplier.id !== id)
    );

    return {
      success: true,
    };
  };

  // =========================================================
  // PURCHASES
  // =========================================================

  const addPurchase = (purchase) => {
    const newPurchase = {
      ...purchase,
      id: Date.now(),
      date:
        purchase.date ||
        new Date().toISOString(),
      status: purchase.status || "received",
    };

    setPurchases((prev) => [
      newPurchase,
      ...prev,
    ]);

    // Automatically increase stock
    if (purchase.items?.length) {
      purchase.items.forEach((item) => {
        increaseStock(
          Number(item.productId),
          Number(item.quantity)
        );
      });
    }

    return newPurchase;
  };

  const updatePurchase = (id, updatedPurchase) => {
    setPurchases((prev) =>
      prev.map((purchase) =>
        purchase.id === id
          ? {
              ...purchase,
              ...updatedPurchase,
            }
          : purchase
      )
    );
  };

  const deletePurchase = (id) => {
    setPurchases((prev) =>
      prev.filter((purchase) => purchase.id !== id)
    );
  };

  // =========================================================
  // INVENTORY HELPERS
  // =========================================================

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.stock) <=
        Number(product.minStock)
    );
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(
      (product) => Number(product.stock) <= 0
    );
  }, [products]);

  const totalProducts = products.length;

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.stock || 0),
      0
    );
  }, [products]);

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0) *
          Number(product.buyingPrice || 0),
      0
    );
  }, [products]);

  const potentialSalesValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0) *
          Number(product.sellingPrice || 0),
      0
    );
  }, [products]);

  // =========================================================
  // SEARCH
  // =========================================================

  const searchProducts = (searchTerm) => {
    if (!searchTerm) {
      return products;
    }

    const term = searchTerm.toLowerCase();

    return products.filter(
      (product) =>
        product.name
          ?.toLowerCase()
          .includes(term) ||
        product.sku
          ?.toLowerCase()
          .includes(term) ||
        product.categoryName
          ?.toLowerCase()
          .includes(term)
    );
  };

  // =========================================================
  // RESET DATA
  // =========================================================

  const resetInventory = () => {
    localStorage.removeItem("pos_products");
    localStorage.removeItem("pos_categories");
    localStorage.removeItem("pos_suppliers");
    localStorage.removeItem("pos_purchases");
    localStorage.removeItem(
      "pos_stock_adjustments"
    );

    window.location.reload();
  };

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,

    // Stock
    increaseStock,
    decreaseStock,
    adjustStock,

    // Categories
    categories,
    addCategory,
    updateCategory,
    deleteCategory,

    // Suppliers
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,

    // Purchases
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,

    // Stock adjustments
    stockAdjustments,

    // Inventory statistics
    totalProducts,
    totalStock,
    inventoryValue,
    potentialSalesValue,
    lowStockProducts,
    outOfStockProducts,

    // Search
    searchProducts,

    // Reset
    resetInventory,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// =========================================================
// CUSTOM HOOK
// =========================================================

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