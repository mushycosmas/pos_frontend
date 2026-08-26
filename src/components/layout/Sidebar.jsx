import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    // =========================
    // MAIN
    // =========================
    {
      section: 'MAIN',
      items: [
        {
          name: 'Dashboard',
          icon: 'bi-grid-1x2-fill',
          path: '/dashboard',
        },
        {
          name: 'POS / Sales',
          icon: 'bi-cart3',
          path: '/pos',
        },
      ],
    },

    // =========================
    // SALES
    // =========================
    {
      section: 'SALES',
      items: [
        {
          name: 'Sales',
          icon: 'bi-receipt',
          path: '/sales',
        },
        {
          name: 'Customers',
          icon: 'bi-people',
          path: '/customers',
        },
        {
          name: 'Returns',
          icon: 'bi-arrow-return-left',
          path: '/returns',
        },
      ],
    },

    // =========================
    // INVENTORY
    // =========================
    {
      section: 'INVENTORY',
      items: [
        {
          name: 'Products',
          icon: 'bi-box-seam',
          path: '/products',
        },
        {
          name: 'Inventory',
          icon: 'bi-stack',
          path: '/inventory',
        },
        {
          name: 'Categories',
          icon: 'bi-tags',
          path: '/categories',
        },
         {
          name: 'Brands',
          icon: 'bi-award',
          path: '/brands',
        },
        {
          name: 'Purchases',
          icon: 'bi-bag-plus',
          path: '/purchases',
        },
        {
          name: 'Suppliers',
          icon: 'bi-truck',
          path: '/suppliers',
        },
        {
          name: 'Stock Adjustments',
          icon: 'bi-sliders',
          path: '/stock-adjustments',
        },
      ],
    },

    // =========================
    // FINANCE
    // =========================
    {
      section: 'FINANCE',
      items: [
        {
          name: 'Expenses',
          icon: 'bi-wallet2',
          path: '/expenses',
        },
        {
          name: 'Payments',
          icon: 'bi-credit-card',
          path: '/payments',
        },
        {
          name: 'Cash Management',
          icon: 'bi-cash-stack',
          path: '/cash-management',
        },
      ],
    },

    // =========================
    // REPORTS
    // =========================
    {
      section: 'REPORTS',
      items: [
        {
          name: 'Sales Reports',
          icon: 'bi-bar-chart-line',
          path: '/reports/sales',
        },
        {
          name: 'Inventory Reports',
          icon: 'bi-clipboard-data',
          path: '/reports/inventory',
        },
        {
          name: 'Expense Reports',
          icon: 'bi-file-earmark-bar-graph',
          path: '/reports/expenses',
        },
        {
          name: 'Profit & Loss',
          icon: 'bi-graph-up-arrow',
          path: '/reports/profit-loss',
        },
      ],
    },

    // =========================
    // SYSTEM
    // =========================
    {
      section: 'SYSTEM',
      items: [
        {
          name: 'Users',
          icon: 'bi-people-fill',
          path: '/users',
        },
        {
          name: 'Roles & Permissions',
          icon: 'bi-shield-lock',
          path: '/roles',
        },
        {
          name: 'Settings',
          icon: 'bi-gear',
          path: '/settings',
        },
      ],
    },
  ];

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="brand">
        <div className="brand-icon">
          <i className="bi bi-shop"></i>
        </div>

        <div>
          <div className="brand-name">
            POS SYSTEM
          </div>

          <small>
            Retail Management
          </small>
        </div>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">

        {menuItems.map((group) => (
          <div
            className="menu-group"
            key={group.section}
          >

            <div className="menu-title">
              {group.section}
            </div>

            {group.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon}`}></i>

                <span>
                  {item.name}
                </span>
              </NavLink>
            ))}

          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">

        <div className="store-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              Store Online
            </strong>

            <small>
              System operational
            </small>
          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;