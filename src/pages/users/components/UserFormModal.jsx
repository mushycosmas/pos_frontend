
import React, { useState } from "react";

import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

const DEFAULT_PASSWORD = "ChangeMe@123";

export default function UserFormModal({
  show,
  onHide,
  editingUser,
  formData,
  onChange,
  onSubmit,
  saving,
  branches = [],
  branchesLoading,
  currentBranchId,
  error,
  roles = [],
}) {
  const [showPassword, setShowPassword] = useState(false);

  const branch = branches.find(
    (item) => String(item.id) === String(currentBranchId)
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    // Build the complete payload without waiting for React state updates.
    const payload = {
      ...formData,
      branch: currentBranchId,
    };

    // New users receive the default password.
    // Editing users keep their existing password unchanged.
    if (!editingUser) {
      payload.password = DEFAULT_PASSWORD;
    } else {
      delete payload.password;
    }

    // The parent handler must accept (event, payload).
    onSubmit(event, payload);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop={saving ? "static" : true}
      keyboard={!saving}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>
            {editingUser ? "Edit User" : "Add User"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row className="g-3">
            {/* Username */}
            <Col md={6}>
              <Form.Label>Username *</Form.Label>
              <Form.Control
                name="username"
                value={formData.username || ""}
                onChange={onChange}
                required
                disabled={!!editingUser || saving}
                autoComplete="off"
              />
            </Col>

            {/* Default Password */}
            {!editingUser && (
              <Col md={6}>
                <Form.Label>Default Password</Form.Label>

                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={DEFAULT_PASSWORD}
                    readOnly
                    autoComplete="new-password"
                    aria-label="Default user password"
                  />

                  <Button
                    variant="outline-secondary"
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <i
                      className={
                        showPassword
                          ? "bi bi-eye-slash"
                          : "bi bi-eye"
                      }
                    />
                  </Button>
                </InputGroup>

                <Form.Text className="text-warning">
                  Default password: ChangeMe@123. Ask the user to change
                  it after logging in.
                </Form.Text>
              </Col>
            )}

            {/* First Name */}
            <Col md={6}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="first_name"
                value={formData.first_name || ""}
                onChange={onChange}
                disabled={saving}
              />
            </Col>

            {/* Last Name */}
            <Col md={6}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="last_name"
                value={formData.last_name || ""}
                onChange={onChange}
                disabled={saving}
              />
            </Col>

            {/* Email */}
            <Col md={6}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={onChange}
                disabled={saving}
              />
            </Col>

            {/* Phone */}
            <Col md={6}>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone || ""}
                onChange={onChange}
                placeholder="2557XXXXXXXX"
                disabled={saving}
              />
            </Col>

            {/* Role */}
            <Col md={6}>
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="role"
                value={formData.role || ""}
                onChange={onChange}
                required
                disabled={saving}
              >
                <option value="">Select role</option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Current Branch */}
            <Col md={6}>
              <Form.Label>Current Branch *</Form.Label>

              <Form.Control
                readOnly
                value={
                  branchesLoading
                    ? "Loading branches..."
                    : branch?.name || ""
                }
                placeholder="Select a branch in the branch switcher"
              />

              {!currentBranchId && (
                <Form.Text className="text-danger">
                  Select a branch before creating or editing users.
                </Form.Text>
              )}
            </Col>

            {/* Active Status */}
            <Col md={12}>
              <Form.Check
                type="switch"
                name="is_active"
                id="user-active"
                label="User is active"
                checked={Boolean(formData.is_active)}
                onChange={onChange}
                disabled={saving}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            type="button"
            onClick={onHide}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="primary-button"
            disabled={
              saving ||
              branchesLoading ||
              !currentBranchId ||
              !roles.length
            }
          >
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : editingUser ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
