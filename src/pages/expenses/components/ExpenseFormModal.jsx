
import React from "react";

export default function ExpenseFormModal(props) {
  const {
    showModal,
    editingExpense,
    handleCloseModal,
    handleSubmit,
    formData,
    handleChange,
    EXPENSE_TYPES,
    branches = [],
    currentBranch,
    paymentMethods = [],
    loadingOptions,
    loadingPaymentMethods = false,
    PAYMENT_STATUSES,
    formatMoney,
    saving,
  } = props;

  if (!showModal) {
    return null;
  }

  const currentBranchId =
    currentBranch?.id !== null &&
    currentBranch?.id !== undefined
      ? String(currentBranch.id)
      : "";

  const editingBranchId =
    editingExpense?.branch &&
    typeof editingExpense.branch === "object"
      ? editingExpense.branch.id
      : editingExpense?.branch;

  const selectedBranchId = editingExpense
    ? String(
        editingBranchId ??
          formData.branch ??
          ""
      )
    : currentBranchId;

  const selectedBranch = branches.find(
    (branch) => String(branch.id) === selectedBranchId
  );

  const branchLocked = !editingExpense;

  const selectedPaymentMethod = String(
    formData.payment_method ?? ""
  );

  const selectedPaymentMethodExists = paymentMethods.some(
    (method) =>
      String(method.name) === selectedPaymentMethod
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expenseModalTitle"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5
              className="modal-title"
              id="expenseModalTitle"
            >
              <i
                className={`bi ${
                  editingExpense
                    ? "bi-pencil-square"
                    : "bi-receipt"
                } me-2`}
              />

              {editingExpense
                ? "Edit Expense"
                : "Add Expense"}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              disabled={saving}
              aria-label="Close"
            />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* EXPENSE TITLE */}
                <div className="col-md-8">
                  <label className="form-label">
                    Expense Title{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Office electricity bill"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* EXPENSE TYPE */}
                <div className="col-md-4">
                  <label className="form-label">
                    Expense Type{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <select
                    name="expense_type"
                    className="form-select"
                    value={formData.expense_type}
                    onChange={handleChange}
                    required
                  >
                    {EXPENSE_TYPES.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BRANCH */}
                <div className="col-md-6">
                  <label className="form-label">
                    Branch{" "}
                    <span className="text-danger">*</span>
                  </label>

                  {branchLocked && selectedBranchId && (
                    <input
                      type="hidden"
                      name="branch"
                      value={selectedBranchId}
                    />
                  )}

                  <select
                    name="branch"
                    className="form-select"
                    value={selectedBranchId}
                    onChange={handleChange}
                    disabled={
                      loadingOptions ||
                      branchLocked ||
                      saving
                    }
                    required
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading branches..."
                        : "Select branch"}
                    </option>

                    {selectedBranchId &&
                      !selectedBranch && (
                        <option value={selectedBranchId}>
                          {typeof editingExpense?.branch === "object"
                            ? editingExpense.branch?.name ||
                              `Branch ${selectedBranchId}`
                            : `Branch ${selectedBranchId}`}
                        </option>
                      )}

                    {branches.map((branch) => (
                      <option
                        key={branch.id}
                        value={String(branch.id)}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>

                  <small className="text-muted d-block mt-1">
                    {branchLocked
                      ? currentBranch?.name
                        ? `Selected branch: ${currentBranch.name}`
                        : "Select a branch before adding an expense."
                      : "The existing expense branch is preserved unless changed."}
                  </small>
                </div>

                {/* EXPENSE DATE */}
                <div className="col-md-3">
                  <label className="form-label">
                    Expense Date{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="date"
                    name="expense_date"
                    className="form-control"
                    value={formData.expense_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* DUE DATE */}
                <div className="col-md-3">
                  <label className="form-label">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    className="form-control"
                    value={formData.due_date}
                    onChange={handleChange}
                  />
                </div>

                {/* AMOUNT */}
                <div className="col-md-3">
                  <label className="form-label">
                    Amount{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      TSh
                    </span>

                    <input
                      type="number"
                      name="amount"
                      className="form-control"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* TAX */}
                <div className="col-md-3">
                  <label className="form-label">
                    Tax
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      TSh
                    </span>

                    <input
                      type="number"
                      name="tax"
                      className="form-control"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.tax}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* PAYMENT STATUS */}
                <div className="col-md-6">
                  <label className="form-label">
                    Payment Status
                  </label>

                  <select
                    name="payment_status"
                    className="form-select"
                    value={formData.payment_status}
                    onChange={handleChange}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PAYMENT METHOD FROM API */}
                <div className="col-md-6">
                  <label className="form-label">
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    className="form-select"
                    value={selectedPaymentMethod}
                    onChange={handleChange}
                    disabled={loadingPaymentMethods || saving}
                  >
                    <option value="">
                      {loadingPaymentMethods
                        ? "Loading payment methods..."
                        : "Select payment method"}
                    </option>

                    {paymentMethods.map((method) => (
                      <option
                        key={method.id}
                        value={method.name}
                      >
                        {method.name}
                      </option>
                    ))}

                    {selectedPaymentMethod &&
                      !selectedPaymentMethodExists && (
                        <option value={selectedPaymentMethod}>
                          {selectedPaymentMethod} (existing)
                        </option>
                      )}
                  </select>

                  {!loadingPaymentMethods &&
                    paymentMethods.length === 0 && (
                      <small className="text-muted d-block mt-1">
                        No active payment methods were returned.
                        Check your payment method settings.
                      </small>
                    )}
                </div>

                {/* PAYMENT DATE */}
                <div className="col-md-6">
                  <label className="form-label">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="payment_date"
                    className="form-control"
                    value={formData.payment_date}
                    onChange={handleChange}
                  />
                </div>

                {/* INVOICE NUMBER */}
                <div className="col-md-6">
                  <label className="form-label">
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoice_number"
                    className="form-control"
                    placeholder="Optional invoice number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                  />
                </div>

                {/* REFERENCE */}
                <div className="col-md-6">
                  <label className="form-label">
                    Reference
                  </label>

                  <input
                    type="text"
                    name="reference"
                    className="form-control"
                    placeholder="Optional reference"
                    value={formData.reference}
                    onChange={handleChange}
                  />
                </div>

                {/* RECEIPT */}
                <div className="col-md-6">
                  <label className="form-label">
                    Receipt
                  </label>

                  <input
                    type="file"
                    name="receipt"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                  />

                  <small className="text-muted">
                    PDF, JPG, JPEG or PNG.
                  </small>
                </div>

                {/* DESCRIPTION */}
                <div className="col-12">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Enter expense description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* TOTAL PREVIEW */}
              <div className="alert alert-light border mt-4 mb-0">
                <div className="d-flex justify-content-between">
                  <span>Amount</span>

                  <strong>
                    TSh {formatMoney(formData.amount)}
                  </strong>
                </div>

                <div className="d-flex justify-content-between">
                  <span>Tax</span>

                  <strong>
                    TSh {formatMoney(formData.tax)}
                  </strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <strong>Total</strong>

                  <strong className="text-primary">
                    TSh{" "}
                    {formatMoney(
                      Number(formData.amount || 0) +
                        Number(formData.tax || 0)
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* FOOTER */}
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
                disabled={
                  saving ||
                  loadingOptions ||
                  !selectedBranchId
                }
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />

                    {editingExpense
                      ? "Update Expense"
                      : "Save Expense"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

