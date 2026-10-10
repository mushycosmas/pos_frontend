import React from "react";

export default function ExpenseStats(props) {
  const {
    formatMoney, totalExpenses, paidExpenses, pendingExpenses, approvedExpenses
  } = props;

  return (
    <>
    {/* =====================================================
              STATISTICS
          ====================================================== */}

          <div className="row g-3 mb-4">
            {/* TOTAL */}

            <div className="col-md-3">
              <div className="dashboard-card bg-white p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Total Expenses
                    </p>

                    <h4 className="mb-0">
                      TSh {formatMoney(totalExpenses)}
                    </h4>
                  </div>

                  <div className="fs-2 text-primary">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* PAID */}

            <div className="col-md-3">
              <div className="dashboard-card bg-white p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Paid Expenses
                    </p>

                    <h4 className="mb-0 text-success">
                      TSh {formatMoney(paidExpenses)}
                    </h4>
                  </div>

                  <div className="fs-2 text-success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* PENDING PAYMENT */}

            <div className="col-md-3">
              <div className="dashboard-card bg-white p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Pending Payment
                    </p>

                    <h4 className="mb-0 text-warning">
                      TSh {formatMoney(pendingExpenses)}
                    </h4>
                  </div>

                  <div className="fs-2 text-warning">
                    <i className="bi bi-clock-history"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* APPROVED */}

            <div className="col-md-3">
              <div className="dashboard-card bg-white p-4 h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Approved
                    </p>

                    <h4 className="mb-0 text-success">
                      TSh {formatMoney(approvedExpenses)}
                    </h4>
                  </div>

                  <div className="fs-2 text-success">
                    <i className="bi bi-shield-check"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}
