
import React from "react";
import {
  Button,
  Form,
  Table,
} from "react-bootstrap";

import { formatMoney } from "../utils/posHelpers";

const CartTable = ({
  cart,
  onUpdateQuantity,
  onRemove,
}) => (
  <div className="table-responsive">
    <Table hover bordered size="sm" className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>Product</th>
          <th style={{ minWidth: 85 }}>Qty</th>
          <th className="text-end">Price</th>
          <th className="text-end">Subtotal</th>
          <th />
        </tr>
      </thead>

      <tbody>
        {cart.map((item) => (
          <tr key={item.productId}>
            <td>
              <div className="fw-semibold">{item.name}</div>
              <small className="text-muted">
                {item.sku || "-"}
              </small>
            </td>

            <td>
              <Form.Control
                type="number"
                min="1"
                max={item.stock}
                step="1"
                size="sm"
                value={item.quantity}
                onChange={(event) =>
                  onUpdateQuantity(
                    item.productId,
                    event.target.value
                  )
                }
              />
            </td>

            <td className="text-end">
              {formatMoney(item.price)}
            </td>

            <td className="text-end">
              {formatMoney(item.price * item.quantity)}
            </td>

            <td>
              <Button
                size="sm"
                variant="outline-danger"
                aria-label={`Remove ${item.name}`}
                onClick={() => onRemove(item.productId)}
              >
                <i className="bi bi-trash" />
              </Button>
            </td>
          </tr>
        ))}

        {cart.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-muted p-4">
              Your cart is empty.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);

export default CartTable;
