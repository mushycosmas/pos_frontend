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
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import salesApi from "../services/SalesApi";
import returnApi from "../services/returnApi";

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
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase();
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
    typeof sale?.customer_name === "string" &&
    sale.customer_name.trim()
  ) {
    return sale.customer_name;
  }

  if (
    typeof sale?.customer_display_name === "string" &&
    sale.customer_display_name.trim()
  ) {
    return sale.customer_display_name;
  }

  if (
    typeof sale?.customerName === "string" &&
    sale.customerName.trim()
  ) {
    return sale.customerName;
  }

  if (
    typeof sale?.customer?.name === "string" &&
    sale.customer.name.trim()
  ) {
    return sale.customer.name;
  }

  if (
    typeof sale?.customer?.full_name === "string" &&
    sale.customer.full_name.trim()
  ) {
    return sale.customer.full_name;
  }

  if (
    typeof sale?.customer_details?.name === "string" &&
    sale.customer_details.name.trim()
  ) {
    return sale.customer_details.name;
  }

  return "Walk-in Customer";
};

const getCustomerPhone = (sale) => {
  return (
    sale?.customer_phone ??
    sale?.customer_display_phone ??
    sale?.customerPhone ??
    sale?.customer?.phone ??
    sale?.customer_details?.phone ??
    "-"
  );
};

const getBranchName = (sale) => {
  return (
    sale?.branch_name ??
    sale?.branchName ??
    sale?.branch?.name ??
    sale?.branch_details?.name ??
    "-"
  );
};

const getSaleStatus = (sale) => {
  return (
    sale?.status ??
    sale?.sale_status ??
    sale?.saleStatus ??
    "completed"
  );
};

const getSaleItems = (sale) => {
  if (Array.isArray(sale?.items)) {
    return sale.items;
  }

  if (Array.isArray(sale?.sale_items)) {
    return sale.sale_items;
  }

  if (Array.isArray(sale?.saleItems)) {
    return sale.saleItems;
  }

  // Support wrapped API responses
  if (Array.isArray(sale?.data?.items)) {
    return sale.data.items;
  }

  if (Array.isArray(sale?.data?.sale_items)) {
    return sale.data.sale_items;
  }

  return [];
};

const getItemId = (item) => {
  return (
    item?.id ??
    item?.sale_item_id ??
    item?.saleItemId ??
    null
  );
};

const getProductId = (item) => {
  if (
    item?.product &&
    typeof item.product === "object"
  ) {
    return item.product.id ?? null;
  }

  return (
    item?.product_id ??
    item?.productId ??
    item?.product ??
    null
  );
};

const getProductName = (item) => {
  return (
    item?.product_name ??
    item?.productName ??
    item?.product?.name ??
    item?.product_details?.name ??
    item?.name ??
    `Product #${getProductId(item) || "-"}`
  );
};

const getProductSku = (item) => {
  return (
    item?.product_sku ??
    item?.productSku ??
    item?.product?.sku ??
    item?.product_details?.sku ??
    "-"
  );
};

const getQuantity = (item) => {
  const quantity = Number(
    item?.quantity ??
      item?.qty ??
      0
  );

  return Number.isFinite(quantity)
    ? quantity
    : 0;
};

const getUnitPrice = (item) => {
  const price = Number(
    item?.unit_price ??
      item?.unitPrice ??
      item?.selling_price ??
      item?.sellingPrice ??
      item?.price ??
      0
  );

  return Number.isFinite(price)
    ? price
    : 0;
};

const getItemDiscount = (item) => {
  const value = Number(
    item?.discount ?? 0
  );

  return Number.isFinite(value)
    ? value
    : 0;
};

const getItemTax = (item) => {
  const value = Number(
    item?.tax ?? 0
  );

  return Number.isFinite(value)
    ? value
    : 0;
};

const getItemTotal = (item) => {
  const explicitTotal =
    item?.total ??
    item?.subtotal ??
    item?.sub_total;

  if (
    explicitTotal !== undefined &&
    explicitTotal !== null
  ) {
    const value = Number(
      explicitTotal
    );

    if (Number.isFinite(value)) {
      return value;
    }
  }

  const quantity =
    getQuantity(item);

  const unitPrice =
    getUnitPrice(item);

  const discount =
    getItemDiscount(item);

  const tax =
    getItemTax(item);

  return (
    quantity * unitPrice -
    discount +
    tax
  );
};

