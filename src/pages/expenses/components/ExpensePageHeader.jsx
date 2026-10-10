import React from "react";

export default function ExpensePageHeader(props) {
  const {
    handleAddExpense, approvingExpenseId, rejectingExpenseId
  } = props;

  return (
    <>
    {/* =====================================================
              PAGE HEADER
          ====================================================== */}

          <div className="page-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                Expenses
              </h2>

              <p className="text-muted mb-0">
                Manage business expenses and spending.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddExpense}
              disabled={
                approvingExpenseId !== null ||
                rejectingExpenseId !== null
              }
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Expense
            </button>
          </div>
    </>
  );
}
