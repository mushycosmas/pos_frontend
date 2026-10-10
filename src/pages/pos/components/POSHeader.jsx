
import React from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";

const POSHeader = ({ branch, inventoryLoading }) => (
  <Card className="mb-3 shadow-sm border-0">
    <Card.Body>
      <Row className="align-items-center g-3">
        <Col>
          <h4 className="mb-1">Point of Sale</h4>
          <div className="text-muted small">
            Product sales, payments and receipts
          </div>
        </Col>

        <Col xs="auto" className="text-end">
          <div className="small text-muted">Active branch</div>
          <Badge bg={branch ? "primary" : "danger"}>
            {branch?.name ?? "No branch selected"}
          </Badge>

          {inventoryLoading && (
            <div className="small text-muted mt-1">
              Loading inventory...
            </div>
          )}
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default POSHeader;
