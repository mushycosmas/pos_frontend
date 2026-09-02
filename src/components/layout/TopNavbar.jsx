
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const TopNavbar = () => {
  const { user, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);

  // ============================================================
  // USER DISPLAY
  // ============================================================

  const fullName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "User";

  const role =
    user?.role_name ||
    user?.role ||
    "User";

  const avatarLetter =
    (
      user?.first_name?.charAt(0) ||
      user?.username?.charAt(0) ||
      "U"
    ).toUpperCase();

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <header className="top-navbar">

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="search-box">
        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Search products, customers, orders..."
        />

        <span className="search-shortcut">
          Ctrl K
        </span>
      </div>

      {/* ======================================================
          NAVBAR ACTIONS
      ====================================================== */}

      <div className="navbar-actions">

        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <button
          type="button"
          className="icon-button"
          title="Notifications"
        >
          <i className="bi bi-bell"></i>

          <span className="notification-dot"></span>
        </button>

        {/* ====================================================
            USER PROFILE
        ==================================================== */}

        <div
          className="user-profile"
          onClick={() => setShowMenu(!showMenu)}
          style={{ position: "relative" }}
        >

          {/* Avatar */}

          <div className="avatar">
            {avatarLetter}
          </div>

          {/* User information */}

          <div className="user-info">
            <strong>{fullName}</strong>

            <small>{role}</small>
          </div>

          {/* Chevron */}

          <i
            className={`bi ${
              showMenu
                ? "bi-chevron-up"
                : "bi-chevron-down"
            }`}
          ></i>

          {/* ==================================================
              USER DROPDOWN
          ================================================== */}

          {showMenu && (
            <div
              className="user-dropdown"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* Profile */}

              <button
                type="button"
                className="dropdown-item"
              >
                <i className="bi bi-person"></i>
                <span>Profile</span>
              </button>

              {/* Settings */}

              <button
                type="button"
                className="dropdown-item"
              >
                <i className="bi bi-gear"></i>
                <span>Settings</span>
              </button>

              <div className="dropdown-divider"></div>

              {/* Logout */}

              <button
                type="button"
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default TopNavbar;

