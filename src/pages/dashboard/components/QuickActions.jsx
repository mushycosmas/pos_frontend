
import React from "react";
import { Card } from "react-bootstrap";

const QuickActions = ({
  canCreateSale,
  canViewSales,
  canViewProducts,
  canViewCustomers,
  navigate,
}) => {
  const actions = [
    canCreateSale && {
      title: "New Sale",
      description: "Create a new transaction",
      icon: "bi-cart-plus",
      path: "/pos",
    },
    canViewSales && {
      title: "Sales",
      description: "View sales transactions",
      icon: "bi-receipt",
      path: "/sales",
    },
    canViewProducts && {
      title: "Products",
      description: "Manage inventory",
      icon: "bi-box-seam",
      path: "/products",
    },
    canViewCustomers && {
      title: "Customers",
      description: "View customers",
      icon: "bi-people",
      path: "/customers",
    },
  ].filter(Boolean);

  return (
    <Card className="dashboard-card border-0 h-100">
      <Card.Body>
        <div className="card-heading">
          <div>
            <h5>Quick Actions</h5>
            <span>Available actions</span>
          </div>
        </div>

        <div className="quick-action-list">
          {actions.map((action) => (
            <button
              type="button"
              className="quick-action mb-3 w-100 text-start border-0 bg-transparent"
              style={{ cursor: "pointer" }}
              key={action.path}
              onClick={() => navigate(action.path)}
            >
              <div className="quick-action-icon">
                <i className={`bi ${action.icon}`} />
              </div>
              <div>
                <strong>{action.title}</strong>
                <small className="d-block">{action.description}</small>
              </div>
            </button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuickActions;
