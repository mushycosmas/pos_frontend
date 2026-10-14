import React from "react";
import { Card, Col, Row } from "react-bootstrap";

const ProductStats = ({
  totalProducts = 0,
  totalStock = 0,
  inventoryValue = 0,
  sellingValue = 0,
  lowStockProducts = 0,
  outOfStockProducts = 0,
  formatNumber,
  formatCurrency,
}) => {
  const number = (value) =>
    typeof formatNumber === "function"
      ? formatNumber(value)
      : Number(value || 0).toLocaleString("en-TZ");

  const currency = (value) =>
    typeof formatCurrency === "function"
      ? formatCurrency(value)
      : `TSh ${Number(value || 0).toLocaleString("en-TZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const cards = [
    {
      label: "Total Products",
      value: number(totalProducts),
      icon: "bi-box-seam",
      color: "primary",
    },
    {
      label: "Total Stock",
      value: number(totalStock),
      icon: "bi-stack",
      color: "success",
    },
    {
      label: "Inventory Value",
      value: currency(inventoryValue),
      icon: "bi-currency-exchange",
      color: "info",
    },
    {
      label: "Low / Out of Stock",
      value: number(lowStockProducts + outOfStockProducts),
      icon: "bi-exclamation-triangle",
      color: "danger",
    },
    {
  label: "Potential Selling Value",
  value: currency(sellingValue),
  icon: "bi-cash-stack",
  color: "success",
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
                  <h4 className="mt-2 mb-0">
                    {card.value}
                  </h4>
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