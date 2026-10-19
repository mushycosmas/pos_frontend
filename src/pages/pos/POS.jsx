
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";

import { useInventory } from "../../context/InventoryContext";
import { useBranch } from "../../context/BranchContext";

import salesApi from "../../services/SalesApi";
import brandsApi from "../../services/brandsApi";
import categoriesApi from "../../services/categoriesApi";

import usePOS from "./hooks/usePOS";
import usePOSPaymentMethods from "./hooks/usePOSPaymentMethods";

import POSHeader from "./components/POSHeader";
import ProductSearch from "./components/ProductSearch";
import ProductGrid from "./components/ProductGrid";
import CartTable from "./components/CartTable";
import CartSummary from "./components/CartSummary";
import CustomerForm from "./components/CustomerForm";
import PaymentModal from "./components/PaymentModal";
import SaleSuccessModal from "./components/SaleSuccessModal";

/* ==================================================
   GENERAL HELPERS
================================================== */

const toText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeText = (value) =>
  toText(value).toLocaleLowerCase();

const getName = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return toText(
      value.name ??
        value.brand_name ??
        value.brandName ??
        value.category_name ??
        value.categoryName ??
        value.display_name ??
        value.label ??
        value.title ??
        value.product_name ??
        ""
    );
  }

  return toText(value);
};

const getId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return toText(
      value.id ??
        value.pk ??
        value.brand_id ??
        value.brandId ??
        value.category_id ??
        value.categoryId ??
        value.product_id ??
        ""
    );
  }

  return toText(value);
};

/*
 * Return the first non-empty value.
 * Unlike ??, this also skips empty strings.
 */
const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      toText(value) !== ""
    ) {
      return value;
    }
  }

  return "";
};

const getProductName = (product) =>
  toText(
    firstNonEmpty(
      product?.name,
      product?.product_name,
      product?.title,
      product?.rawProduct?.name,
      product?.rawProduct?.product_name,
      product?.raw?.product?.name
    )
  );

const getProductSku = (product) =>
  toText(
    firstNonEmpty(
      product?.sku,
      product?.product_sku,
      product?.code,
      product?.product_code,
      product?.rawProduct?.sku
    )
  );

const getProductBarcode = (product) =>
  toText(
    firstNonEmpty(
      product?.barcode,
      product?.barcode_number,
      product?.bar_code,
      product?.rawProduct?.barcode
    )
  );

/* ==================================================
   BRAND ID RESOLUTION
================================================== */

const getProductBrandId = (product) => {
  const candidates = [
    product?.brand_id,
    product?.brandId,
    product?.brand_detail,
    product?.brand,
    product?.rawProduct?.brand_id,
    product?.rawProduct?.brandId,
    product?.rawProduct?.brand_detail,
    product?.rawProduct?.brand,
    product?.raw?.brand_id,
    product?.raw?.brandId,
    product?.raw?.brand_detail,
    product?.raw?.brand,
    product?.raw?.product?.brand_id,
    product?.raw?.product?.brand,
  ];

  for (const candidate of candidates) {
    const id = getId(candidate);

    if (id) {
      return id;
    }
  }

  return "";
};

/* ==================================================
   CATEGORY ID RESOLUTION
================================================== */

const getProductCategoryId = (product) => {
  const candidates = [
    product?.category_id,
    product?.categoryId,
    product?.category_detail,
    product?.category,
    product?.rawProduct?.category_id,
    product?.rawProduct?.categoryId,
    product?.rawProduct?.category_detail,
    product?.rawProduct?.category,
    product?.raw?.category_id,
    product?.raw?.categoryId,
    product?.raw?.category_detail,
    product?.raw?.category,
    product?.raw?.product?.category_id,
    product?.raw?.product?.category,
  ];

  for (const candidate of candidates) {
    const id = getId(candidate);

    if (id) {
      return id;
    }
  }

  return "";
};

/* ==================================================
   EXPLICIT BRAND NAME
================================================== */

