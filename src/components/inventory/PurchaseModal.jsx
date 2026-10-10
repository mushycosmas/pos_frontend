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
  branch: "",
  order_date: new Date().toISOString().split("T")[0],
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
// HELPERS
// ==========================================================

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const fixedNumber = (value, decimals = 2) =>
  Number(toNumber(value).toFixed(decimals));

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForInput = (value) => {
  if (!value) return today();

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return today();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const generatePurchaseNumber = () => {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  return `PUR-${datePart}-${timePart}`;
};

const getRelatedId = (value) => {
  if (value && typeof value === "object") {
    return value.id ?? value.pk ?? "";
  }

  return value ?? "";
};

const getProductId = (item) =>
  getRelatedId(
    item?.product ??
      item?.product_id ??
      item?.productId
  );

const getProductName = (item, products = []) => {
  if (item?.product_name) return item.product_name;

  if (item?.product && typeof item.product === "object") {
    return (
      item.product.name ||
      item.product.product_name ||
      item.product.title ||
      "Product"
    );
  }

  const productId = getProductId(item);

  const product = products.find(
    (entry) => String(entry.id) === String(productId)
  );

  return product?.name || product?.product_name || "Product";
};

const normalizePurchaseItem = (item, products) => {
  const productId = getProductId(item);
  const quantity = toNumber(item?.quantity, 1);
  const unitCost = toNumber(
    item?.unit_cost ?? item?.unitCost ?? item?.cost_price,
    0
  );
  const discount = toNumber(
    item?.discount ?? item?.discount_rate,
    0
  );
  const tax = toNumber(item?.tax ?? item?.tax_rate, 18);

  const gross = quantity * unitCost;
  const discountAmount = gross * (discount / 100);
  const subtotal = gross - discountAmount;
  const taxAmount = subtotal * (tax / 100);
  const calculatedTotal = subtotal + taxAmount;

  const backendTotal =
    item?.total ?? item?.total_amount ?? item?.line_total;

  return {
    id: item?.id,
    product: productId !== "" ? Number(productId) : "",
    product_name: getProductName(item, products),
    quantity,
    received_quantity: toNumber(item?.received_quantity, 0),
    unit_cost: fixedNumber(unitCost),
    discount: fixedNumber(discount),
    tax: fixedNumber(tax),
    gross: fixedNumber(gross),
    discount_amount: fixedNumber(discountAmount),
    subtotal: fixedNumber(subtotal),
    tax_amount: fixedNumber(taxAmount),
    total:
      backendTotal !== undefined &&
      backendTotal !== null &&
      backendTotal !== ""
        ? fixedNumber(toNumber(backendTotal, calculatedTotal))
        : fixedNumber(calculatedTotal),
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

  currentBranch = null,
  currentBranchId = "",

  purchase = null,
  editing = false,
  saving: parentSaving = false,
}) => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [item, setItem] = useState({ ...EMPTY_ITEM });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editing && purchase?.id);
  const isBusy = saving || parentSaving;

  const selectedBranchId =
    currentBranchId !== null &&
    currentBranchId !== undefined
      ? String(currentBranchId)
      : "";

  const selectedBranchName =
    currentBranch?.name ||
    currentBranch?.branch_name ||
    branches.find(
      (branch) => String(branch.id) === selectedBranchId
    )?.name ||
    "";

  // ========================================================
  // INITIALIZE FORM
  // ========================================================

  useEffect(() => {
    if (!show) return;

    setError("");
    setSaving(false);
    setItem({ ...EMPTY_ITEM });

    if (purchase?.id) {
      const rawItems = Array.isArray(purchase.items)
        ? purchase.items
        : Array.isArray(purchase.purchase_items)
          ? purchase.purchase_items
          : [];

      const supplierId = getRelatedId(
        purchase.supplier ??
          purchase.supplier_id
      );

      const branchId = getRelatedId(
        purchase.branch ??
          purchase.branch_id ??
          purchase.branchId
      );

      setForm({
        purchase_number: String(
          purchase.purchase_number ??
            purchase.purchaseNumber ??
            ""
        ),
        supplier: supplierId !== "" ? String(supplierId) : "",
        branch: branchId !== "" ? String(branchId) : selectedBranchId,
        order_date: formatDateForInput(
          purchase.order_date ??
            purchase.purchase_date ??
            purchase.created_at
        ),
        status: purchase.status || "received",
        payment_status: purchase.payment_status || "pending",
        notes: purchase.notes || "",
        items: rawItems.map((entry) =>
          normalizePurchaseItem(entry, products)
        ),
      });

      return;
    }

    setForm({
      ...EMPTY_FORM,
      purchase_number: generatePurchaseNumber(),
      supplier: "",
      branch: selectedBranchId,
      order_date: today(),
      status: "received",
      payment_status: "pending",
      notes: "",
      items: [],
    });
  }, [
    show,
    purchase,
    products,
    selectedBranchId,
  ]);

  // ========================================================
  // FORM CHANGES
  // ========================================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    // New purchases must use the selected branch.
    if (name === "branch" && !isEditing) return;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleItemChange = (event) => {
    const { name, value } = event.target;

    setItem((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================================
  // SELECTED PRODUCT
  // ========================================================

  const selectedProduct = useMemo(() => {
    if (!item.product) return null;

    return products.find(
      (product) => String(product.id) === String(item.product)
    ) || null;
  }, [item.product, products]);

  // ========================================================
  // ITEM CALCULATIONS
  // ========================================================

  const currentItemCalculation = useMemo(() => {
    const quantity = toNumber(item.quantity);
    const unitCost = toNumber(item.unit_cost);
    const discountRate = toNumber(item.discount);
    const taxRate = toNumber(item.tax);

    const gross = quantity * unitCost;
    const discountAmount = gross * (discountRate / 100);
    const subtotal = gross - discountAmount;
    const taxAmount = subtotal * (taxRate / 100);

    return {
      gross,
      discountAmount,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }, [
    item.quantity,
    item.unit_cost,
    item.discount,
    item.tax,
  ]);

  // ========================================================
  // TOTALS
  // ========================================================

  const totals = useMemo(() => {
    return form.items.reduce(
      (result, entry) => ({
        subtotal: result.subtotal + toNumber(entry.subtotal),
        discount:
          result.discount + toNumber(entry.discount_amount),
        tax: result.tax + toNumber(entry.tax_amount),
        total: result.total + toNumber(entry.total),
        quantity: result.quantity + toNumber(entry.quantity),
      }),
      {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        quantity: 0,
      }
    );
  }, [form.items]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 2,
    }).format(toNumber(value));

  // ========================================================
  // ADD ITEM
  // ========================================================

  const handleAddItem = () => {
    setError("");

    if (!item.product) {
      setError("Please select a product.");
      return;
    }

    const quantity = toNumber(item.quantity, 0);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (item.unit_cost === "" || item.unit_cost === null) {
      setError("Please enter a valid unit cost.");
      return;
    }

    const unitCost = toNumber(item.unit_cost, -1);

    if (unitCost < 0) {
      setError("Unit cost cannot be negative.");
      return;
    }

    const discount = toNumber(item.discount, -1);
    if (discount < 0 || discount > 100) {
      setError("Discount must be between 0 and 100%.");
      return;
    }

    const tax = toNumber(item.tax, -1);
    if (tax < 0 || tax > 100) {
      setError("Tax must be between 0 and 100%.");
      return;
    }

    const exists = form.items.some(
      (entry) => String(entry.product) === String(item.product)
    );

    if (exists) {
      setError("This product has already been added.");
      return;
    }

    const calculation = currentItemCalculation;

    const newItem = {
      product: Number(item.product),
      product_name:
        selectedProduct?.name ||
        selectedProduct?.product_name ||
        "Product",
      quantity,
      unit_cost: fixedNumber(unitCost),
      discount: fixedNumber(discount),
      tax: fixedNumber(tax),
      gross: fixedNumber(calculation.gross),
      discount_amount: fixedNumber(calculation.discountAmount),
      subtotal: fixedNumber(calculation.subtotal),
      tax_amount: fixedNumber(calculation.taxAmount),
      total: fixedNumber(calculation.total),
    };

    setForm((previous) => ({
      ...previous,
      items: [...previous.items, newItem],
    }));

    setItem({ ...EMPTY_ITEM });
  };

  // ========================================================
  // REMOVE ITEM
  // ========================================================

  const handleRemoveItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  // ========================================================
  // SAVE PURCHASE
  // ========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.supplier) {
      setError("Please select a supplier.");
      return;
    }

    if (!form.order_date) {
      setError("Please select an order date.");
      return;
    }

    if (!form.items.length) {
      setError("Please add at least one product.");
      return;
    }

    // Always use BranchContext for a new purchase.
    const branchId = isEditing
      ? form.branch
      : selectedBranchId;

    if (!branchId) {
      setError("Please select a branch before saving the purchase.");
      return;
    }

    const payload = {
      ...form,
      supplier: Number(form.supplier),
      branch: Number(branchId),
      items: form.items.map((entry) => ({
        product: Number(entry.product),
        quantity: Number(entry.quantity),
        unit_cost: Number(entry.unit_cost),
        discount: Number(entry.discount),
        tax: Number(entry.tax),
      })),
    };

    try {
      setSaving(true);

      const result = await onSave(payload);

      if (result === false) return;

      onHide();
    } catch (err) {
      console.error("Failed to submit purchase:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to save purchase."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Modal
      show={show}
      onHide={isBusy ? undefined : onHide}
      size="xl"
      centered
      backdrop={isBusy ? "static" : true}
      keyboard={!isBusy}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isBusy}>
          <Modal.Title>
            {isEditing ? "Edit Purchase" : "Create Purchase"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {!isEditing && !selectedBranchId && (
            <Alert variant="warning">
              No branch is selected. Select a branch before creating
              a purchase.
            </Alert>
          )}

          <Card className="mb-3">
            <Card.Header>Purchase Details</Card.Header>

            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Purchase Number</Form.Label>
                    <Form.Control
                      name="purchase_number"
                      value={form.purchase_number}
                      onChange={handleFormChange}
                      readOnly
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Branch</Form.Label>

                    {isEditing ? (
                      <Form.Select
                        name="branch"
                        value={form.branch}
                        onChange={handleFormChange}
                        disabled={isBusy}
                        required
                      >
                        <option value="">Select branch</option>

                        {branches.map((branch) => (
                          <option
                            key={branch.id}
                            value={String(branch.id)}
                          >
                            {branch.name ||
                              branch.branch_name ||
                              `Branch ${branch.id}`}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Form.Control
                        value={
                          selectedBranchName ||
                          (selectedBranchId
                            ? `Branch ${selectedBranchId}`
                            : "")
                        }
                        placeholder="Select a branch first"
                        readOnly
                      />
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Order Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="order_date"
                      value={form.order_date}
                      onChange={handleFormChange}
                      disabled={isBusy}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Supplier</Form.Label>
                    <Form.Select
                      name="supplier"
                      value={form.supplier}
                      onChange={handleFormChange}
                      disabled={isBusy}
                      required
                    >
                      <option value="">Select supplier</option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.id}
                          value={String(supplier.id)}
                        >
                          {supplier.name ||
                            supplier.supplier_name ||
                            supplier.company_name ||
                            `Supplier ${supplier.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      disabled={isBusy}
                    >
                      <option value="draft">Draft</option>
                      <option value="ordered">Ordered</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Select
                      name="payment_status"
                      value={form.payment_status}
                      onChange={handleFormChange}
                      disabled={isBusy}
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                      disabled={isBusy}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header>Add Products</Card.Header>

            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Product</Form.Label>
                    <Form.Select
                      name="product"
                      value={item.product}
                      onChange={handleItemChange}
                      disabled={isBusy}
                    >
                      <option value="">Select product</option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={String(product.id)}
                        >
                          {product.name ||
                            product.product_name ||
                            `Product ${product.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      step="1"
                      name="quantity"
                      value={item.quantity}
                      onChange={handleItemChange}
                      disabled={isBusy}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Unit Cost (TZS)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      name="unit_cost"
                      value={item.unit_cost}
                      onChange={handleItemChange}
                      disabled={isBusy}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      name="discount"
                      value={item.discount}
                      onChange={handleItemChange}
                      disabled={isBusy}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Tax (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      name="tax"
                      value={item.tax}
                      onChange={handleItemChange}
                      disabled={isBusy}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <small className="text-muted">
                        Line total:{" "}
                      </small>
                      <strong>
                        {formatCurrency(
                          currentItemCalculation.total
                        )}
                      </strong>
                    </div>

                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={handleAddItem}
                      disabled={isBusy}
                    >
                      Add Product
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>Purchase Items</Card.Header>

            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Unit Cost</th>
                    <th className="text-end">Discount</th>
                    <th className="text-end">Tax</th>
                    <th className="text-end">Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {form.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-muted py-4"
                      >
                        No products added yet.
                      </td>
                    </tr>
                  ) : (
                    form.items.map((entry, index) => (
                      <tr key={`${entry.product}-${index}`}>
                        <td>{entry.product_name}</td>
                        <td className="text-end">
                          {entry.quantity}
                        </td>
                        <td className="text-end">
                          {formatCurrency(entry.unit_cost)}
                        </td>
                        <td className="text-end">
                          {entry.discount}%
                        </td>
                        <td className="text-end">
                          {entry.tax}%
                        </td>
                        <td className="text-end">
                          {formatCurrency(entry.total)}
                        </td>
                        <td>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleRemoveItem(index)}
                            disabled={isBusy}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Row className="mt-3">
            <Col md={{ span: 5, offset: 7 }}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total quantity</span>
                    <strong>{totals.quantity}</strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal after discount</span>
                    <strong>{formatCurrency(totals.subtotal)}</strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount</span>
                    <strong>{formatCurrency(totals.discount)}</strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax</span>
                    <strong>{formatCurrency(totals.tax)}</strong>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Grand Total</span>
                    <strong className="fs-5">
                      {formatCurrency(totals.total)}
                    </strong>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onHide}
            disabled={isBusy}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              isBusy ||
              !form.items.length ||
              !form.supplier ||
              (!isEditing && !selectedBranchId)
            }
          >
            {isBusy
              ? "Saving..."
              : isEditing
                ? "Update Purchase"
                : "Create Purchase"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PurchaseModal;
