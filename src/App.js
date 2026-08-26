import React from "react";
import { BrowserRouter } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import TopNavbar from "./components/layout/TopNavbar";

import { InventoryProvider } from "./context/InventoryContext";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <InventoryProvider>

        <div className="app-container">

          <Sidebar />

          <div className="main-content">

            <TopNavbar />

            <main className="content-area">
              <AppRoutes />
            </main>

          </div>

        </div>

      </InventoryProvider>
    </BrowserRouter>
  );
};

export default App;