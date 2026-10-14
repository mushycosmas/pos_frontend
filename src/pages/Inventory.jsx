import React, { useMemo, useState } from "react";

import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useInventory } from "../context/InventoryContext";
import { useBranch } from "../context/BranchContext";

const Inventory = () => {
  const inventoryContext = useInventory();
  const branchContext = useBranch();

  const {
    products = [],
    categories = [],
    loading = false,
    error = null,
    refreshInventory,
    refreshProducts,
  } = inventoryContext;

  const { currentBranch } = branchContext;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // SAFE NUMBER
  // =====================================================

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    return toNumber(value).toLocaleString("en-TZ", {
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return `TSh ${toNumber(value).toLocaleString("en-TZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // NORMALIZE PRODUCT FIELDS
  // Supports Django snake_case and older camelCase data.
  // =====================================================

  const normalizeProduct = (product) => ({
    ...product,

    categoryId:
      product.categoryId ??
      product.category_id ??
      product.category?.id ??
      product.category ??
      null,

    costPrice: toNumber(
      product.cost_price ?? product.costPrice
    ),

    minStock: toNumber(
      product.minimum_stock ??
      product.min_quantity ??
      product.min_stock ??
      product.minStock ??
      5
    ),

    stock: toNumber(
      product.current_stock ??
      product.stock_quantity ??
      product.stock ??
      0
    ),
  });

  // =====================================================
  // CATEGORY LOOKUP
  // =====================================================

  const getCategory = (categoryId) => {
    if (
      categoryId === null ||
      categoryId === undefined
    ) {
      return null;
    }

    return categories.find(
      (category) =>
        Number(category.id) === Number(categoryId)
    );
  };

  // =====================================================
  // NORMALIZED PRODUCTS
  // =====================================================

  const inventoryProducts = useMemo(
    () => products.map(normalizeProduct),
    [products]
  );

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const totalProducts = inventoryProducts.length;

  const totalStock = inventoryProducts.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const stockValue = inventoryProducts.reduce(
    (sum, product) =>
      sum + product.stock * product.costPrice,
    0
  );

  const lowStock = inventoryProducts.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= product.minStock
  ).length;

  const outOfStock = inventoryProducts.filter(
    (product) => product.stock === 0
  ).length;

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventoryProducts.filter((product) => {
      const searchText = [
        product.name,
        product.sku,
        product.barcode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchText.includes(normalizedSearch);

      let matchesStatus = true;

      if (statusFilter === "in-stock") {
        matchesStatus =
          product.stock > product.minStock;
      } else if (statusFilter === "low-stock") {
        matchesStatus =
          product.stock > 0 &&
          product.stock <= product.minStock;
      } else if (statusFilter === "out-of-stock") {
        matchesStatus = product.stock === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [inventoryProducts, search, statusFilter]);

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (product) => {
    if (product.stock <= 0) {
      return {
        text: "Out of Stock",
        variant: "danger",
      };
    }

    if (product.stock <= product.minStock) {
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

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // =====================================================
  // REFRESH INVENTORY
  // =====================================================

  const handleRefresh = async () => {
    const refresh =
      refreshInventory || refreshProducts;

    if (typeof refresh === "function") {
      await refresh();
    }
  };

  
const toTitleCase = (value) => {
  if (!value) return "Unnamed Product";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="page-header d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2>Inventory</h2>

          <p className="text-muted mb-1">
            Monitor stock levels and inventory value.
          </p>

          {currentBranch && (
            <small className="text-muted">
              Branch:{" "}
              <strong>
                {currentBranch.name ||
                  currentBranch.branch_name ||
                  `Branch ${currentBranch.id}`}
              </strong>
            </small>
          )}
        </div>

        <Button
          variant="outline-secondary"
          onClick={handleRefresh}
          disabled={
            loading ||
            !(
              refreshInventory ||
              refreshProducts
            )
          }
        >
          <i className="bi bi-arrow-clockwise me-1" />

          Refresh
        </Button>
      </div>

      {/* ERROR */}

      {error && (
        <Alert variant="danger" dismissible>
          {typeof error === "string"
            ? error
            : error.message || "Unable to load inventory."}
        </Alert>
      )}

      {/* INVENTORY STATISTICS */}

      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Total Products
                  </small>

                  <h4 className="mt-2 mb-0">
                    {formatNumber(totalProducts)}
                  </h4>
                </div>

                <div className="stat-icon">
                  <i className="bi bi-box-seam" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Total Stock
                  </small>

                  <h4 className="mt-2 mb-0">
                    {formatNumber(totalStock)}
                  </h4>
                </div>

                <div className="stat-icon">
                  <i className="bi bi-stack" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Stock Value
                  </small>

                  <h4 className="mt-2 mb-0">
                    {formatCurrency(stockValue)}
                  </h4>
                </div>

                <div className="stat-icon">
                  <i className="bi bi-cash-stack" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Low / Out of Stock
                  </small>

                  <h4 className="mt-2 mb-0 text-danger">
                    {formatNumber(
                      lowStock + outOfStock
                    )}
                  </h4>
                </div>

                <div className="stat-icon text-danger">
                  <i className="bi bi-exclamation-triangle" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* STOCK TABLE */}

      <Card className="dashboard-card border-0">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="mb-1">
                Stock Overview
              </h5>

              <small className="text-muted">
                Manage and monitor current inventory.
              </small>
            </div>

            <Badge bg="secondary">
              {formatNumber(filteredProducts.length)} items
            </Badge>
          </div>

          {/* FILTERS */}

          <Row className="g-2 mb-4">
            <Col md={7}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search product, barcode or SKU..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter inventory by stock status"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                Reset
              </Button>
            </Col>
          </Row>

          {/* TABLE */}

          <Table
            hover
            responsive
            className="align-middle"
          >
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>MIN STOCK</th>
                <th>COST</th>
                <th>STOCK VALUE</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />

                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-5"
                  >
                    <div className="text-muted">
                      <i
                        className="bi bi-box-seam"
                        style={{ fontSize: "35px" }}
                      />

                      <div className="mt-2">
                        No inventory items found.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  const productStockValue =
                    product.stock * product.costPrice;

                  const category = getCategory(
                    product.categoryId
                  );

                  return (
                    <tr key={product.id}>
                      {/* PRODUCT */}

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="stock-icon">
                            <i className="bi bi-box" />
                          </div>

                          <div>
                            <strong>
                            {toTitleCase(
                              product.name ?? product.product_name
                            )}
                          </strong>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}

                      <td>
                        <span className="text-muted">
                          {product.sku || "-"}
                        </span>
                      </td>

                      {/* CATEGORY */}

                      <td>
                        {category?.name ||
                          product.category_name ||
                          "-"}
                      </td>

                      {/* STOCK */}

                      <td>
                        <strong>
                          {formatNumber(product.stock)}
                        </strong>
                      </td>

                      {/* MINIMUM STOCK */}

                      <td>
                        {formatNumber(product.minStock)}
                      </td>

                      {/* COST PRICE */}

                      <td>
                        {formatCurrency(product.costPrice)}
                      </td>

                      {/* STOCK VALUE */}

                      <td>
                        <strong>
                          {formatCurrency(productStockValue)}
                        </strong>
                      </td>

                      {/* STATUS */}

                      <td>
                        <Badge bg={status.variant}>
                          {status.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Inventory;

