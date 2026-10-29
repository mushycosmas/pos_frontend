import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
} from "./utils/salesHelpers";

import SalesHeader from "./components/SalesHeader";
import SalesError from "./components/SalesError";
import SalesStats from "./components/SalesStats";
import SalesFilters from "./components/SalesFilters";
import SalesTable from "./components/SalesTable";
import SaleViewModal from "./components/SaleViewModal";
import SaleDeleteModal from "./components/SaleDeleteModal";

// ======================================================
// HELPERS
// ======================================================

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const getSaleDate = (sale) => {
  const value =
    sale?.created_at ??
    sale?.created_date ??
    sale?.date ??
    "";

  return value ? String(value).slice(0, 10) : "";
};

const getSaleProductNames = (sale) => {
  const items =
    sale?.items ??
    sale?.sale_items ??
    sale?.saleItems ??
    sale?.details ??
    [];

  if (!Array.isArray(items)) return "";

  return items
    .map((item) => {
      const product =
        item?.product_detail ??
        item?.product_details ??
        item?.product ??
        item?.product_info;

      if (typeof product === "string") {
        return product;
      }

      return (
        product?.name ??
        product?.product_name ??
        item?.product_name ??
        item?.name ??
        ""
      );
    })
    .filter(Boolean)
    .join(" ");
};

const getSalePaymentStatus = (sale) => {
  // Prefer an explicit payment status when the API provides one.
  const explicitStatus =
    sale?.payment_status ??
    sale?.payment_status_display ??
    null;

  if (explicitStatus) {
    const status = String(explicitStatus)
      .trim()
      .toUpperCase();

    if (
      ["PAID", "PARTIAL", "PENDING", "UNPAID"].includes(
        status
      )
    ) {
      return status;
    }
  }

  // Otherwise derive payment status from amounts.
  const total = Number(sale?.total ?? 0);
  const paid = Number(sale?.amount_paid ?? 0);

  if (paid <= 0) return "UNPAID";
  if (total > 0 && paid >= total) return "PAID";
  if (paid > 0 && paid < total) return "PARTIAL";

  return "PENDING";
};

// ======================================================
// SALES PAGE
// ======================================================

