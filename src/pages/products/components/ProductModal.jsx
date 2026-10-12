import React, { useEffect, useState } from "react";

// ==========================================================
// INITIAL FORM DATA
// ==========================================================

const createInitialForm = (product, currentBranch) => {
  const productBranch =
    product?.branch && typeof product.branch === "object"
      ? product.branch.id
      : product?.branch ?? product?.branch_id;

  const branchId = currentBranch?.id ?? productBranch ?? "";

  return {
    name: product?.name || product?.product_name || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    description: product?.description || "",

    brand:
      product?.brand?.id != null
        ? String(product.brand.id)
        : String(product?.brand ?? product?.brand_id ?? ""),

    category:
      product?.category?.id != null
        ? String(product.category.id)
        : String(product?.category ?? product?.category_id ?? ""),

    supplier:
      product?.supplier?.id != null
        ? String(product.supplier.id)
        : String(product?.supplier ?? product?.supplier_id ?? ""),

    cost_price:
      product?.cost_price != null
        ? String(product.cost_price)
        : product?.cost != null
          ? String(product.cost)
          : product?.purchase_price != null
            ? String(product.purchase_price)
            : "",

    selling_price:
      product?.selling_price != null
        ? String(product.selling_price)
        : product?.price != null
          ? String(product.price)
          : "",

    minimum_stock:
      product?.minimum_stock != null
        ? String(product.minimum_stock)
        : product?.min_stock != null
          ? String(product.min_stock)
          : product?.reorder_level != null
            ? String(product.reorder_level)
            : product?.min_quantity != null
              ? String(product.min_quantity)
              : "0",

    unit: product?.unit || "pcs",

    branch: branchId !== "" ? String(branchId) : "",

    is_active: product?.is_active ?? true,
  };
};

// ==========================================================
// ERROR MESSAGE
// ==========================================================

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return error?.message || "Failed to save product. Please try again.";
};

// ==========================================================
// PRODUCT MODAL
// ==========================================================

