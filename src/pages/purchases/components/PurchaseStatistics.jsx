
import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { formatCurrency } from "./utils/purchaseUtils";

const PurchaseStatistics = ({ statistics }) => {
  const cards = [
    {
      label: "Total Purchases",
      value: statistics.totalPurchases.toLocaleString("en-TZ"),
    },
    {
      label: "Purchase Value",
      value: formatCurrency(statistics.totalPurchaseValue),
    },
    {
      label: "Items Purchased",
      value: statistics.totalItemsPurchased.toLocaleString("en-TZ"),
    },
    {
      label: "Received Purchases",
      value: statistics.receivedPurchases.toLocaleString("en-TZ"),
      valueClass: "text-success",
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((item) => (
        <Col xl={3} md={6} key={item.label}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">{item.label}</small>
              <h4 className={`mt-2 mb-0 ${item.valueClass || ""}`}>
                {item.value}
              </h4>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PurchaseStatistics;
