import React, { useCallback, useEffect, useMemo, useState } from "react";
import salesApi from "../../services/SalesApi";
import { useBranch } from "../../context/BranchContext";
import {
  getSaleId, getInvoiceNumber, getCustomerName, getBranchName, getSoldBy,
  getStatus, getTotal, getDiscount,getPaymentMethod
} from "./utils/salesHelpers";
import SalesHeader from "./components/SalesHeader";
import SalesError from "./components/SalesError";
import SalesStats from "./components/SalesStats";
import SalesFilters from "./components/SalesFilters";
import SalesTable from "./components/SalesTable";
import SaleViewModal from "./components/SaleViewModal";
import SaleDeleteModal from "./components/SaleDeleteModal";

const Sales = () => {
  const { currentBranch } = useBranch();
  const currentBranchId = currentBranch?.id ?? currentBranch?.branch_id ?? null;

  const [sales, setSales] = useState([]);

  const [loading, setLoading] =

    useState(false);

  const [deleting, setDeleting] =

    useState(false);

  const [error, setError] =

    useState("");

  const [search, setSearch] =

    useState("");

  const [

    statusFilter,

    setStatusFilter,

  ] = useState("ALL");

  const [

    paymentStatusFilter,

    setPaymentStatusFilter,

  ] = useState("ALL");

  const [dateFrom, setDateFrom] =

    useState("");

  const [dateTo, setDateTo] =

    useState("");

  const [

    selectedSale,

    setSelectedSale,

  ] = useState(null);

  const [

    showViewModal,

    setShowViewModal,

  ] = useState(false);

  const [

    showDeleteModal,

    setShowDeleteModal,

  ] = useState(false);

  const [

    saleToDelete,

    setSaleToDelete,

  ] = useState(null);

  const [page, setPage] =

    useState(1);

  const [pageSize] =

    useState(20);

  const [

    pagination,

    setPagination,

  ] = useState({

    count: 0,

    next: null,

    previous: null,

  });

  // =======================================================

  // LOAD SALES

  // =======================================================

  const loadSales = useCallback(

    async () => {
      if (currentBranchId === null || currentBranchId === undefined || currentBranchId === "") {
        setSales([]);
        setPagination({ count: 0, next: null, previous: null });
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

        if (

          paymentStatusFilter !==

          "ALL"

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

        // =============================================

        // DRF PAGINATION

        // =============================================

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

        // =============================================

        // ARRAY RESPONSE

        // =============================================

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

        // =============================================

        // RESPONSE.DATA

        // =============================================

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

        setPagination({

          count: 0,

          next: null,

          previous: null,

        });

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

      currentBranchId,

    ]

  );

  // =======================================================

  // LOAD

  // =======================================================

  useEffect(() => {

    loadSales();

  }, [loadSales]);

  // =======================================================

  // RESET PAGE

  // =======================================================

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

  // =======================================================

  // FILTER SALES

  // =======================================================

  const filteredSales =

    useMemo(() => {

      const keyword =

        search

          .trim()

          .toLowerCase();

      if (!keyword) {

        return sales;

      }

      return sales.filter(

        (sale) => {

          const invoice =

            String(

              getInvoiceNumber(

                sale

              )

            ).toLowerCase();

          const customer =

            String(

              getCustomerName(

                sale

              )

            ).toLowerCase();

          const branch =

            String(

              getBranchName(

                sale

              )

            ).toLowerCase();

          const soldBy =

            String(

              getSoldBy(

                sale

              )

            ).toLowerCase();

          const paymentMethod =

            String(

              getPaymentMethod(

                sale

              )

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

            soldBy.includes(

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

  const statistics =

    useMemo(() => {

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

      const totalDiscount =

        sales.reduce(

          (sum, sale) =>

            sum +

            getDiscount(sale),

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

  // =======================================================

  // VIEW SALE

  // =======================================================

  const handleView = async (

    sale

  ) => {

    const id =

      getSaleId(sale);

    if (!id) {

      setSelectedSale(sale);

      setShowViewModal(true);

      return;

    }

    try {

      setLoading(true);

      const response =

        await salesApi.getById(

          id

        );

      setSelectedSale(

        response?.data ||

          response

      );

      setShowViewModal(true);

    } catch (err) {

      console.error(

        "Failed to load sale:",

        err

      );

      setSelectedSale(sale);

      setShowViewModal(true);

    } finally {

      setLoading(false);

    }

  };

  // =======================================================

  // DELETE

  // =======================================================

  const openDeleteModal = (

    sale

  ) => {

    setSaleToDelete(sale);

    setShowDeleteModal(true);

  };

  const handleDelete =

    async () => {

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

        setSaleToDelete(null);

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

    setStatusFilter("ALL");

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

    page < totalPages &&

    Boolean(

      pagination.next

    );

  // =======================================================

  return (
    <div>
      <SalesHeader loading={loading} onRefresh={loadSales} />
      <SalesError error={error} onDismiss={() => setError("")} />
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
