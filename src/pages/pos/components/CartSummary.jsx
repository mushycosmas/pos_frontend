
import React from "react";
import {
  Button,
  Card,
  Form,
} from "react-bootstrap";

import { formatMoney } from "../utils/posHelpers";

const CartSummary = ({
  subtotal,
  discount,
  setDiscount,
  discountAmount,
  vatEnabled,
  setVatEnabled,
  vatAmount,
  grandTotal,
  paidAmount,
  remaining,
  cartCount,
  onCheckout,
  onClearCart,
  loading,
}) => (
  <Card className="shadow-sm mt-3">
    <Card.Body>
      <h5 className="mb-3">Order Summary</h5>

      <div className="d-flex justify-content-between mb-2">
        <span>Items</span>
        <strong>{cartCount}</strong>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span>Subtotal</span>
        <strong>{formatMoney(subtotal)}</strong>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Discount (TSh)</Form.Label>
        <Form.Control
          type="number"
          min="0"
          step="0.01"
          value={discount}
          onChange={(event) => setDiscount(event.target.value)}
        />
        <Form.Text>
          Applied discount: {formatMoney(discountAmount)}
        </Form.Text>
      </Form.Group>

      <Form.Check
        type="switch"
        id="pos-vat-switch"
        label="Apply VAT (18%)"
        checked={vatEnabled}
        onChange={(event) =>
          setVatEnabled(event.target.checked)
        }
        className="mb-3"
      />

      <div className="d-flex justify-content-between mb-2">
        <span>VAT</span>
        <span>{formatMoney(vatAmount)}</span>
      </div>

      <hr />

      <div className="d-flex justify-content-between fs-5 mb-3">
        <strong>Total</strong>
        <strong>{formatMoney(grandTotal)}</strong>
      </div>

      {paidAmount > 0 && (
        <div className="d-flex justify-content-between mb-2">
          <span>Remaining</span>
          <strong>{formatMoney(remaining)}</strong>
        </div>
      )}

      <div className="d-grid gap-2">
        <Button
          onClick={onCheckout}
          disabled={loading || cartCount === 0}
        >
          Proceed to Payment
        </Button>

        <Button
          variant="outline-secondary"
          onClick={onClearCart}
          disabled={loading || cartCount === 0}
        >
          Clear Cart
        </Button>
      </div>
    </Card.Body>
  </Card>
);

export default CartSummary;
