import React from "react";

export default function ExpenseAlerts(props) {
  const {
    error, setError, success, setSuccess
  } = props;

  return (
    <>
    {/* =====================================================
              ALERTS
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

          {success && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-check-circle me-2"></i>

              {success}

              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}
    </>
  );
}
