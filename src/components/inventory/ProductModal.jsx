import React, { useEffect, useState } from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";

// ==========================================================
// EMPTY PRODUCT
// ==========================================================

const emptyProduct = {
  name: "",
  sku: "",
  barcode: "",

  brandId: "",
  categoryId: "",
  supplierId: "",

  // Default branch
  branchId: 1,

  // Pricing
  costPrice: "",
  sellingPrice: "",
  wholesalePrice: "",

  // Tax
  taxRate: 0,

  // Description
  description: "",

  // ========================================================
  // INVENTORY
  // ========================================================

  // Initial quantity when creating product
  stock: 0,

  // Minimum quantity before low-stock warning
  minStock: 5,

  // Status
  isActive: true,
  isKitchen: false,
};

// ==========================================================
// PRODUCT MODAL
// ==========================================================

const ProductModal = ({
  show,
  onHide,
  onSave,
  product,

  brands = [],
  categories = [],
  suppliers = [],
  branches = [],
}) => {
  const [form, setForm] = useState({
    ...emptyProduct,
  });

  // ========================================================
  // LOAD PRODUCT
  // ========================================================

  useEffect(() => {
    if (product) {
      setForm({
        ...emptyProduct,

        // --------------------------------------------------
        // BASIC INFORMATION
        // --------------------------------------------------

        name: product.name ?? "",

        sku: product.sku ?? "",

        barcode: product.barcode ?? "",

        // --------------------------------------------------
        // BRAND
        // --------------------------------------------------

        brandId:
          product.brandId ??
          product.brand_id ??
          product.brand ??
          "",

        // --------------------------------------------------
        // CATEGORY
        // --------------------------------------------------

        categoryId:
          product.categoryId ??
          product.category_id ??
          product.category ??
          "",

        // --------------------------------------------------
        // SUPPLIER
        // --------------------------------------------------

        supplierId:
          product.supplierId ??
          product.supplier_id ??
          product.supplier ??
          "",

        // --------------------------------------------------
        // BRANCH
        // --------------------------------------------------

        branchId:
          product.branchId ??
          product.branch_id ??
          product.branch ??
          1,

        // --------------------------------------------------
        // PRICES
        // --------------------------------------------------

        costPrice:
          product.costPrice ??
          product.cost_price ??
          "",

        sellingPrice:
          product.sellingPrice ??
          product.selling_price ??
          "",

        wholesalePrice:
          product.wholesalePrice ??
          product.wholesale_price ??
          "",

        // --------------------------------------------------
        // TAX
        // --------------------------------------------------

        taxRate:
          product.taxRate ??
          product.tax_rate ??
          0,

        // --------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------

        description:
          product.description ?? "",

        // --------------------------------------------------
        // INITIAL / CURRENT STOCK
        //
        // Product API may return:
        // stock
        // current_stock
        // currentStock
        // --------------------------------------------------

        stock:
          product.stock ??
          product.current_stock ??
          product.currentStock ??
          product.quantity ??
          0,

        // --------------------------------------------------
        // MINIMUM STOCK
        // --------------------------------------------------

        minStock:
          product.minStock ??
          product.min_stock ??
          product.minimum_stock ??
          product.reorder_level ??
          5,

        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        isActive:
          product.isActive ??
          product.is_active ??
          true,

        isKitchen:
          product.isKitchen ??
          product.is_kitchen ??
          false,
      });
    } else {
      // ----------------------------------------------------
      // NEW PRODUCT
      // ----------------------------------------------------

      setForm({
        ...emptyProduct,

        branchId: 1,

        stock: 0,

        minStock: 5,
      });
    }
  }, [product, show]);

  // ========================================================
  // HANDLE CHANGE
  // ========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    // ======================================================
    // VALIDATION
    // ======================================================

    if (!form.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      alert("SKU is required.");
      return;
    }

    if (
      form.costPrice === "" ||
      form.costPrice === null
    ) {
      alert("Cost price is required.");
      return;
    }

    if (
      form.sellingPrice === "" ||
      form.sellingPrice === null
    ) {
      alert("Selling price is required.");
      return;
    }

    // ======================================================
    // CONVERT VALUES
    // ======================================================

    const stock = Number(form.stock || 0);

    const minimumStock = Number(
      form.minStock || 0
    );

    const costPrice = Number(
      form.costPrice
    );

    const sellingPrice = Number(
      form.sellingPrice
    );

    const wholesalePrice =
      form.wholesalePrice !== "" &&
      form.wholesalePrice !== null
        ? Number(form.wholesalePrice)
        : null;

    const taxRate = Number(
      form.taxRate || 0
    );

    const branchId =
      form.branchId
        ? Number(form.branchId)
        : 1;

    // ======================================================
    // VALIDATE NUMBERS
    // ======================================================

    if (!Number.isFinite(stock) || stock < 0) {
      alert(
        "Initial stock must be zero or greater."
      );
      return;
    }

    if (
      !Number.isFinite(minimumStock) ||
      minimumStock < 0
    ) {
      alert(
        "Minimum stock must be zero or greater."
      );
      return;
    }

    if (
      !Number.isFinite(costPrice) ||
      costPrice < 0
    ) {
      alert(
        "Cost price must be zero or greater."
      );
      return;
    }

    if (
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      alert(
        "Selling price must be zero or greater."
      );
      return;
    }

    // ======================================================
    // API PAYLOAD
    // ======================================================

    const payload = {
      // ----------------------------------------------------
      // BASIC INFORMATION
      // ----------------------------------------------------

      name: form.name.trim(),

      sku: form.sku.trim(),

      barcode:
        form.barcode.trim() || null,

      // ----------------------------------------------------
      // BRAND
      // ----------------------------------------------------

      brand: form.brandId
        ? Number(form.brandId)
        : null,

      // ----------------------------------------------------
      // CATEGORY
      // ----------------------------------------------------

      category: form.categoryId
        ? Number(form.categoryId)
        : null,

      // ----------------------------------------------------
      // SUPPLIER
      // ----------------------------------------------------

      supplier: form.supplierId
        ? Number(form.supplierId)
        : null,

      // ----------------------------------------------------
      // BRANCH
      // ----------------------------------------------------

      branch: branchId,

      // ----------------------------------------------------
      // PRICING
      // ----------------------------------------------------

      cost_price: costPrice,

      selling_price: sellingPrice,

      wholesale_price: wholesalePrice,

      // ----------------------------------------------------
      // TAX
      // ----------------------------------------------------

      tax_rate: taxRate,

      // ----------------------------------------------------
      // DESCRIPTION
      // ----------------------------------------------------

      description:
        form.description.trim(),

      // ----------------------------------------------------
      // INVENTORY
      //
      // IMPORTANT:
      // This is consumed by ProductSerializer.create()
      //
      // stock_quantity = validated_data.pop("stock", 0)
      //
      // Stock.objects.create(
      //     product=product,
      //     branch_id=branch_id,
      //     quantity=stock_quantity
      // )
      // ----------------------------------------------------

      stock: stock,

      minimum_stock: minimumStock,

      // ----------------------------------------------------
      // STATUS
      // ----------------------------------------------------

      is_active: Boolean(
        form.isActive
      ),

      is_kitchen: Boolean(
        form.isKitchen
      ),
    };

    // ======================================================
    // DEBUG
    // ======================================================

    console.log(
      "================================"
    );

    console.log(
      "PRODUCT PAYLOAD:"
    );

    console.log(payload);

    console.log(
      "INITIAL STOCK:",
      payload.stock
    );

    console.log(
      "BRANCH:",
      payload.branch
    );

    console.log(
      "================================"
    );

    // ======================================================
    // SAVE
    // ======================================================

    onSave(payload);
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Form onSubmit={handleSubmit}>
        {/* ==================================================
            HEADER
        ================================================== */}

        <Modal.Header closeButton>
          <Modal.Title>
            {product
              ? "Edit Product"
              : "Add Product"}
          </Modal.Title>
        </Modal.Header>

        {/* ==================================================
            BODY
        ================================================== */}

        <Modal.Body>
          <Row className="g-3">

            {/* =================================================
                PRODUCT NAME
            ================================================= */}

            <Col md={8}>
              <Form.Group>
                <Form.Label>
                  Product Name
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </Form.Group>
            </Col>

            {/* =================================================
                SKU
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  SKU
                </Form.Label>

                <Form.Control
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="SKU-001"
                  required
                />
              </Form.Group>
            </Col>

            {/* =================================================
                BARCODE
            ================================================= */}

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Barcode
                </Form.Label>

                <Form.Control
                  type="text"
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="Scan or enter barcode"
                />
              </Form.Group>
            </Col>

            {/* =================================================
                BRAND
            ================================================= */}

            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  Brand
                </Form.Label>

                <Form.Select
                  name="brandId"
                  value={form.brandId}
                  onChange={handleChange}
                >
                  <option value="">
                    Select brand
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  Category
                </Form.Label>

                <Form.Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* =================================================
                SUPPLIER
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Supplier
                </Form.Label>

                <Form.Select
                  name="supplierId"
                  value={form.supplierId}
                  onChange={handleChange}
                >
                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* =================================================
                BRANCH
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Branch
                </Form.Label>

                <Form.Select
                  name="branchId"
                  value={form.branchId}
                  onChange={handleChange}
                  required
                >
                  {branches.length > 0 ? (
                    branches.map(
                      (branch) => (
                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.name}
                        </option>
                      )
                    )
                  ) : (
                    <option value="1">
                      Main Branch
                    </option>
                  )}
                </Form.Select>

                <Form.Text className="text-muted">
                  Stock will be assigned to this branch.
                </Form.Text>
              </Form.Group>
            </Col>

            {/* =================================================
                INITIAL STOCK
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Initial Stock
                </Form.Label>

                <Form.Control
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />

                <Form.Text className="text-muted">
                  Quantity available when the product is created.
                </Form.Text>
              </Form.Group>
            </Col>

            {/* =================================================
                COST PRICE
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Cost Price
                </Form.Label>

                <Form.Control
                  type="number"
                  name="costPrice"
                  value={form.costPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>

            {/* =================================================
                SELLING PRICE
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Selling Price
                </Form.Label>

                <Form.Control
                  type="number"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>

            {/* =================================================
                WHOLESALE PRICE
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Wholesale Price
                </Form.Label>

                <Form.Control
                  type="number"
                  name="wholesalePrice"
                  value={form.wholesalePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>

            {/* =================================================
                TAX
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Tax Rate (%)
                </Form.Label>

                <Form.Control
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </Form.Group>
            </Col>

            {/* =================================================
                MINIMUM STOCK
            ================================================= */}

            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  Minimum Stock
                </Form.Label>

                <Form.Control
                  type="number"
                  name="minStock"
                  value={form.minStock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                />

                <Form.Text className="text-muted">
                  Product becomes low stock at or below this quantity.
                </Form.Text>
              </Form.Group>
            </Col>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Description
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Product description"
                />
              </Form.Group>
            </Col>

            {/* =================================================
                ACTIVE
            ================================================= */}

            <Col md={6}>
              <Form.Check
                type="switch"
                id="product-active"
                name="isActive"
                label="Active Product"
                checked={form.isActive}
                onChange={handleChange}
              />
            </Col>

            {/* =================================================
                KITCHEN
            ================================================= */}

            <Col md={6}>
              <Form.Check
                type="switch"
                id="product-kitchen"
                name="isKitchen"
                label="Kitchen Product"
                checked={form.isKitchen}
                onChange={handleChange}
              />
            </Col>

          </Row>
        </Modal.Body>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <Modal.Footer>
          <Button
            variant="light"
            onClick={onHide}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
          >
            {product
              ? "Update Product"
              : "Save Product"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;