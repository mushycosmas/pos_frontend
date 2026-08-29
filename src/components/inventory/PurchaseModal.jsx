import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";

// ==========================================================
// EMPTY FORM
// ==========================================================

const EMPTY_FORM = {
  purchase_number: "",
  supplier: "",
  branch: 1,
  order_date: new Date()
    .toISOString()
    .split("T")[0],
  status: "received",
  payment_status: "pending",
  notes: "",
  items: [],
};

// ==========================================================
// EMPTY ITEM
// ==========================================================

const EMPTY_ITEM = {
  product: "",
  quantity: 1,
  unit_cost: "",
  discount: 0,
  tax: 18,
};

// ==========================================================
// NUMBER HELPER
// ==========================================================

const toNumber = (value, fallback = 0) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// ==========================================================
// SAFE FIXED NUMBER
// ==========================================================

const fixedNumber = (
  value,
  decimals = 2
) => {
  return Number(
    toNumber(value).toFixed(decimals)
  );
};

// ==========================================================
// DATE HELPER
// ==========================================================

const formatDateForInput = (value) => {
  if (!value) {
    return new Date()
      .toISOString()
      .split("T")[0];
  }

  // Already YYYY-MM-DD
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date()
      .toISOString()
      .split("T")[0];
  }

  return date
    .toISOString()
    .split("T")[0];
};

// ==========================================================
// GENERATE PURCHASE NUMBER
// ==========================================================

const generatePurchaseNumber = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const hours = String(
    now.getHours()
  ).padStart(2, "0");

  const minutes = String(
    now.getMinutes()
  ).padStart(2, "0");

  const seconds = String(
    now.getSeconds()
  ).padStart(2, "0");

  return `PUR-${year}${month}${day}-${hours}${minutes}${seconds}`;
};

// ==========================================================
// GET PRODUCT ID
// ==========================================================

const getProductId = (item) => {
  if (
    item?.product &&
    typeof item.product === "object"
  ) {
    return (
      item.product.id ??
      item.product.pk ??
      ""
    );
  }

  return (
    item?.product_id ??
    item?.productId ??
    item?.product ??
    ""
  );
};

// ==========================================================
// GET PRODUCT NAME
// ==========================================================

const getProductName = (
  item,
  products
) => {
  if (item?.product_name) {
    return item.product_name;
  }

  if (
    item?.product &&
    typeof item.product === "object"
  ) {
    return (
      item.product.name ||
      item.product.product_name ||
      item.product.title ||
      "Product"
    );
  }

  const productId =
    getProductId(item);

  const product = products.find(
    (currentProduct) =>
      Number(currentProduct.id) ===
      Number(productId)
  );

  return (
    product?.name ||
    product?.product_name ||
    "Product"
  );
};

// ==========================================================
// NORMALIZE PURCHASE ITEM
// ==========================================================

const normalizePurchaseItem = (
  item,
  products
) => {
  const productId =
    getProductId(item);

  const quantity = toNumber(
    item?.quantity,
    1
  );

  const unitCost = toNumber(
    item?.unit_cost ??
      item?.unitCost ??
      item?.cost_price,
    0
  );

  const discount = toNumber(
    item?.discount ??
      item?.discount_rate,
    0
  );

  const tax = toNumber(
    item?.tax ??
      item?.tax_rate,
    18
  );

  const gross =
    quantity * unitCost;

  const discountAmount =
    gross * (discount / 100);

  const taxableAmount =
    gross - discountAmount;

  const taxAmount =
    taxableAmount * (tax / 100);

  const calculatedTotal =
    taxableAmount + taxAmount;

  const backendTotal =
    item?.total ??
    item?.total_amount ??
    item?.line_total;

  const total =
    backendTotal !== undefined &&
    backendTotal !== null &&
    backendTotal !== ""
      ? toNumber(
          backendTotal,
          calculatedTotal
        )
      : calculatedTotal;

  return {
    id: item?.id,

    product:
      productId !== ""
        ? Number(productId)
        : "",

    product_name:
      getProductName(
        item,
        products
      ),

    quantity: toNumber(
      quantity,
      1
    ),

    received_quantity:
      toNumber(
        item?.received_quantity,
        0
      ),

    unit_cost:
      fixedNumber(unitCost),

    discount:
      fixedNumber(discount),

    tax:
      fixedNumber(tax),

    gross:
      fixedNumber(gross),

    discount_amount:
      fixedNumber(
        discountAmount
      ),

    subtotal:
      fixedNumber(
        taxableAmount
      ),

    tax_amount:
      fixedNumber(
        taxAmount
      ),

    total:
      fixedNumber(total),
  };
};

