import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  Envelope,
  ArrowLeft,
  Send,
  CheckCircle,
  ShieldLock,
} from "react-bootstrap-icons";

const ForgotPassword = ({
  onSubmit,
  loading = false,
  serverError = "",
  onBackToLogin,
}) => {
  // =========================================================
  // STATE
  // =========================================================

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // =========================================================
  // HANDLE EMAIL CHANGE
  // =========================================================

  const handleChange = (e) => {
    setEmail(e.target.value);

    // Clear validation error when user starts typing
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess(false);
    }
  };

  // =========================================================
  // VALIDATE EMAIL
  // =========================================================

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!validateEmail()) {
      return;
    }

    try {
      if (typeof onSubmit !== "function") {
        throw new Error(
          "Password reset handler is not configured."
        );
      }

      await onSubmit({
        email: email.trim(),
      });

      setSuccess(true);
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        err?.message ||
          "Unable to send the password reset link. Please try again."
      );
    }
  };

  // =========================================================
  // BACK TO LOGIN
  // =========================================================

  const handleBackToLogin = () => {
    setEmail("");
    setError("");
    setSuccess(false);

    if (typeof onBackToLogin === "function") {
      onBackToLogin();
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4 p-md-5">

        {/* =====================================================
            HEADER
        ====================================================== */}

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

          <h4 className="fw-semibold mb-2">
            Forgot Password?
          </h4>

          <p className="text-muted mb-0">
            Enter the email address associated with
            your account and we'll send you a link to
            reset your password.
          </p>

        </div>

        {/* =====================================================
            SERVER ERROR
        ====================================================== */}

        {(error || serverError) && (
          <Alert
            variant="danger"
            className="mb-4"
          >
            <div className="small">
              {error || serverError}
            </div>
          </Alert>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success ? (
          <div>

            <Alert
              variant="success"
              className="mb-4"
            >
              <div className="d-flex">

                <CheckCircle
                  size={22}
                  className="me-2 mt-1"
                />

                <div>
                  <strong>
                    Password reset email sent
                  </strong>

                  <div className="small mt-1">
                    If an account exists with
                    <strong> {email} </strong>,
                    you will receive instructions to
                    reset your password.
                  </div>
                </div>

              </div>
            </Alert>

            <div className="d-grid">
              <Button
                type="button"
                variant="outline-primary"
                onClick={handleBackToLogin}
              >
                <ArrowLeft
                  size={17}
                  className="me-2"
                />
                Back to Login
              </Button>
            </div>

          </div>
        ) : (

          /* ===================================================
             FORM
          ==================================================== */

          <Form
            onSubmit={handleSubmit}
            noValidate
          >

            <Form.Group
              className="mb-4"
              controlId="forgot-password-email"
            >

              <Form.Label>
                Email Address
              </Form.Label>

              <div className="input-group">

                <span className="input-group-text">
                  <Envelope size={17} />
                </span>

                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  isInvalid={!!error}
                />

                <Form.Control.Feedback type="invalid">
                  {error}
                </Form.Control.Feedback>

              </div>

              <Form.Text className="text-muted">
                We'll send password reset instructions
                to this email address.
              </Form.Text>

            </Form.Group>

            {/* ===============================================
                SUBMIT
            ================================================ */}

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

                    Sending...
                  </>
                ) : (
                  <>
                    <Send
                      size={17}
                      className="me-2"
                    />

                    Send Reset Link
                  </>
                )}

              </Button>

            </div>

            {/* ===============================================
                BACK TO LOGIN
            ================================================ */}

            <div className="text-center">

              <Button
                type="button"
                variant="link"
                className="text-decoration-none"
                onClick={handleBackToLogin}
                disabled={loading}
              >
                <ArrowLeft
                  size={16}
                  className="me-1"
                />

                Back to Login
              </Button>

            </div>

          </Form>
        )}

        {/* =====================================================
            SECURITY INFORMATION
        ====================================================== */}

        {!success && (
          <div
            className="border-top mt-4 pt-3 text-center"
          >
            <small className="text-muted">
              For security reasons, we do not reveal
              whether an email address is registered in
              the system.
            </small>
          </div>
        )}

      </Card.Body>
    </Card>
  );
};

export default ForgotPassword;