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
// PURCHASE MODAL
// ==========================================================

const PurchaseModal = ({
  show,
  onHide,
  onSave,
  products = [],
  suppliers = [],
  branches = [],
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

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  // ========================================================
  // RESET FORM WHEN MODAL OPENS
  // ========================================================

  useEffect(() => {
    if (!show) {
      return;
    }

    setForm({
      ...EMPTY_FORM,
      purchase_number: generatePurchaseNumber(),
      branch: 1,
      order_date: new Date()
        .toISOString()
        .split("T")[0],
      status: "received",
      payment_status: "pending",
      notes: "",
      items: [],
    });

    setItem({
      ...EMPTY_ITEM,
    });

    setError("");
    setSaving(false);
  }, [show]);

  // ========================================================
  // FORM CHANGE
  // ========================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================================
  // ITEM CHANGE
  // ========================================================

  const handleItemChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setItem((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================================
  // SELECTED PRODUCT
  // ========================================================

  const selectedProduct = useMemo(() => {
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

  const currentItemCalculation = useMemo(() => {
    const quantity = Number(
      item.quantity || 0
    );

    const unitCost = Number(
      item.unit_cost || 0
    );

    const discountRate = Number(
      item.discount || 0
    );

    const taxRate = Number(
      item.tax || 0
    );

    const gross =
      quantity * unitCost;

    const discountAmount =
      gross *
      (discountRate / 100);

    const taxableAmount =
      gross - discountAmount;

    const taxAmount =
      taxableAmount *
      (taxRate / 100);

    const total =
      taxableAmount + taxAmount;

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

    const quantity = Number(
      item.quantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Quantity must be greater than zero."
      );

      return;
    }

    // ------------------------------------------------------
    // UNIT COST
    // ------------------------------------------------------

    const unitCost = Number(
      item.unit_cost
    );

    if (
      item.unit_cost === "" ||
      !Number.isFinite(unitCost) ||
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

    const discount = Number(
      item.discount || 0
    );

    if (
      !Number.isFinite(discount) ||
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

    const tax = Number(
      item.tax || 0
    );

    if (
      !Number.isFinite(tax) ||
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
    } = currentItemCalculation;

    // ------------------------------------------------------
    // NEW ITEM
    // ------------------------------------------------------

    const newItem = {
      product:
        Number(item.product),

      product_name:
        selectedProduct?.name ||
        "Product",

      quantity,

      unit_cost:
        Number(
          unitCost.toFixed(2)
        ),

      discount:
        Number(
          discount.toFixed(2)
        ),

      tax:
        Number(
          tax.toFixed(2)
        ),

      subtotal:
        Number(
          taxableAmount.toFixed(2)
        ),

      tax_amount:
        Number(
          taxAmount.toFixed(2)
        ),

      total:
        Number(
          total.toFixed(2)
        ),

      gross:
        Number(
          gross.toFixed(2)
        ),

      discount_amount:
        Number(
          discountAmount.toFixed(2)
        ),
    };

    // ------------------------------------------------------
    // ADD ITEM
    // ------------------------------------------------------

    setForm((previous) => ({
      ...previous,

      items: [
        ...previous.items,
        newItem,
      ],
    }));

    // ------------------------------------------------------
    // RESET ITEM
    // ------------------------------------------------------

    setItem({
      ...EMPTY_ITEM,
    });
  };

  // ========================================================
  // REMOVE ITEM
  // ========================================================

  const handleRemoveItem = (index) => {
    setForm((previous) => ({
      ...previous,

      items: previous.items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
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
        const quantity = Number(
          currentItem.quantity || 0
        );

        const unitCost = Number(
          currentItem.unit_cost || 0
        );

        const discountRate = Number(
          currentItem.discount || 0
        );

        const taxRate = Number(
          currentItem.tax || 0
        );

        const gross =
          quantity * unitCost;

        const discountAmount =
          gross *
          (discountRate / 100);

        const taxableAmount =
          gross - discountAmount;

        const taxAmount =
          taxableAmount *
          (taxRate / 100);

        const itemTotal =
          taxableAmount + taxAmount;

        result.gross += gross;
        result.discount += discountAmount;
        result.subtotal += taxableAmount;
        result.tax += taxAmount;
        result.total += itemTotal;

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

  const formatCurrency = (value) => {
    const amount = Number(
      value || 0
    );

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ------------------------------------------------------
    // PURCHASE NUMBER
    // ------------------------------------------------------

    const purchaseNumber =
      String(
        form.purchase_number || ""
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
      !Array.isArray(form.items) ||
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
        Number(form.supplier),

      branch:
        Number(form.branch),

      order_date:
        form.order_date,

      status:
        form.status || "received",

      payment_status:
        form.payment_status ||
        "pending",

      notes:
        form.notes?.trim() || "",

      items:
        form.items.map(
          (currentItem) => ({
            product:
              Number(
                currentItem.product
              ),

            quantity:
              Number(
                currentItem.quantity
              ),

            unit_cost:
              Number(
                currentItem.unit_cost
              ),

            discount:
              Number(
                currentItem.discount || 0
              ),

            tax:
              Number(
                currentItem.tax || 0
              ),

            total:
              Number(
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
      "PURCHASE PAYLOAD"
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

      setError(
        err?.response?.data
          ? JSON.stringify(
              err.response.data
            )
          : "Failed to save purchase. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // CLOSE
  // ========================================================

  const handleClose = () => {
    if (saving) {
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
        saving
          ? "static"
          : true
      }
      keyboard={!saving}
    >

      <Form
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Modal.Header
          closeButton={!saving}
        >

          <Modal.Title>
            New Purchase
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
            >

              <i className="bi bi-exclamation-triangle me-2" />

              {error}

            </Alert>
          )}

          {/* =================================================
              PURCHASE INFORMATION
          ================================================= */}

          <Card
            className="border-0 bg-light mb-4"
          >

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

                    <Form.Text className="text-muted">
                      Automatically generated.
                    </Form.Text>

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

                      <option value="received">
                        Received
                      </option>

                      <option value="pending">
                        Pending
                      </option>

                      <option value="ordered">
                        Ordered
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

                <Col md={1.5}>

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

                <Col md={1.5}>

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

              {form.items.length === 0 ? (

                <div className="text-center text-muted py-4">

                  <i className="bi bi-cart-x fs-2 d-block mb-2" />

                  No products added yet.

                </div>

              ) : (

                <div className="table-responsive">

                  <Table
                    bordered
                    hover
                    responsive
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
                            width: "70px",
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
                            key={`${currentItem.product}-${index}`}
                          >

                            <td>

                              <strong>
                                {
                                  currentItem.product_name
                                }
                              </strong>

                            </td>

                            <td className="text-end">
                              {
                                currentItem.quantity
                              }
                            </td>

                            <td className="text-end">
                              {formatCurrency(
                                currentItem.unit_cost
                              )}
                            </td>

                            <td className="text-end">

                              {Number(
                                currentItem.discount || 0
                              ).toFixed(2)}
                              %

                            </td>

                            <td className="text-end">

                              {Number(
                                currentItem.tax || 0
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
                                disabled={saving}
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

          {form.items.length > 0 && (

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
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              saving ||
              form.items.length === 0
            }
          >

            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />

                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1" />

                Save Purchase
              </>
            )}

          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default PurchaseModal;