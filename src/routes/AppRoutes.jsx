import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ===============================
// AUTH
// ===============================
import Login from "../pages/Login";

// ===============================
// MAIN PAGES
// ===============================
import Dashboard from "../pages/Dashboard";
import POS from "../pages/POS";
import Sales from "../pages/Sales";
import Customers from "../pages/Customers";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import Brands from "../pages/Brands";

// ===============================
// INVENTORY PAGES
// ===============================
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import Categories from "../pages/Categories";
import Purchases from "../pages/Purchases";
import Suppliers from "../pages/Suppliers";
import StockAdjustments from "../pages/StockAdjustments";
import Return from "../pages/Return";

// ===============================
// EXPENSES
// ===============================
import Expenses from "../pages/Expenses";

// ===============================
// PAYMENT METHODS
// ===============================
import PaymentMethod from "../pages/PaymentMethod";

// ===============================
// ROLES & PERMISSIONS
// ===============================
import Roles from "../pages/Roles";

// ===============================
// SERVICES
// ===============================
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
// PUBLIC ROUTE
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
// APP ROUTES
// ============================================================

const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* =====================================================
          DEFAULT ROUTE
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <POS />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          INVENTORY
      ===================================================== */}

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <Return />
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock-adjustments"
        element={
          <ProtectedRoute>
            <StockAdjustments />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          MANAGEMENT
      ===================================================== */}

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          EXPENSES
      ===================================================== */}

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          PAYMENT METHODS
      ===================================================== */}

      <Route
        path="/payment-methods"
        element={
          <ProtectedRoute>
            <PaymentMethod />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          REPORTS
      ===================================================== */}

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          SYSTEM
      ===================================================== */}

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ROLES & PERMISSIONS
      ===================================================== */}

      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <Roles />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          SETTINGS
      ===================================================== */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={
          <div className="text-center py-5">

            <div className="mb-3">
              <i
                className="bi bi-exclamation-circle"
                style={{
                  fontSize: "50px",
                }}
              ></i>
            </div>

            <h3>Page Not Found</h3>

            <p className="text-muted">
              The page you are looking for
              does not exist.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              <i className="bi bi-grid-1x2-fill me-2"></i>
              Back to Dashboard
            </button>

          </div>
        }
      />

    </Routes>
  );
};

export default AppRoutes;