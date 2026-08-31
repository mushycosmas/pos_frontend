
import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

const AdjustmentModal = ({
  show,
  onHide,
  products = [],
  onSave,
}) => {
  // =========================================================
  // FORM STATE
  // =========================================================

  const [form, setForm] = useState({
    productId: "",
    type: "ADD",
    quantity: "",
    reason: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // RESET FORM WHEN MODAL OPENS/CLOSES
  // =========================================================

  useEffect(() => {
    if (!show) {
      setForm({
        productId: "",
        type: "ADD",
        quantity: "",
        reason: "",
      });

      setError("");
      setSaving(false);
    }
  }, [show]);

  // =========================================================
  // SELECTED PRODUCT
  // =========================================================

  const selectedProduct = products.find(
    (product) =>
      Number(product.productId ?? product.id) ===
      Number(form.productId)
  );

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------------
    // PRODUCT
    // ---------------------------------------------------------

    if (!form.productId) {
      setError(
        "Please select a product."
      );
      return;
    }

    // ---------------------------------------------------------
    // QUANTITY
    // ---------------------------------------------------------

    const quantity =
      Number(form.quantity);

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      setError(
        "Please enter a valid quantity."
      );
      return;
    }

    // ADD / REMOVE require quantity > 0
    if (
      (form.type === "ADD" ||
        form.type === "REMOVE") &&
      quantity <= 0
    ) {
      setError(
        "Quantity must be greater than zero."
      );
      return;
    }

    // ---------------------------------------------------------
    // REASON
    // ---------------------------------------------------------

    const reason =
      form.reason.trim();

    if (!reason) {
      setError(
        "Please enter a reason."
      );
      return;
    }

    // ---------------------------------------------------------
    // REMOVE VALIDATION
    // ---------------------------------------------------------

    if (
      form.type === "REMOVE" &&
      selectedProduct
    ) {
      const currentStock =
        Number(
          selectedProduct.stock
        );

      if (
        quantity >
        currentStock
      ) {
        setError(
          `Cannot remove ${quantity}. Available stock is ${currentStock}.`
        );
        return;
      }
    }

    // ---------------------------------------------------------
    // STOCK ID
    //
    // We DO NOT send stockId here.
    //
    // The modal works with PRODUCT ID.
    //
    // InventoryContext will convert:
    //
    // Product ID 9
    //      ↓
    // Stock ID 5
    // ---------------------------------------------------------

    const payload = {
      productId:
        Number(form.productId),

      type: form.type,

      quantity,

      reason,
    };

    console.log(
      "ADJUSTMENT MODAL PAYLOAD:",
      payload
    );

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    try {
      setSaving(true);

      await onSave(payload);

      // Reset only after successful save
      setForm({
        productId: "",
        type: "ADD",
        quantity: "",
        reason: "",
      });

      onHide();
    } catch (err) {
      console.error(
        "Failed to save stock adjustment:",
        err
      );

      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          err?.message ||
          "Failed to save stock adjustment."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CURRENT STOCK
  // =========================================================

  const currentStock =
    selectedProduct
      ? Number(
          selectedProduct.stock
        )
      : 0;

  // =========================================================
  // PREVIEW STOCK
  // =========================================================

  let previewStock =
    currentStock;

  if (
    form.quantity !== "" &&
    Number.isFinite(
      Number(form.quantity)
    )
  ) {
    const quantity =
      Number(form.quantity);

    if (form.type === "ADD") {
      previewStock =
        currentStock +
        quantity;
    }

    if (form.type === "REMOVE") {
      previewStock =
        currentStock -
        quantity;
    }

    if (form.type === "SET") {
      previewStock =
        quantity;
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Modal
      show={show}
      onHide={saving ? undefined : onHide}
      centered
      backdrop="static"
    >
      <Form
        onSubmit={handleSubmit}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Modal.Header
          closeButton={!saving}
        >
          <Modal.Title>
            <i className="bi bi-sliders me-2"></i>
            Stock Adjustment
          </Modal.Title>
        </Modal.Header>

        {/* =====================================================
            BODY
        ====================================================== */}

        <Modal.Body>

          {/* ERROR */}

          {error && (
            <Alert
              variant="danger"
              className="mb-3"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* ===================================================
              PRODUCT
          ==================================================== */}

          <Form.Group className="mb-3">

            <Form.Label>
              Product
            </Form.Label>

            <Form.Select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              disabled={saving}
            >
              <option value="">
                Select product
              </option>

              {products.map(
                (product) => (
                  <option
                    key={
                      product.productId ??
                      product.id
                    }
                    value={
                      product.productId ??
                      product.id
                    }
                  >
                    {product.name ||
                      "Unnamed Product"}{" "}
                    — Stock:{" "}
                    {product.stock ?? 0}
                  </option>
                )
              )}
            </Form.Select>

          </Form.Group>

          {/* ===================================================
              CURRENT STOCK
          ==================================================== */}

          {selectedProduct && (
            <div className="bg-light rounded p-3 mb-3">

              <div className="d-flex justify-content-between">

                <span>
                  Current Stock
                </span>

                <strong>
                  {currentStock.toLocaleString()}
                </strong>

              </div>

              {selectedProduct.sku && (
                <div className="d-flex justify-content-between mt-2">

                  <span>
                    SKU
                  </span>

                  <strong>
                    {selectedProduct.sku}
                  </strong>

                </div>
              )}

              {selectedProduct.stockId && (
                <div className="d-flex justify-content-between mt-2">

                  <span>
                    Stock Record
                  </span>

                  <strong>
                    #{selectedProduct.stockId}
                  </strong>

                </div>
              )}

            </div>
          )}

          {/* ===================================================
              ADJUSTMENT TYPE
          ==================================================== */}

          <Form.Group className="mb-3">

            <Form.Label>
              Adjustment Type
            </Form.Label>

            <Form.Select
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="ADD">
                + Add Stock
              </option>

              <option value="REMOVE">
                − Remove Stock
              </option>

              <option value="SET">
                = Set Stock
              </option>
            </Form.Select>

          </Form.Group>

          {/* ===================================================
              QUANTITY
          ==================================================== */}

          <Form.Group className="mb-3">

            <Form.Label>
              {form.type === "SET"
                ? "New Stock Quantity"
                : "Quantity"}
            </Form.Label>

            <Form.Control
              type="number"
              min="0"
              step="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder={
                form.type === "SET"
                  ? "Enter new stock level"
                  : "Enter quantity"
              }
              required
              disabled={saving}
            />

          </Form.Group>

          {/* ===================================================
              STOCK PREVIEW
          ==================================================== */}

          {selectedProduct &&
            form.quantity !== "" && (
              <div
                className={`rounded p-3 mb-3 ${
                  previewStock < 0
                    ? "bg-danger-subtle"
                    : "bg-success-subtle"
                }`}
              >

                <div className="d-flex justify-content-between">

                  <span>
                    New Stock
                  </span>

                  <strong>
                    {previewStock.toLocaleString()}
                  </strong>

                </div>

              </div>
            )}

          {/* ===================================================
              REASON
          ==================================================== */}

          <Form.Group>

            <Form.Label>
              Reason
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g. Damaged stock, stock count correction..."
              required
              disabled={saving}
            />

          </Form.Group>

        </Modal.Body>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <Modal.Footer>

          <Button
            variant="light"
            onClick={onHide}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant={
              form.type === "REMOVE"
                ? "danger"
                : form.type === "ADD"
                ? "success"
                : "primary"
            }
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>

                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Save Adjustment
              </>
            )}
          </Button>

        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AdjustmentModal;

