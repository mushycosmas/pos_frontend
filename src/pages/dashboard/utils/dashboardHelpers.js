
export const extractResults = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

export const formatCurrency = (value) =>
  `TSh ${Number(value || 0).toLocaleString("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const isCompletedSale = (sale) => {
  const status = String(sale?.status || "").trim().toUpperCase();
  return !status || status === "COMPLETED" || status === "PAID";
};

export const isToday = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const getProductStock = (product) =>
  Number(
    product?.current_stock ??
      product?.stock ??
      product?.quantity ??
      0
  );

export const getMinimumStock = (product) =>
  Number(
    product?.minimum_stock ??
      product?.reorder_level ??
      0
  );

export const getSaleUserId = (sale) =>
  sale?.created_by_id ??
  sale?.created_by?.id ??
  sale?.cashier_id ??
  sale?.cashier?.id ??
  sale?.user_id ??
  sale?.user?.id ??
  null;

export const getSaleUserName = (sale) =>
  sale?.created_by_name ||
  sale?.cashier_name ||
  sale?.user_name ||
  sale?.created_by?.full_name ||
  sale?.created_by?.username ||
  sale?.cashier?.full_name ||
  sale?.cashier?.username ||
  sale?.user?.full_name ||
  sale?.user?.username ||
  "Unknown Cashier";

export const getSaleDateKey = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
