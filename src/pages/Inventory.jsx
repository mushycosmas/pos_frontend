import React from "react";

import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";

import { useInventory } from "../context/InventoryContext";

const Inventory = () => {
  const {
    products = [],
    categories = [],
  } = useInventory();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // =====================================================
  // SAFE NUMBER
  // =====================================================

  const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    return toNumber(value).toLocaleString("en-TZ");
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return `TSh ${formatNumber(value)}`;
  };

  // =====================================================
  // GET CATEGORY
  // =====================================================

  const getCategory = (id) => {
    return categories.find(
      (category) =>
        Number(category.id) === Number(id)
    );
  };

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + toNumber(product.stock),
    0
  );

  const stockValue = products.reduce(
    (sum, product) => {
      const stock = toNumber(product.stock);
      const costPrice = toNumber(product.costPrice);

      return sum + stock * costPrice;
    },
    0
  );

  const lowStock = products.filter((product) => {
    const stock = toNumber(product.stock);
    const minStock = toNumber(product.minStock);

    return stock > 0 && stock <= minStock;
  }).length;

  const outOfStock = products.filter((product) => {
    return toNumber(product.stock) === 0;
  }).length;

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter((product) => {
    const stock = toNumber(product.stock);
    const minStock = toNumber(product.minStock);

    const searchText =
      `${product.name || ""} ${product.sku || ""}`
        .toLowerCase();

    const matchesSearch =
      searchText.includes(
        search.toLowerCase()
      );

    let matchesStatus = true;

    if (statusFilter === "in-stock") {
      matchesStatus = stock > minStock;
    }

    if (statusFilter === "low-stock") {
      matchesStatus =
        stock > 0 &&
        stock <= minStock;
    }

    if (statusFilter === "out-of-stock") {
      matchesStatus = stock === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (product) => {
    const stock = toNumber(product.stock);
    const minStock = toNumber(product.minStock);

    if (stock === 0) {
      return {
        text: "Out of Stock",
        variant: "danger",
      };
    }

    if (stock <= minStock) {
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

  return (
    <div>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h2>Inventory</h2>

          <p>
            Monitor stock levels and inventory value.
          </p>
        </div>

      </div>


      {/* =====================================================
          INVENTORY STATISTICS
      ===================================================== */}

      <Row className="g-3 mb-4">

        {/* TOTAL PRODUCTS */}

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
                  <i className="bi bi-box-seam"></i>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* TOTAL STOCK */}

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
                  <i className="bi bi-stack"></i>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* STOCK VALUE */}

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
                  <i className="bi bi-cash-stack"></i>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* LOW STOCK */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0 h-100">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <small className="text-muted">
                    Low / Out Stock
                  </small>

                  <h4 className="mt-2 mb-0 text-danger">
                    {formatNumber(
                      lowStock + outOfStock
                    )}
                  </h4>
                </div>

                <div className="stat-icon text-danger">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          STOCK TABLE
      ===================================================== */}

      <Card className="dashboard-card border-0">

        <Card.Body>

          {/* TABLE HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="mb-1">
                Stock Overview
              </h5>

              <small className="text-muted">
                Manage and monitor your current inventory.
              </small>

            </div>

          </div>


          {/* =====================================================
              FILTERS
          ===================================================== */}

          <Row className="g-2 mb-4">

            <Col md={7}>

              <InputGroup>

                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search product or SKU..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </InputGroup>

            </Col>


            <Col md={3}>

              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
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
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >

                <i className="bi bi-arrow-clockwise me-1"></i>

                Reset

              </Button>

            </Col>

          </Row>


          {/* =====================================================
              TABLE
          ===================================================== */}

          <Table
            hover
            responsive
            className="align-middle"
          >

            <thead>

              <tr>

                <th>
                  PRODUCT
                </th>

                <th>
                  SKU
                </th>

                <th>
                  CATEGORY
                </th>

                <th>
                  STOCK
                </th>

                <th>
                  MIN STOCK
                </th>

                <th>
                  COST
                </th>

                <th>
                  STOCK VALUE
                </th>

                <th>
                  STATUS
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-5"
                  >

                    <div className="text-muted">

                      <i
                        className="bi bi-box-seam"
                        style={{
                          fontSize: "35px",
                        }}
                      ></i>

                      <div className="mt-2">
                        No inventory items found.
                      </div>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredProducts.map((product) => {

                  const stock =
                    toNumber(product.stock);

                  const minStock =
                    toNumber(product.minStock);

                  const costPrice =
                    toNumber(product.costPrice);

                  const stockValue =
                    stock * costPrice;

                  const category =
                    getCategory(
                      product.categoryId
                    );

                  const status =
                    getStockStatus(product);

                  return (

                    <tr
                      key={product.id}
                    >

                      {/* PRODUCT */}

                      <td>

                        <div className="d-flex align-items-center gap-2">

                          <div className="stock-icon">

                            <i className="bi bi-box"></i>

                          </div>

                          <div>

                            <strong>
                              {product.name ||
                                "Unnamed Product"}
                            </strong>

                          </div>

                        </div>

                      </td>


                      {/* SKU */}

                      <td>

                        <span className="text-muted">

                          {product.sku ||
                            "-"}

                        </span>

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {category?.name || "-"}

                      </td>


                      {/* STOCK */}

                      <td>

                        <strong>
                          {formatNumber(stock)}
                        </strong>

                      </td>


                      {/* MIN STOCK */}

                      <td>

                        {formatNumber(
                          minStock
                        )}

                      </td>


                      {/* COST */}

                      <td>

                        {formatCurrency(
                          costPrice
                        )}

                      </td>


                      {/* STOCK VALUE */}

                      <td>

                        <strong>
                          {formatCurrency(
                            stockValue
                          )}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <Badge
                          bg={status.variant}
                        >

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