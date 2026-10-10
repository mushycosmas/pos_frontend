import React, { useMemo } from "react";
import { Card, Col, Row } from "react-bootstrap";

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const ProductStats = ({ products = [] }) => {
  const stats = useMemo(() => {
    const normalizedProducts = products.map((product) => {
      const stock = toNumber(
        product.current_stock ??
          product.stock_quantity ??
          product.stock ??
          product.quantity
      );

      const costPrice = toNumber(
        product.cost_price ?? product.costPrice
      );

      const minStock = toNumber(
        product.minimum_stock ??
          product.min_quantity ??
          product.min_stock ??
          product.minStock,
        5
      );

      return { stock, costPrice, minStock };
    });

    return {
      totalProducts: normalizedProducts.length,

      totalStock: normalizedProducts.reduce(
        (sum, product) => sum + product.stock,
        0
      ),

      inventoryValue: normalizedProducts.reduce(
        (sum, product) =>
          sum + product.stock * product.costPrice,
        0
      ),

      lowStockProducts: normalizedProducts.filter(
        (product) =>
          product.stock > 0 &&
          product.stock <= product.minStock
      ).length,

      outOfStockProducts: normalizedProducts.filter(
        (product) => product.stock <= 0
      ).length,
    };
  }, [products]);

  const formatNumber = (value) =>
    toNumber(value).toLocaleString("en-TZ", {
      maximumFractionDigits: 2,
    });

  const formatCurrency = (value) =>
    `TSh ${toNumber(value).toLocaleString("en-TZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cards = [
    {
      label: "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: "bi-box-seam",
      color: "primary",
    },
    {
      label: "Total Stock",
      value: formatNumber(stats.totalStock),
      icon: "bi-stack",
      color: "success",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(stats.inventoryValue),
      icon: "bi-currency-exchange",
      color: "info",
    },
    {
      label: "Low / Out of Stock",
      value: formatNumber(
        stats.lowStockProducts + stats.outOfStockProducts
      ),
      icon: "bi-exclamation-triangle",
      color: "danger",
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card) => (
        <Col xl={3} md={6} key={card.label}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center gap-2">
                <div>
                  <small className="text-muted">
                    {card.label}
                  </small>
                  <h4 className="mt-2 mb-0">{card.value}</h4>
                </div>

                <div
                  className={`text-${card.color} fs-3`}
                  aria-hidden="true"
                >
                  <i className={`bi ${card.icon}`} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductStats;