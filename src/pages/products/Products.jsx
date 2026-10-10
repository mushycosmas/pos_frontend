
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import productsApi from "../../services/productsApi";
import inventoryApi from "../../services/inventoryApi";
import brandsApi from "../../services/brandsApi";
import categoriesApi from "../../services/categoriesApi";
import suppliersApi from "../../services/suppliersApi";

import { useAuth } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";

import ProductPageHeader from "./components/ProductPageHeader";
import ProductAlerts from "./components/ProductAlerts";
import ProductStats from "./components/ProductStats";
import ProductFilters from "./components/ProductFilters";
import ProductTable from "./components/ProductTable";
import ProductModal from "./components/ProductModal";

// ==========================================================
// GENERAL HELPERS
// ==========================================================

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// Supports common Django REST Framework and wrapped API responses.
const normalizeResponse = (response) => {
  let data = response?.data ?? response;

  for (let i = 0; i < 5; i += 1) {
    if (Array.isArray(data)) {
      return data;
    }

    if (!data || typeof data !== "object") {
      return [];
    }

    const arrayKeys = [
      "results",
      "data",
      "products",
      "stocks",
      "inventory",
      "items",
      "brands",
      "categories",
      "suppliers",
    ];

    const key = arrayKeys.find((item) =>
      Array.isArray(data[item])
    );

    if (key) {
      return data[key];
    }

    if (
      data.data &&
      typeof data.data === "object"
    ) {
      data = data.data;
      continue;
    }

    break;
  }

  console.warn(
    "Unrecognized API response format:",
    response
  );

  return [];
};

const getCreatedBy = (product) => {
  const candidates = [
    product?.created_by_name,
    product?.createdByName,
    product?.created_by?.name,
    product?.created_by?.full_name,
    product?.created_by?.username,
    product?.createdBy?.name,
    product?.createdBy?.full_name,
    product?.createdBy?.username,
    product?.user?.name,
    product?.user?.username,
  ];

  return (
    candidates.find(
      (value) =>
        typeof value === "string" && value.trim()
    ) || "-"
  );
};

// ==========================================================
// STOCK HELPERS
// ==========================================================

const getStock = (product) =>
  toNumber(product?.stock);

const getMinStock = (product) =>
  toNumber(
    product?.min_quantity ??
      product?.minimum_stock ??
      product?.min_stock ??
      product?.minStock ??
      product?.reorder_level ??
      0
  );

const getProductStatus = (product) => {
  const stock = getStock(product);
  const minimum = getMinStock(product);

  if (stock <= 0) {
    return {
      text: "Out of Stock",
      variant: "danger",
    };
  }

  if (minimum > 0 && stock <= minimum) {
    return {
      text: "Low Stock",
      variant: "warning",
    };
  }

  return {
    text: "In Stock",
    variant: "success",
  };
};

const formatNumber = (value) =>
  toNumber(value).toLocaleString("en-TZ");

const formatCurrency = (value) =>
  `TSh ${formatNumber(value)}`;

// ==========================================================
// BRANCH AND PRODUCT ID HELPERS
// ==========================================================

const getBranchId = (record) => {
  const value =
    record?.branch?.id ??
    record?.branch_id ??
    record?.branchId ??
    record?.branch;

  const id =
    value && typeof value === "object"
      ? Number(value.id)
      : Number(value);

  return Number.isFinite(id) && id > 0
    ? id
    : null;
};

const getProductId = (record) => {
  const value =
    record?.product?.id ??
    record?.product_id ??
    record?.productId ??
    record?.product;

  const id =
    value && typeof value === "object"
      ? Number(value.id)
      : Number(value);

  return Number.isFinite(id) && id > 0
    ? id
    : null;
};

// ==========================================================
// PRODUCTS PAGE
// ==========================================================

