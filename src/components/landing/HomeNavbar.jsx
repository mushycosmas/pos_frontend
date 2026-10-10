import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Button,
} from "react-bootstrap";

const HomeNavbar = () => {
  return (
    <Navbar
      expand="lg"
      bg="white"
      className="shadow-sm py-3"
      sticky="top"
    >
      <Container>
        {/* ==================================================
            BRAND
        ================================================== */}

        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center"
        >
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
            <div
              className="fw-bold text-dark"
              style={{ fontSize: "21px" }}
            >
              POS System
            </div>

            <small className="text-muted">
              Business Management
            </small>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="home-navbar" />

        <Navbar.Collapse id="home-navbar">
          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <Nav className="mx-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0">
            <Nav.Link href="#home">
              Home
            </Nav.Link>

            <Nav.Link href="#features">
              Features
            </Nav.Link>

            <Nav.Link href="#how-it-works">
              How It Works
            </Nav.Link>

            <Nav.Link href="#benefits">
              Benefits
            </Nav.Link>

            <Nav.Link href="#about">
              About
            </Nav.Link>

            <Nav.Link href="#contact">
              Contact
            </Nav.Link>
          </Nav>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <Button
              as={Link}
              to="/login"
              variant="outline-primary"
              className="px-3"
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Button>

            <Button
              as={Link}
              to="/register"
              variant="primary"
              className="px-3"
            >
              Get Started
              <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HomeNavbar;