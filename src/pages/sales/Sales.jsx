
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Card,
  Col,
  Row,
  Spinner,
  Button,
} from "react-bootstrap";

import salesApi from "../../services/SalesApi";
import { useBranch } from "../../context/BranchContext";

import {
  getSaleId,
  getInvoiceNumber,
  getCustomerName,
  getBranchName,
  getSoldBy,
  getStatus,
  getTotal,
  getDiscount,
  getPaymentMethod,
  formatCurrency,
} from "./utils/salesHelpers";

import SalesHeader from "./components/SalesHeader";
import SalesError from "./components/SalesError";
import SalesStats from "./components/SalesStats";
import SalesFilters from "./components/SalesFilters";
import SalesTable from "./components/SalesTable";
import SaleViewModal from "./components/SaleViewModal";
import SaleDeleteModal from "./components/SaleDeleteModal";

const PAGE_SIZE = 20;

const EMPTY_PAGINATION = {
  count: 0,
  next: null,
  previous: null,
};

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const toNumber = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const getSaleDate = (sale) => {
  const value =
    sale?.created_at ??
    sale?.createdAt ??
    sale?.sale_date ??
    sale?.date ??
    "";

  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10);
  }

  // Local calendar date avoids timezone shifts.
  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
};

const getPaymentStatus = (sale) => {
  const explicitStatus =
    sale?.payment_status ??
    sale?.paymentStatus ??
    sale?.payment_state;

  if (explicitStatus) {
    const status = normalize(explicitStatus);

    if (
      ["paid", "fully_paid", "completed"].includes(status)
    ) {
      return "PAID";
    }

    if (
      ["partial", "partially_paid", "partially paid"].includes(status)
    ) {
      return "PARTIAL";
    }

    if (status === "pending") return "PENDING";
    if (status === "unpaid") return "UNPAID";

    return status.toUpperCase();
  }

  const total = toNumber(getTotal(sale));
  const paid = toNumber(sale?.amount_paid);

  if (total > 0 && paid >= total) return "PAID";
  if (paid > 0) return "PARTIAL";

  return "UNPAID";
};

const getSearchableText = (sale) =>
  [
    getInvoiceNumber(sale),
    getCustomerName(sale),
    getBranchName(sale),
    getSoldBy(sale),
    getPaymentMethod(sale),
    sale?.id,
    getStatus(sale),
    getPaymentStatus(sale),
  ]
    .map(normalize)
    .join(" ");