const Products = () => {
  const { hasPermission } = useAuth();

  const {
    currentBranch,
    loading: branchesLoading,
  } = useBranch();

  // Only use the currently selected branch.
  const branchId = useMemo(() => {
    const id = Number(currentBranch?.id);

    return Number.isFinite(id) && id > 0
      ? id
      : null;
  }, [currentBranch?.id]);

  const canEditProduct = hasPermission(
    "products.change_product"
  );

  const canDeleteProduct = hasPermission(
    "products.delete_product"
  );

  // ========================================================
  // STATE
  // ========================================================

  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);

  const [deletingProductId, setDeletingProductId] =
    useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] =
    useState("all");

  // Prevent stale requests from overwriting data after
  // switching branches or unmounting the page.
  const requestIdRef = useRef(0);

  // ========================================================
  // LOAD PRODUCTS AND CURRENT BRANCH INVENTORY
  // ========================================================

  const loadProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (branchesLoading) {
      setLoading(true);
      return;
    }

    if (!branchId) {
      setProducts([]);
      setStocks([]);
      setLoading(false);

      setError(
        "Please select a branch to view products and stock."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      // IMPORTANT:
      // Django ProductViewSet requires branch or branch_id.
      // Both requests must use the currently selected branch.
      const [productsResponse, stocksResponse] =
        await Promise.all([
          productsApi.getAll({
            branch: branchId,
          }),

          inventoryApi.getAll({
            branch: branchId,
          }),
        ]);

      // Ignore an outdated response after a newer request.
      if (requestId !== requestIdRef.current) {
        return;
      }

      const productList =
        normalizeResponse(productsResponse);

      const allStocks =
        normalizeResponse(stocksResponse);

      console.log(
        `[Products] Selected branch: ${branchId}`
      );

      console.log(
        "[Products] API product count:",
        productList.length
      );

      console.log(
        "[Products] API inventory count:",
        allStocks.length
      );

      // Keep only inventory for the selected branch.
      const branchStocks = allStocks.filter(
        (stock) =>
          getBranchId(stock) === branchId
      );

      // Match inventory records to products by ID.
      const stockMap = new Map();

      branchStocks.forEach((stock) => {
        const productId = getProductId(stock);

        if (productId !== null) {
          stockMap.set(productId, stock);
        }
      });

      // Attach selected-branch stock to each product.
      const mergedProducts = productList.map(
        (product) => {
          const productId = Number(product.id);

          const stock = stockMap.get(productId);

          // Do not use company-wide stock when no matching
          // selected-branch inventory record exists.
          const quantity = stock
            ? toNumber(
                stock.quantity ??
                  stock.current_stock ??
                  stock.stock
              )
            : 0;

          return {
            ...product,

            stock: quantity,
            current_stock: quantity,
            quantity,

            stock_id: stock?.id ?? null,

            reserved_quantity: toNumber(
              stock?.reserved_quantity
            ),

            min_quantity: toNumber(
              stock?.min_quantity ??
                stock?.minimum_stock ??
                product?.minimum_stock ??
                product?.min_quantity ??
                0
            ),

            max_quantity: toNumber(
              stock?.max_quantity
            ),

            branch: branchId,

            branch_name:
              stock?.branch_name ??
              stock?.branch?.name ??
              currentBranch?.name ??
              "",

            inventory: stock ?? null,
          };
        }
      );

      setStocks(branchStocks);
      setProducts(mergedProducts);

      if (productList.length === 0) {
        console.warn(
          "[Products] No products returned for branch:",
          branchId
        );
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to load products and inventory:",
        err
      );

      console.error(
        "Products/inventory response:",
        err?.response?.data
      );

      setProducts([]);
      setStocks([]);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to load products and stock. Please try again."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    branchId,
    branchesLoading,
    currentBranch?.name,
  ]);

  // ========================================================
  // LOAD LOOKUP DATA
  // ========================================================

  const loadBrands = useCallback(async () => {
    try {
      const response = await brandsApi.getAll();

      setBrands(normalizeResponse(response));
    } catch (err) {
      console.error(
        "Failed to load brands:",
        err?.response?.data || err
      );
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();

      setCategories(normalizeResponse(response));
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err?.response?.data || err
      );
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    try {
      const response = await suppliersApi.getAll();

      setSuppliers(normalizeResponse(response));
    } catch (err) {
      console.error(
        "Failed to load suppliers:",
        err?.response?.data || err
      );
    }
  }, []);

  // ========================================================
  // INITIAL LOAD AND BRANCH CHANGES
  // ========================================================

  useEffect(() => {
    if (branchesLoading) {
      return undefined;
    }

    loadProducts();

    return () => {
      // Invalidate the previous request on branch change
      // or when the component unmounts.
      requestIdRef.current += 1;
    };
  }, [loadProducts, branchesLoading]);

  useEffect(() => {
    loadBrands();
    loadCategories();
    loadSuppliers();
  }, [
    loadBrands,
    loadCategories,
    loadSuppliers,
  ]);

  // ========================================================
  // LOOKUP HELPERS
  // ========================================================

  const getBrand = useCallback(
    (product) => {
      if (product?.brand_name) {
        return {
          name: product.brand_name,
        };
      }

      const value =
        product?.brand?.id ??
        product?.brand ??
        product?.brand_id ??
        product?.brandId;

      if (value && typeof value === "object") {
        return value;
      }

      return brands.find(
        (item) =>
          Number(item.id) === Number(value)
      );
    },
    [brands]
  );

  const getCategory = useCallback(
    (product) => {
      if (product?.category_name) {
        return {
          name: product.category_name,
        };
      }

      const value =
        product?.category?.id ??
        product?.category ??
        product?.category_id ??
        product?.categoryId;

      if (value && typeof value === "object") {
        return value;
      }

      return categories.find(
        (item) =>
          Number(item.id) === Number(value)
      );
    },
    [categories]
  );

  const getSupplier = useCallback(
    (product) => {
      if (product?.supplier_name) {
        return {
          name: product.supplier_name,
        };
      }

      const value =
        product?.supplier?.id ??
        product?.supplier ??
        product?.supplier_id ??
        product?.supplierId;

      if (value && typeof value === "object") {
        return value;
      }

      return suppliers.find(
        (item) =>
          Number(item.id) === Number(value)
      );
    },
    [suppliers]
  );

  // ========================================================
  // SEARCH AND FILTER
  // ========================================================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = String(
        product?.name || ""
      ).toLowerCase();

      const sku = String(
        product?.sku || ""
      ).toLowerCase();

      const barcode = String(
        product?.barcode || ""
      ).toLowerCase();

      const createdBy =
        getCreatedBy(product).toLowerCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        sku.includes(keyword) ||
        barcode.includes(keyword) ||
        createdBy.includes(keyword);

      const brandValue =
        product?.brand?.id ??
        product?.brand ??
        product?.brand_id ??
        product?.brandId;

      const matchesBrand =
        brandFilter === "all" ||
        Number(
          typeof brandValue === "object"
            ? brandValue?.id
            : brandValue
        ) === Number(brandFilter);

      const categoryValue =
        product?.category?.id ??
        product?.category ??
        product?.category_id ??
        product?.categoryId;

      const matchesCategory =
        categoryFilter === "all" ||
        Number(
          typeof categoryValue === "object"
            ? categoryValue?.id
            : categoryValue
        ) === Number(categoryFilter);

      const stock = getStock(product);
      const minimum = getMinStock(product);

      let matchesStatus = true;

      if (statusFilter === "in-stock") {
        matchesStatus =
          stock > 0 &&
          (minimum <= 0 || stock > minimum);
      } else if (statusFilter === "low-stock") {
        matchesStatus =
          stock > 0 &&
          minimum > 0 &&
          stock <= minimum;
      } else if (
        statusFilter === "out-of-stock"
      ) {
        matchesStatus = stock <= 0;
      }

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    brandFilter,
    categoryFilter,
    statusFilter,
  ]);

  // ========================================================
  // STATISTICS FOR SELECTED BRANCH
  // ========================================================

  const totalProducts = products.length;

  const totalStock = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum + getStock(product),
        0
      ),
    [products]
  );

  const inventoryValue = useMemo(
    () =>
      products.reduce((sum, product) => {
        const stock = getStock(product);

        const cost = toNumber(
          product?.cost_price ??
            product?.costPrice
        );

        return sum + stock * cost;
      }, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => {
        const stock = getStock(product);
        const minimum = getMinStock(product);

        return (
          stock > 0 &&
          minimum > 0 &&
          stock <= minimum
        );
      }).length,
    [products]
  );

  const outOfStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          getStock(product) <= 0
      ).length,
    [products]
  );

  // ========================================================
  // MODAL ACTIONS
  // ========================================================

  const handleAddProduct = () => {
    if (!branchId) {
      setError(
        "Select a branch before adding a product."
      );
      return;
    }

    setEditingProduct(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleEdit = (product) => {
    if (!branchId) {
      setError(
        "Select a branch before editing a product."
      );
      return;
    }

    setEditingProduct(product);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingProduct(null);
  };

  // ========================================================
  // SAVE PRODUCT
  // ========================================================

  const handleSave = async (data) => {
    if (!branchId) {
      setError(
        "Select a branch before saving a product."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Product details are company-level.
      // Do not send branch unless ProductSerializer
      // explicitly accepts it.
      const payload = {
        ...data,
      };

      if (editingProduct) {
        await productsApi.update(
          editingProduct.id,
          payload
        );
      } else {
        await productsApi.create(payload);
      }

      setShowModal(false);
      setEditingProduct(null);

      setSuccess(
        editingProduct
          ? "Product updated successfully."
          : "Product created successfully."
      );

      // Reload products for the currently selected branch.
      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      console.error(
        "API response:",
        err?.response?.data
      );

      const responseData = err?.response?.data;

      const message =
        responseData?.detail ||
        responseData?.branch?.[0] ||
        responseData?.name?.[0] ||
        responseData?.non_field_errors?.[0] ||
        "Failed to save product. Please check the form and try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // DELETE PRODUCT
  // ========================================================

  const handleDelete = async (product) => {
    if (!canDeleteProduct) {
      setError(
        "You do not have permission to delete products."
      );
      return;
    }

    if (!branchId) {
      setError(
        "Select a branch before deleting a product."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(product.id);
      setError("");
      setSuccess("");

      await productsApi.delete(product.id);

      // Deleting a product is company-level. The API may
      // reject deletion if inventory or transactions exist.
      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      setSuccess("Product deleted successfully.");
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete product. Please try again."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  // ========================================================
  // RESET FILTERS
  // ========================================================

  const handleReset = () => {
    setSearch("");
    setBrandFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div>
      <ProductPageHeader
        onAddProduct={handleAddProduct}
      />

      <ProductAlerts
        error={error}
        success={success}
        onDismissError={() => setError("")}
        onDismissSuccess={() => setSuccess("")}
        onRetry={loadProducts}
      />

      <ProductStats
        totalProducts={totalProducts}
        totalStock={totalStock}
        inventoryValue={inventoryValue}
        lowStockProducts={lowStockProducts}
        outOfStockProducts={outOfStockProducts}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />

      <ProductFilters
        search={search}
        setSearch={setSearch}
        brands={brands}
        categories={categories}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleReset}
        resultCount={filteredProducts.length}
      />

      <ProductTable
        products={filteredProducts}
        loading={loading || branchesLoading}
        currentBranch={currentBranch}
        getBrand={getBrand}
        getCategory={getCategory}
        getSupplier={getSupplier}
        getCreatedBy={getCreatedBy}
        getStock={getStock}
        getProductStatus={getProductStatus}
        toNumber={toNumber}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
        canEditProduct={canEditProduct}
        canDeleteProduct={canDeleteProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingProductId={deletingProductId}
      />

      <ProductModal
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSave}
        product={editingProduct}
        currentBranch={currentBranch}
        brands={brands}
        categories={categories}
        suppliers={suppliers}
        saving={saving}
      />
    </div>
  );
};

export default Products;
