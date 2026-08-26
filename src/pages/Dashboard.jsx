import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const stats = [
    {
      title: "Today's Sales",
      value: "TSh 2,450,000",
      change: "+12.5%",
      changeType: "positive",
      icon: "bi-cash-stack",
      iconColor: "primary",
      description: "Compared to yesterday",
    },

    {
      title: "Orders",
      value: "128",
      change: "+8.2%",
      changeType: "positive",
      icon: "bi-cart-check",
      iconColor: "success",
      description: "Compared to yesterday",
    },

    {
      title: "Profit",
      value: "TSh 640,000",
      change: "+10.4%",
      changeType: "positive",
      icon: "bi-graph-up-arrow",
      iconColor: "warning",
      description: "This month",
    },

    {
      title: "Stock Items",
      value: "1,245",
      change: "24 low",
      changeType: "negative",
      icon: "bi-box-seam",
      iconColor: "danger",
      description: "Products need attention",
    },
  ];


  // =========================================================
  // LOW STOCK PRODUCTS
  // =========================================================

  const lowStockProducts = [
    {
      product: "USB-C Charger",
      stock: "5 left",
    },

    {
      product: "iPhone Case",
      stock: "7 left",
    },

    {
      product: "Power Bank",
      stock: "3 left",
    },

    {
      product: "Bluetooth Earphone",
      stock: "4 left",
    },
  ];


  return (
    <div className="dashboard">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h2>Dashboard</h2>

          <p>
            Welcome back, Kelvin. Here's today's overview.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
        >
          <i className="bi bi-plus-lg"></i>

          New Sale
        </button>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <Row className="g-3">

        {stats.map((stat) => (
          <Col
            xl={3}
            lg={3}
            md={6}
            sm={12}
            key={stat.title}
          >

            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
              description={stat.description}
            />

          </Col>
        ))}

      </Row>


      {/* =====================================================
          SALES + LOW STOCK
      ===================================================== */}

      <Row className="g-3 mt-1">

        {/* ===================================================
            SALES OVERVIEW
        =================================================== */}

        <Col
          xl={8}
          lg={8}
          md={12}
        >

          <Card className="dashboard-card border-0 h-100">

            <Card.Body>

              <div className="card-heading">

                <div>
                  <h5>
                    Sales Overview
                  </h5>

                  <span>
                    Sales performance for the last 7 days
                  </span>
                </div>

                <select
                  className="form-select form-select-sm"
                  defaultValue="7"
                >
                  <option value="7">
                    Last 7 days
                  </option>

                  <option value="30">
                    Last 30 days
                  </option>

                  <option value="365">
                    This year
                  </option>
                </select>

              </div>


              {/* Chart Placeholder */}

              <div className="chart-placeholder">

                <div className="chart-message">

                  <i className="bi bi-bar-chart"></i>

                  <span>
                    Sales chart will appear here
                  </span>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* ===================================================
            LOW STOCK
        =================================================== */}

        <Col
          xl={4}
          lg={4}
          md={12}
        >

          <Card className="dashboard-card border-0 h-100">

            <Card.Body>

              <div className="card-heading">

                <div>
                  <h5>
                    Low Stock
                  </h5>

                  <span>
                    Items requiring attention
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-light"
                >
                  View All
                </button>

              </div>


              {/* Low Stock Products */}

              <div className="low-stock-list">

                {lowStockProducts.map(
                  ({ product, stock }) => (

                    <div
                      className="stock-item"
                      key={product}
                    >

                      {/* Product Icon */}

                      <div className="stock-icon">

                        <i className="bi bi-box"></i>

                      </div>


                      {/* Product Information */}

                      <div className="stock-info">

                        <strong>
                          {product}
                        </strong>

                        <small>
                          {stock}
                        </small>

                      </div>


                      {/* Warning */}

                      <i
                        className="bi bi-exclamation-circle text-warning"
                        title="Low stock"
                      ></i>

                    </div>

                  )
                )}

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <Row className="g-3 mt-1">

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="quick-action">

                <div className="quick-action-icon">
                  <i className="bi bi-cart-plus"></i>
                </div>

                <div>
                  <strong>
                    New Sale
                  </strong>

                  <small>
                    Create a new transaction
                  </small>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="quick-action">

                <div className="quick-action-icon">
                  <i className="bi bi-box-seam"></i>
                </div>

                <div>
                  <strong>
                    Add Product
                  </strong>

                  <small>
                    Add a new product
                  </small>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="quick-action">

                <div className="quick-action-icon">
                  <i className="bi bi-bag-plus"></i>
                </div>

                <div>
                  <strong>
                    New Purchase
                  </strong>

                  <small>
                    Receive new stock
                  </small>
                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="quick-action">

                <div className="quick-action-icon">
                  <i className="bi bi-wallet2"></i>
                </div>

                <div>
                  <strong>
                    Add Expense
                  </strong>

                  <small>
                    Record business expense
                  </small>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </div>
  );
};

export default Dashboard;