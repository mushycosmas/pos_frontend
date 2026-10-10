import React, { useEffect, useState } from "react";

const createInitialForm = (customer, currentBranch) => ({
  name: customer?.name || "",
  phone: customer?.phone || "",
  email: customer?.email || "",
  address: customer?.address || "",
  customer_type: customer?.customer_type || "individual",
  tax_number: customer?.tax_number || "",
  credit_limit:
    customer?.credit_limit !== null &&
    customer?.credit_limit !== undefined
      ? String(customer.credit_limit)
      : "0",
  company:
    customer?.company !== null &&
    customer?.company !== undefined
      ? String(customer.company)
      : "",
  branch: customer
    ? customer.branch != null
      ? String(customer.branch)
      : ""
    : currentBranch?.id
      ? String(currentBranch.id)
      : "",
  is_active: customer?.is_active ?? true,
});

const CustomerFormModal = ({
  show,
  customer,
  currentBranch,
  saving,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(
    () => createInitialForm(customer, currentBranch)
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setFormData(createInitialForm(customer, currentBranch));
      setError("");
    }
  }, [show, customer, currentBranch]);

  if (!show) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (formData.phone.trim().length > 15) {
      setError("Phone number cannot exceed 15 characters.");
      return;
    }

    if (
      formData.credit_limit !== "" &&
      (!Number.isFinite(Number(formData.credit_limit)) ||
        Number(formData.credit_limit) < 0)
    ) {
      setError("Enter a valid, non-negative credit limit.");
      return;
    }

    if (!formData.company || !Number.isInteger(Number(formData.company))) {
      setError("A valid company ID is required.");
      return;
    }

    if (!formData.branch) {
      setError("Select an active branch before saving.");
      return;
    }

    setError("");

    onSubmit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim(),
      customer_type: formData.customer_type,
      tax_number: formData.tax_number.trim() || null,
      credit_limit: formData.credit_limit || "0",
      company: Number(formData.company),
      branch: Number(formData.branch),
      is_active: formData.is_active,
    });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i
                className={`bi ${
                  customer ? "bi-pencil-square" : "bi-person-plus"
                } me-2`}
              />
              {customer ? "Edit Customer" : "Add Customer"}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={saving}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <div className="alert alert-light border">
                <i className="bi bi-geo-alt me-2" />
                Selected branch:{" "}
                <strong>
                  {currentBranch?.name || "No branch selected"}
                </strong>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Customer Name *
                  </label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Phone Number *
                  </label>
                  <input
                    className="form-control"
                    type="tel"
                    name="phone"
                    maxLength={15}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Customer Type</label>
                  <select
                    className="form-select"
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">TIN / Tax Number</label>
                  <input
                    className="form-control"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Credit Limit (TSh)</label>
                  <input
                    className="form-control"
                    type="number"
                    name="credit_limit"
                    min="0"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Company ID *</label>
                  <input
                    className="form-control"
                    type="number"
                    name="company"
                    min="1"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Replace with a company dropdown when your company
                    API is connected.
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Branch</label>
                  <input
                    className="form-control"
                    value={currentBranch?.name || ""}
                    readOnly
                  />
                  <small className="text-muted">
                    The active branch is assigned automatically.
                  </small>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="customer_is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="customer_is_active"
                    >
                      Active Customer
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving || !currentBranch?.id}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />
                    {customer ? "Update Customer" : "Save Customer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;