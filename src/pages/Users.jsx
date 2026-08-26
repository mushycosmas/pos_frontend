import React from "react";

const Users = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Manage POS system users and permissions.</p>
        </div>

        <button className="primary-button">
          <i className="bi bi-person-plus"></i>
          Add User
        </button>
      </div>

      <div className="dashboard-card bg-white p-4">
        <h5>User Management</h5>
        <p className="text-muted mb-0">
          Users and permissions will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default Users;