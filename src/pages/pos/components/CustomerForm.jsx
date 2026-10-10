
import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";

const CustomerForm = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
}) => (
  <Card className="shadow-sm mb-3">
    <Card.Body>
      <h6 className="mb-3">Customer Details</h6>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Customer Name</Form.Label>
            <Form.Control
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="Walk-in customer"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(event.target.value)
              }
              placeholder="Customer phone"
            />
          </Form.Group>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default CustomerForm;
