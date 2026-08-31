import React, { useMemo, useState, useEffect } from "react";

import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";

import { useInventory } from "../context/InventoryContext";

const StockAdjustments = () => {
  const {
    products = [],
    adjustStock,
    stockAdjustments = [],
    deleteStockAdjustment,
    loadStockMovements,
    loading,
  } = useInventory();

  // =========================================================
  // STATE
  // =========================================================

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    type: "ADD",
    quantity: "",
    reason: "",
    notes: "",
    reference: "",
  });

  // =========================================================
  // REASONS
  // =========================================================

  const reasons = [
    { value: "RESTOCK", label: "Restock / Replenishment" },
    { value: "PURCHASE", label: "Purchase Order" },
    { value: "RETURN", label: "Return from Customer" },
    { value: "SALE", label: "Sale" },
    { value: "DAMAGED", label: "Damaged / Defective" },
    { value: "EXPIRED", label: "Expired" },
    { value: "INVENTORY", label: "Inventory Correction" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "WASTE", label: "Waste / Spoilage" },
    { value: "OTHER", label: "Other" },
  ];

  // =========================================================
  // GET PRODUCT BY PRODUCT ID
  // =========================================================

  const getProductByProductId = (productId) => {
    return products.find(
      (product) => Number(product.productId) === Number(productId)
    );
  };

  // =========================================================
  // SELECTED PRODUCT
  // =========================================================

  const selectedProduct = useMemo(() => {
    if (!formData.productId) {
      return null;
    }

    return getProductByProductId(formData.productId);
  }, [products, formData.productId]);

  // =========================================================
  // FILTER ADJUSTMENTS
  // =========================================================

  const filteredAdjustments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return stockAdjustments.filter((item) => {
      const product = getProductByProductId(item.productId);

      const productName = (
        product?.name ||
        item.productName ||
        item.product_name ||
        ""
      ).toLowerCase();

      const sku = (
        product?.sku ||
        item.sku ||
        item.productSku ||
        item.product_sku ||
        ""
      ).toLowerCase();

      const reason = (item.reason || item.notes || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        productName.includes(keyword) ||
        sku.includes(keyword) ||
        reason.includes(keyword);

      const matchesType =
        typeFilter === "ALL" ||
        (item.movement_type && item.movement_type === typeFilter) ||
        (item.type && item.type === typeFilter);

      return matchesSearch && matchesType;
    });
  }, [stockAdjustments, products, search, typeFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalAdjustments = stockAdjustments.length;

  const additions = stockAdjustments.filter(
    (item) => item.type === "ADD" || item.movement_type === "ADD"
  ).length;

  const deductions = stockAdjustments.filter(
    (item) => item.type === "REMOVE" || item.movement_type === "REMOVE"
  ).length;

  // =========================================================
  // LOAD ADJUSTMENTS ON MOUNT
  // =========================================================

  useEffect(() => {
    if (loadStockMovements) {
      loadStockMovements();
    }
  }, [loadStockMovements]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      productId: "",
      type: "ADD",
      quantity: "",
      reason: "",
      notes: "",
      reference: "",
    });

    setError("");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // OPEN MODAL
  // =========================================================

  const handleOpen = () => {
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // SUBMIT ADJUSTMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -------------------------------------------------------
    // PRODUCT
    // -------------------------------------------------------

    if (!formData.productId) {
      setError("Please select a product.");
      return;
    }

    // -------------------------------------------------------
    // FIND STOCK
    // -------------------------------------------------------

    const stock = getProductByProductId(formData.productId);

    if (!stock) {
      setError(
        "Stock record for this product was not found. Please refresh inventory."
      );
      return;
    }

    // -------------------------------------------------------
    // PRODUCT ID
    // -------------------------------------------------------

    const productId = Number(stock.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      setError("Invalid product ID.");
      return;
    }

    // -------------------------------------------------------
    // STOCK ID
    // -------------------------------------------------------

    const stockId = Number(stock.stockId);

    if (!Number.isInteger(stockId) || stockId <= 0) {
      setError("Invalid stock ID. Please refresh inventory.");
      return;
    }

    // -------------------------------------------------------
    // QUANTITY
    // -------------------------------------------------------

    const quantity = Number(formData.quantity);

    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      setError("Please enter a valid whole-number quantity greater than zero.");
      return;
    }

    // -------------------------------------------------------
    // CURRENT STOCK
    // -------------------------------------------------------

    const currentStock = Number(
      stock.stock ?? stock.currentStock ?? stock.quantity ?? 0
    );

    // -------------------------------------------------------
    // REMOVE VALIDATION
    // -------------------------------------------------------

    if (formData.type === "REMOVE" && quantity > currentStock) {
      setError(
        `Cannot remove ${quantity} items. Available stock is ${currentStock}.`
      );
      return;
    }

    // -------------------------------------------------------
    // REASON
    // -------------------------------------------------------

    const reason = formData.reason.trim();

    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    // =======================================================
    // ADJUSTMENT DATA
    // =======================================================

    const adjustment = {
      stockId,
      productId,
      type: formData.type,
      quantity,
      reason,
      reference: formData.reference.trim(),
      notes: formData.notes.trim(),
    };

    console.log("Submitting stock adjustment:", adjustment);

    try {
      setSaving(true);

      // -----------------------------------------------------
      // SEND TO BACKEND
      // -----------------------------------------------------

      await adjustStock(adjustment);

      // -----------------------------------------------------
      // REFRESH ADJUSTMENT HISTORY
      // -----------------------------------------------------

      if (loadStockMovements) {
        await loadStockMovements();
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      const message =
        formData.type === "ADD"
          ? `Successfully added ${quantity} item(s) to stock.`
          : `Successfully removed ${quantity} item(s) from stock.`;

      setShowModal(false);
      resetForm();

      window.alert(message);
    } catch (err) {
      console.error("Stock adjustment failed:", err);

      const responseData = err?.response?.data;

      const message =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        responseData?.quantity?.[0] ||
        err?.message ||
        "Failed to adjust stock.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // GET NEW STOCK
  // =========================================================

  const getNewStock = (item) => {
    // -------------------------------------------------------
    // Backend calculated value
    // -------------------------------------------------------

    if (item.new_quantity !== undefined && item.new_quantity !== null) {
      return Number(item.new_quantity).toLocaleString();
    }

    if (item.quantity_after !== undefined && item.quantity_after !== null) {
      return Number(item.quantity_after).toLocaleString();
    }

    if (item.quantityAfter !== undefined && item.quantityAfter !== null) {
      return Number(item.quantityAfter).toLocaleString();
    }

    if (item.new_stock !== undefined && item.new_stock !== null) {
      return Number(item.new_stock).toLocaleString();
    }

    if (item.after_quantity !== undefined && item.after_quantity !== null) {
      return Number(item.after_quantity).toLocaleString();
    }

    // -------------------------------------------------------
    // Find current product
    // -------------------------------------------------------

    const product = getProductByProductId(item.productId);

    if (!product) {
      return "-";
    }

    const currentStock = Number(
      product.stock ?? product.currentStock ?? product.quantity ?? 0
    );

    const quantity = Number(item.quantity || 0);
    const movementType = item.movement_type || item.type;

    // -------------------------------------------------------
    // Fallback only - Backend should be the source of truth
    // -------------------------------------------------------

    if (movementType === "ADD" || movementType === "IN") {
      return (currentStock + quantity).toLocaleString();
    }

    if (movementType === "REMOVE" || movementType === "OUT") {
      return Math.max(0, currentStock - quantity).toLocaleString();
    }

    return currentStock.toLocaleString();
  };

  // =========================================================
  // GET BADGE VARIANT
  // =========================================================

  const getBadgeVariant = (type) => {
    const normalizedType = type?.toUpperCase();
    if (normalizedType === "ADD" || normalizedType === "IN") {
      return "success";
    }
    if (normalizedType === "REMOVE" || normalizedType === "OUT") {
      return "danger";
    }
    return "secondary";
  };

  // =========================================================
  // GET TYPE LABEL
  // =========================================================

  const getTypeLabel = (type) => {
    const normalizedType = type?.toUpperCase();
    if (normalizedType === "ADD" || normalizedType === "IN") {
      return "Added";
    }
    if (normalizedType === "REMOVE" || normalizedType === "OUT") {
      return "Removed";
    }
    return type || "Unknown";
  };

  // =========================================================
  // DELETE ADJUSTMENT
  // =========================================================

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm("Delete this stock adjustment?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteStockAdjustment(id);
    } catch (err) {
      console.error("Failed to delete stock adjustment:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete stock adjustment.";

      window.alert(message);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <h2>Stock Adjustments</h2>
          <p>Add, remove, and correct product stock levels.</p>
        </div>

        <Button variant="primary" onClick={handleOpen} disabled={saving}>
          <i className="bi bi-plus-lg me-2"></i>
          New Adjustment
        </Button>
      </div>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">Total Adjustments</small>
              <h4 className="mt-2 mb-0">{totalAdjustments}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">Stock Added</small>
              <h4 className="mt-2 mb-0 text-success">{additions}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">Stock Removed</small>
              <h4 className="mt-2 mb-0 text-danger">{deductions}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0">
            <Card.Body>
              <small className="text-muted">Products</small>
              <h4 className="mt-2 mb-0">{products.length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <Card className="dashboard-card border-0">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search product, SKU or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All Adjustments</option>
                <option value="ADD">Stock Added</option>
                <option value="REMOVE">Stock Removed</option>
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Loading adjustments...</div>
            </div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>TYPE</th>
                  <th>QUANTITY</th>
                  <th>REASON</th>
                  <th>NEW STOCK</th>
                  <th>DATE</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i className="bi bi-sliders" style={{ fontSize: "32px" }}></i>
                      <div className="mt-2 text-muted">
                        No stock adjustments found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((item) => {
                    const product = getProductByProductId(item.productId);

                    const quantity = Number(item.quantity || 0);
                    const movementType = item.movement_type || item.type;

                    const productName =
                      product?.name ||
                      item.productName ||
                      item.product_name ||
                      "Unknown Product";

                    const sku =
                      product?.sku ||
                      item.sku ||
                      item.productSku ||
                      item.product_sku ||
                      "-";

                    const date = item.created_at || item.createdAt || item.date;

                    return (
                      <tr key={item.id || item._id}>
                        <td>
                          <strong>{productName}</strong>
                        </td>
                        <td>{sku}</td>
                        <td>
                          <Badge bg={getBadgeVariant(movementType)}>
                            {getTypeLabel(movementType)}
                          </Badge>
                        </td>
                        <td>{quantity.toLocaleString()}</td>
                        <td>{item.reason || item.notes || "-"}</td>
                        <td>{getNewStock(item)}</td>
                        <td>{formatDate(date)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.id || item._id)}
                            disabled={saving}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* =====================================================
          MODAL - NEW ADJUSTMENT
      ====================================================== */}

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Stock Adjustment</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product *</Form.Label>
                  <Form.Select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} - {product.sku}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Adjustment Type *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="ADD">Add Stock (+)</option>
                    <option value="REMOVE">Remove Stock (-)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    placeholder="PO #, Order #, etc."
                    value={formData.reference}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason *</Form.Label>
              <Form.Select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">Select a reason...</option>
                {reasons.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            {selectedProduct && (
              <Alert variant="info" className="mb-0">
                <strong>Current Stock:</strong>{" "}
                {selectedProduct.stock || selectedProduct.quantity || 0} units
                {formData.type === "REMOVE" && formData.quantity && (
                  <>
                    {" "}
                    → <strong>New Stock:</strong>{" "}
                    {Math.max(
                      0,
                      (selectedProduct.stock || selectedProduct.quantity || 0) -
                        Number(formData.quantity)
                    )}{" "}
                    units
                  </>
                )}
                {formData.type === "ADD" && formData.quantity && (
                  <>
                    {" "}
                    → <strong>New Stock:</strong>{" "}
                    {(selectedProduct.stock || selectedProduct.quantity || 0) +
                      Number(formData.quantity)}{" "}
                    units
                  </>
                )}
              </Alert>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
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
                "Submit Adjustment"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StockAdjustments;