const Sales = () => {
  const { currentBranch } = useBranch();

  const currentBranchId =
    currentBranch?.id ??
    currentBranch?.branch_id ??
    null;

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals
  const [selectedSale, setSelectedSale] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  // ======================================================
  // LOAD SALES
  // ======================================================

  const loadSales = useCallback(async () => {
    if (
      currentBranchId === null ||
      currentBranchId === undefined ||
      currentBranchId === ""
    ) {
      setSales([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
      });
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: pageSize,
        branch: currentBranchId,
      };

      // Send filters to the API as well.
      // The backend must support these query parameters.
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

      // Support Axios responses and services that already
      // return response.data directly.
      const payload = response?.data ?? response;

      // Django REST Framework paginated response.
      if (
        payload &&
        !Array.isArray(payload) &&
        Array.isArray(payload.results)
      ) {
        setSales(payload.results);

        setPagination({
          count: Number(payload.count ?? 0),
          next: payload.next ?? null,
          previous: payload.previous ?? null,
        });

        return;
      }

      // Plain array response.
      if (Array.isArray(payload)) {
        setSales(payload);

        setPagination({
          count: payload.length,
          next: null,
          previous: null,
        });

        return;
      }

      // Some APIs wrap a plain array in data.
      if (Array.isArray(payload?.data)) {
        setSales(payload.data);

        setPagination({
          count: payload.data.length,
          next: null,
          previous: null,
        });

        return;
      }

      setSales([]);

      setPagination({
        count: 0,
        next: null,
        previous: null,
      });
    } catch (err) {
      console.error("Failed to load sales:", err);

      const message =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to load sales.";

      setError(message);
      setSales([]);

      setPagination({
        count: 0,
        next: null,
        previous: null,
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    currentBranchId,
  ]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Reset to page 1 whenever filters or branch change.
  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    currentBranchId,
  ]);

  // ======================================================
  // FILTER SALES
  // ======================================================

  const filteredSales = useMemo(() => {
    const keyword = normalize(search);

    return sales.filter((sale) => {
      // Search across the actual API field names.
      const searchableFields = [
        getInvoiceNumber(sale),
        getCustomerName(sale),
        sale?.customer_display_name,
        sale?.customer_display_phone,
        sale?.customer_name,
        sale?.branch_name,
        getBranchName(sale),
        getSoldBy(sale),
        sale?.created_by_name,
        getPaymentMethod(sale),
        sale?.payment_method_name,
        sale?.payment_method_code,
        getSaleProductNames(sale),
      ];

      const matchesSearch =
        !keyword ||
        searchableFields.some((value) =>
          normalize(value).includes(keyword)
        );

      // Sale status
      const saleStatus = String(
        getStatus(sale) ?? sale?.status ?? ""
      )
        .trim()
        .toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        saleStatus === statusFilter.toUpperCase();

      // Payment status
      const paymentStatus = getSalePaymentStatus(sale);

      const matchesPayment =
        paymentStatusFilter === "ALL" ||
        paymentStatus === paymentStatusFilter.toUpperCase();

      // Date range; both endpoints are inclusive.
      const saleDate = getSaleDate(sale);

      const matchesDateFrom =
        !dateFrom ||
        (saleDate !== "" && saleDate >= dateFrom);

      const matchesDateTo =
        !dateTo ||
        (saleDate !== "" && saleDate <= dateTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
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

  // ======================================================
  // STATISTICS
  // ======================================================

  const statistics = useMemo(() => {
    const totalSales = sales.length;

    const completedSales = sales.filter(
      (sale) =>
        String(getStatus(sale) ?? "")
          .toUpperCase() === "COMPLETED"
    ).length;

    const cancelledSales = sales.filter((sale) =>
      ["CANCELLED", "CANCELED"].includes(
        String(getStatus(sale) ?? "").toUpperCase()
      )
    ).length;

    const totalAmount = sales.reduce(
      (sum, sale) => sum + getTotal(sale),
      0
    );

    const totalDiscount = sales.reduce(
      (sum, sale) => sum + getDiscount(sale),
      0
    );

    return {
      totalSales,
      completedSales,
      cancelledSales,
      totalAmount,
      totalDiscount,
    };
  }, [sales]);

  // ======================================================
  // VIEW SALE
  // ======================================================

  const handleView = async (sale) => {
    const id = getSaleId(sale);

    if (!id) {
      setSelectedSale(sale);
      setShowViewModal(true);
      return;
    }

    try {
      setLoading(true);

      const response = await salesApi.getById(id);
      const payload = response?.data ?? response;

      setSelectedSale(payload);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to load sale:", err);

      setSelectedSale(sale);
      setShowViewModal(true);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE SALE
  // ======================================================

  const openDeleteModal = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    const id = getSaleId(saleToDelete);

    if (!id) {
      setError("Sale ID is missing.");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await salesApi.delete(id);

      setShowDeleteModal(false);
      setSaleToDelete(null);

      await loadSales();
    } catch (err) {
      console.error("Failed to delete sale:", err);

      const message =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to delete sale.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.count / pageSize)
  );

  const canGoPrevious =
    page > 1 && Boolean(pagination.previous);

  const canGoNext =
    page < totalPages && Boolean(pagination.next);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div>
      <SalesHeader
        loading={loading}
        onRefresh={loadSales}
      />

      <SalesError
        error={error}
        onDismiss={() => setError("")}
      />

      <SalesStats statistics={statistics} />

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
        onClear={clearFilters}
      />

      <SalesTable
        loading={loading}
        filteredSales={filteredSales}
        pagination={pagination}
        page={page}
        totalPages={totalPages}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        setPage={setPage}
        handleView={handleView}
        openDeleteModal={openDeleteModal}
      />

      <SaleViewModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedSale={selectedSale}
      />

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