import React from "react";

export default function ExpenseTable(props) {
  const {
    loading, filteredExpenses, searchTerm, statusFilter, handleAddExpense,
    formatDate, getExpenseTypeName, getBranchName, formatMoney, getExpenseTotal,
    renderPaymentStatusBadge, renderApprovalBadge, getCreatedByName, getUpdatedByName,
    renderApprovalActions, handleEditExpense, handleDelete, deleting,
    approvingExpenseId, rejectingExpenseId
  } = props;

  return (
    <>
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
                  Loading expenses...
                </p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              /* =================================================
                 EMPTY
              ================================================== */

              <div className="text-center py-5">
                <div className="mb-3">
                  <i
                    className="bi bi-receipt"
                    style={{
                      fontSize: "3rem",
                    }}
                  ></i>
                </div>

                <h5>
                  {searchTerm ||
                  statusFilter !== "all"
                    ? "No expenses found"
                    : "No expenses yet"}
                </h5>

                <p className="text-muted">
                  {searchTerm ||
                  statusFilter !== "all"
                    ? "Try changing your search or filter."
                    : "Add your first expense to get started."}
                </p>

                {!searchTerm &&
                  statusFilter === "all" && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleAddExpense}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Expense
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
                      <th>Date</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Branch</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Approval</th>
                      <th>Created By</th>
                      <th>Updated By</th>
                      <th className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExpenses.map(
                      (expense, index) => (
                        <tr key={expense.id}>
                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>

                          {/* DATE */}

                          <td>
                            {formatDate(
                              expense.expense_date
                            )}
                          </td>

                          {/* TITLE */}

                          <td>
                            <div>
                              <div className="fw-semibold">
                                {expense.title || "—"}
                              </div>

                              {expense.description && (
                                <small className="text-muted">
                                  {expense.description.length >
                                  60
                                    ? `${expense.description.substring(
                                        0,
                                        60
                                      )}...`
                                    : expense.description}
                                </small>
                              )}
                            </div>
                          </td>

                          {/* TYPE */}

                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                }}
                              >
                                <i className="bi bi-receipt"></i>
                              </div>

                              <div>
                                <span className="fw-semibold">
                                  {getExpenseTypeName(
                                    expense.expense_type
                                  )}
                                </span>

                                <br />

                                <small className="text-muted">
                                  {expense.expense_type ||
                                    "other"}
                                </small>
                              </div>
                            </div>
                          </td>

                          {/* BRANCH */}

                          <td>
                            {getBranchName(expense)}
                          </td>

                          {/* AMOUNT */}

                          <td>
                            <span className="fw-semibold">
                              TSh{" "}
                              {formatMoney(
                                getExpenseTotal(
                                  expense
                                )
                              )}
                            </span>

                            {Number(
                              expense.tax || 0
                            ) > 0 && (
                              <small className="d-block text-muted">
                                Tax: TSh{" "}
                                {formatMoney(
                                  expense.tax
                                )}
                              </small>
                            )}
                          </td>

                          {/* PAYMENT */}

                          <td>
                            {renderPaymentStatusBadge(
                              expense.payment_status
                            )}
                          </td>

                          {/* APPROVAL */}

                          <td>
                            {renderApprovalBadge(
                              expense
                            )}
                          </td>

                          {/* CREATED BY */}

                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person-plus text-muted me-2"></i>

                              <div>
                                <span className="fw-semibold">
                                  {getCreatedByName(
                                    expense
                                  )}
                                </span>

                                {expense.created_at && (
                                  <small className="d-block text-muted">
                                    {formatDate(
                                      expense.created_at
                                    )}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* UPDATED BY */}

                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person-check text-muted me-2"></i>

                              <div>
                                <span className="fw-semibold">
                                  {getUpdatedByName(
                                    expense
                                  )}
                                </span>

                                {expense.updated_at && (
                                  <small className="d-block text-muted">
                                    {formatDate(
                                      expense.updated_at
                                    )}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ACTIONS */}

                          <td className="text-end">
                            <div className="d-flex justify-content-end align-items-center gap-1 flex-wrap">
                              {/* APPROVAL ACTIONS */}

                              {renderApprovalActions(
                                expense
                              )}

                              {/* EDIT */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="Edit expense"
                                onClick={() =>
                                  handleEditExpense(
                                    expense
                                  )
                                }
                                disabled={
                                  deleting ||
                                  approvingExpenseId !==
                                    null ||
                                  rejectingExpenseId !==
                                    null
                                }
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Delete expense"
                                onClick={() =>
                                  handleDelete(
                                    expense
                                  )
                                }
                                disabled={
                                  deleting ||
                                  approvingExpenseId !==
                                    null ||
                                  rejectingExpenseId !==
                                    null
                                }
                              >
                                {deleting ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                  {/* =================================================
                      TABLE FOOTER
                  ================================================== */}

                  <tfoot>
                    <tr>
                      <td
                        colSpan="5"
                        className="text-end fw-semibold"
                      >
                        Total:
                      </td>

                      <td className="fw-bold">
                        TSh{" "}
                        {formatMoney(
                          filteredExpenses.reduce(
                            (total, expense) =>
                              total +
                              getExpenseTotal(
                                expense
                              ),
                            0
                          )
                        )}
                      </td>

                      <td colSpan="5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
    </>
  );
}
