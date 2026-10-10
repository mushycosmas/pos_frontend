
import React from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useBranch } from "../../context/BranchContext";

import useDashboard from "./hooks/useDashboard";

import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import RecentSales from "./components/RecentSales";
import QuickActions from "./components/QuickActions";
import SalesOverviewChart from "./components/SalesOverviewChart";
import LowStockCard from "./components/LowStockCard";
import SalesByCashier from "./components/SalesByCashier";

const Dashboard = () => {
  const navigate = useNavigate();
  const branchContext = useBranch();

  const {
    user,
    userName,
    authLoading,
    loading,
    error,
    setError,
    branchId,
    canViewDashboard,
    canViewSales,
    canCreateSale,
    canViewProducts,
    canViewReports,
    canViewCustomers,
    chartPeriod,
    setChartPeriod,
    salesStats,
    recentSales,
    lowStockProducts,
    salesChartData,
    salesByCashier,
    dashboardMessage,
    formatCurrency,
  } = useDashboard();

  const branch =
    branchContext?.currentBranch ??
    branchContext?.selectedBranch ??
    branchContext?.activeBranch ??
    branchContext?.branch ??
    null;

  const branchName =
    branch?.name ??
    branch?.branch_name ??
    branch?.branchName ??
    "";

  if (authLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div className="mt-2 text-muted">Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="warning">
        User session could not be loaded. Please login again.
      </Alert>
    );
  }

  if (!canViewDashboard) {
    return (
      <Alert variant="danger" className="mt-3">
        <div className="d-flex align-items-center">
          <i
            className="bi bi-shield-lock me-2"
            style={{ fontSize: 20 }}
          />
          <div>
            <strong>Dashboard access denied</strong>
            <div className="small mt-1">
              Your account does not have the{" "}
              <code>dashboard.view_dashboard</code> permission.
            </div>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <div className="dashboard">
      <DashboardHeader
        userName={userName}
        message={dashboardMessage}
        canCreateSale={canCreateSale}
        onNewSale={() => navigate("/pos")}
        branchName={branchName}
      />

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
          <div className="mt-2 text-muted">
            Loading dashboard...
          </div>
        </div>
      )}

      {!loading && (
        <>
          <DashboardStats stats={salesStats} />

          {canViewSales && (
            <Row className="g-3 mt-1">
              <Col
                xl={canViewProducts || canViewReports ? 8 : 12}
                lg={canViewProducts || canViewReports ? 8 : 12}
                md={12}
              >
                <RecentSales
                  sales={recentSales}
                  formatCurrency={formatCurrency}
                  canCreateSale={canCreateSale}
                  onViewAll={() => navigate("/sales")}
                  onNewSale={() => navigate("/pos")}
                />
              </Col>

              <Col
                xl={canViewProducts || canViewReports ? 4 : 12}
                lg={canViewProducts || canViewReports ? 4 : 12}
                md={12}
              >
                <QuickActions
                  canCreateSale={canCreateSale}
                  canViewSales={canViewSales}
                  canViewProducts={canViewProducts}
                  canViewCustomers={canViewCustomers}
                  navigate={navigate}
                />
              </Col>
            </Row>
          )}

          {canViewReports && (
            <>
              <Row className="g-3 mt-1">
                {canViewSales && (
                  <Col
                    xl={canViewProducts ? 8 : 12}
                    lg={canViewProducts ? 8 : 12}
                    md={12}
                  >
                    <SalesOverviewChart
                      data={salesChartData}
                      chartPeriod={chartPeriod}
                      setChartPeriod={setChartPeriod}
                      formatCurrency={formatCurrency}
                    />
                  </Col>
                )}

                {canViewProducts && (
                  <Col
                    xl={canViewSales ? 4 : 12}
                    lg={canViewSales ? 4 : 12}
                    md={12}
                  >
                    <LowStockCard
                      products={lowStockProducts}
                      buttonLabel="View All"
                      onViewAll={() => navigate("/products")}
                    />
                  </Col>
                )}
              </Row>

              {canViewSales && (
                <Row className="g-3 mt-1">
                  <Col xs={12}>
                    <SalesByCashier
                      cashiers={salesByCashier}
                      formatCurrency={formatCurrency}
                    />
                  </Col>
                </Row>
              )}
            </>
          )}

          {canViewProducts && !canViewReports && (
            <Row className="g-3 mt-1">
              <Col xs={12}>
                <LowStockCard
                  products={lowStockProducts}
                  buttonLabel="View Products"
                  onViewAll={() => navigate("/products")}
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
