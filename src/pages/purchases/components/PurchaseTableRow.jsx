
import React from "react";
import { Badge, Button, Spinner } from "react-bootstrap";

import {
  formatCurrency,
  formatDate,
  getBranch,
  getItems,
  getPurchaseNumber,
  getPurchaseTotal,
  getStatus,
  getStatusLabel,
  getStatusVariant,
  getSupplier,
  isFullyReceived,
} from "./utils/purchaseUtils";

const PurchaseTableRow = ({
  purchase,
  suppliers,
  branches,
  receiving,
  deletingId,
  saving,
  onReceive,
  onDelete,
}) => {
  const supplier = getSupplier(purchase, suppliers);
  const branch = getBranch(purchase, branches);
  const items = getItems(purchase);
  const status = getStatus(purchase);
  const fullyReceived = isFullyReceived(purchase);

  const isDeleting = deletingId === purchase.id;

  return (
    <tr>
      <td>{formatDate(purchase.order_date ?? purchase.created_at)}</td>

      <td>
        <strong>{getPurchaseNumber(purchase)}</strong>
      </td>

      <td>{supplier?.name || "-"}</td>

      <td>{branch?.name || "-"}</td>

      <td>
        <Badge bg="light" text="dark">
          {items.length}
        </Badge>
      </td>

      <td>
        <strong>{formatCurrency(getPurchaseTotal(purchase))}</strong>
      </td>

      <td>
        <Badge bg={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      </td>

      <td>
        <div className="small">
          <div>
            Ordered:{" "}
            <strong>{purchase.total_ordered_quantity ?? 0}</strong>
          </div>
          <div>
            Received:{" "}
            <strong>{purchase.total_received_quantity ?? 0}</strong>
          </div>
          <div>
            Remaining:{" "}
            <strong>{purchase.total_remaining_quantity ?? 0}</strong>
          </div>
        </div>
      </td>

      <td>
        <div className="d-flex gap-1">
          {!fullyReceived && status !== "cancelled" && (
            <Button
              type="button"
              variant="outline-success"
              size="sm"
              disabled={receiving || saving || Boolean(deletingId)}
              onClick={() => onReceive(purchase)}
            >
              {receiving ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-down me-1" />
                  Receive
                </>
              )}
            </Button>
          )}

          {status !== "received" && (
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              disabled={saving || receiving || Boolean(deletingId)}
              onClick={() => onDelete(purchase.id)}
              title="Delete purchase"
            >
              {isDeleting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-trash" />
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PurchaseTableRow;
