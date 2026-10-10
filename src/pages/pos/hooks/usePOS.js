
import { useCallback, useMemo, useState } from "react";

import {
  calculateSaleTotals,
  getProductId,
  getProductName,
  getProductSku,
  getSellingPrice,
  getStock,
} from "../utils/posHelpers";

const usePOS = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [transactionReference, setTransactionReference] =
    useState("");

  const [discount, setDiscount] = useState(0);
  const [vatEnabled, setVatEnabled] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentTouched, setPaymentTouched] = useState(false);

  const totals = useMemo(
    () => calculateSaleTotals({
      cart,
      discount,
      vatEnabled,
    }),
    [cart, discount, vatEnabled]
  );

  const paidAmount = Number(amountPaid) || 0;

  const change = Math.max(
    0,
    paidAmount - totals.grandTotal
  );

  const remaining = Math.max(
    0,
    totals.grandTotal - paidAmount
  );

  const addToCart = useCallback((product) => {
    setError("");
    setSuccess("");

    const productId = getProductId(product);
    const stock = getStock(product);
    const price = getSellingPrice(product);
    const name = getProductName(product);

    if (!productId) {
      setError("Invalid product ID.");
      return;
    }

    if (stock <= 0) {
      setError(`${name} is out of stock.`);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError(`${name} has an invalid selling price.`);
      return;
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.productId === productId
      );

      if (existing) {
        if (existing.quantity >= existing.stock) {
          setError(
            `Only ${existing.stock} unit(s) of ${name} are available.`
          );
          return previous;
        }

        return previous.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previous,
        {
          productId,
          name,
          sku: getProductSku(product),
          price,
          quantity: 1,
          stock,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isInteger(nextQuantity)) return;

    if (nextQuantity <= 0) {
      setCart((previous) =>
        previous.filter(
          (item) => item.productId !== Number(productId)
        )
      );
      return;
    }

    setCart((previous) =>
      previous.map((item) => {
        if (item.productId !== Number(productId)) {
          return item;
        }

        if (nextQuantity > item.stock) {
          setError(
            `Only ${item.stock} unit(s) of ${item.name} are available.`
          );
          return item;
        }

        setError("");

        return { ...item, quantity: nextQuantity };
      })
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((previous) =>
      previous.filter(
        (item) => item.productId !== Number(productId)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setVatEnabled(false);

    setAmountPaid("");
    setCustomerId(null);
    setCustomerName("");
    setCustomerPhone("");

    setPaymentMethod("");
    setPaymentPhone("");
    setTransactionReference("");

    setPaymentTouched(false);
    setError("");
    setSuccess("");
  }, []);

  const validateCheckout = useCallback(() => {
    if (cart.length === 0) {
      return "Please add at least one product to the cart.";
    }

    if (totals.grandTotal <= 0) {
      return "Sale total must be greater than zero.";
    }

    return "";
  }, [cart, totals.grandTotal]);

  return {
    search,
    setSearch,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    customerId,
    setCustomerId,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,

    paymentMethod,
    setPaymentMethod,
    amountPaid,
    setAmountPaid,
    paymentPhone,
    setPaymentPhone,
    transactionReference,
    setTransactionReference,

    discount,
    setDiscount,
    vatEnabled,
    setVatEnabled,

    ...totals,
    paidAmount,
    change,
    remaining,

    error,
    setError,
    success,
    setSuccess,
    paymentTouched,
    setPaymentTouched,

    validateCheckout,
  };
};

export default usePOS;
