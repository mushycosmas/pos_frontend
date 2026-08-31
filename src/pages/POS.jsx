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

import { useInventory } from "../context/InventoryContext";
import salesApi from "../services/SalesApi";

const POS = () => {
  const {
    products = [],
    loadInventory,
  } = useInventory();

  // =========================================================
  // STATE
  // =========================================================

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");

  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);

  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [completedSale, setCompletedSale] =
    useState(null);

  // =========================================================
  // LOAD INVENTORY
  // =========================================================

  useEffect(() => {
    const load = async () => {
      try {
        setInventoryLoading(true);

        if (loadInventory) {
          await loadInventory();
        }
      } catch (err) {
        console.error(
          "Failed to load inventory:",
          err
        );

        setError(
          "Failed to load products. Please refresh the page."
        );
      } finally {
        setInventoryLoading(false);
      }
    };

    load();
  }, [loadInventory]);

  // =========================================================
  // NORMALIZE PRODUCT
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

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const name =
        product?.name?.toLowerCase() || "";

      const sku =
        product?.sku?.toLowerCase() || "";

      const barcode =
        product?.barcode?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        sku.includes(keyword) ||
        barcode.includes(keyword)
      );
    });
  }, [products, search]);

  // =========================================================
  // ADD PRODUCT TO CART
  // =========================================================

  const addToCart = (product) => {
    setError("");
    setSuccess("");

    const productId =
      getProductId(product);

    const stock =
      getStock(product);

    const price =
      getSellingPrice(product);

    if (!productId) {
      setError(
        "Invalid product ID."
      );
      return;
    }

    if (stock <= 0) {
      setError(
        `${product.name} is out of stock.`
      );
      return;
    }

    if (price < 0) {
      setError(
        `${product.name} has an invalid selling price.`
      );
      return;
    }

    setCart((previousCart) => {
      const existing =
        previousCart.find(
          (item) =>
            Number(item.productId) ===
            productId
        );

      if (existing) {
        if (
          existing.quantity >= stock
        ) {
          setError(
            `Only ${stock} unit(s) of ${product.name} are available.`
          );

          return previousCart;
        }

        return previousCart.map(
          (item) =>
            Number(item.productId) ===
            productId
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...previousCart,
        {
          productId,
          name:
            product.name ||
            "Unnamed Product",
          sku:
            product.sku || "",
          price,
          quantity: 1,
          stock,
        },
      ];
    });
  };

  // =========================================================
  // UPDATE CART QUANTITY
  // =========================================================

  const updateQuantity = (
    productId,
    quantity
  ) => {
    const numericQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        numericQuantity
      )
    ) {
      return;
    }

    if (
      numericQuantity <= 0
    ) {
      removeFromCart(productId);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) => {
        if (
          Number(item.productId) !==
          Number(productId)
        ) {
          return item;
        }

        if (
          numericQuantity >
          item.stock
        ) {
          setError(
            `Only ${item.stock} unit(s) of ${item.name} are available.`
          );

          return item;
        }

        setError("");

        return {
          ...item,
          quantity:
            numericQuantity,
        };
      })
    );
  };

  // =========================================================
  // REMOVE FROM CART
  // =========================================================

  const removeFromCart = (
    productId
  ) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          Number(item.productId) !==
          Number(productId)
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

    const confirmed =
      window.confirm(
        "Clear all items from the cart?"
      );

    if (!confirmed) {
      return;
    }

    setCart([]);
    setDiscount(0);
    setAmountPaid("");
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
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cart]);

  // =========================================================
  // DISCOUNT
  // =========================================================

  const discountAmount = useMemo(() => {
    const value =
      Number(discount) || 0;

    return Math.min(
      Math.max(value, 0),
      subtotal
    );
  }, [discount, subtotal]);

  // =========================================================
  // TAXABLE AMOUNT
  // =========================================================

  const taxableAmount =
    Math.max(
      0,
      subtotal -
        discountAmount
    );

  // =========================================================
  // TAX
  // =========================================================

  const taxAmount = useMemo(() => {
    const rate =
      Number(taxRate) || 0;

    return (
      taxableAmount *
      (rate / 100)
    );
  }, [
    taxableAmount,
    taxRate,
  ]);

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  const grandTotal =
    taxableAmount +
    taxAmount;

  // =========================================================
  // AMOUNT PAID
  // =========================================================

  const paidAmount =
    Number(amountPaid) || 0;

  // =========================================================
  // CHANGE
  // =========================================================

  const change =
    Math.max(
      0,
      paidAmount -
        grandTotal
    );

  // =========================================================
  // REMAINING
  // =========================================================

  const remaining =
    Math.max(
      0,
      grandTotal -
        paidAmount
    );

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-TZ",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // OPEN PAYMENT
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

    if (
      grandTotal <= 0
    ) {
      setError(
        "Sale total must be greater than zero."
      );
      return;
    }

    setAmountPaid(
      grandTotal.toFixed(2)
    );

    setShowPaymentModal(
      true
    );
  };

  // =========================================================
  // VALIDATE PAYMENT
  // =========================================================

  const validatePayment = () => {
    if (
      !paymentMethod
    ) {
      setError(
        "Please select a payment method."
      );
      return false;
    }

    if (
      paymentMethod ===
      "CASH"
    ) {
      if (
        paidAmount <
        grandTotal
      ) {
        setError(
          `Insufficient payment. Required TSh ${formatMoney(
            grandTotal
          )}.`
        );

        return false;
      }
    }

    if (
      paidAmount < 0
    ) {
      setError(
        "Amount paid cannot be negative."
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE SALE
  // =========================================================

  const handleCreateSale =
    async () => {
      setError("");
      setSuccess("");

      if (
        !validatePayment()
      ) {
        return;
      }

      try {
        setLoading(true);

        // ===================================================
        // SALE PAYLOAD
        // ===================================================

        const payload = {
          customer_name:
            customerName.trim() ||
            null,

          customer_phone:
            customerPhone.trim() ||
            null,

          subtotal:
            Number(
              subtotal.toFixed(2)
            ),

          discount:
            Number(
              discountAmount.toFixed(
                2
              )
            ),

          tax_rate:
            Number(taxRate),

          tax_amount:
            Number(
              taxAmount.toFixed(2)
            ),

          total:
            Number(
              grandTotal.toFixed(2)
            ),

          payment_method:
            paymentMethod,

          amount_paid:
            Number(
              paidAmount.toFixed(2)
            ),

          change:
            Number(
              change.toFixed(2)
            ),

          items: cart.map(
            (item) => ({
              product:
                Number(
                  item.productId
                ),

              quantity:
                Number(
                  item.quantity
                ),

              unit_price:
                Number(
                  item.price.toFixed(
                    2
                  )
                ),

              discount: 0,
            })
          ),
        };

        console.log(
          "CREATE SALE PAYLOAD:",
          payload
        );

        // ===================================================
        // SEND TO BACKEND
        // ===================================================

        const response =
          await salesApi.create(
            payload
          );

        console.log(
          "SALE CREATED:",
          response
        );

        setCompletedSale(
          response
        );

        setShowPaymentModal(
          false
        );

        setSuccess(
          "Sale completed successfully."
        );

        // ===================================================
        // CLEAR POS
        // ===================================================

        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setDiscount(0);
        setAmountPaid("");
        setPaymentMethod(
          "CASH"
        );

        // ===================================================
        // REFRESH INVENTORY
        // ===================================================

        if (
          loadInventory
        ) {
          await loadInventory();
        }
      } catch (err) {
        console.error(
          "Failed to create sale:",
          err
        );

        const data =
          err?.response?.data;

        const message =
          data?.detail ||
          data?.message ||
          data?.error ||
          data?.non_field_errors?.[0] ||
          err?.message ||
          "Failed to complete sale.";

        setError(
          message
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================================
  // CANCEL PAYMENT
  // =========================================================

  const closePaymentModal =
    () => {
      if (loading) {
        return;
      }

      setShowPaymentModal(
        false
      );
      setError("");
    };

  // =========================================================
  // PRINT RECEIPT
  // =========================================================

  const printReceipt = () => {
    window.print();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pos-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header mb-4">

        <div>
          <h2>
            Point of Sale
          </h2>

          <p className="text-muted mb-0">
            Sell products and process customer payments.
          </p>
        </div>

        <Badge
          bg="success"
          className="px-3 py-2"
        >
          POS ACTIVE
        </Badge>

      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
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
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      {/* =====================================================
          MAIN POS
      ====================================================== */}

      <Row className="g-4">

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        <Col
          lg={7}
          xl={8}
        >

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>
                  <h5 className="mb-1">
                    Products
                  </h5>

                  <small className="text-muted">
                    Select a product to add it to the cart.
                  </small>
                </div>

                <Badge bg="light" text="dark">
                  {filteredProducts.length} Products
                </Badge>

              </div>

              {/* SEARCH */}

              <InputGroup className="mb-4">

                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search product, SKU or barcode..."
                />

              </InputGroup>

              {/* PRODUCT GRID */}

              {inventoryLoading ? (

                <div className="text-center py-5">

                  <Spinner animation="border" />

                  <div className="mt-2 text-muted">
                    Loading products...
                  </div>

                </div>

              ) : filteredProducts.length === 0 ? (

                <div className="text-center py-5">

                  <i
                    className="bi bi-box-seam"
                    style={{
                      fontSize:
                        "45px",
                    }}
                  ></i>

                  <h5 className="mt-3">
                    No products found
                  </h5>

                  <p className="text-muted">
                    Try another search.
                  </p>

                </div>

              ) : (

                <Row className="g-3">

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

                      const inCart =
                        cart.find(
                          (item) =>
                            Number(
                              item.productId
                            ) ===
                            productId
                        );

                      return (

                        <Col
                          xs={12}
                          sm={6}
                          xl={4}
                          key={
                            productId
                          }
                        >

                          <Card
                            className="h-100 border"
                            style={{
                              cursor:
                                stock >
                                0
                                  ? "pointer"
                                  : "not-allowed",
                              opacity:
                                stock >
                                0
                                  ? 1
                                  : 0.6,
                            }}
                            onClick={() => {

                              if (
                                stock >
                                0
                              ) {
                                addToCart(
                                  product
                                );
                              }

                            }}
                          >

                            <Card.Body>

                              <div className="d-flex justify-content-between">

                                <Badge
                                  bg={
                                    stock >
                                    0
                                      ? "success"
                                      : "danger"
                                  }
                                >
                                  {stock >
                                  0
                                    ? `${stock} in stock`
                                    : "Out of stock"}
                                </Badge>

                                {inCart && (
                                  <Badge bg="primary">
                                    {inCart.quantity}
                                  </Badge>
                                )}

                              </div>

                              <h6 className="mt-3 mb-1">
                                {product.name ||
                                  "Unnamed Product"}
                              </h6>

                              <small className="text-muted d-block">
                                {product.sku ||
                                  "No SKU"}
                              </small>

                              <h5 className="mt-3 mb-0">
                                TSh{" "}
                                {formatMoney(
                                  price
                                )}
                              </h5>

                            </Card.Body>

                          </Card>

                        </Col>

                      );
                    }
                  )}

                </Row>

              )}

            </Card.Body>

          </Card>

        </Col>

        {/* ===================================================
            CART
        ==================================================== */}

        <Col
          lg={5}
          xl={4}
        >

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>
                  <h5 className="mb-1">
                    Current Sale
                  </h5>

                  <small className="text-muted">
                    {cart.length} item type(s)
                  </small>
                </div>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={
                    clearCart
                  }
                  disabled={
                    cart.length ===
                    0
                  }
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear
                </Button>

              </div>

              {/* CART */}

              {cart.length === 0 ? (

                <div className="text-center py-5">

                  <i
                    className="bi bi-cart3"
                    style={{
                      fontSize:
                        "45px",
                    }}
                  ></i>

                  <p className="text-muted mt-3 mb-0">
                    Cart is empty.
                  </p>

                  <small className="text-muted">
                    Select products to begin a sale.
                  </small>

                </div>

              ) : (

                <div
                  style={{
                    maxHeight:
                      "380px",
                    overflowY:
                      "auto",
                  }}
                >

                  {cart.map(
                    (item) => (

                      <div
                        key={
                          item.productId
                        }
                        className="border-bottom py-3"
                      >

                        <div className="d-flex justify-content-between">

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <small className="d-block text-muted">
                              TSh{" "}
                              {formatMoney(
                                item.price
                              )}
                            </small>

                          </div>

                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() =>
                              removeFromCart(
                                item.productId
                              )
                            }
                          >
                            <i className="bi bi-x-lg"></i>
                          </Button>

                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2">

                          <InputGroup
                            size="sm"
                            style={{
                              width:
                                "125px",
                            }}
                          >

                            <Button
                              variant="outline-secondary"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity -
                                    1
                                )
                              }
                            >
                              −
                            </Button>

                            <Form.Control
                              className="text-center"
                              type="number"
                              min="1"
                              max={
                                item.stock
                              }
                              value={
                                item.quantity
                              }
                              onChange={(
                                e
                              ) =>
                                updateQuantity(
                                  item.productId,
                                  e.target
                                    .value
                                )
                              }
                            />

                            <Button
                              variant="outline-secondary"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity +
                                    1
                                )
                              }
                            >
                              +
                            </Button>

                          </InputGroup>

                          <strong>
                            TSh{" "}
                            {formatMoney(
                              item.price *
                                item.quantity
                            )}
                          </strong>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* =================================================
                  CUSTOMER
              ================================================== */}

              <hr />

              <h6>
                Customer
              </h6>

              <Form.Group className="mb-2">

                <Form.Control
                  value={
                    customerName
                  }
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  placeholder="Customer name (optional)"
                />

              </Form.Group>

              <Form.Group className="mb-3">

                <Form.Control
                  value={
                    customerPhone
                  }
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value
                    )
                  }
                  placeholder="Customer phone (optional)"
                />

              </Form.Group>

              {/* =================================================
                  DISCOUNT
              ================================================== */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Discount
                </Form.Label>

                <InputGroup>

                  <InputGroup.Text>
                    TSh
                  </InputGroup.Text>

                  <Form.Control
                    type="number"
                    min="0"
                    value={
                      discount
                    }
                    onChange={(e) =>
                      setDiscount(
                        e.target.value
                      )
                    }
                  />

                </InputGroup>

              </Form.Group>

              {/* =================================================
                  TAX
              ================================================== */}

              <Form.Group className="mb-3">

                <Form.Label>
                  Tax Rate (%)
                </Form.Label>

                <Form.Control
                  type="number"
                  min="0"
                  value={
                    taxRate
                  }
                  onChange={(e) =>
                    setTaxRate(
                      e.target.value
                    )
                  }
                />

              </Form.Group>

              {/* =================================================
                  TOTALS
              ================================================== */}

              <div className="bg-light rounded p-3">

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    TSh{" "}
                    {formatMoney(
                      subtotal
                    )}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Discount
                  </span>

                  <strong className="text-danger">
                    − TSh{" "}
                    {formatMoney(
                      discountAmount
                    )}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Tax ({taxRate}%)
                  </span>

                  <strong>
                    TSh{" "}
                    {formatMoney(
                      taxAmount
                    )}
                  </strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between">

                  <strong>
                    TOTAL
                  </strong>

                  <h4 className="mb-0">
                    TSh{" "}
                    {formatMoney(
                      grandTotal
                    )}
                  </h4>

                </div>

              </div>

              {/* =================================================
                  CHECKOUT
              ================================================== */}

              <Button
                variant="success"
                size="lg"
                className="w-100 mt-3"
                disabled={
                  loading ||
                  cart.length ===
                    0
                }
                onClick={
                  handleCheckout
                }
              >

                <i className="bi bi-credit-card me-2"></i>

                Proceed to Payment

              </Button>

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* =======================================================
          PAYMENT MODAL
      ======================================================== */}

      <Modal
        show={
          showPaymentModal
        }
        onHide={
          closePaymentModal
        }
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            <i className="bi bi-wallet2 me-2"></i>
            Complete Payment
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <div className="bg-light rounded p-3 mb-4">

            <div className="d-flex justify-content-between">

              <span>
                Total Amount
              </span>

              <h4 className="mb-0">
                TSh{" "}
                {formatMoney(
                  grandTotal
                )}
              </h4>

            </div>

          </div>

          <Form.Group className="mb-3">

            <Form.Label>
              Payment Method
            </Form.Label>

            <Form.Select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              disabled={
                loading
              }
            >

              <option value="CASH">
                Cash
              </option>

              <option value="MPESA">
                M-Pesa
              </option>

              <option value="TIGOPESA">
                Tigo Pesa
              </option>

              <option value="AIRTELMONEY">
                Airtel Money
              </option>

              <option value="HALOPESA">
                HaloPesa
              </option>

              <option value="CARD">
                Card
              </option>

              <option value="BANK">
                Bank Transfer
              </option>

            </Form.Select>

          </Form.Group>

          <Form.Group className="mb-3">

            <Form.Label>
              Amount Paid
            </Form.Label>

            <InputGroup>

              <InputGroup.Text>
                TSh
              </InputGroup.Text>

              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={
                  amountPaid
                }
                onChange={(e) =>
                  setAmountPaid(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
              />

            </InputGroup>

          </Form.Group>

          <div className="d-flex justify-content-between mb-2">

            <span>
              Change
            </span>

            <strong className="text-success">
              TSh{" "}
              {formatMoney(
                change
              )}
            </strong>

          </div>

          {remaining > 0 && (

            <Alert variant="warning">

              Remaining payment:

              <strong className="ms-2">
                TSh{" "}
                {formatMoney(
                  remaining
                )}
              </strong>

            </Alert>

          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="light"
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
            variant="success"
            onClick={
              handleCreateSale
            }
            disabled={
              loading ||
              cart.length ===
                0
            }
          >

            {loading ? (

              <>
                <Spinner
                  size="sm"
                  animation="border"
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

      {/* =======================================================
          COMPLETED SALE
      ======================================================== */}

      {completedSale && (

        <Modal
          show={
            Boolean(
              completedSale
            )
          }
          onHide={() =>
            setCompletedSale(
              null
            )
          }
          centered
        >

          <Modal.Header closeButton>

            <Modal.Title>
              <i className="bi bi-check-circle text-success me-2"></i>
              Sale Completed
            </Modal.Title>

          </Modal.Header>

          <Modal.Body>

            <div className="text-center py-3">

              <i
                className="bi bi-check-circle text-success"
                style={{
                  fontSize:
                    "60px",
                }}
              ></i>

              <h4 className="mt-3">
                Payment Successful
              </h4>

              <p className="text-muted">
                The sale has been recorded successfully.
              </p>

              <div className="bg-light rounded p-3 text-start">

                <div className="d-flex justify-content-between mb-2">

                  <span>
                    Sale ID
                  </span>

                  <strong>
                    {completedSale?.id ||
                      completedSale?.sale_id ||
                      "-"}
                  </strong>

                </div>

                <div className="d-flex justify-content-between">

                  <span>
                    Total
                  </span>

                  <strong>
                    TSh{" "}
                    {formatMoney(
                      completedSale?.total ??
                        grandTotal
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="outline-secondary"
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

      )}

    </div>
  );
};

export default POS;

