
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useBranch } from "../../context/BranchContext";
import LanguageSwitcher from "../LanguageSwitcher";

const TopNavbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, logout } = useAuth();

  const {
    branches,
    activeBranches,
    currentBranch,
    switchBranch,
    hasMultipleBranches,
  } = useBranch();

  const [showMenu, setShowMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [branchSwitching, setBranchSwitching] = useState(false);
  const [branchError, setBranchError] = useState("");

  const profileRef = useRef(null);
  const branchRef = useRef(null);

  // ============================================================
  // USER DISPLAY
  // ============================================================

  const fullName =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.username ||
    "User";

  const role = user?.role_name || user?.role || "User";

  const avatarLetter = (
    user?.first_name?.charAt(0) ||
    user?.username?.charAt(0) ||
    "U"
  ).toUpperCase();

  // ============================================================
  // CURRENT BRANCH
  // ============================================================

  const branchName =
    currentBranch?.name ||
    user?.branch_name ||
    t("main_branch", "Main Branch");

  const branchCode =
    currentBranch?.code ||
    user?.branch_code ||
    "MAIN";

  // ============================================================
  // AVAILABLE BRANCHES
  // ============================================================

  const availableBranches = Array.isArray(activeBranches)
    ? activeBranches
    : Array.isArray(branches)
      ? branches.filter((branch) => branch?.is_active !== false)
      : [];

  // ============================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

      if (
        branchRef.current &&
        !branchRef.current.contains(event.target)
      ) {
        setShowBranchMenu(false);
        setBranchError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // BRANCH SWITCH
  // ============================================================

  const handleBranchSwitch = async (branch) => {
    if (!branch) return;

    if (Number(branch.id) === Number(currentBranch?.id)) {
      setShowBranchMenu(false);
      return;
    }

    try {
      setBranchSwitching(true);
      setBranchError("");

      const result = await switchBranch(branch);

      if (result?.success === false) {
        setBranchError(
          result?.error ||
            t("branch_switch_failed", "Failed to switch branch.")
        );
        return;
      }

      setShowBranchMenu(false);
      setBranchError("");
    } catch (error) {
      console.error("Branch switch failed:", error);

      setBranchError(
        t(
          "branch_switch_error",
          "Unable to switch branch. Please try again."
        )
      );
    } finally {
      setBranchSwitching(false);
    }
  };

  // ============================================================
  // USER MENU
  // ============================================================

  const toggleUserMenu = () => {
    setShowMenu((previous) => !previous);
    setShowBranchMenu(false);
    setBranchError("");
  };

  // ============================================================
  // BRANCH MENU
  // ============================================================

  const toggleBranchMenu = () => {
    if (!hasMultipleBranches) return;

    setShowBranchMenu((previous) => !previous);
    setShowMenu(false);
    setBranchError("");
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleProfile = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setShowMenu(false);
    navigate("/settings");
  };

  const handleManageBranches = () => {
    setShowBranchMenu(false);
    setBranchError("");
    navigate("/settings/branches");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    setShowMenu(false);
    setShowBranchMenu(false);
    setBranchError("");

    await logout();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <header className="top-navbar">
      {/* SEARCH */}

      <div className="search-box">
        <i className="bi bi-search" aria-hidden="true"></i>

        <input
          type="text"
          placeholder={t(
            "navbar_search_placeholder",
            "Search products, customers, orders..."
          )}
          aria-label={t("search", "Search")}
        />

        <span className="search-shortcut">Ctrl K</span>
      </div>

      {/* NAVBAR ACTIONS */}

      <div className="navbar-actions">
        {/* LANGUAGE SELECTOR */}

        <LanguageSwitcher />

        {/* BRANCH SELECTOR */}

        <div
          ref={branchRef}
          className="branch-selector"
          style={{
            position: "relative",
            marginRight: "12px",
          }}
        >
          <button
            type="button"
            className="branch-button"
            onClick={toggleBranchMenu}
            disabled={branchSwitching}
            title={
              hasMultipleBranches
                ? t("switch_branch", "Switch Branch")
                : t("current_branch", "Current Branch")
            }
            aria-expanded={showBranchMenu}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              borderRadius: "8px",
              padding: "7px 10px",
              cursor:
                hasMultipleBranches && !branchSwitching
                  ? "pointer"
                  : "default",
              opacity: branchSwitching ? 0.7 : 1,
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f5f9",
                flexShrink: 0,
              }}
            >
              {branchSwitching ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-label={t("loading", "Loading")}
                />
              ) : (
                <i className="bi bi-shop" aria-hidden="true"></i>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                lineHeight: "1.1",
              }}
            >
              <small
                style={{
                  color: "#6b7280",
                  fontSize: "10px",
                }}
              >
                {t("branch", "Branch")}
              </small>

              <strong
                style={{
                  fontSize: "13px",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {branchName}
              </strong>
            </div>

            {hasMultipleBranches && (
              <i
                className={`bi ${
                  showBranchMenu
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
                }`}
                aria-hidden="true"
                style={{ fontSize: "12px" }}
              />
            )}
          </button>

          {/* BRANCH DROPDOWN */}

          {showBranchMenu && hasMultipleBranches && (
            <div
              className="branch-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: "280px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                zIndex: 1050,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "14px" }}>
                  {t("switch_branch", "Switch Branch")}
                </div>

                <small style={{ color: "#6b7280" }}>
                  {t(
                    "select_branch",
                    "Select the branch you want to work in"
                  )}
                </small>
              </div>

              {branchError && (
                <div
                  role="alert"
                  style={{
                    margin: "8px",
                    padding: "9px 10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: "7px",
                    fontSize: "12px",
                  }}
                >
                  <i className="bi bi-exclamation-circle me-1" />
                  {branchError}
                </div>
              )}

              <div
                style={{
                  padding: "6px",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {availableBranches.length === 0 ? (
                  <div
                    style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    <i
                      className="bi bi-shop"
                      aria-hidden="true"
                      style={{
                        fontSize: "24px",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    />

                    {t("no_branches", "No branches available.")}
                  </div>
                ) : (
                  availableBranches.map((branch) => {
                    const isCurrent =
                      Number(branch.id) ===
                      Number(currentBranch?.id);

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        disabled={branchSwitching}
                        onClick={() => handleBranchSwitch(branch)}
                        aria-current={isCurrent ? "true" : undefined}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px",
                          border: "none",
                          borderRadius: "8px",
                          background: isCurrent
                            ? "#f1f5f9"
                            : "transparent",
                          cursor: branchSwitching
                            ? "default"
                            : "pointer",
                          textAlign: "left",
                          opacity: branchSwitching ? 0.6 : 1,
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isCurrent
                              ? "#e2e8f0"
                              : "#f8fafc",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className={
                              branch.is_main
                                ? "bi bi-building"
                                : "bi bi-shop"
                            }
                            aria-hidden="true"
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "13px",
                            }}
                          >
                            {branch.name}
                          </div>

                          <small style={{ color: "#6b7280" }}>
                            {branch.code || "No code"}

                            {branch.is_main && (
                              <span className="ms-1">
                                • {t("main", "Main")}
                              </span>
                            )}
                          </small>
                        </div>

                        {isCurrent && (
                          <i
                            className="bi bi-check-circle-fill"
                            aria-label={t("current_branch", "Current Branch")}
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  padding: "6px",
                }}
              >
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleManageBranches}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    borderRadius: "7px",
                  }}
                >
                  <i className="bi bi-building-add" aria-hidden="true" />
                  <span>
                    {t("manage_branches", "Manage Branches")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="icon-button"
          title={t("notifications", "Notifications")}
          aria-label={t("notifications", "Notifications")}
        >
          <i className="bi bi-bell" aria-hidden="true" />
          <span className="notification-dot" />
        </button>

        {/* USER PROFILE */}

        <div
          ref={profileRef}
          className="user-profile"
          onClick={toggleUserMenu}
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >
          <div className="avatar">{avatarLetter}</div>

          <div className="user-info">
            <strong>{fullName}</strong>
            <small>{role}</small>
          </div>

          <i
            className={`bi ${
              showMenu ? "bi-chevron-up" : "bi-chevron-down"
            }`}
            aria-hidden="true"
          />

          {/* USER DROPDOWN */}

          {showMenu && (
            <div
              className="user-dropdown"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="dropdown-item"
                onClick={handleProfile}
              >
                <i className="bi bi-person" aria-hidden="true" />
                <span>{t("profile", "Profile")}</span>
              </button>

              <button
                type="button"
                className="dropdown-item"
                onClick={handleSettings}
              >
                <i className="bi bi-gear" aria-hidden="true" />
                <span>{t("settings", "Settings")}</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <i
                  className="bi bi-box-arrow-right"
                  aria-hidden="true"
                />
                <span>{t("logout", "Logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
