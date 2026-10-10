
import React from "react";
import {
  Alert,
  Button,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";

import {
  formatMoney,
  getPaymentMethodLabel,
  isMobilePaymentMethod,
} from "../utils/posHelpers";

const PaymentModal = ({
  show,
  onHide,
  paymentMethods,
  paymentMethodsLoading,
  paymentMethodsError,
  paymentMethod,
  setPaymentMethod,
  selectedPaymentMethod,
  amountPaid,
  setAmountPaid,
  paymentPhone,
  setPaymentPhone,
  transactionReference,
  setTransactionReference,
  customerName,
  customerPhone,
  subtotal,
  discountAmount,
  vatAmount,
  grandTotal,
  change,
  remaining,
  error,
  loading,
  onSubmit,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Form onSubmit={onSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>Complete Payment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {paymentMethodsError && (
          <Alert variant="warning">
            {paymentMethodsError}
          </Alert>
        )}

        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <strong>{formatMoney(subtotal)}</strong>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Discount</span>
          <span>{formatMoney(discountAmount)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>VAT</span>
          <span>{formatMoney(vatAmount)}</span>
        </div>

        <hr />

        <div className="d-flex justify-content-between fs-5 mb-3">
          <strong>Total</strong>
          <strong>{formatMoney(grandTotal)}</strong>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>

          <Form.Select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value)
            }
            required
            disabled={paymentMethodsLoading}
          >
            <option value="">
              {paymentMethodsLoading
                ? "Loading payment methods..."
                : "Select payment method"}
            </option>

            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {getPaymentMethodLabel(method)}
              </option>
            ))}
          </Form.Select>

          {paymentMethodsLoading && (
            <Spinner size="sm" animation="border" className="mt-2" />
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amount Paid (TSh)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            step="0.01"
            value={amountPaid}
            onChange={(event) =>
              setAmountPaid(event.target.value)
            }
            required
          />
        </Form.Group>

        {isMobilePaymentMethod(selectedPaymentMethod) && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Money Phone</Form.Label>
              <Form.Control
                type="tel"
                value={paymentPhone}
                onChange={(event) =>
                  setPaymentPhone(event.target.value)
                }
                placeholder="07XXXXXXXX"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Transaction Reference</Form.Label>
              <Form.Control
                value={transactionReference}
                onChange={(event) =>
                  setTransactionReference(event.target.value)
                }
                placeholder="Transaction ID"
              />
            </Form.Group>
          </>
        )}

        <div className="d-flex justify-content-between mb-2">
          <span>Balance remaining</span>
          <strong>{formatMoney(remaining)}</strong>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <span>Change</span>
          <strong>{formatMoney(change)}</strong>
        </div>

        {(customerName || customerPhone) && (
          <div className="small text-muted">
            Customer: {customerName || "Walk-in Customer"}
            {customerPhone ? ` · ${customerPhone}` : ""}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          type="button"
          onClick={onHide}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            loading ||
            paymentMethodsLoading ||
            !paymentMethod ||
            paymentMethods.length === 0
          }
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            "Complete Sale"
          )}
        </Button>
      </Modal.Footer>
    </Form>
  </Modal>
);

export default PaymentModal;