const getProductBrandName = (product) => {
  const candidates = [
    product?.brand_name,
    product?.brandName,
    product?.brand_detail,
    product?.brand,
    product?.rawProduct?.brand_name,
    product?.rawProduct?.brandName,
    product?.rawProduct?.brand_detail,
    product?.rawProduct?.brand,
    product?.raw?.brand_name,
    product?.raw?.brandName,
    product?.raw?.brand_detail,
    product?.raw?.brand,
    product?.raw?.product?.brand_name,
    product?.raw?.product?.brand,
  ];

  for (const candidate of candidates) {
    const name = getName(candidate);

    // Numeric values are IDs, not display names.
    if (name && !/^\d+$/.test(name)) {
      return name;
    }
  }

  return "";
};

/* ==================================================
   EXPLICIT CATEGORY NAME
================================================== */

const getProductCategoryName = (product) => {
  const candidates = [
    product?.category_name,
    product?.categoryName,
    product?.category_detail,
    product?.category,
    product?.rawProduct?.category_name,
    product?.rawProduct?.categoryName,
    product?.rawProduct?.category_detail,
    product?.rawProduct?.category,
    product?.raw?.category_name,
    product?.raw?.categoryName,
    product?.raw?.category_detail,
    product?.raw?.category,
    product?.raw?.product?.category_name,
    product?.raw?.product?.category,
  ];

  for (const candidate of candidates) {
    const name = getName(candidate);

    if (name && !/^\d+$/.test(name)) {
      return name;
    }
  }

  return "";
};

/* ==================================================
   NORMALIZE API LISTS
================================================== */

const normalizeList = (response, keys = []) => {
  const candidates = [
    response,
    response?.data,
    response?.results,
    response?.data?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      for (const key of keys) {
        if (Array.isArray(candidate[key])) {
          return candidate[key];
        }
      }
    }
  }

  return [];
};

/* ==================================================
   API ERROR MESSAGE
================================================== */

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return toText(data.detail);
  }

  if (data?.message) {
    return toText(data.message);
  }

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const detail = Array.isArray(value)
          ? value.map((item) => getName(item)).join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : toText(value);

        return `${key}: ${detail}`;
      })
      .join(" | ");
  }

  return error?.message || "An unexpected error occurred.";
};

/* ==================================================
   POS COMPONENT
================================================== */

