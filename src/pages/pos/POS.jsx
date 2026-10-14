
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";

import { useInventory } from "../../context/InventoryContext";
import { useBranch } from "../../context/BranchContext";
import salesApi from "../../services/SalesApi";

import usePOS from "./hooks/usePOS";
import usePOSPaymentMethods from "./hooks/usePOSPaymentMethods";

import POSHeader from "./components/POSHeader";
import ProductSearch from "./components/ProductSearch";
import ProductGrid from "./components/ProductGrid";
import CartTable from "./components/CartTable";
import CartSummary from "./components/CartSummary";
import CustomerForm from "./components/CustomerForm";
import PaymentModal from "./components/PaymentModal";
import SaleSuccessModal from "./components/SaleSuccessModal";

import {
  getProductId,
  getPaymentMethodLabel,
} from "./utils/posHelpers";

const POS = () => {
  const {
    products = [],
    loadInventory,
  } = useInventory();

  const branchContext = useBranch();

  const branch =
    branchContext?.currentBranch ??
    branchContext?.selectedBranch ??
    branchContext?.activeBranch ??
    branchContext?.branch ??
    null;

  const branchId =
    branch?.id ??
    branch?.branch_id ??
    branch?.branchId ??
    null;

  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
    loadPaymentMethods,
  } = usePOSPaymentMethods();

  const pos = usePOS();

  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [pageError, setPageError] = useState("");

  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (method) =>
          Number(method.id) === Number(pos.paymentMethod)
      ) ?? null,
    [paymentMethods, pos.paymentMethod]
  );

  const filteredProducts = useMemo(() => {
    const keyword = pos.search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const name = String(
        product?.name ?? product?.product_name ?? ""
      ).toLowerCase();

      const sku = String(
        product?.sku ?? product?.product_sku ?? ""
      ).toLowerCase();

      const barcode = String(
        product?.barcode ?? ""
      ).toLowerCase();

      return (
        name.includes(keyword) ||
        sku.includes(keyword) ||
        barcode.includes(keyword)
      );
    });
  }, [products, pos.search]);

  const refreshInventory = useCallback(async () => {
    if (!loadInventory) return;

    setInventoryLoading(true);
    setPageError("");

    try {
      // If your InventoryContext accepts a branch ID,
      // it can filter inventory for this branch.
      await loadInventory(branchId);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setPageError(
        "Failed to load products. Please refresh the page."
      );
    } finally {
      setInventoryLoading(false);
    }
  }, [loadInventory, branchId]);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const handleCheckout = () => {
    setPageError("");
    pos.setError("");

    if (!branchId) {
      setPageError(
        "Please select an active branch before making a sale."
      );
      return;
    }

    const validationError = pos.validateCheckout();

    if (validationError) {
      pos.setError(validationError);
      return;
    }

    pos.setAmountPaid(pos.grandTotal.toFixed(2));
    setShowPaymentModal(true);
  };

  const handleCompleteSale = async (event) => {
    event.preventDefault();

    pos.setError("");
    setPageError("");

    if (!branchId) {
      pos.setError("No active branch is selected.");
      return;
    }

    if (!pos.cart.length) {
      pos.setError("Your cart is empty.");
      return;
    }

    if (!pos.paymentMethod) {
      pos.setError("Please select a payment method.");
      return;
    }

    const paid = Number(pos.amountPaid);

    if (!Number.isFinite(paid) || paid < 0) {
      pos.setError("Enter a valid payment amount.");
      return;
    }

    if (paid > pos.grandTotal) {
      pos.setError(
        "Amount paid cannot exceed the sale total. Record change separately if your API supports it."
      );
      return;
    }

    if (
      selectedPaymentMethod &&
      !pos.paymentMethod
    ) {
      pos.setError("Please select a payment method.");
      return;
    }

    setLoading(true);

    try {
      
const payload = {
  branch_id: Number(branchId),

  customer: pos.customerId || null,
  customer_name:
    pos.customerName.trim() || "Walk-in Customer",
  customer_phone: pos.customerPhone.trim() || "",

  items: pos.cart.map((item) => ({
    branch_id: Number(branchId),
    product: Number(item.productId),
    quantity: Number(item.quantity),
    unit_price: Number(item.price),
  })),

  subtotal: Number(pos.subtotal.toFixed(2)),
  discount: Number(pos.discountAmount.toFixed(2)),
  tax_rate: pos.vatEnabled ? 18 : 0,
  tax_amount: Number(pos.vatAmount.toFixed(2)),
  total: Number(pos.grandTotal.toFixed(2)),
  amount_paid: Number(
    Number(pos.amountPaid).toFixed(2)
  ),

  payment_method: Number(pos.paymentMethod),
  payment_phone: pos.paymentPhone.trim() || "",
  transaction_reference:
    pos.transactionReference.trim() || "",
};


      // Adjust this method name if SalesApi uses a different
      // create-sale function in your existing project.
      const response = await salesApi.create(payload);

      const sale =
        response?.data?.sale ??
        response?.data ??
        response?.sale ??
        response;

      setShowPaymentModal(false);
      setCompletedSale(sale);

      pos.clearCart();

      await refreshInventory();
    } catch (error) {
      console.error("Failed to complete sale:", error);

      const data = error?.response?.data;

      const message =
        data?.detail ??
        data?.message ??
        (typeof data === "object"
          ? Object.entries(data)
              .map(([key, value]) =>
                `${key}: ${
                  Array.isArray(value)
                    ? value.join(", ")
                    : String(value)
                }`
              )
              .join(" | ")
          : null) ??
        "Failed to complete sale. Please try again.";

      pos.setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    if (!pos.cart.length) return;

    if (window.confirm("Clear all items from the cart?")) {
      pos.clearCart();
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setShowPaymentModal(false);
    pos.clearCart();
  };

  
const toTitleCase = (value) => {
  if (!value) return "";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


  return (
    <div className="container-fluid py-3">
      <POSHeader
        branch={branch}
        inventoryLoading={inventoryLoading}
      />

      {(pageError || pos.error) && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => {
            setPageError("");
            pos.setError("");
          }}
        >
          {pageError || pos.error}
        </Alert>
      )}

      {pos.success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => pos.setSuccess("")}
        >
          {pos.success}
        </Alert>
      )}

      {!branchId && (
        <Alert variant="warning">
          Select a branch to enable checkout.
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={7} xl={8}>
          <ProductSearch
            search={pos.search}
            setSearch={pos.setSearch}
          />

          
        <ProductGrid
          products={filteredProducts.map((product) => ({
            ...product,
            name: toTitleCase(
              product?.name ?? product?.product_name ?? ""
            ),
          }))}
          loading={inventoryLoading}
          onAddToCart={pos.addToCart}
        />

        </Col>

        <Col lg={5} xl={4}>
          <CustomerForm
            customerName={pos.customerName}
            setCustomerName={pos.setCustomerName}
            customerPhone={pos.customerPhone}
            setCustomerPhone={pos.setCustomerPhone}
          />

          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>
                <i className="bi bi-cart3 me-2" />
                Shopping Cart
              </strong>

              <span className="badge bg-primary">
                {pos.cart.reduce(
                  (count, item) => count + item.quantity,
                  0
                )}{" "}
                items
              </span>
            </div>

            <div className="card-body p-2">
              <CartTable
                cart={pos.cart}
                onUpdateQuantity={pos.updateQuantity}
                onRemove={pos.removeFromCart}
              />
            </div>
          </div>

          <CartSummary
            subtotal={pos.subtotal}
            discount={pos.discount}
            setDiscount={pos.setDiscount}
            discountAmount={pos.discountAmount}
            vatEnabled={pos.vatEnabled}
            setVatEnabled={pos.setVatEnabled}
            vatAmount={pos.vatAmount}
            grandTotal={pos.grandTotal}
            paidAmount={pos.paidAmount}
            remaining={pos.remaining}
            cartCount={pos.cart.reduce(
              (count, item) => count + item.quantity,
              0
            )}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
            loading={loading}
          />
        </Col>
      </Row>

      <PaymentModal
        show={showPaymentModal}
        onHide={() => {
          if (!loading) setShowPaymentModal(false);
        }}
        paymentMethods={paymentMethods}
        paymentMethodsLoading={paymentMethodsLoading}
        paymentMethodsError={paymentMethodsError}
        paymentMethod={pos.paymentMethod}
        setPaymentMethod={pos.setPaymentMethod}
        selectedPaymentMethod={selectedPaymentMethod}
        amountPaid={pos.amountPaid}
        setAmountPaid={pos.setAmountPaid}
        paymentPhone={pos.paymentPhone}
        setPaymentPhone={pos.setPaymentPhone}
        transactionReference={pos.transactionReference}
        setTransactionReference={pos.setTransactionReference}
        customerName={pos.customerName}
        customerPhone={pos.customerPhone}
        subtotal={pos.subtotal}
        discountAmount={pos.discountAmount}
        vatAmount={pos.vatAmount}
        grandTotal={pos.grandTotal}
        change={pos.change}
        remaining={pos.remaining}
        error={pos.error}
        loading={loading}
        onSubmit={handleCompleteSale}
      />

      <SaleSuccessModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
        onNewSale={handleNewSale}
      />
    </div>
  );
};

export default POS;
