
export const VAT_RATE = 18;

export const formatMoney = (value) =>
  `TSh ${Number(value ?? 0).toLocaleString("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getProductId = (product) =>
  Number(
    product?.productId ??
    product?.product_id ??
    product?.id ??
    0
  );

export const getProductName = (product) =>
  product?.name ??
  product?.product_name ??
  "Unnamed Product";

export const getProductSku = (product) =>
  product?.sku ??
  product?.product_sku ??
  "";

export const getStock = (product) =>
  Number(
    product?.stock ??
    product?.currentStock ??
    product?.quantity ??
    0
  );

export const getSellingPrice = (product) =>
  Number(
    product?.sellingPrice ??
    product?.selling_price ??
    0
  );

export const getPaymentMethodLabel = (method) =>
  method?.name ??
  method?.label ??
  method?.code ??
  "Payment Method";

export const isMobilePaymentMethod = (method) => {
  if (!method) return false;

  const type = String(
    method.payment_type ??
    method.paymentType ??
    ""
  ).toLowerCase();

  const code = String(method.code ?? "")
    .toUpperCase()
    .replace(/_/g, "-");

  return (
    ["mobile_money", "mobile", "mpesa"].includes(type) ||
    [
      "M-PESA",
      "MPESA",
      "TIGO-PESA",
      "AIRTEL-MONEY",
      "HALOPESA",
      "MIXX-BY-YAS",
      "EZY-PESA",
    ].includes(code)
  );
};

export const calculateSaleTotals = ({
  cart = [],
  discount = 0,
  vatEnabled = false,
}) => {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const discountAmount = Math.min(
    Math.max(Number(discount) || 0, 0),
    subtotal
  );

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const vatAmount = vatEnabled
    ? taxableAmount * (VAT_RATE / 100)
    : 0;

  return {
    subtotal,
    discountAmount,
    amountAfterDiscount: taxableAmount,
    vatAmount,
    grandTotal: taxableAmount + vatAmount,
  };
};
