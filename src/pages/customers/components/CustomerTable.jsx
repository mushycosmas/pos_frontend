import React from "react";

const CustomerTable = ({
  customers,
  loading,
  searchTerm,
  onEdit,
  onDelete,
  onToggleStatus,
  formatMoney,
  onAddCustomer,
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-muted mt-3">
          Loading customers...
        </p>
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="text-center py-5">
        <i
          className="bi bi-people"
          style={{ fontSize: "3rem" }}
        />

        <h5 className="mt-3">
          {searchTerm
            ? "No customers found"
            : "No customers yet"}
        </h5>

        <p className="text-muted">
          {searchTerm
            ? "Try using a different search term."
            : "Add your first customer to get started."}
        </p>

        {!searchTerm && (
          <button
            type="button"
            className="primary-button"
            onClick={onAddCustomer}
          >
            <i className="bi bi-person-plus me-2" />
            Add Customer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Company</th>
            <th>Branch</th>
            <th>Credit Limit</th>
            <th>Balance</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.id}>
              <td>{index + 1}</td>

              <td>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                    }}
                  >
                    <i className="bi bi-person" />
                  </div>

                  <div>
                    <div className="fw-semibold">
                      {customer.name || "Unnamed"}
                    </div>

                    {customer.tax_number && (
                      <small className="text-muted">
                        TIN: {customer.tax_number}
                      </small>
                    )}
                  </div>
                </div>
              </td>

              <td>{customer.phone || "—"}</td>

              <td>
                <span className="badge bg-light text-dark">
                  {customer.customer_type_display ||
                    customer.customer_type ||
                    "Individual"}
                </span>
              </td>

              <td>{customer.company_name || "—"}</td>

              <td>{customer.branch_name || "—"}</td>

              <td>
                TSh {formatMoney(customer.credit_limit)}
              </td>

              <td>
                <span
                  className={
                    Number(customer.current_balance || 0) > 0
                      ? "text-danger fw-semibold"
                      : "text-success"
                  }
                >
                  TSh {formatMoney(customer.current_balance)}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    customer.is_active
                      ? "btn-success"
                      : "btn-secondary"
                  }`}
                  onClick={() => onToggleStatus(customer)}
                >
                  {customer.is_active ? "Active" : "Inactive"}
                </button>
              </td>

              <td className="text-end">
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    title="Edit customer"
                    onClick={() => onEdit(customer)}
                  >
                    <i className="bi bi-pencil" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Delete customer"
                    onClick={() => onDelete(customer)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;