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

  // Default branch = 1
  branchId: 1,

  costPrice: "",
  sellingPrice: "",
  wholesalePrice: "",

  taxRate: 0,

  description: "",

  minStock: 5,

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
        // BASIC
        // --------------------------------------------------

        name: product.name || "",

        sku: product.sku || "",

        barcode: product.barcode || "",


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
          product.description || "",


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

      // New product
      setForm({
        ...emptyProduct,

        // Always default to Branch 1
        branchId: 1,
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


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (!form.name.trim()) {
      return;
    }

    if (!form.sku.trim()) {
      return;
    }

    if (!form.costPrice) {
      return;
    }

    if (!form.sellingPrice) {
      return;
    }


    // ======================================================
    // API PAYLOAD
    // ======================================================

    const payload = {

      // ----------------------------------------------------
      // BASIC
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

      // Default is Branch ID 1
      branch: form.branchId
        ? Number(form.branchId)
        : 1,


      // ----------------------------------------------------
      // PRICES
      // ----------------------------------------------------

      cost_price:
        Number(form.costPrice),

      selling_price:
        Number(form.sellingPrice),

      wholesale_price:
        form.wholesalePrice
          ? Number(form.wholesalePrice)
          : null,


      // ----------------------------------------------------
      // TAX
      // ----------------------------------------------------

      tax_rate:
        Number(form.taxRate || 0),


      // ----------------------------------------------------
      // DESCRIPTION
      // ----------------------------------------------------

      description:
        form.description || "",


      // ----------------------------------------------------
      // INVENTORY
      // ----------------------------------------------------

      minimum_stock:
        Number(form.minStock || 0),


      // ----------------------------------------------------
      // STATUS
      // ----------------------------------------------------

      is_active:
        Boolean(form.isActive),

      is_kitchen:
        Boolean(form.isKitchen),
    };


    console.log(
      "PRODUCT PAYLOAD:",
      payload
    );


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

                  {categories.map((category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>

                  ))}

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

                  {suppliers.map((supplier) => (

                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>

                  ))}

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

                    branches.map((branch) => (

                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name}
                      </option>

                    ))

                  ) : (

                    // Fallback: Branch 1
                    <option value="1">
                      Branch 1
                    </option>

                  )}

                </Form.Select>

                <Form.Text className="text-muted">
                  Default branch is Branch 1.
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
                />

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
                id="is_active"
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
                id="is_kitchen"
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