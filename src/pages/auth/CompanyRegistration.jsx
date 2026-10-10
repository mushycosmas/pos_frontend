import React, { useState } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import RegistrationForm from "./components/RegistrationForm";
import authApi from "../../services/auth";

// ============================================================
// COMPANY REGISTRATION PAGE
// ============================================================

const CompanyRegistration = () => {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [registering, setRegistering] = useState(false);
  const [serverError, setServerError] = useState("");

  // ==========================================================
  // REGISTRATION
  // ==========================================================

  const handleRegistration = async (registrationData) => {
    setRegistering(true);
    setServerError("");

    try {
      const response = await authApi.registerCompany(
        registrationData
      );

      // ------------------------------------------------------
      // Registration successful
      // ------------------------------------------------------

      if (response) {
        navigate("/login", {
          replace: true,
          state: {
            registrationSuccess:
              "Your company has been registered successfully. You can now log in.",
          },
        });
      }
    } catch (error) {
      console.error(
        "Company registration error:",
        error
      );

      // ------------------------------------------------------
      // Extract server error
      // ------------------------------------------------------

      let message =
        "Unable to complete registration. Please try again.";

      if (error?.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else {
          // Handle validation errors
          const messages = [];

          Object.keys(data).forEach((key) => {
            const value = data[key];

            if (Array.isArray(value)) {
              messages.push(
                `${key}: ${value.join(", ")}`
              );
            } else if (
              typeof value === "string"
            ) {
              messages.push(
                `${key}: ${value}`
              );
            }
          });

          if (messages.length > 0) {
            message = messages.join(" | ");
          }
        }
      } else if (error?.message) {
        message = error.message;
      }

      setServerError(message);
    } finally {
      setRegistering(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px 0",
      }}
    >
      <Container>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-4">

          <Link
            to="/"
            className="text-decoration-none"
          >
            <div className="d-inline-flex align-items-center">

              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "45px",
                  height: "45px",
                }}
              >
                <i className="bi bi-shop fs-5"></i>
              </div>

              <div className="text-start">
                <div
                  className="fw-bold text-dark"
                  style={{
                    fontSize: "21px",
                  }}
                >
                  POS System
                </div>

                <small className="text-muted">
                  Business Management
                </small>
              </div>

            </div>
          </Link>

          <h2 className="fw-bold mt-4 mb-2">
            Create Your Business Account
          </h2>

          <p className="text-muted mb-0">
            Set up your company and start managing your
            business with our POS system.
          </p>

        </div>

        {/* ==================================================
            REGISTRATION CARD
        ================================================== */}

        <Row className="justify-content-center">

          <Col
            xs={12}
            lg={10}
            xl={9}
          >

            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: "16px",
              }}
            >

              <Card.Body className="p-3 p-md-5">

                {/* ==================================================
                    SERVER ERROR
                ================================================== */}

                {serverError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() =>
                      setServerError("")
                    }
                  >
                    <div className="d-flex">

                      <i className="bi bi-exclamation-triangle-fill me-2"></i>

                      <div>
                        <strong>
                          Registration failed
                        </strong>

                        <div className="mt-1">
                          {serverError}
                        </div>
                      </div>

                    </div>
                  </Alert>
                )}

                {/* ==================================================
                    REGISTRATION FORM
                ================================================== */}

                <RegistrationForm
                  onSubmit={handleRegistration}
                  registering={registering}
                  serverError={serverError}
                />

              </Card.Body>

            </Card>

            {/* ==================================================
                LOGIN LINK
            ================================================== */}

            <div className="text-center mt-4">

              <span className="text-muted">
                Already have an account?
              </span>

              <Link
                to="/login"
                className="ms-2 fw-semibold text-decoration-none"
              >
                Login
              </Link>

            </div>

          </Col>

        </Row>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="text-center mt-5">

          <small className="text-muted">
            © {new Date().getFullYear()} POS System.
            All rights reserved.
          </small>

        </div>

      </Container>
    </div>
  );
};

export default CompanyRegistration;