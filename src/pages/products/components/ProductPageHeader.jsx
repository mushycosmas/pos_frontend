
import React from "react";
import { Button } from "react-bootstrap";

const ProductPageHeader = ({ onAddProduct }) => (
  <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
    <div>
      <h2>Products</h2>
      <p className="mb-0">
        Manage your products, pricing and stock.
      </p>
    </div>

    <Button variant="primary" onClick={onAddProduct}>
      <i className="bi bi-plus-lg me-2" />
      Add Product
    </Button>
  </div>
);

export default ProductPageHeader;

