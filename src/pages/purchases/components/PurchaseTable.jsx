
import React from "react";
import { Card, Spinner, Table } from "react-bootstrap";

import PurchaseTableRow from "./PurchaseTableRow";

const PurchaseTable = ({
  purchases,
  suppliers,
  branches,
  loading,
  saving,
  receiving,
  deletingId,
  onReceive,
  onDelete,
}) => (
  <Card className="dashboard-card border-0">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Purchase List</h5>
          <small className="text-muted">
            {purchases.length} purchases recorded
          </small>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading purchases...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>DATE</th>
                <th>PURCHASE NUMBER</th>
                <th>SUPPLIER</th>
                <th>BRANCH</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>RECEIVING</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-bag fs-3 d-block mb-2" />
                    No purchases recorded.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <PurchaseTableRow
                    key={purchase.id}
                    purchase={purchase}
                    suppliers={suppliers}
                    branches={branches}
                    saving={saving}
                    receiving={receiving}
                    deletingId={deletingId}
                    onReceive={onReceive}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default PurchaseTable;
