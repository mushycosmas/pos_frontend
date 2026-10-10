import React from "react";

const CustomerHeader = ({ onAddCustomer, branchName }) => {
  return (
    <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h2 className="mb-1">Customers</h2>

        <p className="text-muted mb-1">
          Manage your customers and customer credit.
        </p>

        {branchName && (
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1" />
            Active branch: <strong>{branchName}</strong>
          </small>
        )}
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={onAddCustomer}
      >
        <i className="bi bi-person-plus me-2" />
        Add Customer
      </button>
    </div>
  );
};

export default CustomerHeader;