import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Card,
  Alert,
} from "react-bootstrap";

// =========================================================
// OWNER / ADMINISTRATOR FORM
// =========================================================

const OwnerForm = ({
  formData = {},
  setFormData,
  errors = {},
  disabled = false,
}) => {
  // =======================================================
  // PASSWORD VISIBILITY
  // =======================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(false);

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (typeof setFormData === "function") {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="d-flex align-items-center mb-4">

          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
            style={{
              width: "46px",
              height: "46px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "22px",
                lineHeight: 1,
              }}
            >
              👤
            </span>
          </div>

          <div>
            <h5 className="mb-1 fw-semibold">
              Administrator Account
            </h5>

            <p className="text-muted mb-0 small">
              Create the first administrator account
              for your company.
            </p>
          </div>

        </div>

        {/* =================================================
            ADMINISTRATOR INFORMATION
        ================================================== */}

        <Alert
          variant="info"
          className="mb-4"
        >
          <div className="d-flex">

            <div
              className="me-3"
              style={{
                fontSize: "20px",
              }}
            >
              ℹ️
            </div>

            <div>
              <div className="fw-semibold">
                Administrator Access
              </div>

              <div className="small mt-1">
                This account will be the first
                administrator of your company and
                will have full access to the POS
                system.
              </div>
            </div>

          </div>
        </Alert>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================== */}

        <h6 className="fw-semibold mb-3">
          Personal Information
        </h6>

        <Row className="g-3">

          {/* First Name */}
          <Col md={6}>
            <Form.Group controlId="owner-first-name">

              <Form.Label>
                First Name{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <Form.Control
                type="text"
                name="first_name"
                placeholder="Enter first name"
                value={
                  formData.first_name || ""
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={
                  !!errors.first_name
                }
                autoComplete="given-name"
              />

              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>

            </Form.Group>
          </Col>

          {/* Last Name */}
          <Col md={6}>
            <Form.Group controlId="owner-last-name">

              <Form.Label>
                Last Name{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <Form.Control
                type="text"
                name="last_name"
                placeholder="Enter last name"
                value={
                  formData.last_name || ""
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={
                  !!errors.last_name
                }
                autoComplete="family-name"
              />

              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>

            </Form.Group>
          </Col>

          {/* Phone */}
          <Col md={6}>
            <Form.Group controlId="owner-phone">

              <Form.Label>
                Phone Number
              </Form.Label>

              <Form.Control
                type="tel"
                name="phone"
                placeholder="e.g. 0712345678"
                value={
                  formData.phone || ""
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={
                  !!errors.phone
                }
                autoComplete="tel"
              />

              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>

              <Form.Text className="text-muted">
                Optional
              </Form.Text>

            </Form.Group>
          </Col>

          {/* Email */}
          <Col md={6}>
            <Form.Group controlId="owner-email">

              <Form.Label>
                Email{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <Form.Control
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={
                  formData.email || ""
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={
                  !!errors.email
                }
                autoComplete="email"
              />

              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>

            </Form.Group>
          </Col>

        </Row>

        {/* =================================================
            LOGIN INFORMATION
        ================================================== */}

        <h6 className="fw-semibold mb-3 mt-4">
          Login Information
        </h6>

        <Row className="g-3">

          {/* Username */}
          <Col md={12}>
            <Form.Group controlId="owner-username">

              <Form.Label>
                Username{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                value={
                  formData.username || ""
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={
                  !!errors.username
                }
                autoComplete="username"
              />

              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>

              <Form.Text className="text-muted">
                This username will be used to log
                into the POS system.
              </Form.Text>

            </Form.Group>
          </Col>

          {/* Password */}
          <Col md={6}>
            <Form.Group controlId="owner-password">

              <Form.Label>
                Password{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <div className="input-group">

                <Form.Control
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter password"
                  value={
                    formData.password || ""
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={
                    !!errors.password
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={disabled}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

                {errors.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}

              </div>

              <Form.Text className="text-muted">
                Minimum 8 characters.
              </Form.Text>

            </Form.Group>
          </Col>

          {/* Password Confirmation */}
          <Col md={6}>
            <Form.Group
              controlId="owner-password-confirmation"
            >

              <Form.Label>
                Confirm Password{" "}
                <span className="text-danger">
                  *
                </span>
              </Form.Label>

              <div className="input-group">

                <Form.Control
                  type={
                    showPasswordConfirmation
                      ? "text"
                      : "password"
                  }
                  name="password_confirmation"
                  placeholder="Confirm password"
                  value={
                    formData.password_confirmation ||
                    ""
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={
                    !!errors.password_confirmation
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPasswordConfirmation(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={disabled}
                  aria-label={
                    showPasswordConfirmation
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {showPasswordConfirmation
                    ? "Hide"
                    : "Show"}
                </button>

                {errors.password_confirmation && (
                  <div className="invalid-feedback d-block">
                    {
                      errors.password_confirmation
                    }
                  </div>
                )}

              </div>

            </Form.Group>
          </Col>

        </Row>

        {/* =================================================
            SECURITY INFORMATION
        ================================================== */}

        <Alert
          variant="light"
          className="border mt-4 mb-0"
        >
          <div className="d-flex">

            <div
              className="me-3"
              style={{
                fontSize: "20px",
              }}
            >
              🔐
            </div>

            <div>

              <div className="fw-semibold">
                Keep your account secure
              </div>

              <div className="small text-muted mt-1">
                Use a strong password and do not
                share your administrator login
                credentials with other users.
              </div>

            </div>

          </div>
        </Alert>

      </Card.Body>
    </Card>
  );
};

// =========================================================
// EXPORT
// =========================================================

export default OwnerForm;