const getReturnStatusVariant = (
  status
) => {
  switch (
    normalizeStatus(status)
  ) {
    case "pending":
      return "warning";

    case "approved":
      return "primary";

    case "completed":
      return "success";

    case "rejected":
      return "danger";

    default:
      return "secondary";
  }
};

const StatusBadge = ({ status }) => {
  return (
    <Badge
      bg={getReturnStatusVariant(
        status
      )}
    >
      {String(status || "-")
        .replaceAll("_", " ")
        .toUpperCase()}
    </Badge>
  );
};

const extractErrorMessage = (
  error,
  fallback = "An unexpected error occurred."
) => {
  const data =
    error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return String(data.detail);
  }

  if (data?.message) {
    return String(data.message);
  }

  if (data?.error) {
    return String(data.error);
  }

  if (
    data &&
    typeof data === "object"
  ) {
    const messages =
      Object.entries(data)
        .map(([field, value]) => {
          let text;

          if (Array.isArray(value)) {
            text = value.join(", ");
          } else if (
            value &&
            typeof value === "object"
          ) {
            text = JSON.stringify(
              value
            );
          } else {
            text = String(value);
          }

          return `${field}: ${text}`;
        })
        .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return (
    error?.message ||
    fallback
  );
};

// =========================================================
// RETURN PAGE
// =========================================================

