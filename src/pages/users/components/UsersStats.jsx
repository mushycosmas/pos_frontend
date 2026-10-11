import React from "react";
import { Card, Col, Row } from "react-bootstrap";

export default function UsersStats({ totalUsers, users }) {
  const active = users.filter((user) => user.is_active).length;
  const inactive = users.filter((user) => !user.is_active).length;

  const items = [
    { label: "Total Users", value: totalUsers, icon: "bi-people", color: "" },
    { label: "Active Users", value: active, icon: "bi-person-check", color: "text-success" },
    { label: "Inactive Users", value: inactive, icon: "bi-person-x", color: "text-danger" },
  ];

  return (
    <Row className="g-3 mb-4">
      {items.map((item) => (
        <Col md={4} key={item.label}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">{item.label}</small>
                <h3 className="mb-0 mt-1">{item.value}</h3>
              </div>
              <i className={`bi ${item.icon} fs-2 ${item.color}`} />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}