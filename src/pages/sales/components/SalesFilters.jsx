import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";

const SalesFilters = (props) => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    onClear,
  } = props;

  return (
    <Card className="dashboard-card border-0 mb-4">
      <Card.Body>
        <Row className="g-3">
          {/* Search */}
          <Col xl={4} lg={6}>
            <Form.Label>Search</Form.Label>

            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>

              <Form.Control
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice, customer, branch, sold by..."
              />
            </InputGroup>
          </Col>

          {/* Sale Status */}
          <Col xl={2} lg={3}>
            <Form.Label>Status</Form.Label>

            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </Form.Select>
          </Col>

          {/* Payment Status */}
          <Col xl={2} lg={3}>
            <Form.Label>Payment</Form.Label>

            <Form.Select
              value={paymentStatusFilter}
              onChange={(e) =>
                setPaymentStatusFilter(e.target.value)
              }
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
              <option value="UNPAID">Unpaid</option>
            </Form.Select>
          </Col>

          {/* Start Date */}
          <Col xl={2} lg={3}>
            <Form.Label>From</Form.Label>

            <Form.Control
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Col>

          {/* End Date */}
          <Col xl={2} lg={3}>
            <Form.Label>To</Form.Label>

            <Form.Control
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Col>

          {/* Clear Filters */}
          <Col xs={12} className="d-flex justify-content-end">
            <Button
              type="button"
              variant="light"
              onClick={onClear}
            >
              <i className="bi bi-x-circle me-2"></i>
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SalesFilters;
