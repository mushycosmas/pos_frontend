import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

const AppRoutes = () => {
  return (
    <Routes>

      {/* ===============================
          DEFAULT ROUTE
      =============================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ===============================
          MAIN
      =============================== */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/pos"
        element={<POS />}
      />

      <Route
        path="/sales"
        element={<Sales />}
      />

      {/* ===============================
          INVENTORY
      =============================== */}

      <Route
        path="/products"
        element={<Products />}
      />

      <Route
        path="/inventory"
        element={<Inventory />}
      />

      <Route
        path="/categories"
        element={<Categories />}
      />

      <Route
        path="/brands"
        element={<Brands />}
      />

      <Route
        path="/purchases"
        element={<Purchases />}
      />

      <Route
        path="/suppliers"
        element={<Suppliers />}
      />

      <Route
        path="/stock-adjustments"
        element={<StockAdjustments />}
      />

      {/* ===============================
          MANAGEMENT
      =============================== */}

      <Route
        path="/customers"
        element={<Customers />}
      />

      {/* ===============================
          REPORTS
      =============================== */}

      <Route
        path="/reports"
        element={<Reports />}
      />

      {/* ===============================
          SYSTEM
      =============================== */}

      <Route
        path="/users"
        element={<Users />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

      {/* ===============================
          404
      =============================== */}

      <Route
        path="*"
        element={
          <div className="text-center py-5">

            <div className="mb-3">
              <i
                className="bi bi-exclamation-circle"
                style={{ fontSize: "50px" }}
              ></i>
            </div>

            <h3>Page Not Found</h3>

            <p className="text-muted">
              The page you are looking for does not exist.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                window.location.href = "/dashboard";
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