import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

const HomeFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-dark text-white pt-5 pb-3"
    >
      <Container>
        <Row className="g-4 pb-4">

          {/* ==================================================
              BRAND
          ================================================== */}

          <Col lg={5}>
            <div className="d-flex align-items-center mb-3">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "42px",
                  height: "42px",
                }}
              >
                <i className="bi bi-shop fs-5"></i>
              </div>

              <div>
                <div className="fw-bold fs-5">
                  POS System
                </div>

                <small className="text-secondary">
                  Business Management
                </small>
              </div>
            </div>

            <p
              className="text-secondary"
              style={{
                maxWidth: "430px",
                lineHeight: "1.7",
              }}
            >
              A complete Point of Sale and business management
              system designed to help businesses manage sales,
              inventory, customers, expenses, purchases and
              business performance from one platform.
            </p>

            {/* SOCIAL ICONS */}

            <div className="d-flex gap-2 mt-3">
              <a
                href="#facebook"
                className="btn btn-outline-secondary rounded-circle"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>

              <a
                href="#instagram"
                className="btn btn-outline-secondary rounded-circle"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>

              <a
                href="#twitter"
                className="btn btn-outline-secondary rounded-circle"
                aria-label="Twitter"
              >
                <i className="bi bi-twitter-x"></i>
              </a>

              <a
                href="#linkedin"
                className="btn btn-outline-secondary rounded-circle"
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </Col>

          {/* ==================================================
              PRODUCT
          ================================================== */}

          <Col xs={6} md={3} lg={2}>
            <h6 className="fw-bold mb-3">
              Product
            </h6>

            <div className="d-flex flex-column gap-2">
              <a
                href="#features"
                className="text-secondary text-decoration-none"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="text-secondary text-decoration-none"
              >
                How It Works
              </a>

              <a
                href="#benefits"
                className="text-secondary text-decoration-none"
              >
                Benefits
              </a>

              <a
                href="#about"
                className="text-secondary text-decoration-none"
              >
                About
              </a>
            </div>
          </Col>

          {/* ==================================================
              ACCOUNT
          ================================================== */}

          <Col xs={6} md={3} lg={2}>
            <h6 className="fw-bold mb-3">
              Account
            </h6>

            <div className="d-flex flex-column gap-2">
              <Link
                to="/login"
                className="text-secondary text-decoration-none"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="text-secondary text-decoration-none"
              >
                Create Account
              </Link>

              <Link
                to="/reset-password"
                className="text-secondary text-decoration-none"
              >
                Reset Password
              </Link>
            </div>
          </Col>

          {/* ==================================================
              CONTACT
          ================================================== */}

          <Col md={6} lg={3}>
            <h6 className="fw-bold mb-3">
              Contact Us
            </h6>

            <div className="text-secondary">

              <div className="d-flex mb-3">
                <i className="bi bi-envelope me-3 text-primary"></i>

                <span>
                  support@yourpos.com
                </span>
              </div>

              <div className="d-flex mb-3">
                <i className="bi bi-telephone me-3 text-primary"></i>

                <span>
                  +255 XXX XXX XXX
                </span>
              </div>

              <div className="d-flex">
                <i className="bi bi-geo-alt me-3 text-primary"></i>

                <span>
                  Tanzania
                </span>
              </div>

            </div>
          </Col>

        </Row>

        <hr className="border-secondary" />

        {/* ==================================================
            BOTTOM FOOTER
        ================================================== */}

        <Row className="align-items-center pt-2">

          <Col md={6}>
            <p className="text-secondary small mb-0">
              © {currentYear} POS System. All rights reserved.
            </p>
          </Col>

          <Col md={6}>
            <div className="d-flex justify-content-md-end gap-3 mt-2 mt-md-0">

              <a
                href="#privacy"
                className="text-secondary text-decoration-none small"
              >
                Privacy Policy
              </a>

              <a
                href="#terms"
                className="text-secondary text-decoration-none small"
              >
                Terms of Service
              </a>

            </div>
          </Col>

        </Row>
      </Container>
    </footer>
  );
};

export default HomeFooter;