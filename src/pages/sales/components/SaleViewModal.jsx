import React from "react";
import { Badge, Button, Col, Modal, Row, Table } from "react-bootstrap";

import StatusBadge from "./StatusBadge";

import {
  formatCurrency,
  formatDateTime,
  getInvoiceNumber,
  getCreatedDate,
  getCustomerName,
  getCustomerPhone,
  getBranchName,
  getSoldBy,
  getPaymentMethod,
  getPaymentStatus,
  getPaymentPhone,
  getTransactionReference,
  getStatus,
  isVatEnabled,
  getTaxRate,
  getSubtotal,
  getDiscount,
  getTaxAmount,
  getAmountPaid,
  getChange,
  getTotal,
} from "../utils/salesHelpers";

const SaleViewModal = (props) => {
  const {
    showViewModal,
    setShowViewModal,
    selectedSale,
  } = props;

  return (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-receipt me-2"></i>
          Sale Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {selectedSale && (
          <>
            {/* SALE HEADER */}
            <Row className="g-3 mb-4">
              <Col md={6}>
                <small className="text-muted">Invoice</small>
                <div className="fw-bold">
                  {getInvoiceNumber(selectedSale)}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Date</small>
                <div className="fw-bold">
                  {formatDateTime(getCreatedDate(selectedSale))}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Customer</small>
                <div className="fw-bold">
                  {getCustomerName(selectedSale)}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Customer Phone</small>
                <div className="fw-bold">
                  {getCustomerPhone(selectedSale) || "-"}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Branch</small>
                <div className="fw-bold">
                  {getBranchName(selectedSale)}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Sold By</small>
                <div className="fw-bold">
                  {getSoldBy(selectedSale)}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Payment Method</small>
                <div className="fw-bold">
                  {getPaymentMethod(selectedSale)}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Payment Status</small>
                <div>
                  <StatusBadge
                    status={getPaymentStatus(selectedSale)}
                  />
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Payment Phone</small>
                <div className="fw-bold">
                  {getPaymentPhone(selectedSale) || "-"}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">
                  Transaction Reference
                </small>
                <div className="fw-bold">
                  {getTransactionReference(selectedSale) || "-"}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Sale Status</small>
                <div>
                  <StatusBadge status={getStatus(selectedSale)} />
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">VAT</small>
                <div>
                  {isVatEnabled(selectedSale) ? (
                    <Badge bg="success">
                      VAT {getTaxRate(selectedSale) || 18}%
                    </Badge>
                  ) : (
                    <Badge bg="secondary">VAT Not Applied</Badge>
                  )}
                </div>
              </Col>
            </Row>

            {/* SALE ITEMS */}
            {Array.isArray(selectedSale.items) &&
              selectedSale.items.length > 0 && (
                <>
                  <h6 className="mb-3">Sale Items</h6>

                  <Table bordered responsive size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        {isVatEnabled(selectedSale) && <th>VAT</th>}
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedSale.items.map((item, index) => {
                        const productName =
                          item?.product_name ??
                          item?.productName ??
                          item?.product?.name ??
                          item?.product_details?.name ??
                          `Product ${item?.product ?? "-"}`;

                        const productSku =
                          item?.product_sku ??
                          item?.productSku ??
                          item?.product?.sku ??
                          item?.product_details?.sku ??
                          "-";

                        const quantity = Number(
                          item?.quantity ?? item?.qty ?? 0
                        );

                        const unitPrice = Number(
                          item?.unit_price ??
                            item?.unitPrice ??
                            item?.price ??
                            0
                        );

                        const discount = Number(item?.discount ?? 0);
                        const tax = Number(item?.tax ?? 0);

                        const lineTotal = Number(
                          item?.total ??
                            item?.line_total ??
                            item?.lineTotal ??
                            quantity * unitPrice - discount + tax
                        );

                        return (
                          <tr key={item?.id ?? index}>
                            <td>{productName}</td>
                            <td>{productSku}</td>
                            <td>{quantity}</td>
                            <td>{formatCurrency(unitPrice)}</td>
                            <td>
                              <span className="text-danger">
                                {discount > 0
                                  ? `-${formatCurrency(discount)}`
                                  : formatCurrency(0)}
                              </span>
                            </td>

                            {isVatEnabled(selectedSale) && (
                              <td>{formatCurrency(tax)}</td>
                            )}

                            <td>
                              <strong>
                                {formatCurrency(lineTotal)}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}

            {/* TOTALS */}
            <div className="d-flex justify-content-end mt-4">
              <div
                className="text-end"
                style={{ minWidth: "320px" }}
              >
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <strong>
                    {formatCurrency(getSubtotal(selectedSale))}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>Discount</span>
                  <strong className="text-danger">
                    {getDiscount(selectedSale) > 0
                      ? `-${formatCurrency(getDiscount(selectedSale))}`
                      : formatCurrency(0)}
                  </strong>
                </div>

                {isVatEnabled(selectedSale) && (
                  <div className="d-flex justify-content-between mt-2">
                    <span>
                      VAT ({getTaxRate(selectedSale) || 18}%)
                    </span>
                    <strong>
                      {formatCurrency(getTaxAmount(selectedSale))}
                    </strong>
                  </div>
                )}

                <div className="d-flex justify-content-between mt-2">
                  <span>Amount Paid</span>
                  <strong>
                    {formatCurrency(getAmountPaid(selectedSale))}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>Change</span>
                  <strong>
                    {formatCurrency(getChange(selectedSale))}
                  </strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between fs-5">
                  <strong>Grand Total</strong>
                  <strong>
                    {formatCurrency(getTotal(selectedSale))}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="light"
          onClick={() => setShowViewModal(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaleViewModal;
