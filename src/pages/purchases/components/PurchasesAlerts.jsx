
import React from "react";
import { Alert } from "react-bootstrap";

const PurchasesAlerts = ({
  error,
  success,
  onClearError,
  onClearSuccess,
}) => (
  <>
    {error && (
      <Alert
        variant="danger"
        dismissible
        onClose={onClearError}
      >
        <strong>Error</strong>
        <div className="mt-1" style={{ whiteSpace: "pre-line" }}>
          {error}
        </div>
      </Alert>
    )}

    {success && (
      <Alert
        variant="success"
        dismissible
        onClose={onClearSuccess}
      >
        {success}
      </Alert>
    )}
  </>
);

export default PurchasesAlerts;
