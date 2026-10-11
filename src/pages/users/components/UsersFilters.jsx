import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

export default function UsersFilters({
  search, setSearch,
  roleFilter, setRoleFilter,
  statusFilter, setStatusFilter,
  setPage, clearFilters, roles = [],
}) {
  return (
    <Row className="g-3 mb-4">
      <Col md={5}>
        <Form.Label>Search</Form.Label>
        <Form.Control
          placeholder="Search username, name, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Col>

      <Col md={3}>
        <Form.Label>Role</Form.Label>
        <Form.Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Label>Status</Form.Label>
        <Form.Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Form.Select>
      </Col>

      <Col md={2} className="d-flex align-items-end">
        <Button variant="outline-secondary" className="w-100" onClick={clearFilters}>
          <i className="bi bi-arrow-counterclockwise me-2" />
          Reset
        </Button>
      </Col>
    </Row>
  );
}