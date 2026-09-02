import React from "react";
import {
  BrowserRouter,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import { InventoryProvider } from "./context/InventoryContext";
import { AuthProvider } from "./context/AuthContext";

import AppRoutes from "./routes/AppRoutes";

// ============================================================
// APPLICATION LAYOUT
// ============================================================

const AppLayout = () => {
  const location = useLocation();

  // Login page should NOT have:
  // - Sidebar
  // - TopNavbar
  // - Main content wrapper

  const isLoginPage =
    location.pathname.toLowerCase() === "/login";

  // ==========================================================
  // PUBLIC LAYOUT
  // ==========================================================

  if (isLoginPage) {
    return <AppRoutes />;
  }

  // ==========================================================
  // AUTHENTICATED APPLICATION LAYOUT
  // ==========================================================

  return (
    <div className="app-container">

      {/* ===============================
          SIDEBAR
      =============================== */}

      <Sidebar />

      {/* ===============================
          MAIN CONTENT
      =============================== */}

      <div className="main-content">

        {/* ===============================
            TOP NAVBAR
        =============================== */}

        <TopNavbar />

        {/* ===============================
            PAGE CONTENT
        =============================== */}

        <main className="content-area">
          <AppRoutes />
        </main>

      </div>

    </div>
  );
};

// ============================================================
// APP
// ============================================================

const App = () => {
  return (
    <BrowserRouter>

      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <AuthProvider>

        {/* ===================================================
            INVENTORY
        =================================================== */}

        <InventoryProvider>

          {/* =================================================
              APPLICATION LAYOUT
          ================================================= */}

          <AppLayout />

        </InventoryProvider>

      </AuthProvider>

    </BrowserRouter>
  );
};

export default App;

