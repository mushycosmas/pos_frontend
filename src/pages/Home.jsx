import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

import HomeNavbar from "../components/landing/HomeNavbar";
import HomeFooter from "../components/landing/HomeFooter";

// ============================================================
// HOME PAGE
// ============================================================

const Home = () => {
  // ==========================================================
  // FEATURES
  // ==========================================================

  const features = [
    {
      icon: "bi-cart-check-fill",
      title: "Point of Sale",
      description:
        "Process sales quickly, manage payments, issue receipts, and keep your checkout operations simple.",
    },
    {
      icon: "bi-box-seam-fill",
      title: "Inventory Management",
      description:
        "Track products, stock levels, categories, brands, adjustments, and low-stock products.",
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Sales Management",
      description:
        "Manage sales transactions, returns, payments, balances, and monitor your sales performance.",
    },
    {
      icon: "bi-bag-check-fill",
      title: "Purchase Management",
      description:
        "Manage suppliers, purchases, received stock, purchasing costs, and purchase history.",
    },
    {
      icon: "bi-people-fill",
      title: "Customer Management",
      description:
        "Keep customer information organized and easily track their transactions and balances.",
    },
    {
      icon: "bi-wallet2",
      title: "Expense Management",
      description:
        "Record and monitor your business expenses so you can understand where your money goes.",
    },
    {
      icon: "bi-bar-chart-fill",
      title: "Reports & Analytics",
      description:
        "Get useful reports for sales, inventory, purchases, expenses, and overall business performance.",
    },
    {
      icon: "bi-diagram-3-fill",
      title: "Multi-Branch",
      description:
        "Manage multiple business branches from one centralized POS management system.",
    },
  ];

  // ==========================================================
  // HOW IT WORKS
  // ==========================================================

  const steps = [
    {
      number: "01",
      icon: "bi-building-add",
      title: "Register Your Business",
      description:
        "Create your company account and provide your basic business information.",
    },
    {
      number: "02",
      icon: "bi-diagram-3",
      title: "Set Up Your Branch",
      description:
        "Your main branch is created automatically. You can add additional branches later.",
    },
    {
      number: "03",
      icon: "bi-box-seam",
      title: "Add Products",
      description:
        "Create products, categories, brands, suppliers, and opening stock.",
    },
    {
      number: "04",
      icon: "bi-cart-check",
      title: "Start Selling",
      description:
        "Start processing sales and automatically keep your business records updated.",
    },
  ];

  // ==========================================================
  // BENEFITS
  // ==========================================================

  const benefits = [
    {
      icon: "bi-lightning-charge-fill",
      title: "Fast & Easy",
      description:
        "Designed to make everyday business operations faster and easier.",
    },
    {
      icon: "bi-shield-check",
      title: "Secure",
      description:
        "Role-based access helps protect your business information.",
    },
    {
      icon: "bi-phone-fill",
      title: "Responsive",
      description:
        "Use the system comfortably on desktops, tablets, and mobile devices.",
    },
    {
      icon: "bi-bar-chart-line-fill",
      title: "Business Insights",
      description:
        "Turn your daily transactions into useful information for better decisions.",
    },
  ];

  return (
    <div className="home-page">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <HomeNavbar />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main>

        {/* ====================================================
            HERO SECTION
        ==================================================== */}

        <section
          id="home"
          className="py-5"
          style={{
            background:
              "linear-gradient(135deg, #f7faff 0%, #ffffff 55%, #f2f7ff 100%)",
          }}
        >
          <Container>
            <Row
              className="align-items-center"
              style={{
                minHeight: "650px",
              }}
            >
              {/* HERO TEXT */}

              <Col lg={6} className="py-5">

                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
                  style={{
                    backgroundColor: "#eaf3ff",
                    color: "#0d6efd",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <i className="bi bi-stars"></i>

                  Complete Business Management Solution
                </div>

                <h1
                  className="fw-bold mb-4"
                  style={{
                    fontSize: "clamp(42px, 5vw, 64px)",
                    lineHeight: "1.08",
                    color: "#172033",
                  }}
                >
                  Run Your Business
                  <span className="text-primary">
                    {" "}
                    Smarter.
                  </span>
                </h1>

                <p
                  className="lead text-muted mb-4"
                  style={{
                    maxWidth: "650px",
                    lineHeight: "1.7",
                    fontSize: "18px",
                  }}
                >
                  A complete Point of Sale and business management
                  system for managing sales, inventory, purchases,
                  customers, expenses, branches, and business reports
                  from one powerful platform.
                </p>

                {/* BUTTONS */}

                <div className="d-flex flex-wrap gap-3">

                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="lg"
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-rocket-takeoff-fill me-2"></i>
                    Get Started
                  </Button>

                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    size="lg"
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Button>

                </div>

                {/* QUICK BENEFITS */}

                <div className="d-flex flex-wrap gap-4 mt-4">

                  <span className="text-muted small">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Easy to use
                  </span>

                  <span className="text-muted small">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Multi-branch
                  </span>

                  <span className="text-muted small">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Role-based access
                  </span>

                </div>

              </Col>

              {/* =================================================
                  DASHBOARD PREVIEW
              ================================================= */}

              <Col lg={6} className="py-5">

                <div
                  className="bg-white rounded-4 p-3"
                  style={{
                    border: "1px solid #e9edf3",
                    boxShadow:
                      "0 25px 70px rgba(15, 23, 42, 0.12)",
                  }}
                >

                  {/* Dashboard header */}

                  <div className="d-flex justify-content-between align-items-center p-2 mb-3">

                    <div>
                      <h5 className="fw-bold mb-1">
                        Business Dashboard
                      </h5>

                      <small className="text-muted">
                        Overview of your business
                      </small>
                    </div>

                    <span className="badge bg-success-subtle text-success px-3 py-2">
                      <i className="bi bi-circle-fill me-1"></i>
                      Active
                    </span>

                  </div>

                  {/* Dashboard cards */}

                  <Row className="g-3">

                    <Col sm={6}>
                      <div className="bg-light rounded-3 p-3">
                        <div className="text-muted small mb-2">
                          Today's Sales
                        </div>

                        <h4 className="fw-bold mb-1">
                          TSh 2,450,000
                        </h4>

                        <small className="text-success">
                          <i className="bi bi-arrow-up"></i>{" "}
                          12.5%
                        </small>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="bg-light rounded-3 p-3">
                        <div className="text-muted small mb-2">
                          Transactions
                        </div>

                        <h4 className="fw-bold mb-1">
                          128
                        </h4>

                        <small className="text-success">
                          <i className="bi bi-arrow-up"></i>{" "}
                          8.2%
                        </small>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="bg-light rounded-3 p-3">
                        <div className="text-muted small mb-2">
                          Products
                        </div>

                        <h4 className="fw-bold mb-1">
                          1,248
                        </h4>

                        <small className="text-muted">
                          Active products
                        </small>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="bg-light rounded-3 p-3">
                        <div className="text-muted small mb-2">
                          Low Stock
                        </div>

                        <h4 className="fw-bold text-warning mb-1">
                          18
                        </h4>

                        <small className="text-warning">
                          Requires attention
                        </small>
                      </div>
                    </Col>

                  </Row>

                  {/* Sales chart */}

                  <div className="mt-4 p-2">

                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-semibold">
                        Sales Performance
                      </span>

                      <small className="text-muted">
                        This Week
                      </small>
                    </div>

                    <div
                      className="d-flex align-items-end justify-content-around rounded-3 p-3"
                      style={{
                        height: "150px",
                        background:
                          "linear-gradient(to top, #eef5ff, #ffffff)",
                      }}
                    >
                      {[45, 65, 50, 80, 60, 92, 75].map(
                        (height, index) => (
                          <div
                            key={index}
                            style={{
                              width: "9%",
                              height: `${height}%`,
                              backgroundColor: "#0d6efd",
                              borderRadius:
                                "5px 5px 0 0",
                              opacity: 0.8,
                            }}
                          ></div>
                        )
                      )}
                    </div>

                  </div>

                </div>

              </Col>

            </Row>
          </Container>
        </section>

        {/* ====================================================
            FEATURES
        ==================================================== */}

        <section
          id="features"
          className="py-5"
          style={{
            paddingTop: "90px",
            paddingBottom: "90px",
          }}
        >
          <Container>

            <div className="text-center mb-5">

              <div className="text-primary fw-semibold mb-2">
                POWERFUL FEATURES
              </div>

              <h2 className="fw-bold display-6 mb-3">
                Everything You Need to Run Your Business
              </h2>

              <p
                className="text-muted mx-auto"
                style={{
                  maxWidth: "700px",
                  lineHeight: "1.7",
                }}
              >
                Manage your daily operations, track your money,
                understand your customers, and make better business
                decisions from one platform.
              </p>

            </div>

            <Row className="g-4">

              {features.map((feature, index) => (
                <Col
                  md={6}
                  lg={3}
                  key={index}
                >
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{
                      borderRadius: "15px",
                    }}
                  >
                    <Card.Body className="p-4">

                      <div
                        className="d-flex align-items-center justify-content-center mb-4"
                        style={{
                          width: "55px",
                          height: "55px",
                          borderRadius: "13px",
                          backgroundColor: "#eaf3ff",
                          color: "#0d6efd",
                          fontSize: "23px",
                        }}
                      >
                        <i
                          className={`bi ${feature.icon}`}
                        ></i>
                      </div>

                      <h5 className="fw-bold mb-3">
                        {feature.title}
                      </h5>

                      <p className="text-muted mb-0">
                        {feature.description}
                      </p>

                    </Card.Body>
                  </Card>
                </Col>
              ))}

            </Row>

          </Container>
        </section>

        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section
          id="how-it-works"
          className="py-5 bg-light"
        >
          <Container>

            <div className="text-center mb-5">

              <div className="text-primary fw-semibold mb-2">
                SIMPLE SETUP
              </div>

              <h2 className="fw-bold display-6 mb-3">
                Get Started in Four Simple Steps
              </h2>

              <p className="text-muted">
                Set up your business and start selling without
                complicated configuration.
              </p>

            </div>

            <Row className="g-4">

              {steps.map((step, index) => (
                <Col
                  md={6}
                  lg={3}
                  key={index}
                >

                  <div className="text-center">

                    <div
                      className="mx-auto mb-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "58px",
                        height: "58px",
                      }}
                    >
                      {step.number}
                    </div>

                    <div className="text-primary fs-3 mb-3">
                      <i
                        className={`bi ${step.icon}`}
                      ></i>
                    </div>

                    <h5 className="fw-bold">
                      {step.title}
                    </h5>

                    <p className="text-muted">
                      {step.description}
                    </p>

                  </div>

                </Col>
              ))}

            </Row>

          </Container>
        </section>

        {/* ====================================================
            MULTI-BRANCH / ABOUT
        ==================================================== */}

        <section
          id="about"
          className="py-5"
          style={{
            paddingTop: "90px",
            paddingBottom: "90px",
          }}
        >
          <Container>

            <Row className="align-items-center g-5">

              <Col lg={6}>

                <div className="text-primary fw-semibold mb-2">
                  BUILT FOR GROWING BUSINESSES
                </div>

                <h2 className="fw-bold display-6 mb-4">
                  One Business.
                  <br />
                  Multiple Branches.
                  <br />
                  One System.
                </h2>

                <p className="text-muted fs-5">
                  Start with one branch and grow your business
                  without changing your system. Manage your
                  company's operations from one centralized
                  platform.
                </p>

                <div className="mt-4">

                  <div className="d-flex mb-4">

                    <i className="bi bi-check-circle-fill text-primary fs-4 me-3"></i>

                    <div>
                      <h6 className="fw-bold">
                        Centralized Management
                      </h6>

                      <p className="text-muted mb-0">
                        Manage your company from one central
                        platform.
                      </p>
                    </div>

                  </div>

                  <div className="d-flex mb-4">

                    <i className="bi bi-check-circle-fill text-primary fs-4 me-3"></i>

                    <div>
                      <h6 className="fw-bold">
                        Branch-Level Operations
                      </h6>

                      <p className="text-muted mb-0">
                        Organize sales, inventory, and users by
                        branch.
                      </p>
                    </div>

                  </div>

                  <div className="d-flex">

                    <i className="bi bi-check-circle-fill text-primary fs-4 me-3"></i>

                    <div>
                      <h6 className="fw-bold">
                        Ready to Grow
                      </h6>

                      <p className="text-muted mb-0">
                        Add additional branches as your business
                        expands.
                      </p>
                    </div>

                  </div>

                </div>

              </Col>

              {/* BUSINESS STRUCTURE */}

              <Col lg={6}>

                <div
                  className="bg-light rounded-4 p-4 p-lg-5"
                  style={{
                    border: "1px solid #edf0f5",
                  }}
                >

                  <div className="text-center mb-4">

                    <i
                      className="bi bi-diagram-3-fill text-primary"
                      style={{
                        fontSize: "55px",
                      }}
                    ></i>

                    <h4 className="fw-bold mt-3">
                      Your Business Structure
                    </h4>

                  </div>

                  <div
                    className="bg-primary text-white rounded-3 p-3 text-center fw-semibold mx-auto"
                    style={{
                      maxWidth: "260px",
                    }}
                  >
                    <i className="bi bi-building me-2"></i>
                    Your Company
                  </div>

                  <div className="text-center my-3">
                    <i className="bi bi-arrow-down text-muted fs-4"></i>
                  </div>

                  <Row className="g-3">

                    <Col xs={4}>
                      <div className="bg-white border rounded-3 p-3 text-center">

                        <i className="bi bi-shop text-primary fs-3"></i>

                        <div className="fw-semibold mt-2 small">
                          Main Branch
                        </div>

                      </div>
                    </Col>

                    <Col xs={4}>
                      <div className="bg-white border rounded-3 p-3 text-center">

                        <i className="bi bi-shop text-primary fs-3"></i>

                        <div className="fw-semibold mt-2 small">
                          Branch 2
                        </div>

                      </div>
                    </Col>

                    <Col xs={4}>
                      <div className="bg-white border rounded-3 p-3 text-center">

                        <i className="bi bi-shop text-primary fs-3"></i>

                        <div className="fw-semibold mt-2 small">
                          Branch 3
                        </div>

                      </div>
                    </Col>

                  </Row>

                </div>

              </Col>

            </Row>

          </Container>
        </section>

        {/* ====================================================
            BENEFITS
        ==================================================== */}

        <section
          id="benefits"
          className="py-5 bg-light"
        >
          <Container>

            <div className="text-center mb-5">

              <div className="text-primary fw-semibold mb-2">
                WHY CHOOSE OUR POS
              </div>

              <h2 className="fw-bold display-6 mb-3">
                Designed Around Your Business
              </h2>

              <p className="text-muted mx-auto">
                Your POS should do more than process sales. It
                should help you understand and grow your business.
              </p>

            </div>

            <Row className="g-4">

              {benefits.map((benefit, index) => (
                <Col
                  md={6}
                  lg={3}
                  key={index}
                >

                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">

                      <div className="text-primary fs-2 mb-3">
                        <i
                          className={`bi ${benefit.icon}`}
                        ></i>
                      </div>

                      <h5 className="fw-bold">
                        {benefit.title}
                      </h5>

                      <p className="text-muted mb-0">
                        {benefit.description}
                      </p>

                    </Card.Body>
                  </Card>

                </Col>
              ))}

            </Row>

          </Container>
        </section>

        {/* ====================================================
            CALL TO ACTION
        ==================================================== */}

        <section className="py-5 bg-primary text-white">
          <Container>

            <Row className="justify-content-center text-center py-5">

              <Col lg={8}>

                <i
                  className="bi bi-rocket-takeoff-fill"
                  style={{
                    fontSize: "45px",
                  }}
                ></i>

                <h2 className="display-5 fw-bold mt-3 mb-3">
                  Ready to Take Control of Your Business?
                </h2>

                <p className="lead mb-4">
                  Create your business account and start managing
                  your sales, inventory, customers, expenses, and
                  reports from one system.
                </p>

                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                  size="lg"
                  className="px-4 py-3 fw-semibold"
                >
                  Create Your Business Account

                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>

              </Col>

            </Row>

          </Container>
        </section>

      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <HomeFooter />

    </div>
  );
};

export default Home;