const Return = () => {
  // =======================================================
  // MAIN STATE
  // =======================================================

  const [returns, setReturns] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =======================================================
  // FILTERS
  // =======================================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [page, setPage] =
    useState(1);

  const pageSize = 20;

  const [pagination, setPagination] =
    useState({
      count: 0,
      next: null,
      previous: null,
    });

  // =======================================================
  // CREATE RETURN MODAL
  // =======================================================

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [saleSearch, setSaleSearch] =
    useState("");

  const [saleResults, setSaleResults] =
    useState([]);

  const [searchingSale, setSearchingSale] =
    useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [selectedItems, setSelectedItems] =
    useState({});

  const [reason, setReason] =
    useState("");

  const [refundMethod, setRefundMethod] =
    useState("");

  const [notes, setNotes] =
    useState("");

  // =======================================================
  // DETAILS MODAL
  // =======================================================

  const [
    showDetailsModal,
    setShowDetailsModal,
  ] = useState(false);

  const [selectedReturn, setSelectedReturn] =
    useState(null);

  // =======================================================
  // LOAD RETURNS
  // =======================================================

  const loadReturns =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          page_size: pageSize,
        };

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (
          statusFilter !== "ALL"
        ) {
          params.status =
            statusFilter;
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
          await returnApi.getReturns(
            params
          );

        if (
          response &&
          Array.isArray(
            response.results
          )
        ) {
          setReturns(
            response.results
          );

          setPagination({
            count: Number(
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

        if (
          Array.isArray(response)
        ) {
          setReturns(response);

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
          setReturns(
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

        setReturns([]);

        setPagination({
          count: 0,
          next: null,
          previous: null,
        });
      } catch (err) {
        console.error(
          "Failed to load returns:",
          err
        );

        setError(
          extractErrorMessage(
            err,
            "Failed to load returns."
          )
        );

        setReturns([]);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      statusFilter,
      dateFrom,
      dateTo,
    ]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  // =======================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =======================================================

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [
    search,
    statusFilter,
    dateFrom,
    dateTo,
    page,
  ]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics = useMemo(() => {
    const total =
      returns.length;

    const pending =
      returns.filter(
        (item) =>
          normalizeStatus(
            item?.status
          ) === "pending"
      ).length;

    const approved =
      returns.filter(
        (item) =>
          normalizeStatus(
            item?.status
          ) === "approved"
      ).length;

    const completed =
      returns.filter(
        (item) =>
          normalizeStatus(
            item?.status
          ) === "completed"
      ).length;

    const refunded =
      returns
        .filter(
          (item) =>
            normalizeStatus(
              item?.status
            ) === "completed"
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(
              item?.refund_amount ||
                0
            ),
          0
        );

    return {
      total,
      pending,
      approved,
      completed,
      refunded,
    };
  }, [returns]);

  // =======================================================
  // OPEN CREATE MODAL
  // =======================================================

  const openCreateModal = () => {
    setSaleSearch("");
    setSaleResults([]);
    setSelectedSale(null);
    setSelectedItems({});
    setReason("");
    setRefundMethod("");
    setNotes("");
    setError("");
    setSuccess("");

    setShowCreateModal(true);
  };

  // =======================================================
  // CLOSE CREATE MODAL
  // =======================================================

  const closeCreateModal = () => {
    if (saving) {
      return;
    }

    setShowCreateModal(false);
    setSaleSearch("");
    setSaleResults([]);
    setSelectedSale(null);
    setSelectedItems({});
    setReason("");
    setRefundMethod("");
    setNotes("");
  };

  // =======================================================
  // SEARCH SALE
  // =======================================================

  const searchSale = async () => {
    const query =
      saleSearch.trim();

    if (!query) {
      setError(
        "Enter an invoice number, receipt number or sale reference."
      );
      return;
    }

    setSearchingSale(true);
    setError("");
    setSuccess("");
    setSaleResults([]);

    try {
      const response =
        await salesApi.getAll({
          search: query,
          page: 1,
          page_size: 10,
        });

      let results = [];

      if (
        Array.isArray(
          response?.results
        )
      ) {
        results =
          response.results;
      } else if (
        Array.isArray(response)
      ) {
        results = response;
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        results =
          response.data;
      }

      setSaleResults(results);

      if (results.length === 0) {
        setError(
          "No sale found matching your search."
        );
      }
    } catch (err) {
      console.error(
        "Failed to search sale:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to search sales."
        )
      );
    } finally {
      setSearchingSale(false);
    }
  };

  // =======================================================
  // SELECT SALE
  // =======================================================

  const selectSale = (sale) => {
    const saleId =
      getSaleId(sale);

    if (!saleId) {
      setError(
        "The selected sale does not have a valid ID."
      );
      return;
    }

    setError("");
    setSuccess("");
    setSelectedItems({});

    /*
     * IMPORTANT:
     *
     * DO NOT call:
     *
     * salesApi.getById(saleId)
     *
     * The sales list endpoint now returns nested
     * `items` through SaleListSerializer.
     *
     * Calling GET /sales/<id>/ was causing:
     *
     * 405 Method Not Allowed
     *
     * So we use the sale returned by the search
     * endpoint directly.
     */

    console.log(
      "RETURN - SELECTED SALE:",
      sale
    );

    const items =
      getSaleItems(sale);

    console.log(
      "RETURN - SALE ITEMS:",
      items
    );

    setSelectedSale(sale);

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      setError(
        `Sale ${getInvoiceNumber(
          sale
        )} was found, but it contains no returnable items.`
      );
    }
  };

  // =======================================================
  // CLEAR SELECTED SALE
  // =======================================================

  const clearSelectedSale = () => {
    setSelectedSale(null);
    setSelectedItems({});
    setError("");
  };

  // =======================================================
  // TOGGLE ITEM
  // =======================================================

  const toggleItem = (item) => {
    const itemId =
      getItemId(item);

    if (!itemId) {
      return;
    }

    const soldQuantity =
      getQuantity(item);

    if (soldQuantity <= 0) {
      return;
    }

    setSelectedItems(
      (previous) => {
        const updated = {
          ...previous,
        };

        if (
          updated[itemId]
        ) {
          delete updated[itemId];
        } else {
          updated[itemId] = {
            sale_item: Number(
              itemId
            ),
            quantity:
              soldQuantity,
            max_quantity:
              soldQuantity,
            unit_price:
              getUnitPrice(item),
            product:
              getProductId(item),
            product_name:
              getProductName(item),
          };
        }

        return updated;
      }
    );
  };

  // =======================================================
  // UPDATE RETURN QUANTITY
  // =======================================================

  const updateReturnQuantity = (
    item,
    value
  ) => {
    const itemId =
      getItemId(item);

    if (!itemId) {
      return;
    }

    const maxQuantity =
      getQuantity(item);

    let quantity =
      Number(value);

    if (
      !Number.isFinite(quantity)
    ) {
      quantity = 0;
    }

    quantity = Math.max(
      0,
      Math.min(
        quantity,
        maxQuantity
      )
    );

    setSelectedItems(
      (previous) => {
        const current =
          previous[itemId];

        if (!current) {
          return previous;
        }

        if (quantity <= 0) {
          const updated = {
            ...previous,
          };

          delete updated[itemId];

          return updated;
        }

        return {
          ...previous,
          [itemId]: {
            ...current,
            quantity,
          },
        };
      }
    );
  };

  // =======================================================
  // SELECTED RETURN ITEMS
  // =======================================================

  const selectedReturnItems =
    useMemo(() => {
      return Object.values(
        selectedItems
      );
    }, [selectedItems]);

  // =======================================================
  // RETURN TOTAL
  // =======================================================

  const returnTotal = useMemo(() => {
    return selectedReturnItems.reduce(
      (sum, item) => {
        return (
          sum +
          Number(
            item.quantity || 0
          ) *
            Number(
              item.unit_price || 0
            )
        );
      },
      0
    );
  }, [selectedReturnItems]);

  // =======================================================
  // CREATE RETURN
  // =======================================================

  const createReturn = async () => {
    setError("");
    setSuccess("");

    if (!selectedSale) {
      setError(
        "Please select a sale."
      );
      return;
    }

    if (!reason) {
      setError(
        "Please select a return reason."
      );
      return;
    }

    if (!refundMethod) {
      setError(
        "Please select a refund method."
      );
      return;
    }

    if (
      selectedReturnItems.length ===
      0
    ) {
      setError(
        "Please select at least one item to return."
      );
      return;
    }

    const saleId =
      getSaleId(selectedSale);

    if (!saleId) {
      setError(
        "Selected sale has an invalid ID."
      );
      return;
    }

    const payload = {
      sale: Number(saleId),
      reason,
      refund_method:
        refundMethod,
      notes: notes.trim(),
      items:
        selectedReturnItems.map(
          (item) => ({
            sale_item:
              Number(
                item.sale_item
              ),
            quantity:
              Number(
                item.quantity
              ),
          })
        ),
    };

    console.log(
      "RETURN - CREATE PAYLOAD:",
      payload
    );

    setSaving(true);

    try {
      const response =
        await returnApi.createReturn(
          payload
        );

      console.log(
        "RETURN - CREATED:",
        response
      );

      setSuccess(
        `Return ${
          response?.return_number ||
          ""
        } created successfully.`
      );

      setShowCreateModal(false);

      setSaleSearch("");
      setSaleResults([]);
      setSelectedSale(null);
      setSelectedItems({});
      setReason("");
      setRefundMethod("");
      setNotes("");

      await loadReturns();
    } catch (err) {
      console.error(
        "Failed to create return:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to create return."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // VIEW RETURN
  // =======================================================

  const openDetails = async (
    returnItem
  ) => {
    const returnId =
      returnItem?.id;

    if (!returnId) {
      return;
    }

    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const response =
        await returnApi.getReturn(
          returnId
        );

      const detail =
        response?.data ||
        response;

      setSelectedReturn(
        detail
      );

      setShowDetailsModal(
        true
      );
    } catch (err) {
      console.error(
        "Failed to load return details:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to load return details."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // APPROVE RETURN
  // =======================================================

  const approveReturn = async () => {
    if (!selectedReturn?.id) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await returnApi.approveReturn(
          selectedReturn.id
        );

      const updated =
        response?.data ||
        response;

      setSelectedReturn(
        updated
      );

      setSuccess(
        "Return approved successfully."
      );

      await loadReturns();
    } catch (err) {
      console.error(
        "Failed to approve return:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to approve return."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // REJECT RETURN
  // =======================================================

  const rejectReturn = async () => {
    if (!selectedReturn?.id) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await returnApi.rejectReturn(
          selectedReturn.id
        );

      const updated =
        response?.data ||
        response;

      setSelectedReturn(
        updated
      );

      setSuccess(
        "Return rejected successfully."
      );

      await loadReturns();
    } catch (err) {
      console.error(
        "Failed to reject return:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to reject return."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // COMPLETE RETURN
  // =======================================================

  const completeReturn = async () => {
    if (!selectedReturn?.id) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await returnApi.completeReturn(
          selectedReturn.id
        );

      const updated =
        response?.data ||
        response;

      setSelectedReturn(
        updated
      );

      setSuccess(
        "Return completed successfully and stock has been updated."
      );

      await loadReturns();
    } catch (err) {
      console.error(
        "Failed to complete return:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Failed to complete return."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =======================================================
  // PAGINATION
  // =======================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        Number(
          pagination.count || 0
        ) / pageSize
      )
    );

  const goToPreviousPage = () => {
    if (
      pagination.previous &&
      page > 1
    ) {
      setPage(
        (previous) =>
          Math.max(
            1,
            previous - 1
          )
      );
    }
  };

  const goToNextPage = () => {
    if (
      pagination.next &&
      page < totalPages
    ) {
      setPage(
        (previous) =>
          Math.min(
            totalPages,
            previous + 1
          )
      );
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="container-fluid py-3">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">
            Sales Returns
          </h3>

          <p className="text-muted mb-0">
            Manage customer returns,
            refunds and returned stock.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={
            openCreateModal
          }
        >
          <i className="bi bi-arrow-return-left me-2" />
          New Return
        </Button>
      </div>

      {/* ================================================= */}
      {/* ALERTS */}
      {/* ================================================= */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      )}

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <Row className="g-3 mb-4">

        <Col md={6} lg={2.4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted small">
                Total Returns
              </div>

              <h4 className="mb-0 mt-2">
                {statistics.total}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={2.4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted small">
                Pending
              </div>

              <h4 className="mb-0 mt-2 text-warning">
                {statistics.pending}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={2.4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted small">
                Approved
              </div>

              <h4 className="mb-0 mt-2 text-primary">
                {statistics.approved}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={2.4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted small">
                Completed
              </div>

              <h4 className="mb-0 mt-2 text-success">
                {statistics.completed}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={2.4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted small">
                Refunded
              </div>

              <h5 className="mb-0 mt-2 text-danger">
                {formatCurrency(
                  statistics.refunded
                )}
              </h5>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">

            <Col md={4}>
              <Form.Label>
                Search
              </Form.Label>

              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Return number..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />
              </InputGroup>
            </Col>

            <Col md={2}>
              <Form.Label>
                Status
              </Form.Label>

              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label>
                From
              </Form.Label>

              <Form.Control
                type="date"
                value={dateFrom}
                onChange={(e) =>
                  setDateFrom(
                    e.target.value
                  )
                }
              />
            </Col>

            <Col md={2}>
              <Form.Label>
                To
              </Form.Label>

              <Form.Control
                type="date"
                value={dateTo}
                onChange={(e) =>
                  setDateTo(
                    e.target.value
                  )
                }
              />
            </Col>

            <Col
              md={2}
              className="d-flex align-items-end"
            >
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "ALL"
                  );
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* ================================================= */}
      {/* RETURNS TABLE */}
      {/* ================================================= */}

      <Card className="shadow-sm">
        <Card.Body className="p-0">

          <div className="table-responsive">

            <Table
              hover
              responsive
              className="mb-0 align-middle"
            >
              <thead className="table-light">
                <tr>
                  <th>
                    Return #
                  </th>

                  <th>
                    Sale
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Refund Method
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th className="text-end">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-5"
                    >
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />

                      Loading returns...
                    </td>
                  </tr>
                ) : returns.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center text-muted py-5"
                    >
                      No returns found.
                    </td>
                  </tr>
                ) : (
                  returns.map(
                    (returnItem) => (
                      <tr
                        key={
                          returnItem.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              returnItem.return_number ||
                              `RET-${returnItem.id}`
                            }
                          </strong>
                        </td>

                        <td>
                          {getInvoiceNumber(
                            returnItem.sale_details ||
                              returnItem.sale ||
                              returnItem
                          )}
                        </td>

                        <td>
                          {getCustomerName(
                            returnItem
                          )}
                        </td>

                        <td>
                          {String(
                            returnItem.reason ||
                              "-"
                          )
                            .replaceAll(
                              "_",
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (char) =>
                                char.toUpperCase()
                            )}
                        </td>

                        <td>
                          {String(
                            returnItem.refund_method ||
                              "-"
                          )
                            .replaceAll(
                              "_",
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (char) =>
                                char.toUpperCase()
                            )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              returnItem.refund_amount
                            )}
                          </strong>
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              returnItem.status
                            }
                          />
                        </td>

                        <td>
                          {formatDate(
                            returnItem.created_at
                          )}
                        </td>

                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              openDetails(
                                returnItem
                              )
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  )
                )}

              </tbody>
            </Table>

          </div>
        </Card.Body>

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        <Card.Footer className="d-flex justify-content-between align-items-center">

          <small className="text-muted">
            Page {page} of{" "}
            {totalPages}
            {" • "}
            {pagination.count || 0}{" "}
            records
          </small>

          <div className="d-flex gap-2">

            <Button
              size="sm"
              variant="outline-secondary"
              disabled={
                !pagination.previous ||
                page <= 1 ||
                loading
              }
              onClick={
                goToPreviousPage
              }
            >
              Previous
            </Button>

            <Button
              size="sm"
              variant="outline-secondary"
              disabled={
                !pagination.next ||
                page >= totalPages ||
                loading
              }
              onClick={
                goToNextPage
              }
            >
              Next
            </Button>

          </div>
        </Card.Footer>
      </Card>

      {/* ================================================= */}
      {/* CREATE RETURN MODAL */}
      {/* ================================================= */}

      <Modal
        show={showCreateModal}
        onHide={closeCreateModal}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Create Sales Return
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {/* SALE SEARCH */}

          {!selectedSale && (
            <>
              <Card className="mb-3">
                <Card.Body>

                  <Form.Label>
                    Search Sale
                  </Form.Label>

                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Invoice number, receipt number or reference"
                      value={saleSearch}
                      onChange={(e) =>
                        setSaleSearch(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          e.preventDefault();
                          searchSale();
                        }
                      }}
                    />

                    <Button
                      variant="primary"
                      disabled={
                        searchingSale
                      }
                      onClick={
                        searchSale
                      }
                    >
                      {searchingSale ? (
                        <>
                          <Spinner
                            size="sm"
                            animation="border"
                            className="me-2"
                          />

                          Searching...
                        </>
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </InputGroup>

                </Card.Body>
              </Card>

              {/* SEARCH RESULTS */}

              {saleResults.length >
                0 && (
                <Card>
                  <Card.Header>
                    <strong>
                      Sales Found
                    </strong>
                  </Card.Header>

                  <div className="table-responsive">

                    <Table
                      hover
                      className="mb-0"
                    >
                      <thead className="table-light">
                        <tr>
                          <th>
                            Invoice
                          </th>

                          <th>
                            Customer
                          </th>

                          <th>
                            Phone
                          </th>

                          <th>
                            Branch
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Total
                          </th>

                          <th className="text-end">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {saleResults.map(
                          (sale) => {
                            const saleId =
                              getSaleId(
                                sale
                              );

                            const saleItems =
                              getSaleItems(
                                sale
                              );

                            return (
                              <tr
                                key={
                                  saleId
                                }
                              >
                                <td>
                                  <strong>
                                    {getInvoiceNumber(
                                      sale
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  {getCustomerName(
                                    sale
                                  )}
                                </td>

                                <td>
                                  {getCustomerPhone(
                                    sale
                                  )}
                                </td>

                                <td>
                                  {getBranchName(
                                    sale
                                  )}
                                </td>

                                <td>
                                  <Badge
                                    bg={
                                      normalizeStatus(
                                        getSaleStatus(
                                          sale
                                        )
                                      ) ===
                                      "completed"
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {String(
                                      getSaleStatus(
                                        sale
                                      )
                                    )
                                      .replaceAll(
                                        "_",
                                        " "
                                      )
                                      .toUpperCase()}
                                  </Badge>
                                </td>

                                <td>
                                  {formatCurrency(
                                    sale?.total ??
                                      sale?.grand_total ??
                                      sale?.grandTotal ??
                                      0
                                  )}
                                </td>

                                <td className="text-end">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                      selectSale(
                                        sale
                                      )
                                    }
                                  >
                                    Select
                                  </Button>
                                </td>
                              </tr>
                            );
                          }
                        )}

                      </tbody>
                    </Table>

                  </div>
                </Card>
              )}
            </>
          )}

          {/* SELECTED SALE */}

          {selectedSale && (
            <>
              <Card className="mb-3">

                <Card.Header className="d-flex justify-content-between align-items-center">

                  <strong>
                    Selected Sale
                  </strong>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={
                      clearSelectedSale
                    }
                  >
                    Change Sale
                  </Button>

                </Card.Header>

                <Card.Body>

                  <Row className="g-3">

                    <Col md={3}>
                      <div className="text-muted small">
                        Invoice
                      </div>

                      <strong>
                        {getInvoiceNumber(
                          selectedSale
                        )}
                      </strong>
                    </Col>

                    <Col md={3}>
                      <div className="text-muted small">
                        Customer
                      </div>

                      <strong>
                        {getCustomerName(
                          selectedSale
                        )}
                      </strong>
                    </Col>

                    <Col md={3}>
                      <div className="text-muted small">
                        Phone
                      </div>

                      <strong>
                        {getCustomerPhone(
                          selectedSale
                        )}
                      </strong>
                    </Col>

                    <Col md={3}>
                      <div className="text-muted small">
                        Branch
                      </div>

                      <strong>
                        {getBranchName(
                          selectedSale
                        )}
                      </strong>
                    </Col>

                  </Row>

                </Card.Body>
              </Card>

              {/* RETURN ITEMS */}

              <Card className="mb-3">

                <Card.Header>
                  <strong>
                    Select Items to Return
                  </strong>
                </Card.Header>

                <div className="table-responsive">

                  <Table
                    hover
                    className="mb-0 align-middle"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>
                          Select
                        </th>

                        <th>
                          Product
                        </th>

                        <th>
                          SKU
                        </th>

                        <th>
                          Sold Qty
                        </th>

                        <th>
                          Return Qty
                        </th>

                        <th>
                          Unit Price
                        </th>

                        <th>
                          Return Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {getSaleItems(
                        selectedSale
                      ).map(
                        (item) => {
                          const itemId =
                            getItemId(
                              item
                            );

                          const soldQuantity =
                            getQuantity(
                              item
                            );

                          const selected =
                            Boolean(
                              selectedItems[
                                itemId
                              ]
                            );

                          const returnQuantity =
                            selected
                              ? Number(
                                  selectedItems[
                                    itemId
                                  ]
                                    ?.quantity ||
                                    0
                                )
                              : 0;

                          return (
                            <tr
                              key={
                                itemId
                              }
                            >
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  disabled={
                                    soldQuantity <=
                                    0
                                  }
                                  onChange={() =>
                                    toggleItem(
                                      item
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <strong>
                                  {getProductName(
                                    item
                                  )}
                                </strong>
                              </td>

                              <td>
                                {getProductSku(
                                  item
                                )}
                              </td>

                              <td>
                                {soldQuantity}
                              </td>

                              <td>
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  min="0"
                                  max={
                                    soldQuantity
                                  }
                                  step="0.001"
                                  value={
                                    selected
                                      ? returnQuantity
                                      : ""
                                  }
                                  disabled={
                                    !selected
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateReturnQuantity(
                                      item,
                                      e.target
                                        .value
                                    )
                                  }
                                  style={{
                                    width: "120px",
                                  }}
                                />
                              </td>

                              <td>
                                {formatCurrency(
                                  getUnitPrice(
                                    item
                                  )
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatCurrency(
                                    returnQuantity *
                                      getUnitPrice(
                                        item
                                      )
                                  )}
                                </strong>
                              </td>
                            </tr>
                          );
                        }
                      )}

                      {getSaleItems(
                        selectedSale
                      ).length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center text-muted py-4"
                          >
                            No sale items found.
                          </td>
                        </tr>
                      )}

                    </tbody>

                    <tfoot>
                      <tr>
                        <td
                          colSpan={6}
                          className="text-end"
                        >
                          <strong>
                            Refund Amount:
                          </strong>
                        </td>

                        <td>
                          <strong className="text-danger">
                            {formatCurrency(
                              returnTotal
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>

                </div>
              </Card>

              {/* RETURN INFORMATION */}

              <Card>
                <Card.Header>
                  <strong>
                    Return Information
                  </strong>
                </Card.Header>

                <Card.Body>

                  <Row className="g-3">

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          Reason{" "}
                          <span className="text-danger">
                            *
                          </span>
                        </Form.Label>

                        <Form.Select
                          value={reason}
                          onChange={(e) =>
                            setReason(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select reason
                          </option>

                          <option value="wrong_item">
                            Wrong Item
                          </option>

                          <option value="damaged">
                            Damaged
                          </option>

                          <option value="defective">
                            Defective
                          </option>

                          <option value="customer_change_mind">
                            Customer Changed Mind
                          </option>

                          <option value="wrong_quantity">
                            Wrong Quantity
                          </option>

                          <option value="expired">
                            Expired
                          </option>

                          <option value="other">
                            Other
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          Refund Method{" "}
                          <span className="text-danger">
                            *
                          </span>
                        </Form.Label>

                        <Form.Select
                          value={
                            refundMethod
                          }
                          onChange={(e) =>
                            setRefundMethod(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select refund method
                          </option>

                          <option value="cash">
                            Cash
                          </option>

                          <option value="mobile_money">
                            Mobile Money
                          </option>

                          <option value="bank">
                            Bank
                          </option>

                          <option value="store_credit">
                            Store Credit
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>
                          Notes
                        </Form.Label>

                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Additional notes about this return..."
                          value={notes}
                          onChange={(e) =>
                            setNotes(
                              e.target
                                .value
                            )
                          }
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                </Card.Body>
              </Card>
            </>
          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={
              closeCreateModal
            }
            disabled={saving}
          >
            Cancel
          </Button>

          {selectedSale && (
            <Button
              variant="primary"
              onClick={
                createReturn
              }
              disabled={
                saving ||
                selectedReturnItems.length ===
                  0 ||
                !reason ||
                !refundMethod ||
                returnTotal <= 0
              }
            >
              {saving ? (
                <>
                  <Spinner
                    size="sm"
                    animation="border"
                    className="me-2"
                  />

                  Creating...
                </>
              ) : (
                <>
                  Create Return
                </>
              )}
            </Button>
          )}

        </Modal.Footer>
      </Modal>

      {/* ================================================= */}
      {/* RETURN DETAILS MODAL */}
      {/* ================================================= */}

      <Modal
        show={showDetailsModal}
        onHide={() =>
          setShowDetailsModal(
            false
          )
        }
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Return Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedReturn && (
            <>
              <Row className="g-3 mb-4">

                <Col md={4}>
                  <div className="text-muted small">
                    Return Number
                  </div>

                  <strong>
                    {
                      selectedReturn.return_number
                    }
                  </strong>
                </Col>

                <Col md={4}>
                  <div className="text-muted small">
                    Status
                  </div>

                  <StatusBadge
                    status={
                      selectedReturn.status
                    }
                  />
                </Col>

                <Col md={4}>
                  <div className="text-muted small">
                    Created
                  </div>

                  <strong>
                    {formatDateTime(
                      selectedReturn.created_at
                    )}
                  </strong>
                </Col>

                <Col md={4}>
                  <div className="text-muted small">
                    Sale
                  </div>

                  <strong>
                    {getInvoiceNumber(
                      selectedReturn.sale_details ||
                        selectedReturn.sale ||
                        selectedReturn
                    )}
                  </strong>
                </Col>

                <Col md={4}>
                  <div className="text-muted small">
                    Customer
                  </div>

                  <strong>
                    {getCustomerName(
                      selectedReturn
                    )}
                  </strong>
                </Col>

                <Col md={4}>
                  <div className="text-muted small">
                    Refund
                  </div>

                  <strong className="text-danger">
                    {formatCurrency(
                      selectedReturn.refund_amount
                    )}
                  </strong>
                </Col>

              </Row>

              <Table
                bordered
                hover
                responsive
              >
                <thead className="table-light">
                  <tr>
                    <th>
                      Product
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Unit Price
                    </th>

                    <th>
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {Array.isArray(
                    selectedReturn.items
                  ) &&
                    selectedReturn.items.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            {
                              item.product_name ||
                              item.product?.name ||
                              `Product #${
                                item.product ||
                                "-"
                              }`
                            }
                          </td>

                          <td>
                            {
                              item.quantity
                            }
                          </td>

                          <td>
                            {formatCurrency(
                              item.unit_price
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              item.subtotal
                            )}
                          </td>
                        </tr>
                      )
                    )}

                  {(!Array.isArray(
                    selectedReturn.items
                  ) ||
                    selectedReturn.items
                      .length ===
                      0) && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-muted"
                      >
                        No return items.
                      </td>
                    </tr>
                  )}

                </tbody>
              </Table>

              <Row className="mt-3">

                <Col md={6}>
                  <strong>
                    Reason:
                  </strong>{" "}
                  {String(
                    selectedReturn.reason ||
                      "-"
                  ).replaceAll(
                    "_",
                    " "
                  )}
                </Col>

                <Col md={6}>
                  <strong>
                    Refund Method:
                  </strong>{" "}
                  {String(
                    selectedReturn.refund_method ||
                      "-"
                  ).replaceAll(
                    "_",
                    " "
                  )}
                </Col>

                <Col md={12} className="mt-3">
                  <strong>
                    Notes:
                  </strong>

                  <div className="text-muted mt-1">
                    {selectedReturn.notes ||
                      "No notes."}
                  </div>
                </Col>

              </Row>
            </>
          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() =>
              setShowDetailsModal(
                false
              )
            }
            disabled={
              actionLoading
            }
          >
            Close
          </Button>

          {normalizeStatus(
            selectedReturn?.status
          ) === "pending" && (
            <>
              <Button
                variant="danger"
                onClick={
                  rejectReturn
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading ? (
                  <Spinner
                    size="sm"
                    animation="border"
                  />
                ) : (
                  "Reject"
                )}
              </Button>

              <Button
                variant="primary"
                onClick={
                  approveReturn
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading ? (
                  <Spinner
                    size="sm"
                    animation="border"
                  />
                ) : (
                  "Approve"
                )}
              </Button>
            </>
          )}

          {normalizeStatus(
            selectedReturn?.status
          ) === "approved" && (
            <Button
              variant="success"
              onClick={
                completeReturn
              }
              disabled={
                actionLoading
              }
            >
              {actionLoading ? (
                <Spinner
                  size="sm"
                  animation="border"
                />
              ) : (
                "Complete Return"
              )}
            </Button>
          )}

        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Return;