const ProductModal = ({
  show,
  product,
  currentBranch,
  brands = [],
  categories = [],
  suppliers = [],
  saving = false,
  onHide,
  onSave,
}) => {
  const [formData, setFormData] = useState(() =>
    createInitialForm(product, currentBranch)
  );

  const [error, setError] = useState("");

  const isEditing = Boolean(product?.id);

  // --------------------------------------------------------
  // INITIALIZE FORM
  // --------------------------------------------------------

  useEffect(() => {
    if (show) {
      setFormData(createInitialForm(product, currentBranch));
      setError("");
    }
  }, [show, product, currentBranch]);

  // --------------------------------------------------------
  // HANDLE INPUT CHANGES
  // --------------------------------------------------------

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  // --------------------------------------------------------
  // VALIDATE FORM
  // --------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    const branchId = Number(currentBranch?.id);

    if (
      !currentBranch?.id ||
      !Number.isInteger(branchId) ||
      branchId <= 0
    ) {
      setError("Select a valid active branch before saving.");
      return;
    }

    if (
      formData.cost_price === "" ||
      !Number.isFinite(Number(formData.cost_price)) ||
      Number(formData.cost_price) < 0
    ) {
      setError("Enter a valid, non-negative cost price.");
      return;
    }

    if (
      formData.selling_price === "" ||
      !Number.isFinite(Number(formData.selling_price)) ||
      Number(formData.selling_price) < 0
    ) {
      setError("Enter a valid, non-negative selling price.");
      return;
    }

    if (
      formData.minimum_stock === "" ||
      !Number.isFinite(Number(formData.minimum_stock)) ||
      Number(formData.minimum_stock) < 0
    ) {
      setError("Enter a valid, non-negative minimum stock.");
      return;
    }

    if (!Number.isInteger(Number(formData.minimum_stock))) {
      setError("Minimum stock must be a whole number.");
      return;
    }

    // ------------------------------------------------------
    // BUILD API PAYLOAD
    // ------------------------------------------------------

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || null,
      barcode: formData.barcode.trim() || null,
      description: formData.description.trim(),

      brand: formData.brand ? Number(formData.brand) : null,
      category: formData.category ? Number(formData.category) : null,
      supplier: formData.supplier ? Number(formData.supplier) : null,

      cost_price: Number(formData.cost_price),
      selling_price: Number(formData.selling_price),
      minimum_stock: Number(formData.minimum_stock),

      unit: formData.unit,

      // Always use the currently selected branch.
      branch: branchId,

      is_active: formData.is_active,
    };

    // Debug: verify branch ID before the API request.
    console.log("Active branch:", currentBranch);
    console.log("Product payload:", payload);
    console.log("Submitted branch ID:", payload.branch);

    setError("");

    // ------------------------------------------------------
    // SAVE PRODUCT
    // ------------------------------------------------------

    try {
      await onSave(payload);
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(getErrorMessage(err));
    }
  };

  if (!show) return null;

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i
                className={`bi ${
                  isEditing ? "bi-pencil-square" : "bi-box-seam"
                } me-2`}
              />
              {isEditing ? "Edit Product" : "Add Product"}
            </h5>

            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              disabled={saving}
              aria-label="Close"
            />
          </div>

          <form onSubmit={handleSubmit}>
            {/* BODY */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2" />
                  {error}
                </div>
              )}

              {/* ACTIVE BRANCH */}
              <div className="alert alert-light border">
                <i className="bi bi-geo-alt me-2" />

                Selected branch:{" "}
                <strong>
                  {currentBranch?.name || "No branch selected"}
                </strong>

                <div className="small text-muted mt-1">
                  Branch ID: {currentBranch?.id ?? "Not available"}
                </div>

                <div className="small text-muted">
                  The active branch is assigned automatically.
                </div>
              </div>

              <div className="row">

                {/* PRODUCT NAME */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                    disabled={saving}
                  />
                </div>

               {/* SKU - OPTIONAL */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            SKU <small className="text-muted">(Optional)</small>
          </label>
          <input
            className="form-control"
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Enter SKU (optional)"
            disabled={saving}
          />
        </div>

        {/* BARCODE - OPTIONAL */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            Barcode <small className="text-muted">(Optional)</small>
          </label>
          <input
            className="form-control"
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Enter barcode (optional)"
            disabled={saving}
          />
        </div>

                {/* UNIT */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="packet">Packet</option>
                    <option value="carton">Carton</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Litre (L)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="m">Metre (m)</option>
                    <option value="pair">Pair</option>
                    <option value="set">Set</option>
                  </select>
                </div>

                {/* BRAND */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Brand</label>
                  <select
                    className="form-select"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name ||
                          brand.brand_name ||
                          `Brand ${brand.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATEGORY */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name ||
                          category.category_name ||
                          `Category ${category.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUPPLIER */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Supplier</label>
                  <select
                    className="form-select"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name ||
                          supplier.supplier_name ||
                          supplier.company_name ||
                          `Supplier ${supplier.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COST PRICE */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Cost Price (TSh) *</label>
                  <input
                    className="form-control"
                    type="number"
                    name="cost_price"
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    disabled={saving}
                  />
                </div>

                {/* SELLING PRICE */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Selling Price (TSh) *
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="selling_price"
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    disabled={saving}
                  />
                </div>

                {/* MINIMUM STOCK */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Minimum Stock</label>
                  <input
                    className="form-control"
                    type="number"
                    name="minimum_stock"
                    min="0"
                    step="1"
                    value={formData.minimum_stock}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={saving}
                  />
                  <small className="text-muted">
                    Used to identify low-stock products.
                  </small>
                </div>

                {/* BRANCH */}
                <div className="col-md-12 mb-3">
                  <label className="form-label">Branch</label>
                  <input
                    className="form-control"
                    value={currentBranch?.name || ""}
                    readOnly
                    disabled={!currentBranch?.id}
                  />
                  <small className="text-muted">
                    The active branch is assigned automatically.
                  </small>
                </div>

                {/* DESCRIPTION */}
                <div className="col-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    disabled={saving}
                  />
                </div>

                {/* ACTIVE STATUS */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="product_is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={saving}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="product_is_active"
                    >
                      Active Product
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving || !currentBranch?.id}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />
                    {isEditing ? "Update Product" : "Save Product"}
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProductModal;
