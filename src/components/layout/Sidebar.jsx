import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    {
      section: "main",
      items: [
        {
          name: "dashboard",
          icon: "bi-grid-1x2-fill",
          path: "/dashboard",
          permission: "dashboard.view_dashboard",
        },
        {
          name: "pos_sales",
          icon: "bi-cart3",
          path: "/pos",
          permission: "sales.view_sale",
        },
      ],
    },
    {
      section: "sales_section",
      items: [
        {
          name: "sales",
          icon: "bi-receipt",
          path: "/sales",
          permission: "sales.view_sale",
        },
        {
          name: "customers",
          icon: "bi-people",
          path: "/customers",
          permission: "customers.view_customer",
        },
        {
          name: "returns",
          icon: "bi-arrow-return-left",
          path: "/returns",
          permission: "sales.return_sale",
        },
      ],
    },
    {
      section: "inventory_section",
      items: [
        {
          name: "products",
          icon: "bi-box-seam",
          path: "/products",
          permission: "products.view_product",
        },
        {
          name: "inventory",
          icon: "bi-stack",
          path: "/inventory",
          permission: "inventory.view_stock",
        },
        {
          name: "categories",
          icon: "bi-tags",
          path: "/categories",
          permission: "products.view_category",
        },
        {
          name: "brands",
          icon: "bi-award",
          path: "/brands",
          permission: "products.view_brand",
        },
        {
          name: "purchases",
          icon: "bi-bag-plus",
          path: "/purchases",
          permission: "purchases.view_purchase",
        },
        {
          name: "suppliers",
          icon: "bi-truck",
          path: "/suppliers",
          permission: "suppliers.view_supplier",
        },
        {
          name: "stock_adjustments",
          icon: "bi-sliders",
          path: "/stock-adjustments",
          permission: "inventory.change_stock",
        },
        {
          name: "stock_movements",
          icon: "bi-arrow-left-right",
          path: "/stock-movements",
          permission: "inventory.view_stockmovement",
        },
      ],
    },
    {
      section: "finance_section",
      items: [
        {
          name: "expenses",
          icon: "bi-wallet2",
          path: "/expenses",
          permission: "expenses.view_expense",
        },
        {
          name: "payments",
          icon: "bi-credit-card",
          path: "/payments",
          permission: "payments.view_payment",
        },
        {
          name: "cash_management",
          icon: "bi-cash-stack",
          path: "/cash-management",
          permission: "cash_management.view_cash",
        },
      ],
    },
    {
      section: "reports_section",
      items: [
        {
          name: "sales_reports",
          icon: "bi-bar-chart-line",
          path: "/reports/sales",
          permission: "reports.view_sales_report",
        },
        {
          name: "inventory_reports",
          icon: "bi-clipboard-data",
          path: "/reports/inventory",
          permission: "reports.view_inventory_report",
        },
        {
          name: "expense_reports",
          icon: "bi-file-earmark-bar-graph",
          path: "/reports/expenses",
          permission: "reports.view_expense_report",
        },
        {
          name: "profit_loss",
          icon: "bi-graph-up-arrow",
          path: "/reports/profit-loss",
          permission: "reports.view_profit_loss",
        },
      ],
    },
    {
      section: "system_section",
      items: [
        {
          name: "users",
          icon: "bi-people-fill",
          path: "/users",
          permission: "accounts.view_user",
        },
        {
          name: "roles_permissions",
          icon: "bi-shield-lock",
          path: "/roles",
          permission: "roles.view_role",
        },
        {
          name: "payment_methods",
          icon: "bi-credit-card-2-front",
          path: "/payment-methods",
          permission: "payments.view_paymentmethod",
        },
        {
          name: "settings",
          icon: "bi-gear",
          path: "/settings",
          permission: "settings.view_setting",
        },
      ],
    },
  ];

  const visibleMenuGroups = menuItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.permission || hasPermission(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <i className="bi bi-shop" />
        </div>

        <div>
          <div className="brand-name">POS SYSTEM</div>
          <small>{t("retail_management")}</small>
        </div>
      </div>

      <div className="sidebar-menu">
        {visibleMenuGroups.map((group) => (
          <div className="menu-group" key={group.section}>
            <div className="menu-title">
              {t(group.section)}
            </div>

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <i className={`bi ${item.icon}`} />

                <span>{t(item.name)}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="store-status">
          <span className="status-dot" />

          <div>
            <strong>{t("store_online")}</strong>
            <small>{t("system_operational")}</small>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
