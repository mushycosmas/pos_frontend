import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  Eye,
  EyeSlash,
  Lock,
  Person,
} from "react-bootstrap-icons";

import authApi from "../services/auth";

// ============================================================
// LOGIN PAGE
// ============================================================

const Login = () => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear previous error when user starts typing again
    if (error) {
      setError("");
    }
  };

  // ==========================================================
  // GET BACKEND ERROR MESSAGE
  // ==========================================================

  const getErrorMessage = (err) => {
    const responseData = err?.response?.data;

    // --------------------------------------------
    // Backend detail
    // --------------------------------------------

    if (responseData?.detail) {
      return Array.isArray(responseData.detail)
        ? responseData.detail[0]
        : responseData.detail;
    }

    // --------------------------------------------
    // Non-field errors
    // --------------------------------------------

    if (responseData?.non_field_errors) {
      return Array.isArray(responseData.non_field_errors)
        ? responseData.non_field_errors[0]
        : responseData.non_field_errors;
    }

    // --------------------------------------------
    // Username validation error
    // --------------------------------------------

    if (responseData?.username) {
      return Array.isArray(responseData.username)
        ? responseData.username[0]
        : responseData.username;
    }

    // --------------------------------------------
    // Password validation error
    // --------------------------------------------

    if (responseData?.password) {
      return Array.isArray(responseData.password)
        ? responseData.password[0]
        : responseData.password;
    }

    // --------------------------------------------
    // Account inactive
    // --------------------------------------------

    if (responseData?.is_active) {
      return Array.isArray(responseData.is_active)
        ? responseData.is_active[0]
        : responseData.is_active;
    }

    // --------------------------------------------
    // HTTP status errors
    // --------------------------------------------

    if (err?.response?.status === 401) {
      return "Invalid username or password.";
    }

    if (err?.response?.status === 403) {
      return "You are not authorized to access the system.";
    }

    if (err?.response?.status === 404) {
      return "Login service was not found. Please contact the administrator.";
    }

    if (err?.response?.status >= 500) {
      return "Server error. Please try again later.";
    }

    // --------------------------------------------
    // Network error
    // --------------------------------------------

    if (err?.request && !err?.response) {
      return "Unable to connect to the server. Please check your connection.";
    }

    // --------------------------------------------
    // Default
    // --------------------------------------------

    return "Unable to sign in. Please check your credentials and try again.";
  };

  // ==========================================================
  // HANDLE LOGIN
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error
    setError("");

    // --------------------------------------------
    // Validate username
    // --------------------------------------------

    const username = formData.username.trim();

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    // --------------------------------------------
    // Validate password
    // --------------------------------------------

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // ------------------------------------------
      // Authenticate user
      // ------------------------------------------

      await authApi.login(
        {
          username,
          password: formData.password,
        },
        rememberMe
      );

      // ------------------------------------------
      // Login successful
      // ------------------------------------------

      window.location.replace("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // TOGGLE PASSWORD VISIBILITY
  // ==========================================================

  const handleTogglePassword = () => {
    setShowPassword((previous) => !previous);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)",
        padding: "20px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col
            xs={12}
            sm={10}
            md={7}
            lg={5}
            xl={4}
          >
            {/* ==================================================
                LOGIN CARD
            ================================================== */}

            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                className="text-center text-white p-4"
                style={{
                  background:
                    "linear-gradient(135deg, #0d6efd, #084298)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background:
                      "rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <Lock size={30} />
                </div>

                <h3 className="fw-bold mb-1">
                  POS System
                </h3>

                <p className="mb-0 opacity-75">
                  Sign in to your account
                </p>
              </div>

              {/* =================================================
                  LOGIN BODY
              ================================================= */}

              <Card.Body className="p-4 p-md-5">
                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError("")}
                    className="small"
                  >
                    {error}
                  </Alert>
                )}

                {/* =================================================
                    LOGIN FORM
                ================================================= */}

                <Form
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* =================================================
                      USERNAME
                  ================================================= */}

                  <Form.Group
                    className="mb-3"
                    controlId="loginUsername"
                  >
                    <Form.Label className="fw-semibold">
                      Username
                    </Form.Label>

                    <InputGroup>
                      <InputGroup.Text>
                        <Person size={18} />
                      </InputGroup.Text>

                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        autoFocus
                        disabled={loading}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <Form.Group
                    className="mb-3"
                    controlId="loginPassword"
                  >
                    <Form.Label className="fw-semibold">
                      Password
                    </Form.Label>

                    <InputGroup>
                      <InputGroup.Text>
                        <Lock size={18} />
                      </InputGroup.Text>

                      <Form.Control
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        disabled={loading}
                        required
                      />

                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={handleTogglePassword}
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeSlash size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* =================================================
                      REMEMBER ME / FORGOT PASSWORD
                  ================================================= */}

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      disabled={loading}
                    />

                    <Button
                      variant="link"
                      type="button"
                      className="p-0 text-decoration-none"
                      disabled
                    >
                      Forgot password?
                    </Button>
                  </div>

                  {/* =================================================
                      SIGN IN BUTTON
                  ================================================= */}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />

                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                {/* =================================================
                    CARD FOOTER
                ================================================= */}

                <div className="text-center mt-4">
                  <small className="text-muted">
                    POS Management System
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* ====================================================
                PAGE FOOTER
            ==================================================== */}

            <div className="text-center mt-3">
              <small className="text-muted">
                © {new Date().getFullYear()} POS System
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;