
import React from "react";

const DashboardHeader = ({
  userName,
  message,
  canCreateSale,
  onNewSale,
  branchName,
}) => (
  <div className="page-header">
    <div>
      <h2>Dashboard</h2>
      <p>
        Welcome back, <strong>{userName}</strong>. {message}
        {branchName ? (
          <span className="d-block small text-muted mt-1">
            <i className="bi bi-shop me-1" />
            Branch: {branchName}
          </span>
        ) : null}
      </p>
    </div>

    {canCreateSale && (
      <button
        type="button"
        className="primary-button"
        onClick={onNewSale}
      >
        <i className="bi bi-plus-lg" /> New Sale
      </button>
    )}
  </div>
);

export default DashboardHeader;
