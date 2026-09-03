import React, { useEffect, useMemo, useState } from "react";
import customerApi from "../services/customerApi";

const Customers = () => {
  // =========================================================
  // STATE
  // =========================================================
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "individual",
    tax_number: "",
    credit_limit: "0",
    company: "",
    branch: "",
    is_active: true,
  });

  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await customerApi.getAll();

      // Support normal array and DRF pagination
      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.results)) {
        setCustomers(data.results);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }

    const search = searchTerm.toLowerCase().trim();

    return customers.filter((customer) => {
      return (
        String(customer.name || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.email || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.customer_type_display || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.tax_number || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.company_name || "")
          .toLowerCase()
          .includes(search) ||
        String(customer.branch_name || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [customers, searchTerm]);

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================
  const handleAddCustomer = () => {
    setEditingCustomer(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      customer_type: "individual",
      tax_number: "",
      credit_limit: "0",
      company: "",
      branch: "",
      is_active: true,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      customer_type: customer.customer_type || "individual",
      tax_number: customer.tax_number || "",
      credit_limit:
        customer.credit_limit !== null &&
        customer.credit_limit !== undefined
          ? String(customer.credit_limit)
          : "0",
      company:
        customer.company !== null &&
        customer.company !== undefined
          ? String(customer.company)
          : "",
      branch:
        customer.branch !== null &&
        customer.branch !== undefined
          ? String(customer.branch)
          : "",
      is_active:
        customer.is_active === undefined
          ? true
          : customer.is_active,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      customer_type: "individual",
      tax_number: "",
      credit_limit: "0",
      company: "",
      branch: "",
      is_active: true,
    });
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Customer name is required.";
    }

    if (!formData.phone.trim()) {
      return "Phone number is required.";
    }

    if (formData.phone.trim().length > 15) {
      return "Phone number cannot exceed 15 characters.";
    }

    if (
      formData.credit_limit !== "" &&
      Number(formData.credit_limit) < 0
    ) {
      return "Credit limit cannot be negative.";
    }

    if (!formData.company) {
      return "Company is required.";
    }

    return "";
  };

  // =========================================================
  // PREPARE PAYLOAD
  // =========================================================
  const preparePayload = () => {
    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim(),
      customer_type: formData.customer_type,
      tax_number: formData.tax_number.trim() || null,
      credit_limit:
        formData.credit_limit === ""
          ? "0"
          : formData.credit_limit,
      company: Number(formData.company),
      is_active: formData.is_active,
    };

    // Branch is optional in your Django model
    if (formData.branch) {
      payload.branch = Number(formData.branch);
    } else {
      payload.branch = null;
    }

    return payload;
  };

  // =========================================================
  // SAVE CUSTOMER
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = preparePayload();

      if (editingCustomer) {
        const updatedCustomer = await customerApi.update(
          editingCustomer.id,
          payload
        );

        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingCustomer.id
              ? updatedCustomer
              : customer
          )
        );
      } else {
        const newCustomer = await customerApi.create(payload);

        setCustomers((prev) => [
          newCustomer,
          ...prev,
        ]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save customer:", err);

      const apiError = err?.response?.data;

      if (
        typeof apiError === "object" &&
        apiError !== null
      ) {
        const messages = Object.entries(apiError)
          .map(([field, message]) => {
            if (Array.isArray(message)) {
              return `${field}: ${message.join(", ")}`;
            }

            if (
              typeof message === "object" &&
              message !== null
            ) {
              return `${field}: ${JSON.stringify(message)}`;
            }

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages || "Failed to save customer."
        );
      } else {
        setError(
          "Failed to save customer. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE CUSTOMER
  // =========================================================
  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await customerApi.delete(customer.id);

      setCustomers((prev) =>
        prev.filter(
          (item) => item.id !== customer.id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete customer:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete customer. Please try again."
      );
    }
  };

  // =========================================================
  // TOGGLE ACTIVE STATUS
  // =========================================================
  const handleToggleStatus = async (customer) => {
    try {
      setError("");

      const updatedCustomer =
        await customerApi.patch(customer.id, {
          is_active: !customer.is_active,
        });

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id
            ? updatedCustomer
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update customer status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to update customer status."
      );
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================
  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-TZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Customers</h2>

          <p className="text-muted mb-0">
            Manage your customers and customer credit.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAddCustomer}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add Customer
        </button>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* =====================================================
          CUSTOMER CARD
      ====================================================== */}
      <div className="dashboard-card bg-white p-4">
        {/* TOP BAR */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h5 className="mb-1">
              Customer Management
            </h5>

            <small className="text-muted">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}
            </small>
          </div>

          {/* SEARCH */}
          <div
            className="input-group"
            style={{ maxWidth: "350px" }}
          >
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-3 mb-0">
              Loading customers...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================== */
          <div className="text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-people"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>

            <h5>
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
                onClick={handleAddCustomer}
              >
                <i className="bi bi-person-plus me-2"></i>
                Add Customer
              </button>
            )}
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================== */
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
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer, index) => (
                    <tr key={customer.id}>
                      {/* NUMBER */}
                      <td>{index + 1}</td>

                      {/* CUSTOMER */}
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                            }}
                          >
                            <i className="bi bi-person"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {customer.name ||
                                "Unnamed"}
                            </div>

                            {customer.tax_number && (
                              <small className="text-muted">
                                TIN:{" "}
                                {customer.tax_number}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PHONE */}
                      <td>
                        {customer.phone || (
                          <span className="text-muted">
                            —
                          </span>
                        )}
                      </td>

                      {/* CUSTOMER TYPE */}
                      <td>
                        <span className="badge bg-light text-dark">
                          {customer.customer_type_display ||
                            customer.customer_type ||
                            "Individual"}
                        </span>
                      </td>

                      {/* COMPANY */}
                      <td>
                        {customer.company_name || (
                          <span className="text-muted">
                            —
                          </span>
                        )}
                      </td>

                      {/* BRANCH */}
                      <td>
                        {customer.branch_name || (
                          <span className="text-muted">
                            —
                          </span>
                        )}
                      </td>

                      {/* CREDIT LIMIT */}
                      <td>
                        TSh{" "}
                        {formatMoney(
                          customer.credit_limit
                        )}
                      </td>

                      {/* CURRENT BALANCE */}
                      <td>
                        <span
                          className={
                            Number(
                              customer.current_balance ||
                                0
                            ) > 0
                              ? "text-danger fw-semibold"
                              : "text-success"
                          }
                        >
                          TSh{" "}
                          {formatMoney(
                            customer.current_balance
                          )}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            customer.is_active
                              ? "btn-success"
                              : "btn-secondary"
                          }`}
                          onClick={() =>
                            handleToggleStatus(
                              customer
                            )
                          }
                          title="Change status"
                        >
                          {customer.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Edit customer"
                            onClick={() =>
                              handleEditCustomer(
                                customer
                              )
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete customer"
                            onClick={() =>
                              handleDelete(customer)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT CUSTOMER MODAL
      ====================================================== */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              {/* MODAL HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">
                  <i
                    className={`bi ${
                      editingCustomer
                        ? "bi-pencil-square"
                        : "bi-person-plus"
                    } me-2`}
                  ></i>

                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={saving}
                ></button>
              </div>

              {/* MODAL BODY */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* NAME */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Customer Name{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter customer name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* PHONE */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Phone Number{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="e.g. 0712345678"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={15}
                        required
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="customer@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    {/* CUSTOMER TYPE */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Customer Type{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <select
                        name="customer_type"
                        className="form-select"
                        value={formData.customer_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="individual">
                          Individual
                        </option>

                        <option value="business">
                          Business
                        </option>

                        <option value="wholesale">
                          Wholesale
                        </option>
                      </select>
                    </div>

                    {/* TAX NUMBER */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Tax Number / TIN
                      </label>

                      <input
                        type="text"
                        name="tax_number"
                        className="form-control"
                        placeholder="Enter TIN"
                        value={formData.tax_number}
                        onChange={handleChange}
                      />
                    </div>

                    {/* CREDIT LIMIT */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Credit Limit
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          TSh
                        </span>

                        <input
                          type="number"
                          name="credit_limit"
                          className="form-control"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={
                            formData.credit_limit
                          }
                          onChange={handleChange}
                        />
                      </div>

                      <small className="text-muted">
                        Maximum amount this customer can
                        owe.
                      </small>
                    </div>

                    {/* COMPANY */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Company{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <input
                        type="number"
                        name="company"
                        className="form-control"
                        placeholder="Enter company ID"
                        value={formData.company}
                        onChange={handleChange}
                        required
                      />

                      <small className="text-muted">
                        Replace this with a company dropdown
                        when your Company API is available.
                      </small>
                    </div>

                    {/* BRANCH */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Branch
                      </label>

                      <input
                        type="number"
                        name="branch"
                        className="form-control"
                        placeholder="Enter branch ID"
                        value={formData.branch}
                        onChange={handleChange}
                      />

                      <small className="text-muted">
                        Optional.
                      </small>
                    </div>

                    {/* ADDRESS */}
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        Address
                      </label>

                      <textarea
                        name="address"
                        className="form-control"
                        rows="3"
                        placeholder="Enter customer address"
                        value={formData.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    {/* STATUS */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_active"
                          name="is_active"
                          checked={
                            formData.is_active
                          }
                          onChange={handleChange}
                        />

                        <label
                          className="form-check-label"
                          htmlFor="is_active"
                        >
                          Active Customer
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editingCustomer
                          ? "Update Customer"
                          : "Save Customer"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

