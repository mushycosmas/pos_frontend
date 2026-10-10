
import React from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  formatMoney,
  getProductId,
  getProductName,
  getProductSku,
  getSellingPrice,
  getStock,
} from "../utils/posHelpers";

const ProductGrid = ({
  products,
  loading,
  onAddToCart,
}) => {
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <div className="mt-2">Loading products...</div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-muted text-center p-4">
        No products found.
      </div>
    );
  }

  return (
    <Row className="g-3">
      {products.map((product) => {
        const id = getProductId(product);
        const stock = getStock(product);
        const name = getProductName(product);
        const price = getSellingPrice(product);
        const sku = getProductSku(product);

        return (
          <Col key={id} xs={6} md={6} xl={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="fw-semibold">{name}</div>

                <div className="text-muted small mb-2">
                  SKU: {sku || "-"}
                </div>

                <h6 className="mb-2">
                  {formatMoney(price)}
                </h6>

                <div className="mb-3">
                  <Badge bg={stock > 0 ? "success" : "danger"}>
                    Stock: {stock}
                  </Badge>
                </div>

                <Button
                  className="mt-auto"
                  size="sm"
                  disabled={stock <= 0}
                  onClick={() => onAddToCart(product)}
                >
                  <i className="bi bi-plus-lg me-1" />
                  Add to cart
                </Button>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ProductGrid;
