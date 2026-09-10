
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
} from "react-bootstrap";

import { useInventory } from "../context/InventoryContext";
import salesApi from "../services/SalesApi";
import paymentMethodApi from "../services/paymentMethod";

const POS = () => {
  const {
    products = [],
    loadInventory,
  } = useInventory();

  // =========================================================
  // CONSTANTS
  // =========================================================

  const VAT_RATE = 18;

  // =========================================================
  // STATE
  // =========================================================

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  // Customer
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Payment
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [transactionReference, setTransactionReference] = useState("");

  // Discount
  const [discount, setDiscount] = useState(0);

  // VAT
  // OFF by default
  const [vatEnabled, setVatEnabled] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] =
    useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [paymentTouched, setPaymentTouched] = useState(false);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // =========================================================
  // LOAD INVENTORY
  // =========================================================

  useEffect(() => {
    const load = async () => {
      try {
        setInventoryLoading(true);
        setError("");

        if (loadInventory) {
          await loadInventory();
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setError("Failed to load products. Please refresh the page.");
      } finally {
        setInventoryLoading(false);
      }
    };

    load();
  }, [loadInventory]);

  // =========================================================
  // LOAD PAYMENT METHODS
  // =========================================================

  const loadPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodsLoading(true);
      setError("");

      let methods = [];

      try {
        const response = await paymentMethodApi.getActive();

        methods = Array.isArray(response)
          ? response
          : response?.results || [];
      } catch (activeErr) {
        console.log(
          "Active endpoint failed, trying getAll:",
          activeErr
        );

        const response = await paymentMethodApi.getAll({
          is_active: true,
        });

        methods = Array.isArray(response)
          ? response
          : response?.results || response?.data || [];
      }

      if (methods.length === 0) {
        setError(
          "No active payment methods found. Please contact the administrator."
        );
      }

      setPaymentMethods(methods);
      setPaymentMethod("");
    } catch (err) {
      console.error("Failed to load payment methods:", err);

      setPaymentMethods([]);
      setPaymentMethod("");

      let message = "Failed to load payment methods. ";

      if (err?.response?.status === 404) {
        message += "Payment methods endpoint not found.";
      } else if (err?.response?.status === 403) {
        message +=
          "You don't have permission to view payment methods.";
      } else if (err?.response?.status === 500) {
        message += "Server error. Please try again later.";
      } else {
        message += "Please refresh the page.";
      }

      setError(message);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // =========================================================
  // PRODUCT HELPERS
  // =========================================================

  const getProductId = useCallback((product) => {
    return Number(
      product?.productId ??
        product?.product_id ??
        product?.id ??
        0
    );
  }, []);

  const getStock = useCallback((product) => {
    return Number(
      product?.stock ??
        product?.currentStock ??
        product?.quantity ??
        0
    );
  }, []);

  const getSellingPrice = useCallback((product) => {
    return Number(
      product?.sellingPrice ??
        product?.selling_price ??
        0
    );
  }, []);

  const getProductName = useCallback((product) => {
    return (
      product?.name ||
      product?.product_name ||
      "Unnamed Product"
    );
  }, []);

  const getProductSku = useCallback((product) => {
    return product?.sku || product?.product_sku || "";
  }, []);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const sku = String(product?.sku || "").toLowerCase();
      const barcode = String(product?.barcode || "").toLowerCase();

      return (
        name.includes(keyword) ||
        sku.includes(keyword) ||
        barcode.includes(keyword)
      );
    });
  }, [products, search]);

  // =========================================================
  // SELECTED PAYMENT METHOD
  // =========================================================

  const selectedPaymentMethod = useMemo(() => {
    if (!paymentMethod) {
      return null;
    }

    return paymentMethods.find(
      (method) =>
        Number(method?.id) === Number(paymentMethod)
    );
  }, [paymentMethods, paymentMethod]);

  // =========================================================
  // PAYMENT LABEL
  // =========================================================

  const getPaymentMethodLabel = useCallback((method) => {
    return (
      method?.name ||
      method?.label ||
      method?.code ||
      "Payment Method"
    );
  }, []);

  // =========================================================
  // MOBILE PAYMENT
  // =========================================================

  const isMobilePayment = useMemo(() => {
    if (!selectedPaymentMethod) {
      return false;
    }

    const paymentType = String(
      selectedPaymentMethod?.payment_type ||
        selectedPaymentMethod?.paymentType ||
        ""
    ).toLowerCase();

    const code = String(
      selectedPaymentMethod?.code || ""
    ).toUpperCase();

    return (
      paymentType === "mobile_money" ||
      paymentType === "mobile" ||
      paymentType === "mpesa" ||
      [
        "M-PESA",
        "M_PESA",
        "MPESA",
        "TIGO-PESA",
        "TIGO_PESA",
        "AIRTEL-MONEY",
        "AIRTEL_MONEY",
        "HALOPESA",
        "MIXX-BY-YAS",
        "EZY-PESA",
      ].includes(code)
    );
  }, [selectedPaymentMethod]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = (product) => {
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

    if (price < 0) {
      setError(`${name} has an invalid selling price.`);
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => Number(item.productId) === productId
      );

      if (existing) {
        if (existing.quantity >= stock) {
          setError(
            `Only ${stock} unit(s) of ${name} are available.`
          );

          return previousCart;
        }

        return previousCart.map((item) =>
          Number(item.productId) === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
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
  };

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQuantity = (productId, quantity) => {
    const numericQuantity = Number(quantity);

    if (!Number.isInteger(numericQuantity)) {
      return;
    }

    if (numericQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) => {
        if (
          Number(item.productId) !== Number(productId)
        ) {
          return item;
        }

        if (numericQuantity > item.stock) {
          setError(
            `Only ${item.stock} unit(s) of ${item.name} are available.`
          );

          return item;
        }

        setError("");

        return {
          ...item,
          quantity: numericQuantity,
        };
      })
    );
  };

  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  const removeFromCart = (productId) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          Number(item.productId) !== Number(productId)
      )
    );
  };

  // =========================================================
  // CLEAR CART
  // =========================================================

  const clearCart = () => {
    if (cart.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Clear all items from the cart?"
    );

    if (!confirmed) {
      return;
    }

    setCart([]);
    setDiscount(0);

    // Reset VAT
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
  };

  // =========================================================
  // SUBTOTAL
  // =========================================================

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) * Number(item.quantity),
      0
    );
  }, [cart]);

  // =========================================================
  // DISCOUNT
  // =========================================================

  const discountAmount = useMemo(() => {
    const value = Number(discount) || 0;

    return Math.min(
      Math.max(value, 0),
      subtotal
    );
  }, [discount, subtotal]);

  // =========================================================
  // AMOUNT AFTER DISCOUNT
  // =========================================================

  const amountAfterDiscount = Math.max(
    0,
    subtotal - discountAmount
  );

  // =========================================================
  // VAT
  // =========================================================

  const vatAmount = useMemo(() => {
    if (!vatEnabled) {
      return 0;
    }

    return amountAfterDiscount * (VAT_RATE / 100);
  }, [vatEnabled, amountAfterDiscount]);

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  const grandTotal =
    amountAfterDiscount + vatAmount;

  // =========================================================
  // PAYMENT
  // =========================================================

  const paidAmount = Number(amountPaid) || 0;

  const change = Math.max(
    0,
    paidAmount - grandTotal
  );

  const remaining = Math.max(
    0,
    grandTotal - paidAmount
  );

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "en-TZ",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handleCheckout = () => {
    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError(
        "Please add at least one product to the cart."
      );

      return;
    }

    if (grandTotal <= 0) {
      setError(
        "Sale total must be greater than zero."
      );

      return;
    }

    setAmountPaid(
      grandTotal.toFixed(2)
    );

    setShowPaymentModal(true);
  };

  // =========================================================
  // VALIDATE PAYMENT
  // =========================================================

  const validatePayment = () => {
    if (!paymentMethod) {
      setPaymentTouched(true);
      setError(
        "Please select a payment method."
      );

      return false;
    }

    if (!selectedPaymentMethod) {
      setError(
        "Selected payment method is invalid."
      );

      return false;
    }

    if (paidAmount < 0) {
      setError(
        "Amount paid cannot be negative."
      );

      return false;
    }

    if (paidAmount < grandTotal) {
      setError(
        `Insufficient payment. Required TSh ${formatMoney(
          grandTotal
        )}.`
      );

      return false;
    }

    if (
      isMobilePayment &&
      !paymentPhone.trim()
    ) {
      setError(
        "Payment phone number is required for mobile money payments."
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE SALE
  // =========================================================

  const handleCreateSale = async () => {
    setError("");
    setSuccess("");

    if (!validatePayment()) {
      return;
    }

    try {
      setLoading(true);

      const paymentMethodId =
        Number(paymentMethod);

      const methodExists =
        paymentMethods.some(
          (method) =>
            Number(method.id) ===
            paymentMethodId
        );

      if (!methodExists) {
        setError(
          `Payment method with ID ${paymentMethodId} does not exist.`
        );

        setLoading(false);
        return;
      }

      const items = cart.map((item) => ({
        product: Number(item.productId),
        quantity: Number(item.quantity),
        unit_price: Number(
          Number(item.price).toFixed(2)
        ),
        discount: 0,
        tax: 0,
      }));

      const payload = {
        branch_id: 1,

        customer_id:
          customerId || null,

        customer_name:
          customerName.trim() || "",

        customer_phone:
          customerPhone.trim() || "",

        items,

        discount: Number(
          discountAmount.toFixed(2)
        ),

        notes: customerName.trim()
          ? `Customer: ${customerName.trim()}`
          : "Walk-in Customer",

        payment_method:
          paymentMethodId,

        amount_paid: Number(
          paidAmount.toFixed(2)
        ),

        payment_phone:
          paymentPhone.trim() || "",

        transaction_reference:
          transactionReference.trim() || "",
      };

      console.log(
        "========== SALE =========="
      );

      console.log(
        "Subtotal:",
        subtotal
      );

      console.log(
        "Discount:",
        discountAmount
      );

      console.log(
        "VAT Enabled:",
        vatEnabled
      );

      console.log(
        "VAT Amount:",
        vatAmount
      );

      console.log(
        "Grand Total:",
        grandTotal
      );

      console.log(
        "Payload:",
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "=========================="
      );

      const response =
        await salesApi.create(payload);

      console.log(
        "SALE CREATED:",
        response
      );

      const sale =
        response?.data ?? response;

      const receiptSale = {
        ...sale,

        vat_enabled:
          vatEnabled,

        vat_rate:
          vatEnabled
            ? VAT_RATE
            : 0,

        vat_amount:
          vatEnabled
            ? Number(
                vatAmount.toFixed(2)
              )
            : 0,

        tax_amount:
          vatEnabled
            ? Number(
                vatAmount.toFixed(2)
              )
            : 0,

        frontend_subtotal:
          Number(
            subtotal.toFixed(2)
          ),

        frontend_discount:
          Number(
            discountAmount.toFixed(2)
          ),

        frontend_total:
          Number(
            grandTotal.toFixed(2)
          ),
      };

      setCompletedSale(
        receiptSale
      );

      setShowPaymentModal(false);

      setSuccess(
        "Sale completed successfully."
      );

      // Reset
      setCart([]);
      setCustomerId(null);
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
      setPaymentMethod("");
      setPaymentPhone("");
      setTransactionReference("");
      setDiscount(0);

      // VAT OFF for next sale
      setVatEnabled(false);

      setPaymentTouched(false);

      if (loadInventory) {
        await loadInventory();
      }
    } catch (err) {
      console.error(
        "Failed to create sale:",
        err
      );

      const data =
        err?.response?.data;

      let message =
        "Failed to complete sale.";

      if (data) {
        if (typeof data === "string") {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else if (
          data.non_field_errors
        ) {
          message =
            data.non_field_errors.join(
              ", "
            );
        } else {
          const errors = [];

          Object.entries(data).forEach(
            ([key, value]) => {
              if (Array.isArray(value)) {
                errors.push(
                  `${key}: ${value.join(
                    ", "
                  )}`
                );
              } else if (
                typeof value ===
                  "object" &&
                value !== null
              ) {
                errors.push(
                  `${key}: ${JSON.stringify(
                    value
                  )}`
                );
              } else {
                errors.push(
                  `${key}: ${value}`
                );
              }
            }
          );

          if (errors.length) {
            message =
              errors.join("; ");
          }
        }
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE PAYMENT MODAL
  // =========================================================

  const closePaymentModal = () => {
    if (loading) {
      return;
    }

    setShowPaymentModal(false);
    setError("");
    setPaymentTouched(false);
  };

  // =========================================================
  // PRINT
  // =========================================================

  const printReceipt = () => {
    window.print();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pos-page">

      {/* HEADER */}

      <div className="page-header mb-4">

        <div>
          <h2>Point of Sale</h2>

          <p>
            Process customer sales quickly and efficiently.
          </p>
        </div>

        <div className="d-flex gap-2">

          <Button
            variant="outline-danger"
            onClick={clearCart}
            disabled={
              cart.length === 0 ||
              loading
            }
          >
            <i className="bi bi-trash me-2"></i>
            Clear Cart
          </Button>

          <Button
            variant="success"
            onClick={handleCheckout}
            disabled={
              cart.length === 0 ||
              loading
            }
          >
            <i className="bi bi-cart-check me-2"></i>
            Checkout
          </Button>

        </div>

      </div>

      {/* ALERTS */}

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

      <Row className="g-4">

        {/* PRODUCTS */}

        <Col lg={8}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <InputGroup className="mb-3">

                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search products by name, SKU, or barcode..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}

              </InputGroup>

              {inventoryLoading ? (

                <div className="text-center py-5">

                  <Spinner
                    animation="border"
                    variant="primary"
                  />

                  <div className="mt-2 text-muted">
                    Loading products...
                  </div>

                </div>

              ) : (

                <div className="product-grid">

                  {filteredProducts.length === 0 ? (

                    <div className="text-center py-5">

                      <i
                        className="bi bi-box-seam"
                        style={{
                          fontSize: "48px",
                          color: "#ccc",
                        }}
                      ></i>

                      <div className="mt-2 text-muted">

                        {search
                          ? "No products found."
                          : "No products available."}

                      </div>

                    </div>

                  ) : (

                    <Row className="g-2">

                      {filteredProducts.map(
                        (product) => {

                          const productId =
                            getProductId(
                              product
                            );

                          const stock =
                            getStock(
                              product
                            );

                          const price =
                            getSellingPrice(
                              product
                            );

                          const name =
                            getProductName(
                              product
                            );

                          const sku =
                            getProductSku(
                              product
                            );

                          return (

                            <Col
                              key={
                                productId
                              }
                              xs={6}
                              md={4}
                              lg={3}
                            >

                              <Card
                                className={`product-card h-100 ${
                                  stock <= 0
                                    ? "out-of-stock"
                                    : ""
                                }`}
                                onClick={() =>
                                  stock > 0 &&
                                  addToCart(
                                    product
                                  )
                                }
                                style={{
                                  cursor:
                                    stock > 0
                                      ? "pointer"
                                      : "not-allowed",
                                }}
                              >

                                <Card.Body className="text-center">

                                  <div className="product-icon mb-2">

                                    <i
                                      className="bi bi-box"
                                      style={{
                                        fontSize:
                                          "32px",
                                        color:
                                          "#6c757d",
                                      }}
                                    ></i>

                                  </div>

                                  <h6 className="mb-1 text-truncate">
                                    {name}
                                  </h6>

                                  <small className="text-muted d-block mb-2">
                                    {sku}
                                  </small>

                                  <div className="product-price">

                                    <strong>
                                      TSh{" "}
                                      {formatMoney(
                                        price
                                      )}
                                    </strong>

                                  </div>

                                  <Badge
                                    bg={
                                      stock > 0
                                        ? "success"
                                        : "danger"
                                    }
                                    className="mt-2"
                                  >
                                    {stock > 0
                                      ? `${stock} in stock`
                                      : "Out of Stock"}
                                  </Badge>

                                </Card.Body>

                              </Card>

                            </Col>

                          );
                        }
                      )}

                    </Row>

                  )}

                </div>

              )}

            </Card.Body>

          </Card>

        </Col>

        {/* CART */}

        <Col lg={4}>

          <Card className="dashboard-card border-0 h-100">

            <Card.Header className="bg-white border-0 pt-3">

              <h5 className="mb-0">

                <i className="bi bi-cart me-2"></i>

                Cart

                {cart.length > 0 && (

                  <Badge
                    bg="primary"
                    className="ms-2"
                  >
                    {cart.reduce(
                      (total, item) =>
                        total +
                        item.quantity,
                      0
                    )}{" "}
                    items
                  </Badge>

                )}

              </h5>

            </Card.Header>

            <Card.Body className="d-flex flex-column">

              {/* CART ITEMS */}

              <div
                className="cart-items flex-grow-1"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >

                {cart.length === 0 ? (

                  <div className="text-center py-5">

                    <i
                      className="bi bi-cart-plus"
                      style={{
                        fontSize:
                          "48px",
                        color:
                          "#ccc",
                      }}
                    ></i>

                    <div className="mt-2 text-muted">
                      Your cart is empty
                    </div>

                    <small className="text-muted">
                      Click on products to add them
                    </small>

                  </div>

                ) : (

                  cart.map((item) => (

                    <div
                      key={
                        item.productId
                      }
                      className="cart-item mb-2 p-2 border rounded"
                    >

                      <Row className="align-items-center">

                        <Col className="flex-grow-1">

                          <div className="fw-bold">
                            {item.name}
                          </div>

                          <small className="text-muted">
                            {item.sku}
                          </small>

                          <div className="text-success">
                            TSh{" "}
                            {formatMoney(
                              item.price
                            )}
                          </div>

                        </Col>

                        <Col xs="auto">

                          <Form.Control
                            type="number"
                            size="sm"
                            value={
                              item.quantity
                            }
                            onChange={(e) =>
                              updateQuantity(
                                item.productId,
                                e.target.value
                              )
                            }
                            min="1"
                            max={
                              item.stock
                            }
                            style={{
                              width:
                                "60px",
                            }}
                          />

                        </Col>

                        <Col xs="auto">

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              removeFromCart(
                                item.productId
                              )
                            }
                          >
                            <i className="bi bi-x-lg"></i>
                          </Button>

                        </Col>

                      </Row>

                    </div>

                  ))

                )}

              </div>

              {/* =================================================
                  SALE SUMMARY
              ================================================== */}

              {cart.length > 0 && (

                <div className="cart-summary mt-3 pt-3 border-top">

                  {/* SUBTOTAL */}

                  <div className="d-flex justify-content-between mb-2">

                    <span>
                      Subtotal:
                    </span>

                    <strong>
                      TSh{" "}
                      {formatMoney(
                        subtotal
                      )}
                    </strong>

                  </div>

                  {/* DISCOUNT */}

                  <Form.Group className="mb-3">

                    <Form.Label className="fw-semibold">
                      Discount
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        TSh
                      </InputGroup.Text>

                      <Form.Control
                        type="number"
                        placeholder="Enter discount amount"
                        value={
                          discount
                        }
                        onChange={(e) =>
                          setDiscount(
                            Math.min(
                              Math.max(
                                Number(
                                  e.target
                                    .value
                                ) || 0,
                                0
                              ),
                              subtotal
                            )
                          )
                        }
                        min="0"
                        max={
                          subtotal
                        }
                        step="0.01"
                        disabled={
                          loading
                        }
                      />

                    </InputGroup>

                    <Form.Text className="text-muted">
                      Maximum discount:
                      {" "}
                      TSh{" "}
                      {formatMoney(
                        subtotal
                      )}
                    </Form.Text>

                  </Form.Group>

                  {/* DISCOUNT RESULT */}

                  {discountAmount > 0 && (

                    <div className="d-flex justify-content-between mb-2">

                      <span>
                        Discount:
                      </span>

                      <span className="text-danger">
                        -TSh{" "}
                        {formatMoney(
                          discountAmount
                        )}
                      </span>

                    </div>

                  )}

                  {/* AMOUNT AFTER DISCOUNT */}

                  <div className="d-flex justify-content-between mb-3">

                    <span>
                      After Discount:
                    </span>

                    <strong>
                      TSh{" "}
                      {formatMoney(
                        amountAfterDiscount
                      )}
                    </strong>

                  </div>

                  {/* =================================================
                      VAT OPTION
                  ================================================== */}

                  <div className="border rounded p-3 mb-3">

                    <Form.Check
                      type="switch"
                      id="apply-vat"
                      checked={
                        vatEnabled
                      }
                      onChange={(e) =>
                        setVatEnabled(
                          e.target.checked
                        )
                      }
                      disabled={
                        loading
                      }
                      label={
                        <strong>
                          Apply VAT ({VAT_RATE}%)
                        </strong>
                      }
                    />

                    <small className="text-muted d-block mt-1">
                      Turn this on only when VAT
                      should be charged.
                    </small>

                  </div>

                  {/* VAT */}

                  {vatEnabled && (

                    <div className="d-flex justify-content-between mb-2">

                      <span>
                        VAT ({VAT_RATE}%):
                      </span>

                      <span>
                        TSh{" "}
                        {formatMoney(
                          vatAmount
                        )}
                      </span>

                    </div>

                  )}

                  {/* GRAND TOTAL */}

                  <div className="d-flex justify-content-between mt-2 pt-3 border-top">

                    <h5 className="mb-0">
                      Total:
                    </h5>

                    <h5 className="mb-0 text-primary">
                      TSh{" "}
                      {formatMoney(
                        grandTotal
                      )}
                    </h5>

                  </div>

                </div>

              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* =========================================================
          PAYMENT MODAL
      ========================================================== */}

      <Modal
        show={showPaymentModal}
        onHide={
          closePaymentModal
        }
        size="lg"
        backdrop="static"
      >

        <Modal.Header
          closeButton={!loading}
        >

          <Modal.Title>

            <i className="bi bi-credit-card me-2"></i>

            Complete Payment

          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

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

          {/* ORDER SUMMARY */}

          <Card className="mb-3 bg-light">

            <Card.Body>

              <h6 className="mb-3">
                Order Summary
              </h6>

              <div className="d-flex justify-content-between mb-1">

                <span>
                  Items:
                </span>

                <span>
                  {cart.reduce(
                    (total, item) =>
                      total +
                      item.quantity,
                    0
                  )}
                </span>

              </div>

              <div className="d-flex justify-content-between mb-1">

                <span>
                  Subtotal:
                </span>

                <span>
                  TSh{" "}
                  {formatMoney(
                    subtotal
                  )}
                </span>

              </div>

              {discountAmount > 0 && (

                <div className="d-flex justify-content-between mb-1 text-danger">

                  <span>
                    Discount:
                  </span>

                  <span>
                    -TSh{" "}
                    {formatMoney(
                      discountAmount
                    )}
                  </span>

                </div>

              )}

              <div className="d-flex justify-content-between mb-1">

                <span>
                  After Discount:
                </span>

                <span>
                  TSh{" "}
                  {formatMoney(
                    amountAfterDiscount
                  )}
                </span>

              </div>

              {vatEnabled && (

                <div className="d-flex justify-content-between mb-1">

                  <span>
                    VAT ({VAT_RATE}%):
                  </span>

                  <span>
                    TSh{" "}
                    {formatMoney(
                      vatAmount
                    )}
                  </span>

                </div>

              )}

              <div className="d-flex justify-content-between mt-2 pt-2 border-top">

                <strong>
                  Grand Total:
                </strong>

                <strong className="text-primary">
                  TSh{" "}
                  {formatMoney(
                    grandTotal
                  )}
                </strong>

              </div>

            </Card.Body>

          </Card>

          {/* CUSTOMER */}

          <Row className="mb-3">

            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Customer Name
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Optional"
                  value={
                    customerName
                  }
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                />

              </Form.Group>

            </Col>

            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Customer Phone
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Optional"
                  value={
                    customerPhone
                  }
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value
                    )
                  }
                />

              </Form.Group>

            </Col>

          </Row>

          {/* PAYMENT */}

          <Row>

            <Col md={6}>

              <Form.Group className="mb-3">

                <Form.Label>
                  Payment Method *
                </Form.Label>

                <Form.Select
                  value={
                    paymentMethod
                  }
                  onChange={(e) => {

                    setPaymentMethod(
                      e.target.value
                    );

                    setPaymentTouched(
                      false
                    );

                    setPaymentPhone(
                      ""
                    );

                    setTransactionReference(
                      ""
                    );

                    setError("");
                  }}
                  disabled={
                    paymentMethodsLoading ||
                    loading
                  }
                >

                  <option value="">
                    Select payment method
                  </option>

                  {paymentMethodsLoading ? (

                    <option
                      value=""
                      disabled
                    >
                      Loading payment methods...
                    </option>

                  ) : paymentMethods.length ===
                    0 ? (

                    <option
                      value=""
                      disabled
                    >
                      No active payment methods available
                    </option>

                  ) : (

                    paymentMethods.map(
                      (method) => (

                        <option
                          key={
                            method.id
                          }
                          value={
                            method.id
                          }
                        >
                          {getPaymentMethodLabel(
                            method
                          )}
                        </option>

                      )
                    )

                  )}

                </Form.Select>

                {paymentTouched &&
                  !paymentMethod && (

                    <Form.Text className="text-danger">
                      Please select a payment method.
                    </Form.Text>

                  )}

              </Form.Group>

            </Col>

            <Col md={6}>

              <Form.Group className="mb-3">

                <Form.Label>
                  Amount Paid *
                </Form.Label>

                <Form.Control
                  type="number"
                  value={
                    amountPaid
                  }
                  onChange={(e) =>
                    setAmountPaid(
                      e.target.value
                    )
                  }
                  min="0"
                  step="0.01"
                  required
                  disabled={
                    loading
                  }
                />

              </Form.Group>

            </Col>

          </Row>

          {/* MOBILE PAYMENT */}

          {isMobilePayment && (

            <Row>

              <Col md={6}>

                <Form.Group className="mb-3">

                  <Form.Label>
                    Payment Phone *
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="07XXXXXXXX"
                    value={
                      paymentPhone
                    }
                    onChange={(e) =>
                      setPaymentPhone(
                        e.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

                <Form.Group className="mb-3">

                  <Form.Label>
                    Transaction Reference
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Optional"
                    value={
                      transactionReference
                    }
                    onChange={(e) =>
                      setTransactionReference(
                        e.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                  />

                </Form.Group>

              </Col>

            </Row>

          )}

          {/* OTHER PAYMENT REFERENCE */}

          {!isMobilePayment &&
            selectedPaymentMethod &&
            String(
              selectedPaymentMethod.code ||
                ""
            ).toUpperCase() !==
              "CASH" && (

              <Form.Group className="mb-3">

                <Form.Label>
                  Transaction Reference
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Optional"
                  value={
                    transactionReference
                  }
                  onChange={(e) =>
                    setTransactionReference(
                      e.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                />

              </Form.Group>

            )}

          {/* PAYMENT RESULT */}

          {paidAmount > 0 && (

            <Alert
              variant={
                paidAmount >=
                grandTotal
                  ? "success"
                  : "warning"
              }
            >

              <div className="d-flex justify-content-between">

                <span>
                  {paidAmount >=
                  grandTotal
                    ? "Change:"
                    : "Remaining:"}
                </span>

                <strong>
                  TSh{" "}
                  {formatMoney(
                    paidAmount >=
                      grandTotal
                      ? change
                      : remaining
                  )}
                </strong>

              </div>

            </Alert>

          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={
              closePaymentModal
            }
            disabled={
              loading
            }
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={
              handleCreateSale
            }
            disabled={
              loading ||
              !paymentMethod ||
              paymentMethodsLoading ||
              paymentMethods.length ===
                0
            }
          >

            {loading ? (

              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />

                Processing...
              </>

            ) : (

              <>
                <i className="bi bi-check-lg me-2"></i>
                Complete Sale
              </>

            )}

          </Button>

        </Modal.Footer>

      </Modal>

      {/* =========================================================
          RECEIPT MODAL
      ========================================================== */}

      <Modal
        show={!!completedSale}
        onHide={() =>
          setCompletedSale(
            null
          )
        }
        size="md"
      >

        <Modal.Header closeButton>

          <Modal.Title>

            <i className="bi bi-receipt me-2"></i>

            Receipt

          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          {completedSale && (

            <div className="receipt">

              <div className="text-center mb-3">

                <h5>
                  Thank You!
                </h5>

                <p className="text-muted mb-0">
                  Sale completed successfully
                </p>

                <small className="text-muted">

                  Receipt #:{" "}
                  {completedSale.invoice_number ||
                    completedSale.id}

                </small>

              </div>

              <hr />

              <div className="d-flex justify-content-between">

                <span>
                  Date:
                </span>

                <span>

                  {completedSale.created_at
                    ? new Date(
                        completedSale.created_at
                      ).toLocaleString(
                        "en-TZ"
                      )
                    : new Date().toLocaleString(
                        "en-TZ"
                      )}

                </span>

              </div>

              {completedSale.customer_name && (

                <div className="d-flex justify-content-between">

                  <span>
                    Customer:
                  </span>

                  <span>
                    {
                      completedSale.customer_name
                    }
                  </span>

                </div>

              )}

              {completedSale.customer_phone && (

                <div className="d-flex justify-content-between">

                  <span>
                    Phone:
                  </span>

                  <span>
                    {
                      completedSale.customer_phone
                    }
                  </span>

                </div>

              )}

              <hr />

              {/* ITEMS */}

              {completedSale.items &&
                completedSale.items.length >
                  0 && (

                  <div className="mb-3">

                    {completedSale.items.map(
                      (item, index) => (

                        <div
                          key={
                            item.id ??
                            index
                          }
                          className="d-flex justify-content-between mb-1"
                        >

                          <span>

                            {item.product_name ||
                              item.product_details
                                ?.name ||
                              "Product"}{" "}

                            ×{" "}
                            {
                              item.quantity
                            }

                          </span>

                          <span>

                            TSh{" "}
                            {formatMoney(
                              item.total
                            )}

                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              {/* SUBTOTAL */}

              <div className="d-flex justify-content-between">

                <span>
                  Subtotal:
                </span>

                <span>
                  TSh{" "}
                  {formatMoney(
                    completedSale.frontend_subtotal ??
                      completedSale.subtotal
                  )}
                </span>

              </div>

              {/* DISCOUNT */}

              {Number(
                completedSale.frontend_discount ??
                  completedSale.discount ??
                  0
              ) > 0 && (

                <div className="d-flex justify-content-between text-danger">

                  <span>
                    Discount:
                  </span>

                  <span>
                    -TSh{" "}
                    {formatMoney(
                      completedSale.frontend_discount ??
                        completedSale.discount
                    )}
                  </span>

                </div>

              )}

              {/* VAT */}

              {(completedSale.vat_enabled ||
                Number(
                  completedSale.vat_amount ||
                    completedSale.tax_amount ||
                    0
                ) > 0) && (

                <div className="d-flex justify-content-between">

                  <span>
                    VAT (
                    {completedSale.vat_rate ||
                      VAT_RATE}
                    %):
                  </span>

                  <span>
                    TSh{" "}
                    {formatMoney(
                      completedSale.vat_amount ??
                        completedSale.tax_amount ??
                        0
                    )}
                  </span>

                </div>

              )}

              {/* TOTAL */}

              <div className="d-flex justify-content-between mt-2 pt-2 border-top">

                <strong>
                  Total:
                </strong>

                <strong>
                  TSh{" "}
                  {formatMoney(
                    completedSale.frontend_total ??
                      completedSale.total
                  )}
                </strong>

              </div>

              <hr />

              {/* PAYMENT */}

              <div className="d-flex justify-content-between">

                <span>
                  Payment:
                </span>

                <span>

                  {completedSale.payment_method_name ||
                    completedSale.payment_method
                      ?.name ||
                    completedSale.payment_method ||
                    "Payment"}

                </span>

              </div>

              <div className="d-flex justify-content-between">

                <span>
                  Amount Paid:
                </span>

                <span>
                  TSh{" "}
                  {formatMoney(
                    completedSale.amount_paid
                  )}
                </span>

              </div>

              <div className="d-flex justify-content-between">

                <span>
                  Change:
                </span>

                <span>
                  TSh{" "}
                  {formatMoney(
                    completedSale.change
                  )}
                </span>

              </div>

            </div>

          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() =>
              setCompletedSale(
                null
              )
            }
          >
            Close
          </Button>

          <Button
            variant="primary"
            onClick={
              printReceipt
            }
          >

            <i className="bi bi-printer me-2"></i>

            Print Receipt

          </Button>

        </Modal.Footer>

      </Modal>

      {/* =========================================================
          STYLES
      ========================================================== */}

      <style jsx>{`

        .pos-page {
          padding: 1.5rem;
        }

        .product-card {
          transition: all 0.2s ease;
          border: 1px solid #e9ecef;
        }

        .product-card:hover:not(.out-of-stock) {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #0d6efd;
        }

        .product-card.out-of-stock {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .product-card .product-price {
          color: #0d6efd;
          font-weight: 600;
        }

        .cart-items {
          scrollbar-width: thin;
        }

        .cart-items::-webkit-scrollbar {
          width: 4px;
        }

        .cart-items::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }

        .cart-item {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .cart-item:hover {
          background-color: #e9ecef;
        }

        .receipt {
          font-size: 14px;
        }

        .receipt hr {
          margin: 8px 0;
        }

        @media print {

          .pos-page {
            padding: 0;
          }

          .page-header,
          .product-grid,
          .dashboard-card {
            display: none !important;
          }

          .receipt {
            font-size: 12px;
          }

          .modal {
            position: absolute !important;
          }

          .modal-content {
            border: none !important;
            box-shadow: none !important;
          }

          .modal-footer {
            display: none !important;
          }

          .modal-header {
            border-bottom: none !important;
          }

          .modal-header .btn-close {
            display: none !important;
          }

        }

      `}</style>

    </div>
  );
};

export default POS;