// ==========================================================
// PURCHASE MODAL
// ==========================================================

const PurchaseModal = ({
  show,
  onHide,
  onSave,

  products = [],
  suppliers = [],
  branches = [],

  purchase = null,
  editing = false,
  saving: parentSaving = false,
}) => {
  // ========================================================
  // STATE
  // ========================================================

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [item, setItem] = useState({
    ...EMPTY_ITEM,
  });

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  // ========================================================
  // EFFECTIVE EDIT MODE
  // ========================================================

  const isEditing =
    Boolean(
      editing && purchase?.id
    );

  // ========================================================
  // INITIALIZE FORM
  // CREATE OR EDIT
  // ========================================================

  useEffect(() => {
    if (!show) {
      return;
    }

    setError("");
    setSaving(false);

    // ======================================================
    // EDIT PURCHASE
    // ======================================================

    if (
      purchase &&
      purchase.id
    ) {
      const rawItems =
        Array.isArray(
          purchase.items
        )
          ? purchase.items
          : Array.isArray(
              purchase.purchase_items
            )
          ? purchase.purchase_items
          : [];

      const normalizedItems =
        rawItems.map(
          (currentItem) =>
            normalizePurchaseItem(
              currentItem,
              products
            )
        );

      const supplierId =
        purchase?.supplier?.id ??
        purchase?.supplier_id ??
        purchase?.supplier ??
        "";

      const branchId =
        purchase?.branch?.id ??
        purchase?.branch_id ??
        purchase?.branch ??
        1;

      const purchaseNumber =
        purchase?.purchase_number ??
        purchase?.purchaseNumber ??
        "";

      const orderDate =
        purchase?.order_date ??
        purchase?.purchase_date ??
        purchase?.created_at;

      setForm({
        purchase_number:
          String(
            purchaseNumber
          ),

        supplier:
          supplierId !== ""
            ? String(
                supplierId
              )
            : "",

        branch:
          branchId !== ""
            ? String(branchId)
            : "1",

        order_date:
          formatDateForInput(
            orderDate
          ),

        status:
          purchase?.status ||
          "received",

        payment_status:
          purchase?.payment_status ||
          "pending",

        notes:
          purchase?.notes || "",

        items:
          normalizedItems,
      });

      setItem({
        ...EMPTY_ITEM,
      });

      console.log(
        "EDIT PURCHASE:",
        purchase
      );

      console.log(
        "NORMALIZED EDIT FORM:",
        {
          purchase_number:
            String(
              purchaseNumber
            ),
          supplier:
            String(
              supplierId
            ),
          branch:
            String(
              branchId
            ),
          order_date:
            formatDateForInput(
              orderDate
            ),
          status:
            purchase?.status ||
            "received",
          payment_status:
            purchase?.payment_status ||
            "pending",
          notes:
            purchase?.notes || "",
          items:
            normalizedItems,
        }
      );

      return;
    }

    // ======================================================
    // CREATE NEW PURCHASE
    // ======================================================

    setForm({
      ...EMPTY_FORM,

      purchase_number:
        generatePurchaseNumber(),

      supplier: "",

      branch:
        branches.length > 0
          ? String(
              branches[0].id
            )
          : "1",

      order_date:
        new Date()
          .toISOString()
          .split("T")[0],

      status: "received",

      payment_status:
        "pending",

      notes: "",

      items: [],
    });

    setItem({
      ...EMPTY_ITEM,
    });
  }, [
    show,
    purchase,
    products,
    branches,
  ]);

  // ========================================================
  // FORM CHANGE
  // ========================================================

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ========================================================
  // ITEM CHANGE
  // ========================================================

  const handleItemChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setItem(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ========================================================
  // SELECTED PRODUCT
  // ========================================================

  const selectedProduct =
    useMemo(() => {
      if (!item.product) {
        return null;
      }

      return products.find(
        (product) =>
          Number(product.id) ===
          Number(item.product)
      );
    }, [
      item.product,
      products,
    ]);

  // ========================================================
  // CURRENT ITEM CALCULATION
  // ========================================================

  const currentItemCalculation =
    useMemo(() => {
      const quantity =
        toNumber(
          item.quantity,
          0
        );

      const unitCost =
        toNumber(
          item.unit_cost,
          0
        );

      const discountRate =
        toNumber(
          item.discount,
          0
        );

      const taxRate =
        toNumber(
          item.tax,
          0
        );

      const gross =
        quantity * unitCost;

      const discountAmount =
        gross *
        (discountRate / 100);

      const taxableAmount =
        gross -
        discountAmount;

      const taxAmount =
        taxableAmount *
        (taxRate / 100);

      const total =
        taxableAmount +
        taxAmount;

      return {
        gross,
        discountAmount,
        taxableAmount,
        taxAmount,
        total,
      };
    }, [
      item.quantity,
      item.unit_cost,
      item.discount,
      item.tax,
    ]);

  // ========================================================
  // ADD ITEM
  // ========================================================

  const handleAddItem = () => {
    setError("");

    // ------------------------------------------------------
    // PRODUCT
    // ------------------------------------------------------

    if (!item.product) {
      setError(
        "Please select a product."
      );

      return;
    }

    // ------------------------------------------------------
    // QUANTITY
    // ------------------------------------------------------

    const quantity =
      toNumber(
        item.quantity,
        0
      );

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity <= 0
    ) {
      setError(
        "Quantity must be a whole number greater than zero."
      );

      return;
    }

    // ------------------------------------------------------
    // UNIT COST
    // ------------------------------------------------------

    if (
      item.unit_cost === "" ||
      item.unit_cost === null ||
      item.unit_cost === undefined
    ) {
      setError(
        "Please enter a valid unit cost."
      );

      return;
    }

    const unitCost =
      toNumber(
        item.unit_cost,
        -1
      );

    if (
      !Number.isFinite(
        unitCost
      ) ||
      unitCost < 0
    ) {
      setError(
        "Please enter a valid unit cost."
      );

      return;
    }

    // ------------------------------------------------------
    // DISCOUNT
    // ------------------------------------------------------

    const discount =
      toNumber(
        item.discount,
        0
      );

    if (
      !Number.isFinite(
        discount
      ) ||
      discount < 0 ||
      discount > 100
    ) {
      setError(
        "Discount must be between 0 and 100%."
      );

      return;
    }

    // ------------------------------------------------------
    // TAX
    // ------------------------------------------------------

    const tax =
      toNumber(
        item.tax,
        0
      );

    if (
      !Number.isFinite(
        tax
      ) ||
      tax < 0 ||
      tax > 100
    ) {
      setError(
        "Tax must be between 0 and 100%."
      );

      return;
    }

    // ------------------------------------------------------
    // DUPLICATE PRODUCT
    // ------------------------------------------------------

    const exists =
      form.items.some(
        (existingItem) =>
          Number(
            existingItem.product
          ) ===
          Number(item.product)
      );

    if (exists) {
      setError(
        "This product has already been added."
      );

      return;
    }

    // ------------------------------------------------------
    // CALCULATIONS
    // ------------------------------------------------------

    const {
      gross,
      discountAmount,
      taxableAmount,
      taxAmount,
      total,
    } =
      currentItemCalculation;

    // ------------------------------------------------------
    // NEW ITEM
    // ------------------------------------------------------

    const newItem = {
      product:
        Number(
          item.product
        ),

      product_name:
        selectedProduct?.name ||
        selectedProduct?.product_name ||
        "Product",

      quantity,

      unit_cost:
        fixedNumber(
          unitCost
        ),

      discount:
        fixedNumber(
          discount
        ),

      tax:
        fixedNumber(
          tax
        ),

      gross:
        fixedNumber(
          gross
        ),

      discount_amount:
        fixedNumber(
          discountAmount
        ),

      subtotal:
        fixedNumber(
          taxableAmount
        ),

      tax_amount:
        fixedNumber(
          taxAmount
        ),

      total:
        fixedNumber(
          total
        ),
    };

    setForm(
      (previous) => ({
        ...previous,

        items: [
          ...previous.items,
          newItem,
        ],
      })
    );

    setItem({
      ...EMPTY_ITEM,
    });
  };

  // ========================================================
  // REMOVE ITEM
  // ========================================================

  const handleRemoveItem = (
    index
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        items:
          previous.items.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),
      })
    );
  };

  // ========================================================
  // PURCHASE TOTALS
  // ========================================================

  const totals = useMemo(() => {
    return form.items.reduce(
      (
        result,
        currentItem
      ) => {
        const quantity =
          toNumber(
            currentItem.quantity,
            0
          );

        const unitCost =
          toNumber(
            currentItem.unit_cost,
            0
          );

        const discountRate =
          toNumber(
            currentItem.discount,
            0
          );

        const taxRate =
          toNumber(
            currentItem.tax,
            0
          );

        const gross =
          quantity *
          unitCost;

        const discountAmount =
          gross *
          (discountRate /
            100);

        const taxableAmount =
          gross -
          discountAmount;

        const taxAmount =
          taxableAmount *
          (taxRate / 100);

        const itemTotal =
          taxableAmount +
          taxAmount;

        result.gross +=
          gross;

        result.discount +=
          discountAmount;

        result.subtotal +=
          taxableAmount;

        result.tax +=
          taxAmount;

        result.total +=
          itemTotal;

        return result;
      },
      {
        gross: 0,
        discount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      }
    );
  }, [form.items]);

  // ========================================================
  // FORMAT CURRENCY
  // ========================================================

  const formatCurrency = (
    value
  ) => {
    const amount =
      toNumber(value);

    return `TSh ${amount.toLocaleString(
      "en-TZ",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    // ------------------------------------------------------
    // PURCHASE NUMBER
    // ------------------------------------------------------

    const purchaseNumber =
      String(
        form.purchase_number ||
          ""
      ).trim();

    if (!purchaseNumber) {
      setError(
        "Purchase number is required."
      );

      return;
    }

    // ------------------------------------------------------
    // SUPPLIER
    // ------------------------------------------------------

    if (!form.supplier) {
      setError(
        "Please select a supplier."
      );

      return;
    }

    // ------------------------------------------------------
    // BRANCH
    // ------------------------------------------------------

    if (!form.branch) {
      setError(
        "Please select a branch."
      );

      return;
    }

    // ------------------------------------------------------
    // DATE
    // ------------------------------------------------------

    if (!form.order_date) {
      setError(
        "Purchase date is required."
      );

      return;
    }

    // ------------------------------------------------------
    // ITEMS
    // ------------------------------------------------------

    if (
      !Array.isArray(
        form.items
      ) ||
      form.items.length === 0
    ) {
      setError(
        "Please add at least one product."
      );

      return;
    }

    // ------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------

    if (
      !Number.isFinite(
        totals.total
      ) ||
      totals.total <= 0
    ) {
      setError(
        "Purchase total must be greater than zero."
      );

      return;
    }

    // ======================================================
    // BACKEND PAYLOAD
    // ======================================================

    const payload = {
      purchase_number:
        purchaseNumber,

      supplier:
        Number(
          form.supplier
        ),

      branch:
        Number(
          form.branch
        ),

      order_date:
        form.order_date,

      status:
        form.status ||
        "received",

      payment_status:
        form.payment_status ||
        "pending",

      notes:
        String(
          form.notes || ""
        ).trim(),

      items:
        form.items.map(
          (currentItem) => ({
            product:
              Number(
                currentItem.product
              ),

            quantity:
              toNumber(
                currentItem.quantity
              ),

            received_quantity:
              toNumber(
                currentItem.received_quantity,
                0
              ),

            unit_cost:
              fixedNumber(
                currentItem.unit_cost
              ),

            discount:
              fixedNumber(
                currentItem.discount
              ),

            tax:
              fixedNumber(
                currentItem.tax
              ),

            total:
              fixedNumber(
                currentItem.total
              ),
          })
        ),
    };

    // ======================================================
    // DEBUG
    // ======================================================

    console.log(
      "=========================================="
    );

    console.log(
      isEditing
        ? "UPDATE PURCHASE PAYLOAD"
        : "CREATE PURCHASE PAYLOAD"
    );

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "PURCHASE TOTALS",
      totals
    );

    console.log(
      "=========================================="
    );

    // ======================================================
    // SAVE
    // ======================================================

    try {
      setSaving(true);

      await onSave(payload);

    } catch (err) {
      console.error(
        "Purchase save error:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );

      const backendError =
        err?.response?.data;

      if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        const message =
          Object.entries(
            backendError
          )
            .map(
              ([
                field,
                messages,
              ]) => {
                const formatted =
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        ", "
                      )
                    : String(
                        messages
                      );

                return `${field}: ${formatted}`;
              }
            )
            .join("\n");

        setError(
          message ||
            "Failed to save purchase."
        );
      } else {
        setError(
          backendError
            ? String(
                backendError
              )
            : err?.message ||
                "Failed to save purchase. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // CLOSE
  // ========================================================

  const handleClose = () => {
    if (
      saving ||
      parentSaving
    ) {
      return;
    }

    setError("");

    onHide();
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      backdrop={
        saving ||
        parentSaving
          ? "static"
          : true
      }
      keyboard={
        !saving &&
        !parentSaving
      }
    >
      <Form
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Modal.Header
          closeButton={
            !saving &&
            !parentSaving
          }
        >
          <Modal.Title>
            {isEditing
              ? "Edit Purchase"
              : "New Purchase"}
          </Modal.Title>
        </Modal.Header>

        {/* ==================================================
            BODY
        ================================================== */}

        <Modal.Body>

          {/* ERROR */}

          {error && (
            <Alert
              variant="danger"
              className="mb-4"
              style={{
                whiteSpace:
                  "pre-line",
              }}
            >
              <i className="bi bi-exclamation-triangle me-2" />

              {error}
            </Alert>
          )}

          {/* =================================================
              PURCHASE INFORMATION
          ================================================= */}

          <Card className="border-0 bg-light mb-4">

            <Card.Body>

              <h6 className="mb-3">
                Purchase Information
              </h6>

              <Row className="g-3">

                {/* PURCHASE NUMBER */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Purchase Number
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="purchase_number"
                      value={
                        form.purchase_number
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />

                    {!isEditing && (
                      <Form.Text className="text-muted">
                        Automatically generated.
                      </Form.Text>
                    )}

                  </Form.Group>

                </Col>

                {/* SUPPLIER */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Supplier
                    </Form.Label>

                    <Form.Select
                      name="supplier"
                      value={
                        form.supplier
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    >

                      <option value="">
                        Select supplier
                      </option>

                      {suppliers.map(
                        (supplier) => (
                          <option
                            key={
                              supplier.id
                            }
                            value={
                              supplier.id
                            }
                          >
                            {
                              supplier.name
                            }
                          </option>
                        )
                      )}

                    </Form.Select>

                    {suppliers.length ===
                      0 && (
                      <Form.Text className="text-danger">
                        No suppliers available.
                      </Form.Text>
                    )}

                  </Form.Group>

                </Col>

                {/* BRANCH */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Branch
                    </Form.Label>

                    <Form.Select
                      name="branch"
                      value={
                        form.branch
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    >

                      {branches.length >
                      0 ? (
                        branches.map(
                          (branch) => (
                            <option
                              key={
                                branch.id
                              }
                              value={
                                branch.id
                              }
                            >
                              {
                                branch.name
                              }
                            </option>
                          )
                        )
                      ) : (
                        <option value="1">
                          Branch 1
                        </option>
                      )}

                    </Form.Select>

                  </Form.Group>

                </Col>

                {/* DATE */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Purchase Date
                    </Form.Label>

                    <Form.Control
                      type="date"
                      name="order_date"
                      value={
                        form.order_date
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />

                  </Form.Group>

                </Col>

                {/* STATUS */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Status
                    </Form.Label>

                    <Form.Select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="draft">
                        Draft
                      </option>

                      <option value="ordered">
                        Ordered
                      </option>

                      <option value="received">
                        Received
                      </option>

                      <option value="partially_received">
                        Partially Received
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>

                    </Form.Select>

                  </Form.Group>

                </Col>

                {/* PAYMENT STATUS */}

                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Payment Status
                    </Form.Label>

                    <Form.Select
                      name="payment_status"
                      value={
                        form.payment_status
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="paid">
                        Paid
                      </option>

                      <option value="partial">
                        Partial
                      </option>

                    </Form.Select>

                  </Form.Group>

                </Col>

                {/* NOTES */}

                <Col md={12}>

                  <Form.Group>

                    <Form.Label>
                      Notes
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="notes"
                      value={
                        form.notes
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Optional notes..."
                    />

                  </Form.Group>

                </Col>

              </Row>

            </Card.Body>

          </Card>

          {/* =================================================
              ADD PRODUCT
          ================================================= */}

          <Card className="mb-4">

            <Card.Body>

              <h6 className="mb-3">
                Add Product
              </h6>

              <Row className="g-3 align-items-end">

                {/* PRODUCT */}

                <Col md={3}>

                  <Form.Group>

                    <Form.Label>
                      Product
                    </Form.Label>

                    <Form.Select
                      name="product"
                      value={
                        item.product
                      }
                      onChange={
                        handleItemChange
                      }
                    >

                      <option value="">
                        Select product
                      </option>

                      {products.map(
                        (product) => (
                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                          >
                            {
                              product.name
                            }
                          </option>
                        )
                      )}

                    </Form.Select>

                  </Form.Group>

                </Col>

                {/* QUANTITY */}

                <Col md={2}>

                  <Form.Group>

                    <Form.Label>
                      Quantity
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      value={
                        item.quantity
                      }
                      onChange={
                        handleItemChange
                      }
                    />

                  </Form.Group>

                </Col>

                {/* UNIT COST */}

                <Col md={2}>

                  <Form.Group>

                    <Form.Label>
                      Unit Cost
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="unit_cost"
                      min="0"
                      step="0.01"
                      value={
                        item.unit_cost
                      }
                      onChange={
                        handleItemChange
                      }
                      placeholder="0.00"
                    />

                  </Form.Group>

                </Col>

                {/* DISCOUNT */}

                <Col md={2}>

                  <Form.Group>

                    <Form.Label>
                      Discount %
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="discount"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        item.discount
                      }
                      onChange={
                        handleItemChange
                      }
                    />

                  </Form.Group>

                </Col>

                {/* TAX */}

                <Col md={1}>

                  <Form.Group>

                    <Form.Label>
                      Tax %
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="tax"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        item.tax
                      }
                      onChange={
                        handleItemChange
                      }
                    />

                  </Form.Group>

                </Col>

                {/* ADD BUTTON */}

                <Col md={2}>

                  <Button
                    type="button"
                    variant="primary"
                    className="w-100"
                    onClick={
                      handleAddItem
                    }
                    disabled={
                      saving ||
                      parentSaving
                    }
                  >

                    <i className="bi bi-plus-lg me-1" />

                    Add Item

                  </Button>

                </Col>

              </Row>

              {/* CURRENT ITEM PREVIEW */}

              {item.product &&
                item.unit_cost !== "" && (
                  <div className="mt-3 text-muted">

                    <small>

                      Gross:{" "}

                      <strong>
                        {formatCurrency(
                          currentItemCalculation.gross
                        )}
                      </strong>

                      {" | "}

                      Discount:{" "}

                      <strong>
                        {formatCurrency(
                          currentItemCalculation.discountAmount
                        )}
                      </strong>

                      {" | "}

                      Tax:{" "}

                      <strong>
                        {formatCurrency(
                          currentItemCalculation.taxAmount
                        )}
                      </strong>

                      {" | "}

                      Total:{" "}

                      <strong>
                        {formatCurrency(
                          currentItemCalculation.total
                        )}
                      </strong>

                    </small>

                  </div>
                )}

            </Card.Body>

          </Card>

          {/* =================================================
              ITEMS TABLE
          ================================================= */}

          <Card>

            <Card.Body>

              <h6 className="mb-3">
                Purchase Items
              </h6>

              {form.items.length ===
              0 ? (

                <div className="text-center text-muted py-4">

                  <i className="bi bi-cart-x fs-2 d-block mb-2" />

                  {isEditing
                    ? "No products found for this purchase."
                    : "No products added yet."}

                </div>

              ) : (

                <div className="table-responsive">

                  <Table
                    bordered
                    hover
                    className="align-middle mb-0"
                  >

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th className="text-end">
                          Qty
                        </th>

                        <th className="text-end">
                          Unit Cost
                        </th>

                        <th className="text-end">
                          Discount
                        </th>

                        <th className="text-end">
                          Tax
                        </th>

                        <th className="text-end">
                          Total
                        </th>

                        <th
                          className="text-center"
                          style={{
                            width:
                              "70px",
                          }}
                        >
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {form.items.map(
                        (
                          currentItem,
                          index
                        ) => (

                          <tr
                            key={
                              currentItem.id ??
                              `${currentItem.product}-${index}`
                            }
                          >

                            <td>

                              <strong>
                                {
                                  currentItem.product_name
                                }
                              </strong>

                            </td>

                            <td className="text-end">
                              {toNumber(
                                currentItem.quantity
                              )}
                            </td>

                            <td className="text-end">
                              {formatCurrency(
                                currentItem.unit_cost
                              )}
                            </td>

                            <td className="text-end">

                              {toNumber(
                                currentItem.discount
                              ).toFixed(2)}
                              %

                            </td>

                            <td className="text-end">

                              {toNumber(
                                currentItem.tax
                              ).toFixed(2)}
                              %

                            </td>

                            <td className="text-end">

                              <strong>
                                {formatCurrency(
                                  currentItem.total
                                )}
                              </strong>

                            </td>

                            <td className="text-center">

                              <Button
                                type="button"
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveItem(
                                    index
                                  )
                                }
                                disabled={
                                  saving ||
                                  parentSaving
                                }
                                title="Remove item"
                              >

                                <i className="bi bi-trash" />

                              </Button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </Table>

                </div>

              )}

            </Card.Body>

          </Card>

          {/* =================================================
              TOTALS
          ================================================= */}

          {form.items.length >
            0 && (

            <Row className="justify-content-end mt-4">

              <Col md={5}>

                <Card className="bg-light border-0">

                  <Card.Body>

                    <div className="d-flex justify-content-between mb-2">

                      <span>
                        Gross Subtotal
                      </span>

                      <strong>
                        {formatCurrency(
                          totals.gross
                        )}
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between mb-2">

                      <span>
                        Discount
                      </span>

                      <strong>
                        -{" "}
                        {formatCurrency(
                          totals.discount
                        )}
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between mb-2">

                      <span>
                        Subtotal
                      </span>

                      <strong>
                        {formatCurrency(
                          totals.subtotal
                        )}
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between mb-3">

                      <span>
                        Tax
                      </span>

                      <strong>
                        {formatCurrency(
                          totals.tax
                        )}
                      </strong>

                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">

                      <h5 className="mb-0">
                        Total
                      </h5>

                      <h5 className="mb-0">
                        {formatCurrency(
                          totals.total
                        )}
                      </h5>

                    </div>

                  </Card.Body>

                </Card>

              </Col>

            </Row>

          )}

        </Modal.Body>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <Modal.Footer>

          <Button
            type="button"
            variant="secondary"
            onClick={
              handleClose
            }
            disabled={
              saving ||
              parentSaving
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              saving ||
              parentSaving ||
              form.items.length ===
                0
            }
          >

            {saving ||
            parentSaving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />

                {isEditing
                  ? "Updating..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1" />

                {isEditing
                  ? "Update Purchase"
                  : "Save Purchase"}
              </>
            )}

          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default PurchaseModal;