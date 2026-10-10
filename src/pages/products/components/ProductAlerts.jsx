import React from "react";
import { Alert, Button } from "react-bootstrap";

const ProductAlerts = ({
  error,
  success,
  onDismissError,
  onDismissSuccess,
  onRetry,
}) => (
  <>
    {error && (
      <Alert
        variant="danger"
        dismissible
        onClose={onDismissError}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <span>{error}</span>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={onRetry}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Retry
          </Button>
        </div>
      </Alert>
    )}

    {success && (
      <Alert
        variant="success"
        dismissible
        onClose={onDismissSuccess}
      >
        {success}
      </Alert>
    )}
  </>
);

export default ProductAlerts;

