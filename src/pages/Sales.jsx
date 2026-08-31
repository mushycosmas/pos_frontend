import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import salesApi from "../services/SalesApi";

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `TSh ${number.toLocaleString("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSaleId = (sale) => {
  return (
    sale?.id ??
    sale?.sale_id ??
    sale?.saleId ??
    null
  );
};

const getInvoiceNumber = (sale) => {
  return (
    sale?.invoice_number ??
    sale?.invoiceNumber ??
    sale?.reference ??
    sale?.receipt_number ??
    sale?.receiptNumber ??
    `SALE-${getSaleId(sale) || "-"}`
  );
};

const getCustomerName = (sale) => {
  if (
    sale?.customer_name &&
    typeof sale.customer_name === "string"
  ) {
    return sale.customer_name;
  }

  if (
    sale?.customerName &&
    typeof sale.customerName === "string"
  ) {
    return sale.customerName;
  }

  if (
    sale?.customer?.name &&
    typeof sale.customer.name === "string"
  ) {
    return sale.customer.name;
  }

  if (
    sale?.customer?.full_name &&
    typeof sale.customer.full_name === "string"
  ) {
    return sale.customer.full_name;
  }

  return "Walk-in Customer";
};

const getBranchName = (sale) => {
  return (
    sale?.branch_name ??
    sale?.branchName ??
    sale?.branch?.name ??
    "-"
  );
};

const getStatus = (sale) => {
  return (
    sale?.status ??
    sale?.sale_status ??
    sale?.saleStatus ??
    "COMPLETED"
  );
};

const getPaymentStatus = (sale) => {
  return (
    sale?.payment_status ??
    sale?.paymentStatus ??
    "-"
  );
};

const getPaymentMethod = (sale) => {
  return (
    sale?.payment_method ??
    sale?.paymentMethod ??
    sale?.payment?.method ??
    "-"
  );
};

const getTotal = (sale) => {
  return Number(
    sale?.grand_total ??
      sale?.grandTotal ??
      sale?.total_amount ??
      sale?.totalAmount ??
      sale?.total ??
      0
  );
};

const getItemsCount = (sale) => {
  if (Array.isArray(sale?.items)) {
    return sale.items.reduce(
      (total, item) =>
        total +
        Number(
          item?.quantity ??
            item?.qty ??
            0
        ),
      0
    );
  }

  return Number(
    sale?.items_count ??
      sale?.itemsCount ??
      sale?.total_items ??
      0
  );
};

const getCreatedDate = (sale) => {
  return (
    sale?.created_at ??
    sale?.createdAt ??
    sale?.date ??
    sale?.sale_date ??
    sale?.saleDate ??
    null
  );
};

// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({ status }) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  let variant = "secondary";

  if (
    normalized === "COMPLETED" ||
    normalized === "PAID" ||
    normalized === "SUCCESS"
  ) {
    variant = "success";
  } else if (
    normalized === "PENDING" ||
    normalized === "PARTIAL"
  ) {
    variant = "warning";
  } else if (
    normalized === "CANCELLED" ||
    normalized === "CANCELED" ||
    normalized === "FAILED"
  ) {
    variant = "danger";
  } else if (
    normalized === "REFUNDED"
  ) {
    variant = "info";
  }

  return (
    <Badge bg={variant}>
      {String(status || "-").replaceAll(
        "_",
        " "
      )}
    </Badge>
  );
};

// =========================================================
// SALES PAGE
// =========================================================

const Sales = () => {
  // =======================================================
  // STATE
  // =======================================================

  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [
    paymentStatusFilter,
    setPaymentStatusFilter,
  ] = useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [saleToDelete, setSaleToDelete] =
    useState(null);

  const [page, setPage] = useState(1);

  const [pageSize] = useState(20);

  const [pagination, setPagination] =
    useState({
      count: 0,
      next: null,
      previous: null,
    });

  // =======================================================
  // LOAD SALES
  // =======================================================

  const loadSales = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          page_size: pageSize,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (
          statusFilter !== "ALL"
        ) {
          params.status =
            statusFilter;
        }

        if (
          paymentStatusFilter !== "ALL"
        ) {
          params.payment_status =
            paymentStatusFilter;
        }

        if (dateFrom) {
          params.date_from =
            dateFrom;
        }

        if (dateTo) {
          params.date_to =
            dateTo;
        }

        const response =
          await salesApi.getAll(
            params
          );

        // -------------------------------------------------
        // DRF PAGINATION
        // -------------------------------------------------

        if (
          response &&
          Array.isArray(
            response.results
          )
        ) {
          setSales(
            response.results
          );

          setPagination({
            count:
              Number(
                response.count || 0
              ),
            next:
              response.next ||
              null,
            previous:
              response.previous ||
              null,
          });

          return;
        }

        // -------------------------------------------------
        // NON-PAGINATED RESPONSE
        // -------------------------------------------------

        if (
          Array.isArray(response)
        ) {
          setSales(response);

          setPagination({
            count:
              response.length,
            next: null,
            previous: null,
          });

          return;
        }

        if (
          Array.isArray(
            response?.data
          )
        ) {
          setSales(
            response.data
          );

          setPagination({
            count:
              response.data.length,
            next: null,
            previous: null,
          });

          return;
        }

        setSales([]);
      } catch (err) {
        console.error(
          "Failed to load sales:",
          err
        );

        const message =
          err?.response?.data
            ?.detail ||
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to load sales.";

        setError(message);
        setSales([]);
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      pageSize,
      search,
      statusFilter,
      paymentStatusFilter,
      dateFrom,
      dateTo,
    ]
  );

  // =======================================================
  // INITIAL / FILTER LOAD
  // =======================================================

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // =======================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =======================================================

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  // =======================================================
  // FILTER CURRENT RESULTS
  //
  // This is useful if the backend doesn't implement
  // search/filtering exactly as expected.
  // =======================================================

  const filteredSales = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return sales;
    }

    return sales.filter(
      (sale) => {
        const invoice =
          String(
            getInvoiceNumber(sale)
          ).toLowerCase();

        const customer =
          String(
            getCustomerName(sale)
          ).toLowerCase();

        const branch =
          String(
            getBranchName(sale)
          ).toLowerCase();

        const paymentMethod =
          String(
            getPaymentMethod(sale)
          ).toLowerCase();

        return (
          invoice.includes(
            keyword
          ) ||
          customer.includes(
            keyword
          ) ||
          branch.includes(
            keyword
          ) ||
          paymentMethod.includes(
            keyword
          )
        );
      }
    );
  }, [sales, search]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics = useMemo(() => {
    const totalSales =
      sales.length;

    const completedSales =
      sales.filter(
        (sale) =>
          String(
            getStatus(sale)
          ).toUpperCase() ===
          "COMPLETED"
      ).length;

    const cancelledSales =
      sales.filter(
        (sale) =>
          [
            "CANCELLED",
            "CANCELED",
          ].includes(
            String(
              getStatus(sale)
            ).toUpperCase()
          )
      ).length;

    const totalAmount =
      sales.reduce(
        (sum, sale) =>
          sum + getTotal(sale),
        0
      );

    return {
      totalSales,
      completedSales,
      cancelledSales,
      totalAmount,
    };
  }, [sales]);

  // =======================================================
  // VIEW SALE
  // =======================================================

  const handleView = async (
    sale
  ) => {
    const id = getSaleId(
      sale
    );

    if (!id) {
      setSelectedSale(
        sale
      );
      setShowViewModal(
        true
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await salesApi.getById(
          id
        );

      setSelectedSale(
        response
      );

      setShowViewModal(
        true
      );
    } catch (err) {
      console.error(
        "Failed to load sale:",
        err
      );

      setSelectedSale(
        sale
      );

      setShowViewModal(
        true
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // DELETE CONFIRMATION
  // =======================================================

  const openDeleteModal = (
    sale
  ) => {
    setSaleToDelete(
      sale
    );

    setShowDeleteModal(
      true
    );
  };

  // =======================================================
  // DELETE SALE
  // =======================================================

  const handleDelete = async () => {
    const id =
      getSaleId(
        saleToDelete
      );

    if (!id) {
      setError(
        "Sale ID is missing."
      );
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await salesApi.delete(
        id
      );

      setShowDeleteModal(
        false
      );

      setSaleToDelete(
        null
      );

      await loadSales();
    } catch (err) {
      console.error(
        "Failed to delete sale:",
        err
      );

      const message =
        err?.response?.data
          ?.detail ||
        err?.response?.data
          ?.message ||
        err?.response?.data
          ?.error ||
        err?.message ||
        "Failed to delete sale.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(
      "ALL"
    );
    setPaymentStatusFilter(
      "ALL"
    );
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // =======================================================
  // PAGINATION
  // =======================================================

  const totalPages =
    pagination.count > 0
      ? Math.ceil(
          pagination.count /
            pageSize
        )
      : 1;

  const canGoPrevious =
    page > 1 &&
    Boolean(
      pagination.previous
    );

  const canGoNext =
    page <
      totalPages &&
    Boolean(
      pagination.next
    );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div>
      {/* ===================================================
          PAGE HEADER
      ==================================================== */}

      <div className="page-header mb-4">
        <div>
          <h2 className="mb-1">
            Sales
          </h2>

          <p className="text-muted mb-0">
            View and manage all sales transactions.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={
            loadSales
          }
          disabled={
            loading
          }
        >
          {loading ? (
            <Spinner
              size="sm"
              animation="border"
              className="me-2"
            />
          ) : (
            <i className="bi bi-arrow-clockwise me-2"></i>
          )}

          Refresh
        </Button>
      </div>

      {/* ===================================================
          ERROR
      ==================================================== */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* ===================================================
          STATISTICS
      ==================================================== */}

      <Row className="g-3 mb-4">
        <Col
          xl={3}
          md={6}
        >
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">
                Sales
              </small>

              <h4 className="mt-2 mb-0">
                {
                  statistics.totalSales
                }
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col
          xl={3}
          md={6}
        >
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">
                Completed
              </small>

              <h4 className="mt-2 mb-0 text-success">
                {
                  statistics.completedSales
                }
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col
          xl={3}
          md={6}
        >
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">
                Cancelled
              </small>

              <h4 className="mt-2 mb-0 text-danger">
                {
                  statistics.cancelledSales
                }
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col
          xl={3}
          md={6}
        >
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">
                Current Page Value
              </small>

              <h4 className="mt-2 mb-0">
                {formatCurrency(
                  statistics.totalAmount
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================
          FILTERS
      ==================================================== */}

      <Card className="dashboard-card border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            {/* SEARCH */}

            <Col
              xl={4}
              lg={6}
            >
              <Form.Label>
                Search
              </Form.Label>

              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target
                        .value
                    )
                  }
                  placeholder="Invoice, customer, branch..."
                />
              </InputGroup>
            </Col>

            {/* STATUS */}

            <Col
              xl={2}
              lg={3}
            >
              <Form.Label>
                Status
              </Form.Label>

              <Form.Select
                value={
                  statusFilter
                }
                onChange={(
                  e
                ) =>
                  setStatusFilter(
                    e.target
                      .value
                  )
                }
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

                <option value="REFUNDED">
                  Refunded
                </option>
              </Form.Select>
            </Col>

            {/* PAYMENT STATUS */}

            <Col
              xl={2}
              lg={3}
            >
              <Form.Label>
                Payment
              </Form.Label>

              <Form.Select
                value={
                  paymentStatusFilter
                }
                onChange={(
                  e
                ) =>
                  setPaymentStatusFilter(
                    e.target
                      .value
                  )
                }
              >
                <option value="ALL">
                  All Payments
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="PARTIAL">
                  Partial
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="UNPAID">
                  Unpaid
                </option>
              </Form.Select>
            </Col>

            {/* DATE FROM */}

            <Col
              xl={2}
              lg={3}
            >
              <Form.Label>
                From
              </Form.Label>

              <Form.Control
                type="date"
                value={
                  dateFrom
                }
                onChange={(
                  e
                ) =>
                  setDateFrom(
                    e.target
                      .value
                  )
                }
              />
            </Col>

            {/* DATE TO */}

            <Col
              xl={2}
              lg={3}
            >
              <Form.Label>
                To
              </Form.Label>

              <Form.Control
                type="date"
                value={
                  dateTo
                }
                onChange={(
                  e
                ) =>
                  setDateTo(
                    e.target
                      .value
                  )
                }
              />
            </Col>

            {/* CLEAR */}

            <Col
              xs={12}
              className="d-flex justify-content-end"
            >
              <Button
                variant="light"
                onClick={
                  clearFilters
                }
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===================================================
          SALES TABLE
      ==================================================== */}

      <Card className="dashboard-card border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">
                Sales Transactions
              </h5>

              <small className="text-muted">
                {pagination.count
                  ? `${pagination.count.toLocaleString()} sale(s)`
                  : "No sales"}
              </small>
            </div>

            {loading && (
              <Spinner
                animation="border"
                size="sm"
              />
            )}
          </div>

          <Table
            responsive
            hover
            className="align-middle"
          >
            <thead>
              <tr>
                <th>
                  INVOICE
                </th>

                <th>
                  CUSTOMER
                </th>

                <th>
                  BRANCH
                </th>

                <th>
                  ITEMS
                </th>

                <th>
                  TOTAL
                </th>

                <th>
                  PAYMENT
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  DATE
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {loading &&
              filteredSales.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-5"
                  >
                    <Spinner
                      animation="border"
                      className="mb-2"
                    />

                    <div className="text-muted">
                      Loading sales...
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-5"
                  >
                    <i
                      className="bi bi-receipt"
                      style={{
                        fontSize:
                          "36px",
                      }}
                    ></i>

                    <div className="mt-2 text-muted">
                      No sales found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map(
                  (sale) => {
                    const id =
                      getSaleId(
                        sale
                      );

                    const status =
                      getStatus(
                        sale
                      );

                    return (
                      <tr
                        key={
                          id ||
                          getInvoiceNumber(
                            sale
                          )
                        }
                      >
                        {/* INVOICE */}

                        <td>
                          <strong>
                            {
                              getInvoiceNumber(
                                sale
                              )
                            }
                          </strong>
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          {
                            getCustomerName(
                              sale
                            )
                          }
                        </td>

                        {/* BRANCH */}

                        <td>
                          {
                            getBranchName(
                              sale
                            )
                          }
                        </td>

                        {/* ITEMS */}

                        <td>
                          {getItemsCount(
                            sale
                          ).toLocaleString()}
                        </td>

                        {/* TOTAL */}

                        <td>
                          <strong>
                            {formatCurrency(
                              getTotal(
                                sale
                              )
                            )}
                          </strong>
                        </td>

                        {/* PAYMENT */}

                        <td>
                          <div>
                            <strong>
                              {
                                getPaymentMethod(
                                  sale
                                )
                              }
                            </strong>
                          </div>

                          <small className="text-muted">
                            {
                              getPaymentStatus(
                                sale
                              )
                            }
                          </small>
                        </td>

                        {/* STATUS */}

                        <td>
                          <StatusBadge
                            status={
                              status
                            }
                          />
                        </td>

                        {/* DATE */}

                        <td>
                          {formatDate(
                            getCreatedDate(
                              sale
                            )
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="border-0"
                            >
                              <i className="bi bi-three-dots-vertical"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() =>
                                  handleView(
                                    sale
                                  )
                                }
                              >
                                <i className="bi bi-eye me-2"></i>
                                View Sale
                              </Dropdown.Item>

                              {id && (
                                <Dropdown.Item
                                  onClick={() =>
                                    openDeleteModal(
                                      sale
                                    )
                                  }
                                  className="text-danger"
                                >
                                  <i className="bi bi-trash me-2"></i>
                                  Delete
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </Table>

          {/* =================================================
              PAGINATION
          ================================================== */}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Page{" "}
              <strong>
                {page}
              </strong>{" "}
              of{" "}
              <strong>
                {totalPages}
              </strong>
            </small>

            <div className="d-flex gap-2">
              <Button
                variant="light"
                size="sm"
                disabled={
                  loading ||
                  !canGoPrevious
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      Math.max(
                        1,
                        previous -
                          1
                      )
                  )
                }
              >
                <i className="bi bi-chevron-left me-1"></i>
                Previous
              </Button>

              <Button
                variant="light"
                size="sm"
                disabled={
                  loading ||
                  !canGoNext
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      previous +
                      1
                  )
                }
              >
                Next
                <i className="bi bi-chevron-right ms-1"></i>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ===================================================
          VIEW SALE MODAL
      ==================================================== */}

      <Modal
        show={
          showViewModal
        }
        onHide={() =>
          setShowViewModal(
            false
          )
        }
        size="lg"
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
              {/* HEADER */}

              <Row className="g-3 mb-4">
                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Invoice
                  </small>

                  <div className="fw-bold">
                    {
                      getInvoiceNumber(
                        selectedSale
                      )
                    }
                  </div>
                </Col>

                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Date
                  </small>

                  <div className="fw-bold">
                    {formatDateTime(
                      getCreatedDate(
                        selectedSale
                      )
                    )}
                  </div>
                </Col>

                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Customer
                  </small>

                  <div className="fw-bold">
                    {
                      getCustomerName(
                        selectedSale
                      )
                    }
                  </div>
                </Col>

                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Branch
                  </small>

                  <div className="fw-bold">
                    {
                      getBranchName(
                        selectedSale
                      )
                    }
                  </div>
                </Col>

                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Payment Method
                  </small>

                  <div className="fw-bold">
                    {
                      getPaymentMethod(
                        selectedSale
                      )
                    }
                  </div>
                </Col>

                <Col
                  md={6}
                >
                  <small className="text-muted">
                    Status
                  </small>

                  <div>
                    <StatusBadge
                      status={getStatus(
                        selectedSale
                      )}
                    />
                  </div>
                </Col>
              </Row>

              {/* ITEMS */}

              {Array.isArray(
                selectedSale.items
              ) &&
                selectedSale
                  .items.length >
                  0 && (
                  <>
                    <h6 className="mb-3">
                      Sale Items
                    </h6>

                    <Table
                      bordered
                      responsive
                      size="sm"
                    >
                      <thead>
                        <tr>
                          <th>
                            Product
                          </th>

                          <th>
                            Qty
                          </th>

                          <th>
                            Unit Price
                          </th>

                          <th>
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedSale.items.map(
                          (
                            item,
                            index
                          ) => {
                            const productName =
                              item?.product_name ??
                              item?.productName ??
                              item?.product?.name ??
                              `Product ${
                                item?.product ??
                                "-"
                              }`;

                            const quantity =
                              Number(
                                item?.quantity ??
                                  item?.qty ??
                                  0
                              );

                            const unitPrice =
                              Number(
                                item?.unit_price ??
                                  item?.unitPrice ??
                                  item?.price ??
                                  0
                              );

                            const lineTotal =
                              Number(
                                item?.total ??
                                  item?.line_total ??
                                  item?.lineTotal ??
                                  quantity *
                                    unitPrice
                              );

                            return (
                              <tr
                                key={
                                  item?.id ||
                                  index
                                }
                              >
                                <td>
                                  {
                                    productName
                                  }
                                </td>

                                <td>
                                  {
                                    quantity
                                  }
                                </td>

                                <td>
                                  {formatCurrency(
                                    unitPrice
                                  )}
                                </td>

                                <td>
                                  <strong>
                                    {formatCurrency(
                                      lineTotal
                                    )}
                                  </strong>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </Table>
                  </>
                )}

              {/* TOTAL */}

              <div className="d-flex justify-content-end mt-4">
                <div
                  className="text-end"
                  style={{
                    minWidth:
                      "250px",
                  }}
                >
                  <div className="d-flex justify-content-between">
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          selectedSale?.subtotal ??
                            selectedSale?.sub_total ??
                            0
                        )
                      )}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span>
                      Discount
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          selectedSale?.discount ??
                            selectedSale?.discount_amount ??
                            0
                        )
                      )}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span>
                      Tax
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(
                          selectedSale?.tax ??
                            selectedSale?.tax_amount ??
                            0
                        )
                      )}
                    </strong>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between">
                    <strong>
                      Grand Total
                    </strong>

                    <strong>
                      {formatCurrency(
                        getTotal(
                          selectedSale
                        )
                      )}
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
            onClick={() =>
              setShowViewModal(
                false
              )
            }
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===================================================
          DELETE MODAL
      ==================================================== */}

      <Modal
        show={
          showDeleteModal
        }
        onHide={() => {
          if (!deleting) {
            setShowDeleteModal(
              false
            );
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Delete Sale
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>

            Deleting a sale may affect
            stock, payments, and
            financial records.
          </Alert>

          <p className="mb-0">
            Are you sure you want to
            delete{" "}
            <strong>
              {saleToDelete
                ? getInvoiceNumber(
                    saleToDelete
                  )
                : "-"}
            </strong>
            ?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="light"
            disabled={
              deleting
            }
            onClick={() =>
              setShowDeleteModal(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={
              deleting
            }
            onClick={
              handleDelete
            }
          >
            {deleting ? (
              <>
                <Spinner
                  size="sm"
                  animation="border"
                  className="me-2"
                />

                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Delete Sale
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sales;