const POS = () => {
  /* -----------------------------------------------
     INVENTORY
  ----------------------------------------------- */

  const {
    products: inventoryProducts = [],
    loadInventory,
  } = useInventory();

  const products = Array.isArray(inventoryProducts)
    ? inventoryProducts
    : [];

  /* -----------------------------------------------
     ACTIVE BRANCH
  ----------------------------------------------- */

  const branchContext = useBranch();

  const branch =
    branchContext?.currentBranch ??
    branchContext?.selectedBranch ??
    branchContext?.activeBranch ??
    branchContext?.branch ??
    null;

  const branchId =
    branch?.id ??
    branch?.branch_id ??
    branch?.branchId ??
    null;

  /* -----------------------------------------------
     POS AND PAYMENT HOOKS
  ----------------------------------------------- */

  const pos = usePOS();

  const {
    paymentMethods = [],
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = usePOSPaymentMethods();

  /* -----------------------------------------------
     PAGE STATE
  ----------------------------------------------- */

  const [inventoryLoading, setInventoryLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [filtersLoading, setFiltersLoading] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [completedSale, setCompletedSale] =
    useState(null);

  const [pageError, setPageError] = useState("");

  const [brands, setBrands] = useState([]);

  const [categories, setCategories] = useState([]);

  /* -----------------------------------------------
     FILTER STATE
  ----------------------------------------------- */

  const [brandFilter, setBrandFilter] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [productNameFilter, setProductNameFilter] =
    useState("");

  /* -----------------------------------------------
     SELECTED PAYMENT METHOD
  ----------------------------------------------- */

  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (method) =>
          String(method.id) === String(pos.paymentMethod)
      ) ?? null,
    [paymentMethods, pos.paymentMethod]
  );

  /* ==================================================
     LOAD BRANDS AND CATEGORIES
  ================================================== */

  const loadProductFilters = useCallback(async () => {
    setFiltersLoading(true);

    try {
      const [brandsResponse, categoriesResponse] =
        await Promise.all([
          brandsApi.getAll(),
          categoriesApi.getAll(),
        ]);

      const brandsData = normalizeList(
        brandsResponse,
        ["brands"]
      );

      const categoriesData = normalizeList(
        categoriesResponse,
        ["categories"]
      );

      setBrands(
        brandsData.filter(
          (item) => getId(item) && getName(item)
        )
      );

      setCategories(
        categoriesData.filter(
          (item) => getId(item) && getName(item)
        )
      );
    } catch (error) {
      console.error(
        "Failed to load brands and categories:",
        error
      );

      setPageError(
        `Could not load product filters. ${getErrorMessage(error)}`
      );
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductFilters();
  }, [loadProductFilters]);

  /* ==================================================
     REFRESH INVENTORY

     InventoryContext reads the active branch itself.
     loadInventory expects a params object, not branchId.
  ================================================== */

  const refreshInventory = useCallback(async () => {
    if (typeof loadInventory !== "function") {
      return;
    }

    setInventoryLoading(true);

    try {
      await loadInventory();
    } catch (error) {
      console.error("Failed to refresh inventory:", error);

      setPageError(
        `Could not load products. ${getErrorMessage(error)}`
      );
    } finally {
      setInventoryLoading(false);
    }
  }, [loadInventory]);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  /* ==================================================
     BRAND LOOKUP: ID -> NAME
  ================================================== */

  const brandLookup = useMemo(() => {
    const lookup = new Map();

    brands.forEach((brand) => {
      const id = getId(brand);
      const name = getName(brand);

      if (id && name) {
        lookup.set(id, name);
      }
    });

    return lookup;
  }, [brands]);

  /* ==================================================
     CATEGORY LOOKUP: ID -> NAME
  ================================================== */

  const categoryLookup = useMemo(() => {
    const lookup = new Map();

    categories.forEach((category) => {
      const id = getId(category);
      const name = getName(category);

      if (id && name) {
        lookup.set(id, name);
      }
    });

    return lookup;
  }, [categories]);

  /* ==================================================
     RESOLVE BRAND NAME

     Supports:
     brand: 1
     brand_id: 1
     brand: { id: 1, name: "Samsung" }
     brand_name: "Samsung"
     Nested original API product data
  ================================================== */

  const resolveBrandName = useCallback(
    (product) => {
      const explicitName = getProductBrandName(product);

      if (explicitName) {
        return explicitName;
      }

      const brandId = getProductBrandId(product);

      return brandLookup.get(brandId) ?? "";
    },
    [brandLookup]
  );

  /* ==================================================
     RESOLVE CATEGORY NAME
  ================================================== */

  const resolveCategoryName = useCallback(
    (product) => {
      const explicitName = getProductCategoryName(product);

      if (explicitName) {
        return explicitName;
      }

      const categoryId = getProductCategoryId(product);

      return categoryLookup.get(categoryId) ?? "";
    },
    [categoryLookup]
  );

  /* ==================================================
     FILTER PRODUCTS
  ================================================== */

  const filteredProducts = useMemo(() => {
    const searchTerm = normalizeText(pos.search);

    const nameTerm = normalizeText(productNameFilter);

    const selectedBrand = normalizeText(brandFilter);

    const selectedCategory = normalizeText(categoryFilter);

    return products.filter((product) => {
      const name = normalizeText(getProductName(product));

      const sku = normalizeText(getProductSku(product));

      const barcode = normalizeText(
        getProductBarcode(product)
      );

      const brandName = normalizeText(
        resolveBrandName(product)
      );

      const categoryName = normalizeText(
        resolveCategoryName(product)
      );

      const brandId = getProductBrandId(product);

      const categoryId = getProductCategoryId(product);

      /* General search */

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        sku.includes(searchTerm) ||
        barcode.includes(searchTerm);

      /* Product name */

      const matchesName =
        !nameTerm || name.includes(nameTerm);

      /*
       * Dropdowns contain brand/category names.
       * IDs are also supported if a dropdown uses IDs.
       */

      const matchesBrand =
        !selectedBrand ||
        brandName === selectedBrand ||
        normalizeText(brandId) === selectedBrand;

      const matchesCategory =
        !selectedCategory ||
        categoryName === selectedCategory ||
        normalizeText(categoryId) === selectedCategory;

      return (
        matchesSearch &&
        matchesName &&
        matchesBrand &&
        matchesCategory
      );
    });
  }, [
    products,
    pos.search,
    productNameFilter,
    brandFilter,
    categoryFilter,
    resolveBrandName,
    resolveCategoryName,
  ]);

  /* ==================================================
     CLEAR FILTERS
  ================================================== */

  const clearProductFilters = useCallback(() => {
    pos.setSearch("");
    setProductNameFilter("");
    setBrandFilter("");
    setCategoryFilter("");
  }, [pos.setSearch]);

  /* ==================================================
     CHECKOUT
  ================================================== */

  const handleCheckout = () => {
    setPageError("");

    pos.setError("");

    if (!branchId) {
      setPageError(
        "Please select an active branch before making a sale."
      );
      return;
    }

    const validationError = pos.validateCheckout();

    if (validationError) {
      pos.setError(validationError);
      return;
    }

    pos.setAmountPaid(pos.grandTotal.toFixed(2));

    setShowPaymentModal(true);
  };

  /* ==================================================
     COMPLETE SALE
  ================================================== */

  const handleCompleteSale = async (event) => {
    event.preventDefault();

    pos.setError("");

    setPageError("");

    if (!branchId) {
      pos.setError("No active branch is selected.");
      return;
    }

    if (!pos.cart.length) {
      pos.setError("Your cart is empty.");
      return;
    }

    if (!pos.paymentMethod) {
      pos.setError("Please select a payment method.");
      return;
    }

    const paid = Number(pos.amountPaid);

    if (!Number.isFinite(paid) || paid < 0) {
      pos.setError("Enter a valid payment amount.");
      return;
    }

    if (paid > pos.grandTotal) {
      pos.setError(
        "Amount paid cannot exceed the sale total."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        branch_id: Number(branchId),

        customer: pos.customerId || null,

        customer_name:
          pos.customerName.trim() || "Walk-in Customer",

        customer_phone: pos.customerPhone.trim() || "",

        items: pos.cart.map((item) => ({
          branch_id: Number(branchId),
          product: Number(item.productId),
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
        })),

        subtotal: Number(pos.subtotal.toFixed(2)),

        discount: Number(pos.discountAmount.toFixed(2)),

        tax_rate: pos.vatEnabled ? 18 : 0,

        tax_amount: Number(pos.vatAmount.toFixed(2)),

        total: Number(pos.grandTotal.toFixed(2)),

        amount_paid: Number(paid.toFixed(2)),

        payment_method: Number(pos.paymentMethod),

        payment_phone: pos.paymentPhone.trim() || "",

        transaction_reference:
          pos.transactionReference.trim() || "",
      };

      const response = await salesApi.create(payload);

      const sale =
        response?.data?.sale ??
        response?.data ??
        response?.sale ??
        response;

      setShowPaymentModal(false);

      setCompletedSale(sale);

      pos.clearCart();

      await refreshInventory();
    } catch (error) {
      console.error("Failed to complete sale:", error);

      pos.setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     CART ACTIONS
  ================================================== */

  const handleClearCart = () => {
    if (!pos.cart.length) {
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to clear all items from the cart?"
      )
    ) {
      pos.clearCart();
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);

    setShowPaymentModal(false);

    pos.clearCart();

    clearProductFilters();

    pos.setError("");

    setPageError("");
  };

  const cartCount = pos.cart.reduce(
    (count, item) =>
      count + Number(item.quantity || 0),
    0
  );

  const hasActiveFilters = Boolean(
    pos.search ||
      productNameFilter ||
      brandFilter ||
      categoryFilter
  );

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="container-fluid py-3">
      <POSHeader
        branch={branch}
        inventoryLoading={inventoryLoading}
      />

      {(pageError || pos.error) && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => {
            setPageError("");
            pos.setError("");
          }}
        >
          {pageError || pos.error}
        </Alert>
      )}

      {pos.success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => pos.setSuccess("")}
        >
          {pos.success}
        </Alert>
      )}

      {!branchId && (
        <Alert variant="warning">
          Select an active branch to enable checkout.
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7} xl={8}>
          {filtersLoading && (
            <div className="small text-muted mb-2">
              <Spinner
                animation="border"
                size="sm"
                className="me-2"
              />
              Loading brands and categories...
            </div>
          )}

          <ProductSearch
            search={pos.search}
            setSearch={pos.setSearch}
            products={products}
            brands={brands}
            categories={categories}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            productNameFilter={productNameFilter}
            setProductNameFilter={setProductNameFilter}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>
              <i className="bi bi-box-seam me-2" />
              Available Products
            </strong>

            <span className="badge bg-primary">
              {filteredProducts.length} / {products.length}
            </span>
          </div>

          {hasActiveFilters && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">
                Filters applied to your product list.
              </small>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={clearProductFilters}
              >
                <i className="bi bi-x-circle me-1" />
                Clear Filters
              </button>
            </div>
          )}

          {inventoryLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />

              <p className="text-muted mt-2">
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-search me-2" />
              No products match your search or selected
              filters. Try changing or clearing the filters.
            </Alert>
          ) : (
            <ProductGrid
              products={filteredProducts}
              loading={inventoryLoading}
              onAddToCart={pos.addToCart}
            />
          )}
        </Col>

        <Col lg={5} xl={4}>
          <CustomerForm
            customerName={pos.customerName}
            setCustomerName={pos.setCustomerName}
            customerPhone={pos.customerPhone}
            setCustomerPhone={pos.setCustomerPhone}
          />

          <div className="card shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>
                <i className="bi bi-cart3 me-2" />
                Shopping Cart
              </strong>

              <span className="badge bg-primary">
                {cartCount} items
              </span>
            </div>

            <div className="card-body p-2">
              <CartTable
                cart={pos.cart}
                onUpdateQuantity={pos.updateQuantity}
                onRemove={pos.removeFromCart}
              />
            </div>
          </div>

          <CartSummary
            subtotal={pos.subtotal}
            discount={pos.discount}
            setDiscount={pos.setDiscount}
            discountAmount={pos.discountAmount}
            vatEnabled={pos.vatEnabled}
            setVatEnabled={pos.setVatEnabled}
            vatAmount={pos.vatAmount}
            grandTotal={pos.grandTotal}
            paidAmount={pos.paidAmount}
            remaining={pos.remaining}
            cartCount={cartCount}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
            loading={loading}
          />
        </Col>
      </Row>

      <PaymentModal
        show={showPaymentModal}
        onHide={() => {
          if (!loading) {
            setShowPaymentModal(false);
          }
        }}
        paymentMethods={paymentMethods}
        paymentMethodsLoading={paymentMethodsLoading}
        paymentMethodsError={paymentMethodsError}
        paymentMethod={pos.paymentMethod}
        setPaymentMethod={pos.setPaymentMethod}
        selectedPaymentMethod={selectedPaymentMethod}
        amountPaid={pos.amountPaid}
        setAmountPaid={pos.setAmountPaid}
        paymentPhone={pos.paymentPhone}
        setPaymentPhone={pos.setPaymentPhone}
        transactionReference={pos.transactionReference}
        setTransactionReference={pos.setTransactionReference}
        customerName={pos.customerName}
        customerPhone={pos.customerPhone}
        subtotal={pos.subtotal}
        discountAmount={pos.discountAmount}
        vatAmount={pos.vatAmount}
        grandTotal={pos.grandTotal}
        change={pos.change}
        remaining={pos.remaining}
        error={pos.error}
        loading={loading}
        onSubmit={handleCompleteSale}
      />

      <SaleSuccessModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
        onNewSale={handleNewSale}
      />
    </div>
  );
};

export default POS;
