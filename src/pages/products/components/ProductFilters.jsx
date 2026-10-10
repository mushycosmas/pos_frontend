import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";

const ProductFilters = ({
  search,
  setSearch,
  brands,
  categories,
  brandFilter,
  setBrandFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onReset,
  resultCount,
}) => (
  <Card className="dashboard-card border-0 mb-4">
    <Card.Body>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
        <div>
          <h5 className="mb-1">Product List</h5>
          <small className="text-muted">
            {resultCount} product
            {resultCount !== 1 ? "s" : ""} displayed
          </small>
        </div>
      </div>

      <Row className="g-2">
        <Col lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search" />
            </InputGroup.Text>

            <Form.Control
              type="search"
              placeholder="Search product, SKU, barcode or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />

            {search && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <i className="bi bi-x-lg" />
              </Button>
            )}
          </InputGroup>
        </Col>

        <Col lg={2} md={4}>
          <Form.Select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            aria-label="Filter by brand"
          >
            <option value="all">All Brands</option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={4}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={2} md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            aria-label="Filter by stock status"
          >
            <option value="all">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </Form.Select>
        </Col>

        <Col lg={2}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={onReset}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Reset
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default ProductFilters;

