
import React from "react";
import {
  Button,
  Modal,
} from "react-bootstrap";

import { formatMoney } from "../utils/posHelpers";

const SaleSuccessModal = ({
  sale,
  onClose,
  onNewSale,
}) => {
  if (!sale) return null;

  const invoice =
    sale.invoice_number ??
    sale.invoiceNumber ??
    sale.reference ??
    sale.id ??
    "-";

  const total = Number(
    sale.grand_total ??
    sale.total_amount ??
    sale.total ??
    0
  );

  return (
    <Modal show={Boolean(sale)} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sale Completed</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4">
        <div className="text-success mb-3">
          <i className="bi bi-check-circle-fill" style={{ fontSize: 48 }} />
        </div>

        <h5>Payment processed successfully</h5>

        <div className="text-muted mt-3">Invoice</div>
        <h5>{invoice}</h5>

        <div className="text-muted mt-3">Sale Total</div>
        <h4>{formatMoney(total)}</h4>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>

        <Button onClick={onNewSale}>
          New Sale
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaleSuccessModal;