const Sales = () => {
  const { currentBranchId } = useBranch();

  // Data and request state.
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Filters.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination.
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  // Modals.
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Increment to reload after refresh or delete.
  const [reloadKey, setReloadKey] = useState(0);

  /*
   * FETCH SALES
   *
   * Original implementation preserved.
   * Filters are sent to Django before pagination.
   */
  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
      };

      if (
        currentBranchId !== undefined &&
        currentBranchId !== null &&
        currentBranchId !== ""
      ) {
        params.branch = currentBranchId;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      if (paymentStatusFilter !== "ALL") {
        params.payment_status = paymentStatusFilter;
      }

      if (dateFrom) {
        params.date_from = dateFrom;
      }

      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await salesApi.getAll(params);
      const payload = response?.data ?? response;

      let results;
      let count;
      let next;
      let previous;

      if (Array.isArray(payload)) {
        results = payload;
        count = payload.length;
        next = null;
        previous = null;
      } else if (Array.isArray(payload?.results)) {
        results = payload.results;
        count = Number(payload.count ?? results.length);
        next = payload.next ?? null;
        previous = payload.previous ?? null;
      } else if (Array.isArray(payload?.data)) {
        results = payload.data;
        count = Number(payload.count ?? results.length);
        next = payload.next ?? null;
        previous = payload.previous ?? null;
      } else {
        throw new Error(
          "Unexpected sales API response format."
        );
      }

      setSales(results);

      setPagination({
        count,
        next,
        previous,
      });

    } catch (err) {
      console.error("Failed to load sales:", err);

      setSales([]);
      setPagination(EMPTY_PAGINATION);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load sales. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }, [
    page,
    currentBranchId,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    reloadKey,
  ]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  /*
   * RESET PAGINATION WHEN FILTERS CHANGE
   *
   * Original implementation preserved.
   */
  useEffect(() => {
    setPage(1);
  }, [
    currentBranchId,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  /*
   * FILTER SALES
   *
   * Original implementation preserved.
   */
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        !search.trim() ||
        getSearchableText(sale).includes(normalize(search));

      const matchesStatus =
        statusFilter === "ALL" ||
        normalize(getStatus(sale)) === normalize(statusFilter);

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        normalize(getPaymentStatus(sale)) ===
          normalize(paymentStatusFilter);

      const saleDate = getSaleDate(sale);

      const matchesDateFrom =
        !dateFrom || (saleDate !== "" && saleDate >= dateFrom);

      const matchesDateTo =
        !dateTo || (saleDate !== "" && saleDate <= dateTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    sales,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  /*
   * FILTERED SALES SUMMARY
   */
  const filteredSalesSummary = useMemo(
    () =>
      filteredSales.reduce(
        (summary, sale) => {
          summary.totalSales += toNumber(getTotal(sale));
          summary.totalSubtotal += toNumber(sale?.subtotal);
          summary.totalDiscount += toNumber(getDiscount(sale));
          summary.totalPaid += toNumber(sale?.amount_paid);
          summary.transactionCount += 1;

          return summary;
        },
        {
          totalSales: 0,
          totalSubtotal: 0,
          totalDiscount: 0,
          totalPaid: 0,
          transactionCount: 0,
        }
      ),
    [filteredSales]
  );

  /*
   * SALES STATISTICS
   */
  const statistics = useMemo(() => {
    const completedSales = filteredSales.filter(
      (sale) => normalize(getStatus(sale)) === "completed"
    );

    const cancelledSales = filteredSales.filter(
      (sale) => normalize(getStatus(sale)) === "cancelled"
    );

    return {
      totalSales: filteredSalesSummary.transactionCount,
      completedSales: completedSales.length,
      cancelledSales: cancelledSales.length,
      totalAmount: filteredSalesSummary.totalSales,
    };
  }, [filteredSales, filteredSalesSummary]);

  // Pagination calculations.
  const totalPages = Math.max(
    1,
    Math.ceil(pagination.count / PAGE_SIZE)
  );

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  /*
   * REFRESH SALES
   */
  const handleRefresh = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  /*
   * CLEAR ALL FILTERS
   */
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  /*
   * PAGINATION
   */
  const handlePageChange = useCallback(
    (nextPage) => {
      const requestedPage = Number(nextPage);

      if (!Number.isFinite(requestedPage)) return;

      setPage(
        Math.min(Math.max(1, requestedPage), totalPages)
      );
    },
    [totalPages]
  );

  /*
   * EXPORT PDF
   *
   * Independent of loadSales().
   * Does not modify filters, sales state or pagination.
   */
  const handleExportPdf = useCallback(async () => {
    if (typeof salesApi.exportPdf !== "function") {
      setError(
        "PDF export method is missing in SalesApi.js."
      );
      return;
    }

    setExporting(true);
    setError("");

    try {
      const params = {};

      // Branch filter.
      if (
        currentBranchId !== undefined &&
        currentBranchId !== null &&
        currentBranchId !== ""
      ) {
        params.branch = currentBranchId;
      }

      // Search filter.
      if (search.trim()) {
        params.search = search.trim();
      }

      // Sale status filter.
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      // Payment status filter.
      if (paymentStatusFilter !== "ALL") {
        params.payment_status = paymentStatusFilter;
      }

      // Date filters.
      if (dateFrom) {
        params.date_from = dateFrom;
      }

      if (dateTo) {
        params.date_to = dateTo;
      }

      // Request PDF from Django.
      const response = await salesApi.exportPdf(params);

      if (!response?.data) {
        throw new Error("The PDF response is empty.");
      }

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        `sales-report-${dateFrom || "all"}-to-${dateTo || "all"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release browser memory after download starts.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error("Failed to export sales PDF:", err);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to export sales report. Please try again."
      );

    } finally {
      setExporting(false);
    }
  }, [
    currentBranchId,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  /*
   * OPEN SALE DETAILS
   */
  const handleView = useCallback(async (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);

    const saleId = getSaleId(sale);

    if (!saleId || !salesApi.getById) return;

    try {
      const response = await salesApi.getById(saleId);
      const payload = response?.data ?? response;

      setSelectedSale(payload);

    } catch (err) {
      console.error("Failed to load sale details:", err);

      // Keep row data available if detail loading fails.
    }
  }, []);

  /*
   * OPEN DELETE CONFIRMATION MODAL
   */
  const openDeleteModal = useCallback((sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  }, []);

  /*
   * DELETE SALE
   */
  const handleDelete = useCallback(async () => {
    const saleId = getSaleId(saleToDelete);

    if (!saleId) {
      setError(
        "Cannot delete this sale: sale ID is missing."
      );
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await salesApi.delete(saleId);

      setShowDeleteModal(false);
      setSaleToDelete(null);

      setReloadKey((value) => value + 1);

    } catch (err) {
      console.error("Failed to delete sale:", err);

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete sale. Please try again."
      );

    } finally {
      setDeleting(false);
    }
  }, [saleToDelete]);

  /*
   * RENDER
   */
  return (
    <div className="container-fluid py-3">

      {/* Sales Header */}
      <SalesHeader
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Error Message */}
      {error && (
        <SalesError
          error={error}
          onDismiss={() => setError("")}
        />
      )}

      {/* Sales Statistics */}
      <SalesStats statistics={statistics} />

      {/* Sales Filters */}
      <SalesFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onClear={handleClearFilters}
      />

      {/* Filtered Sales Summary */}
      <Card className="shadow-sm mb-3">
        <Card.Body>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

            <div>
              <h5 className="mb-1">
                Filtered Sales Summary
              </h5>

              <small className="text-muted">
                {pagination.count} matching records reported by the API.
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">

              {loading && (
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-label="Loading sales"
                />
              )}

              {/* Export PDF */}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleExportPdf}
                disabled={exporting || loading}
              >
                {exporting ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Export PDF
                  </>
                )}
              </Button>

            </div>
          </div>

          {/* Summary Cards */}
          <Row className="g-3">

            <Col xs={6} md={3}>
              <div className="border rounded p-3 h-100">
                <div className="small text-muted">
                  Loaded Transactions
                </div>

                <h4 className="mb-0">
                  {filteredSalesSummary.transactionCount}
                </h4>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="border rounded p-3 h-100">
                <div className="small text-muted">
                  Total Sales
                </div>

                <h5 className="mb-0 text-success">
                  {formatCurrency(
                    filteredSalesSummary.totalSales
                  )}
                </h5>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="border rounded p-3 h-100">
                <div className="small text-muted">
                  Total Discount
                </div>

                <h5 className="mb-0">
                  {formatCurrency(
                    filteredSalesSummary.totalDiscount
                  )}
                </h5>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="border rounded p-3 h-100">
                <div className="small text-muted">
                  Amount Paid
                </div>

                <h5 className="mb-0 text-primary">
                  {formatCurrency(
                    filteredSalesSummary.totalPaid
                  )}
                </h5>
              </div>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* Sales Table */}
      <SalesTable
        loading={loading}
        filteredSales={filteredSales}
        pagination={pagination}
        page={page}
        totalPages={totalPages}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        setPage={handlePageChange}
        handleView={handleView}
        openDeleteModal={openDeleteModal}
      />

      {/* Sale Details Modal */}
      <SaleViewModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedSale={selectedSale}
      />

      {/* Delete Sale Modal */}
      <SaleDeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deleting={deleting}
        saleToDelete={saleToDelete}
        setSaleToDelete={setSaleToDelete}
        handleDelete={handleDelete}
      />

    </div>
  );
};

export default Sales;
