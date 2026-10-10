
import React from "react";
import { Button } from "react-bootstrap";

const PurchasesHeader = ({
  onNewPurchase,
  disabled,
}) => (
  <div className="page-header d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2>Purchases</h2>
      <p className="mb-0">
        Manage purchases and receive stock.
      </p>
    </div>

    <Button
      variant="primary"
      onClick={onNewPurchase}
      disabled={disabled}
    >
      <i className="bi bi-plus-lg me-2" />
      New Purchase
    </Button>
  </div>
);

export default PurchasesHeader;
