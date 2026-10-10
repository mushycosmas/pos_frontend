
import React from "react";
import { Badge, Card } from "react-bootstrap";

const RecentSales = ({ sales, formatCurrency, onViewAll, onNewSale, canCreateSale }) => (
  <Card className="dashboard-card border-0 h-100">
    <Card.Body>
      <div className="card-heading">
        <div>
          <h5>Recent Sales</h5>
          <span>Latest transactions recorded today</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={onViewAll}
        >
          View All
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-receipt" style={{ fontSize: 40 }} />
          <div className="mt-2">No sales recorded today.</div>

          {canCreateSale && (
            <button
              type="button"
              className="primary-button mt-3"
              onClick={onNewSale}
            >
              <i className="bi bi-cart-plus" /> Start New Sale
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const invoice =
                  sale?.invoice_number ||
                  sale?.reference ||
                  sale?.invoice ||
                  sale?.id ||
                  "-";

                const customer =
                  sale?.customer?.name ||
                  sale?.customer_name ||
                  "Walk-in Customer";

                const time = sale?.created_at
                  ? new Date(sale.created_at).toLocaleTimeString("en-TZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";

                return (
                  <tr key={sale?.id ?? invoice}>
                    <td><strong>{invoice}</strong></td>
                    <td>{time}</td>
                    <td>{customer}</td>
                    <td><strong>{formatCurrency(sale?.total)}</strong></td>
                    <td>
                      <Badge bg="success">
                        {String(sale?.status || "Completed")}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default RecentSales;
