import React from "react";
import {
  BrowserRouter,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import { AuthProvider } from "./context/AuthContext";
import { BranchProvider } from "./context/BranchContext";
import { InventoryProvider } from "./context/InventoryContext";

import AppRoutes from "./routes/AppRoutes";


// ============================================================
// APPLICATION LAYOUT
// ============================================================

const AppLayout = () => {

  const location = useLocation();

  const pathname =
    location.pathname.toLowerCase();


  // ==========================================================
  // PUBLIC PAGES
  // ==========================================================
  //
  // Public pages have their own layouts.
  //
  // Therefore they MUST NOT display:
  //
  // - POS Sidebar
  // - POS TopNavbar
  // - POS main-content wrapper
  //
  // ==========================================================

  const publicPages = [
    "/",
    "/login",
    "/register",
    "/reset-password",
  ];


  const isPublicPage =
    publicPages.includes(pathname);


  // ==========================================================
  // PUBLIC LAYOUT
  // ==========================================================

  if (isPublicPage) {

    return (
      <AppRoutes />
    );
  }


  // ==========================================================
  // AUTHENTICATED POS LAYOUT
  // ==========================================================

  return (
    <div className="app-container">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="main-content">

        {/* ====================================================
            TOP NAVBAR
        ==================================================== */}

        <TopNavbar />


        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

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

      {/* ======================================================
          AUTHENTICATION PROVIDER
      ====================================================== */}

      <AuthProvider>

        {/* ====================================================
            BRANCH PROVIDER
            ----------------------------------------------------
            BranchProvider MUST be inside AuthProvider because
            it uses useAuth().
        ==================================================== */}

        <BranchProvider>

          {/* ==================================================
              INVENTORY PROVIDER
          ================================================== */}

          <InventoryProvider>

            {/* ================================================
                APPLICATION LAYOUT
            ================================================ */}

            <AppLayout />

          </InventoryProvider>

        </BranchProvider>

      </AuthProvider>

    </BrowserRouter>
  );
};


export default App;