
import React from "react";
import { Card } from "react-bootstrap";

import {
  getMinimumStock,
  getProductStock,
} from "../utils/dashboardHelpers";

const LowStockCard = ({ products, onViewAll, buttonLabel = "View All" }) => (
  <Card className="dashboard-card border-0 h-100">
    <Card.Body>
      <div className="card-heading">
        <div>
          <h5>Low Stock</h5>
          <span>Items requiring attention</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={onViewAll}
        >
          {buttonLabel}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-check-circle fs-4 text-success" />
          <div className="mt-2">All products have sufficient stock.</div>
        </div>
      ) : (
        <div className="low-stock-list mt-3">
          {products.map((product) => (
            <div className="stock-item" key={product?.id}>
              <div className="stock-icon">
                <i className="bi bi-box" />
              </div>

              <div className="stock-info">
                <strong>{product?.name || "Unnamed Product"}</strong>
                <small>
                  Current: {getProductStock(product)}
                  {" • "}
                  Minimum: {getMinimumStock(product)}
                </small>
              </div>

              <i className="bi bi-exclamation-circle text-warning" />
            </div>
          ))}
        </div>
      )}
    </Card.Body>
  </Card>
);

export default LowStockCard;
