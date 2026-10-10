
/* =========================================================
   FORMATTING HELPERS
========================================================= */

export const formatCurrency = (value) => {
  const number = Number(value ?? 0);

  return `TSh ${number.toLocaleString("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (value) => {
  if (!value) return "-";

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

export const formatDateTime = (value) => {
  if (!value) return "-";

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

/* =========================================================
   SALE IDENTIFICATION HELPERS
========================================================= */

export const getSaleId = (sale) => {
  return (
    sale?.id ??
    sale?.sale_id ??
    sale?.saleId ??
    null
  );
};

export const getInvoiceNumber = (sale) => {
  return (
    sale?.invoice_number ??
    sale?.invoiceNumber ??
    sale?.reference ??
    sale?.receipt_number ??
    sale?.receiptNumber ??
    `SALE-${getSaleId(sale) ?? "-"}`
  );
};

/* =========================================================
   CUSTOMER HELPERS
========================================================= */

export const getCustomerName = (sale) => {
  return (
    sale?.customer_display_name ??
    sale?.customer_name ??
    sale?.customerName ??
    sale?.customer?.name ??
    sale?.customer?.full_name ??
    "Walk-in Customer"
  );
};

export const getCustomerPhone = (sale) => {
  return (
    sale?.customer_display_phone ??
    sale?.customer_phone ??
    sale?.customerPhone ??
    sale?.customer?.phone ??
    null
  );
};

/* =========================================================
   BRANCH AND SELLER HELPERS
========================================================= */

export const getBranchName = (sale) => {
  return (
    sale?.branch_name ??
    sale?.branchName ??
    sale?.branch?.name ??
    "-"
  );
};

export const getSoldBy = (sale) => {
  return (
    sale?.created_by_name ??
    sale?.createdByName ??
    sale?.created_by?.name ??
    sale?.created_by?.full_name ??
    sale?.created_by?.username ??
    sale?.createdBy?.name ??
    sale?.createdBy?.full_name ??
    sale?.createdBy?.username ??
    sale?.seller?.name ??
    sale?.seller?.full_name ??
    sale?.seller?.username ??
    "-"
  );
};

/* =========================================================
   SALE STATUS HELPERS
========================================================= */

export const getStatus = (sale) => {
  return (
    sale?.status ??
    sale?.sale_status ??
    sale?.saleStatus ??
    "COMPLETED"
  );
};

export const getPaymentStatus = (sale) => {
  const explicitStatus =
    sale?.payment_status ??
    sale?.paymentStatus;

  if (explicitStatus) {
    return String(explicitStatus).toUpperCase();
  }

  const total = getTotal(sale);
  const amountPaid = getAmountPaid(sale);

  if (total > 0 && amountPaid >= total) {
    return "PAID";
  }

  if (amountPaid > 0 && amountPaid < total) {
    return "PARTIAL";
  }

  if (total > 0 && amountPaid <= 0) {
    return "UNPAID";
  }

  return "-";
};

/* =========================================================
   PAYMENT HELPERS
========================================================= */

export const getPaymentMethod = (sale) => {
  return (
    sale?.payment_method_name ??
    sale?.paymentMethodName ??
    sale?.payment_method?.name ??
    sale?.paymentMethod?.name ??
    sale?.payment?.method_name ??
    sale?.payment?.method ??
    sale?.payment_method_code ??
    "-"
  );
};

export const getPaymentPhone = (sale) => {
  return (
    sale?.payment_phone ??
    sale?.paymentPhone ??
    null
  );
};

export const getTransactionReference = (sale) => {
  return (
    sale?.transaction_reference ??
    sale?.transactionReference ??
    null
  );
};

/* =========================================================
   FINANCIAL HELPERS
========================================================= */

export const getTotal = (sale) => {
  return Number(
    sale?.total ??
    sale?.grand_total ??
    sale?.grandTotal ??
    sale?.total_amount ??
    sale?.totalAmount ??
    0
  );
};

export const getSubtotal = (sale) => {
  return Number(
    sale?.subtotal ??
    sale?.sub_total ??
    0
  );
};

export const getDiscount = (sale) => {
  return Number(
    sale?.discount ??
    sale?.discount_amount ??
    sale?.discountAmount ??
    0
  );
};

export const getTaxAmount = (sale) => {
  return Number(
    sale?.tax_amount ??
    sale?.taxAmount ??
    sale?.tax ??
    0
  );
};

export const getTaxRate = (sale) => {
  return Number(
    sale?.tax_rate ??
    sale?.taxRate ??
    0
  );
};

export const getAmountPaid = (sale) => {
  return Number(
    sale?.amount_paid ??
    sale?.amountPaid ??
    0
  );
};

export const getBalance = (sale) => {
  return Math.max(
    0,
    getTotal(sale) - getAmountPaid(sale)
  );
};

export const getChange = (sale) => {
  return Number(sale?.change ?? 0);
};

/* =========================================================
   SALE ITEMS HELPERS
========================================================= */

export const getItemsCount = (sale) => {
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
    sale?.item_count ??
    sale?.items_count ??
    sale?.itemsCount ??
    sale?.total_items ??
    0
  );
};

/* =========================================================
   SALE DATE HELPERS
========================================================= */

export const getCreatedDate = (sale) => {
  return (
    sale?.created_at ??
    sale?.createdAt ??
    sale?.date ??
    sale?.sale_date ??
    sale?.saleDate ??
    null
  );
};

/* =========================================================
   VAT HELPER
========================================================= */

export const isVatEnabled = (sale) => {
  return (
    getTaxRate(sale) > 0 ||
    getTaxAmount(sale) > 0
  );
};

/* =========================================================
   STATUS BADGE HELPER
========================================================= */

export const getStatusBadgeVariant = (status) => {
  const normalizedStatus = String(
    status ?? ""
  ).toUpperCase();

  const variants = {
    COMPLETED: "success",
    PAID: "success",
    ACTIVE: "success",
    PARTIAL: "warning",
    PENDING: "warning",
    PROCESSING: "info",
    UNPAID: "danger",
    CANCELLED: "danger",
    CANCELED: "danger",
    FAILED: "danger",
    REFUNDED: "secondary",
    DRAFT: "secondary",
  };

  return variants[normalizedStatus] ?? "secondary";
};

