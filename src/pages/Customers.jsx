import React from "react";

const Customers = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Manage your customers.</p>
        </div>

        <button className="primary-button">
          <i className="bi bi-person-plus"></i>
          Add Customer
        </button>
      </div>

      <div className="dashboard-card bg-white p-4">
        <h5>Customer Management</h5>
        <p className="text-muted mb-0">
          Customer management will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default Customers;