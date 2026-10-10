import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// PUBLIC HOME
// ============================================================
import Home from "../pages/Home";

// ============================================================
// AUTH
// ============================================================
import Login from "../pages/Login";
import CompanyRegistration from "../pages/auth/CompanyRegistration";
import ResetPassword from "../pages/auth/ResetPassword";

// ============================================================
// MAIN PAGES
// ============================================================
import Dashboard from "../pages/dashboard/Dashboard";
import POS from "../pages/pos/POS";
import Sales from "../pages/sales/Sales";
import Customers from "../pages/customers/Customers";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import Settings from "../pages/settings/Settings";
import Brands from "../pages/Brands";

// ============================================================
// SETTINGS PAGES
// ============================================================
import BranchSettings from "../pages/settings/components/BranchSettings";

// ============================================================
// INVENTORY PAGES
// ============================================================
import Products from "../pages/products/Products";
import Inventory from "../pages/Inventory";
import Categories from "../pages/Categories";
import Purchases from "../pages/purchases/Purchases";
import Suppliers from "../pages/Suppliers";
import StockAdjustments from "../pages/StockAdjustments";
import Return from "../pages/Return";

// ============================================================
// EXPENSES
// ============================================================
import Expenses from "../pages/expenses/Expenses";

// ============================================================
// PAYMENT METHODS
// ============================================================
import PaymentMethod from "../pages/PaymentMethod";

// ============================================================
// ROLES & PERMISSIONS
// ============================================================
import Roles from "../pages/Roles";

// ============================================================
// SERVICES
// ============================================================
import authApi from "../services/auth";

// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

// ============================================================
// PUBLIC AUTH ROUTE
// ============================================================
// Used for pages that should not be accessed while logged in,
// such as Login and Registration.
//
// Home is NOT wrapped with this component because the Home page
// should remain accessible to everyone.
// ============================================================

const PublicRoute = ({ children }) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

// ============================================================
// 404 PAGE
// ============================================================

const NotFound = () => {
  const isAuthenticated = authApi.isAuthenticated();

  return (
    <div
      className="d-flex align-items-center justify-content-center text-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "30px",
      }}
    >
      <div>

        {/* ICON */}
        <div className="mb-4">
          <i
            className="bi bi-exclamation-circle text-primary"
            style={{
              fontSize: "70px",
            }}
          ></i>
        </div>

        {/* TITLE */}
        <h2 className="fw-bold mb-3">
          Page Not Found
        </h2>

        {/* DESCRIPTION */}
        <p className="text-muted mb-4">
          The page you are looking for does not exist.
        </p>

        {/* ACTIONS */}
        <div className="d-flex justify-content-center gap-2">

          {/* HOME */}
          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <i className="bi bi-house-fill me-2"></i>
            Home
          </button>

          {/* DASHBOARD */}
          {isAuthenticated && (
            <button
              type="button"
              className="btn btn-outline-primary px-4"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <i className="bi bi-grid-1x2-fill me-2"></i>
              Dashboard
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

// ============================================================
// APP ROUTES
// ============================================================

const AppRoutes = () => {
  return (
    <Routes>

      {/* ======================================================
          HOME
      ====================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* ======================================================
          AUTHENTICATION
      ====================================================== */}

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* COMPANY REGISTRATION */}

      <Route
        path="/register"
        element={
          <PublicRoute>
            <CompanyRegistration />
          </PublicRoute>
        }
      />

      {/* RESET PASSWORD */}

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          POS
      ====================================================== */}

      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POS />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          SALES
      ====================================================== */}

      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          INVENTORY
      ====================================================== */}

      {/* PRODUCTS */}

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      {/* INVENTORY */}

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />

      {/* CATEGORIES */}

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* BRANDS */}

      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        }
      />

      {/* PURCHASES */}

      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        }
      />

      {/* RETURNS */}

      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <Return />
          </ProtectedRoute>
        }
      />

      {/* SUPPLIERS */}

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        }
      />

      {/* STOCK ADJUSTMENTS */}

      <Route
        path="/stock-adjustments"
        element={
          <ProtectedRoute>
            <StockAdjustments />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          MANAGEMENT
      ====================================================== */}

      {/* CUSTOMERS */}

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

      {/* USERS */}

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          EXPENSES
      ====================================================== */}

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          PAYMENT METHODS
      ====================================================== */}

      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute>
            <PaymentMethod />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          REPORTS
      ====================================================== */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          ROLES & PERMISSIONS
      ====================================================== */}

      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <Roles />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          SETTINGS
      ====================================================== */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          BRANCH MANAGEMENT
      ====================================================== */}

      <Route
        path="/settings/branches"
        element={
          <ProtectedRoute>
            <BranchSettings />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          404
      ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};

export default AppRoutes;