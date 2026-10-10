
import React from "react";
import { Badge, Card } from "react-bootstrap";

const SalesByCashier = ({ cashiers, formatCurrency }) => {
  const totalOrders = cashiers.reduce(
    (total, cashier) => total + cashier.orders,
    0
  );

  const totalSales = cashiers.reduce(
    (total, cashier) => total + cashier.sales,
    0
  );

  return (
    <Card className="dashboard-card border-0">
      <Card.Body>
        <div className="card-heading">
          <div>
            <h5>Sales by Cashier</h5>
            <span>Today's sales performance by cashier</span>
          </div>
        </div>

        {cashiers.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-receipt" style={{ fontSize: 40 }} />
            <div className="mt-2">No cashier sales recorded today.</div>
          </div>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cashier</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>Average Order</th>
                </tr>
              </thead>
              <tbody>
                {cashiers.map((cashier, index) => (
                  <tr key={cashier.id}>
                    <td>{index + 1}</td>
                    <td><strong>{cashier.name}</strong></td>
                    <td><Badge bg="secondary">{cashier.orders}</Badge></td>
                    <td><strong>{formatCurrency(cashier.sales)}</strong></td>
                    <td>
                      {formatCurrency(
                        cashier.orders ? cashier.sales / cashier.orders : 0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>Total</th>
                  <th>{totalOrders}</th>
                  <th><strong>{formatCurrency(totalSales)}</strong></th>
                  <th>-</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SalesByCashier;
