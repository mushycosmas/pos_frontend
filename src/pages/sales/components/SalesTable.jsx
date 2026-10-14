
import React from "react";
import { Button, Card, Dropdown, Spinner, Table } from "react-bootstrap";
import StatusBadge from "./StatusBadge";
import {
  formatCurrency,
  formatDate,
  getSaleId,
  getInvoiceNumber,
  getCustomerName,
  getBranchName,
  getSoldBy,
  getStatus,
  getPaymentStatus,
  getPaymentMethod,
  getSubtotal,
  getDiscount,
  getTotal,
  getCreatedDate,
  getItemsCount,
} from "../utils/salesHelpers";

// Convert product names to Title Case.
const toTitleCase = (value) => {
  if (!value) return "-";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Get product names from a sale's items.
const getSaleProductNames = (sale) => {
  const items =
    sale?.items ??
    sale?.sale_items ??
    sale?.saleItems ??
    sale?.details ??
    [];

  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  const names = items
    .map((item) => {
      const product =
        item?.product_detail ??
        item?.product_details ??
        item?.product ??
        item?.product_info ??
        null;

      let name = "";

      if (typeof product === "object" && product !== null) {
        name =
          product.name ??
          product.product_name ??
          "";
      } else if (typeof product === "string") {
        name = product;
      }

      name =
        name ||
        item?.product_name ||
        item?.name ||
        "";

      return name ? toTitleCase(name) : "";
    })
    .filter(Boolean);

  return [...new Set(names)].join(", ") || "-";
};

const SalesTable = (props) => {
  const {
    loading,
    filteredSales,
    pagination,
    page,
    totalPages,
    canGoPrevious,
    canGoNext,
    setPage,
    handleView,
    openDeleteModal,
  } = props;

  return (
    <Card className="dashboard-card border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-1">Sales Transactions</h5>

            <small className="text-muted">
              {pagination.count
                ? `${pagination.count.toLocaleString()} sale(s)`
                : "No sales"}
            </small>
          </div>

          {loading && (
            <Spinner animation="border" size="sm" />
          )}
        </div>

        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Product Name</th>
              <th>Customer</th>
              <th>Branch</th>
              <th>Sold By</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading && filteredSales.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-5">
                  <Spinner animation="border" className="mb-2" />
                  <div className="text-muted">Loading sales...</div>
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-5">
                  <i
                    className="bi bi-receipt"
                    style={{ fontSize: "36px" }}
                  />
                  <div className="mt-2 text-muted">
                    No sales found.
                  </div>
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const id = getSaleId(sale);
                const status = getStatus(sale);
                const paymentStatus = getPaymentStatus(sale);
                const subtotal = getSubtotal(sale);
                const discount = getDiscount(sale);
                const total = getTotal(sale);
                const productNames = getSaleProductNames(sale);

                return (
                  <tr
                    key={
                      id ||
                      getInvoiceNumber(sale)
                    }
                  >
                    {/* INVOICE */}
                    <td>
                      <strong>
                        {getInvoiceNumber(sale)}
                      </strong>
                    </td>

                    {/* PRODUCT NAME */}
                    <td style={{ minWidth: "180px" }}>
                      <span className="fw-semibold">
                        {productNames}
                      </span>
                    </td>

                    {/* CUSTOMER */}
                    <td>{getCustomerName(sale)}</td>

                    {/* BRANCH */}
                    <td>{getBranchName(sale)}</td>

                    {/* SOLD BY */}
                    <td>
                      <span className="fw-semibold">
                        {getSoldBy(sale)}
                      </span>
                    </td>

                    {/* ITEMS */}
                    <td>
                      {getItemsCount(sale).toLocaleString()}
                    </td>

                    {/* SUBTOTAL */}
                    <td className="text-nowrap">
                      {formatCurrency(subtotal)}
                    </td>

                    {/* DISCOUNT */}
                    <td className="text-nowrap">
                      <span className="text-danger fw-semibold">
                        {discount > 0
                          ? `-${formatCurrency(discount)}`
                          : formatCurrency(0)}
                      </span>
                    </td>

                    {/* TOTAL */}
                    <td className="text-nowrap">
                      <strong>
                        {formatCurrency(total)}
                      </strong>
                    </td>

                    {/* PAYMENT */}
                    <td>
                      <div>
                        <strong>
                          {getPaymentMethod(sale)}
                        </strong>
                      </div>

                      <small className="text-muted">
                        {paymentStatus}
                      </small>
                    </td>

                    {/* STATUS */}
                    <td>
                      <StatusBadge status={status} />
                    </td>

                    {/* DATE */}
                    <td className="text-nowrap">
                      {formatDate(getCreatedDate(sale))}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          className="border-0"
                          aria-label={`Actions for sale ${getInvoiceNumber(sale)}`}
                        >
                          <i className="bi bi-three-dots-vertical" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleView(sale)}
                          >
                            <i className="bi bi-eye me-2" />
                            View Sale
                          </Dropdown.Item>

                          {id && (
                            <Dropdown.Item
                              onClick={() => openDeleteModal(sale)}
                              className="text-danger"
                            >
                              <i className="bi bi-trash me-2" />
                              Delete
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

        {/* PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Page <strong>{page}</strong> of{" "}
            <strong>{totalPages}</strong>
          </small>

          <div className="d-flex gap-2">
            <Button
              variant="light"
              size="sm"
              disabled={loading || !canGoPrevious}
              onClick={() =>
                setPage((previous) => Math.max(1, previous - 1))
              }
            >
              <i className="bi bi-chevron-left me-1" />
              Previous
            </Button>

            <Button
              variant="light"
              size="sm"
              disabled={loading || !canGoNext}
              onClick={() =>
                setPage((previous) => previous + 1)
              }
            >
              Next
              <i className="bi bi-chevron-right ms-1" />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalesTable;
