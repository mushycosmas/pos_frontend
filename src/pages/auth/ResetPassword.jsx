import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {
  Lock,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeSlash,
  ShieldLock,
  Key,
} from "react-bootstrap-icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// =========================================================
// RESET PASSWORD
// =========================================================

const ResetPassword = ({
  onSubmit,
  loading = false,
  serverError = "",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =======================================================
  // GET RESET TOKEN
  // =======================================================

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  // =======================================================
  // STATE
  // =======================================================

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =======================================================
  // CHECK TOKEN
  // =======================================================

  useEffect(() => {
    if (!uid || !token) {
      setGeneralError(
        "This password reset link is invalid or incomplete."
      );
    }
  }, [uid, token]);

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear field error
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setGeneralError("");
  };

  // =======================================================
  // PASSWORD STRENGTH
  // =======================================================

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        label: "",
        variant: "",
        width: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[a-z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        label: "Weak password",
        variant: "danger",
        width: 35,
      };
    }

    if (score === 3) {
      return {
        label: "Medium password",
        variant: "warning",
        width: 60,
      };
    }

    if (score === 4) {
      return {
        label: "Strong password",
        variant: "info",
        width: 80,
      };
    }

    return {
      label: "Very strong password",
      variant: "success",
      width: 100,
    };
  };

  const passwordStrength = getPasswordStrength();

  // =======================================================
  // VALIDATE
  // =======================================================

  const validate = () => {
    const validationErrors = {};

    if (!uid || !token) {
      setGeneralError(
        "This password reset link is invalid or incomplete."
      );

      return false;
    }

    if (!formData.password) {
      validationErrors.password =
        "New password is required.";
    } else if (formData.password.length < 8) {
      validationErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!formData.password_confirmation) {
      validationErrors.password_confirmation =
        "Please confirm your new password.";
    } else if (
      formData.password !==
      formData.password_confirmation
    ) {
      validationErrors.password_confirmation =
        "Passwords do not match.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setGeneralError("");
    setSuccess(false);

    if (!validate()) {
      return;
    }

    try {
      if (typeof onSubmit !== "function") {
        throw new Error(
          "Password reset handler is not configured."
        );
      }

      await onSubmit({
        uid,
        token,
        password: formData.password,
        password_confirmation:
          formData.password_confirmation,
      });

      setSuccess(true);
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      const responseData =
        error?.response?.data;

      // ===================================================
      // HANDLE DJANGO VALIDATION ERRORS
      // ===================================================

      if (responseData) {
        if (
          typeof responseData === "object" &&
          !Array.isArray(responseData)
        ) {
          const fieldErrors = {};

          if (responseData.password) {
            fieldErrors.password =
              Array.isArray(responseData.password)
                ? responseData.password.join(" ")
                : responseData.password;
          }

          if (responseData.password_confirmation) {
            fieldErrors.password_confirmation =
              Array.isArray(
                responseData.password_confirmation
              )
                ? responseData.password_confirmation.join(
                    " "
                  )
                : responseData.password_confirmation;
          }

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
          }

          if (responseData.detail) {
            setGeneralError(
              responseData.detail
            );
            return;
          }

          if (responseData.message) {
            setGeneralError(
              responseData.message
            );
            return;
          }
        }
      }

      setGeneralError(
        error?.message ||
          "Unable to reset your password. The reset link may have expired."
      );
    }
  };

  // =======================================================
  // GO TO LOGIN
  // =======================================================

  const handleLogin = () => {
    navigate("/login");
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
      style={{
        backgroundColor: "#f5f7fb",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col
            xs={12}
            sm={10}
            md={8}
            lg={6}
            xl={5}
          >

            {/* =================================================
                BRAND
            ================================================== */}

            <div className="text-center mb-4">

              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                }}
              >
                <ShieldLock size={30} />
              </div>

              <h3 className="fw-bold mb-1">
                POS System
              </h3>

              <p className="text-muted mb-0">
                Secure account management
              </p>

            </div>

            {/* =================================================
                CARD
            ================================================== */}

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">

                {/* =============================================
                    HEADER
                ============================================== */}

                <div className="text-center mb-4">

                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                    style={{
                      width: "52px",
                      height: "52px",
                    }}
                  >
                    <Key size={24} />
                  </div>

                  <h4 className="fw-semibold mb-2">
                    Reset Your Password
                  </h4>

                  <p className="text-muted mb-0">
                    Create a new password for your
                    account.
                  </p>

                </div>

                {/* =============================================
                    GENERAL ERROR
                ============================================== */}

                {(generalError || serverError) && (
                  <Alert
                    variant="danger"
                    className="mb-4"
                  >
                    <div className="small">
                      {generalError ||
                        serverError}
                    </div>
                  </Alert>
                )}

                {/* =============================================
                    SUCCESS
                ============================================== */}

                {success ? (
                  <div className="text-center">

                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                      style={{
                        width: "64px",
                        height: "64px",
                      }}
                    >
                      <CheckCircle size={32} />
                    </div>

                    <h5 className="fw-semibold">
                      Password Reset Successful
                    </h5>

                    <p className="text-muted">
                      Your password has been
                      successfully changed. You can
                      now log in using your new
                      password.
                    </p>

                    <Button
                      type="button"
                      variant="primary"
                      className="px-4"
                      onClick={handleLogin}
                    >
                      <ArrowLeft
                        size={17}
                        className="me-2"
                      />

                      Go to Login
                    </Button>

                  </div>
                ) : !uid || !token ? (

                  /* =========================================
                     INVALID TOKEN
                  ========================================== */

                  <div className="text-center">

                    <Alert variant="warning">
                      <div className="fw-semibold mb-1">
                        Invalid Reset Link
                      </div>

                      <div className="small">
                        This password reset link is
                        missing required information.
                        Please request a new reset
                        link.
                      </div>
                    </Alert>

                    <Button
                      type="button"
                      variant="primary"
                      onClick={() =>
                        navigate(
                          "/forgot-password"
                        )
                      }
                    >
                      Request New Link
                    </Button>

                  </div>

                ) : (

                  /* =========================================
                     RESET FORM
                  ========================================== */

                  <Form
                    onSubmit={handleSubmit}
                    noValidate
                  >

                    {/* =======================================
                        NEW PASSWORD
                    ======================================== */}

                    <Form.Group
                      className="mb-4"
                      controlId="reset-password"
                    >

                      <Form.Label>
                        New Password{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </Form.Label>

                      <div className="input-group">

                        <span className="input-group-text">
                          <Lock size={17} />
                        </span>

                        <Form.Control
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          placeholder="Enter new password"
                          value={
                            formData.password
                          }
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="new-password"
                          autoFocus
                          isInvalid={
                            !!errors.password
                          }
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
                          disabled={loading}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeSlash size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>

                      </div>

                      {/* =====================================
                          PASSWORD STRENGTH
                      ====================================== */}

                      {formData.password && (
                        <div className="mt-2">

                          <div
                            className="progress"
                            style={{
                              height: "5px",
                            }}
                          >
                            <div
                              className={`progress-bar bg-${passwordStrength.variant}`}
                              role="progressbar"
                              style={{
                                width: `${passwordStrength.width}%`,
                              }}
                            />
                          </div>

                          <small
                            className={`text-${passwordStrength.variant}`}
                          >
                            {passwordStrength.label}
                          </small>

                        </div>
                      )}

                      <Form.Text className="text-muted">
                        Password must contain at least
                        8 characters.
                      </Form.Text>

                    </Form.Group>

                    {/* =======================================
                        CONFIRM PASSWORD
                    ======================================== */}

                    <Form.Group
                      className="mb-4"
                      controlId="reset-password-confirmation"
                    >

                      <Form.Label>
                        Confirm New Password{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </Form.Label>

                      <div className="input-group">

                        <span className="input-group-text">
                          <Lock size={17} />
                        </span>

                        <Form.Control
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="password_confirmation"
                          placeholder="Confirm new password"
                          value={
                            formData.password_confirmation
                          }
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="new-password"
                          isInvalid={
                            !!errors.password_confirmation
                          }
                        />

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          disabled={loading}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeSlash size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                        <Form.Control.Feedback type="invalid">
                          {
                            errors.password_confirmation
                          }
                        </Form.Control.Feedback>

                      </div>

                    </Form.Group>

                    {/* =======================================
                        RESET BUTTON
                    ======================================== */}

                    <div className="d-grid mb-3">

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                      >

                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />

                            Resetting Password...
                          </>
                        ) : (
                          <>
                            <CheckCircle
                              size={17}
                              className="me-2"
                            />

                            Reset Password
                          </>
                        )}

                      </Button>

                    </div>

                    {/* =======================================
                        LOGIN LINK
                    ======================================== */}

                    <div className="text-center">

                      <Link
                        to="/login"
                        className="text-decoration-none"
                      >
                        <ArrowLeft
                          size={16}
                          className="me-1"
                        />

                        Back to Login
                      </Link>

                    </div>

                  </Form>
                )}

              </Card.Body>
            </Card>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="text-center mt-4">
              <small className="text-muted">
                Keep your POS account credentials secure.
              </small>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;