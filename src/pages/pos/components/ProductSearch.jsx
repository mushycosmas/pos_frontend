
import React, { useMemo } from "react";
import {
  Col,
  Form,
  InputGroup,
  Row,
  Button,
} from "react-bootstrap";

/* ==================================================
   GENERAL HELPERS
================================================== */

const toText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalizeText = (value) =>
  toText(value).toLocaleLowerCase();

const getFirstValue = (...values) =>
  values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

const getName = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return toText(
      getFirstValue(
        value.name,
        value.brand_name,
        value.brandName,
        value.category_name,
        value.categoryName,
        value.display_name,
        value.label,
        value.title,
        value.product_name
      ) ?? ""
    );
  }

  const text = toText(value);
  return /^\d+$/.test(text) ? "" : text;
};

const getId = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    const id = getFirstValue(
      value.id,
      value.pk,
      value.brand_id,
      value.category_id,
      value.brandId,
      value.categoryId
    );

    return id === undefined ? "" : toText(id);
  }

  const text = toText(value);
  return /^\d+$/.test(text) ? text : "";
};

/* ==================================================
   NORMALIZE BRAND AND CATEGORY OPTIONS
================================================== */

const normalizeOptions = (items = []) => {
  if (!Array.isArray(items)) return [];

  const options = new Map();

  items.forEach((item) => {
    const name = getName(item);
    const id = getId(item);

    if (!name) return;

    const value = id || name;
    const key = normalizeText(value);

    if (!options.has(key)) {
      options.set(key, { id, name, value });
    }
  });

  return [...options.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/* ==================================================
   PRODUCT BRAND AND CATEGORY HELPERS
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
  ];

  for (const candidate of candidates) {
    const id = getId(candidate);
    if (id) return id;
  }

  return "";
};

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
  ];

  for (const candidate of candidates) {
    const id = getId(candidate);
    if (id) return id;
  }

  return "";
};

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
  ];

  for (const candidate of candidates) {
    const name = getName(candidate);
    if (name) return name;
  }

  return "";
};

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
  ];

  for (const candidate of candidates) {
    const name = getName(candidate);
    if (name) return name;
  }

  return "";
};

const getProductName = (product) =>
  toText(
    getFirstValue(
      product?.name,
      product?.product_name,
      product?.productName,
      product?.rawProduct?.name,
      product?.raw?.name
    ) ?? ""
  );

const getProductSku = (product) =>
  toText(
    getFirstValue(
      product?.sku,
      product?.product_sku,
      product?.productSku,
      product?.rawProduct?.sku,
      product?.raw?.sku
    ) ?? ""
  );

const getProductBarcode = (product) =>
  toText(
    getFirstValue(
      product?.barcode,
      product?.bar_code,
      product?.barcode_number,
      product?.rawProduct?.barcode,
      product?.raw?.barcode
    ) ?? ""
  );

/* ==================================================
   COMPONENT
================================================== */

const ProductSearch = ({
  search = "",
  setSearch = () => {},
  products = [],
  brands: suppliedBrands = [],
  categories: suppliedCategories = [],
  brandFilter = "",
  setBrandFilter = () => {},
  categoryFilter = "",
  setCategoryFilter = () => {},
  productNameFilter = "",
  setProductNameFilter = () => {},
}) => {
  const safeProducts = Array.isArray(products)
    ? products
    : [];

  const safeBrands = Array.isArray(suppliedBrands)
    ? suppliedBrands
    : [];

  const safeCategories = Array.isArray(suppliedCategories)
    ? suppliedCategories
    : [];

  /* -----------------------------------------------
     BRAND OPTIONS
  ----------------------------------------------- */

  const brands = useMemo(() => {
    const apiOptions = normalizeOptions(safeBrands);

    if (apiOptions.length) return apiOptions;

    const unique = new Map();

    safeProducts.forEach((product) => {
      const id = getProductBrandId(product);
      const name = getProductBrandName(product);

      if (!name) return;

      const value = id || name;
      const key = normalizeText(value);

      if (!unique.has(key)) {
        unique.set(key, { id, name, value });
      }
    });

    return [...unique.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [safeBrands, safeProducts]);

  /* -----------------------------------------------
     CATEGORY OPTIONS
  ----------------------------------------------- */

  const categories = useMemo(() => {
    const apiOptions = normalizeOptions(safeCategories);

    if (apiOptions.length) return apiOptions;

    const unique = new Map();

    safeProducts.forEach((product) => {
      const id = getProductCategoryId(product);
      const name = getProductCategoryName(product);

      if (!name) return;

      const value = id || name;
      const key = normalizeText(value);

      if (!unique.has(key)) {
        unique.set(key, { id, name, value });
      }
    });

    return [...unique.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [safeCategories, safeProducts]);

  /* -----------------------------------------------
     SELECTED OPTIONS
  ----------------------------------------------- */

  const selectedBrand = brands.find(
    (brand) =>
      normalizeText(brand.value) === normalizeText(brandFilter)
  );

  const selectedCategory = categories.find(
    (category) =>
      normalizeText(category.value) ===
      normalizeText(categoryFilter)
  );

  /* -----------------------------------------------
     CLEAR FILTERS
  ----------------------------------------------- */

  const clearFilters = () => {
    setSearch("");
    setProductNameFilter("");
    setBrandFilter("");
    setCategoryFilter("");
  };

  const hasActiveFilters = Boolean(
    search ||
    productNameFilter ||
    brandFilter ||
    categoryFilter
  );

  /* -----------------------------------------------
     RENDER
  ----------------------------------------------- */

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <strong>
          <i className="bi bi-funnel me-2" />
          Find Products
        </strong>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={clearFilters}
          >
            <i className="bi bi-x-circle me-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="card-body">
        <Row className="g-3">
          {/* PRODUCT NAME */}

          <Col md={6}>
            <Form.Label>Product Name</Form.Label>

            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-box-seam" />
              </InputGroup.Text>

              <Form.Control
                type="text"
                value={productNameFilter}
                onChange={(event) =>
                  setProductNameFilter(event.target.value)
                }
                placeholder="Enter product name..."
                aria-label="Filter by product name"
              />

              {productNameFilter && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setProductNameFilter("")}
                  title="Clear product name"
                  aria-label="Clear product name"
                >
                  <i className="bi bi-x" />
                </Button>
              )}
            </InputGroup>
          </Col>

          {/* SKU / BARCODE */}

          <Col md={6}>
            <Form.Label>SKU / Barcode</Form.Label>

            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-upc-scan" />
              </InputGroup.Text>

              <Form.Control
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search SKU or barcode..."
                aria-label="Search by SKU or barcode"
              />

              {search && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setSearch("")}
                  title="Clear SKU or barcode"
                  aria-label="Clear SKU or barcode"
                >
                  <i className="bi bi-x" />
                </Button>
              )}
            </InputGroup>
          </Col>

          {/* BRAND */}

          <Col md={6}>
            <Form.Label>Brand</Form.Label>

            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-tags" />
              </InputGroup.Text>

              <Form.Select
                value={brandFilter}
                onChange={(event) =>
                  setBrandFilter(event.target.value)
                }
                aria-label="Filter products by brand"
              >
                <option value="">All Brands</option>

                {brands.map((brand) => (
                  <option
                    key={brand.value}
                    value={brand.value}
                  >
                    {brand.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>

          {/* CATEGORY */}

          <Col md={6}>
            <Form.Label>Category</Form.Label>

            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-grid" />
              </InputGroup.Text>

              <Form.Select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                aria-label="Filter products by category"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>

        {/* ACTIVE FILTER SUMMARY: NAMES ONLY */}

        {hasActiveFilters && (
          <div className="d-flex flex-wrap gap-2 mt-3">
            {productNameFilter && (
              <span className="badge bg-light text-dark border">
                Name: {productNameFilter}
              </span>
            )}

            {search && (
              <span className="badge bg-light text-dark border">
                SKU / Barcode: {search}
              </span>
            )}

            {brandFilter && (
              <span className="badge bg-light text-dark border">
                Brand: {selectedBrand?.name || brandFilter}
              </span>
            )}

            {categoryFilter && (
              <span className="badge bg-light text-dark border">
                Category: {selectedCategory?.name || categoryFilter}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
