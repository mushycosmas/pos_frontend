import React from "react";
import {
  Badge,
  Card,
  Dropdown,
  Spinner,
  Table,
} from "react-bootstrap";

// Convert text to sentence case while preserving the remaining text.



const toTitleCase = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProductTable = ({
  products = [],
  loading = false,
  currentBranch,
  getBrand,
  getCategory,
  getSupplier,
  getCreatedBy,
  getStock,
  getProductStatus,
  toNumber,
  formatNumber,
  formatCurrency,
  canEditProduct,
  canDeleteProduct,
  onEdit,
  onDelete,
  deletingProductId,
}) => {
  const hasActions = canEditProduct || canDeleteProduct;
  const columnCount = hasActions ? 11 : 10;

  if (!currentBranch?.id && !loading) {
    return (
      <Card className="dashboard-card border-0">
        <Card.Body className="text-center py-5">
          <i className="bi bi-building fs-2 d-block mb-3 text-muted" />

          <h6>Select a branch</h6>

          <p className="text-muted mb-0">
            Please select a branch to view its products and inventory.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="dashboard-card border-0">
      <Card.Body>
        {/* BRANCH INFORMATION */}
        {currentBranch && (
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h6 className="mb-1">Products &amp; inventory</h6>

              <small className="text-muted">
                Branch:{" "}
                <strong>
                  {toTitleCase(
                    currentBranch.name || `Branch ${currentBranch.id}`
                  )}
                </strong>
              </small>
            </div>

            <Badge bg="light" text="dark" className="border">
              {products.length}{" "}
              {products.length === 1 ? "Product" : "Products"}
            </Badge>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />

            <p className="mt-3 text-muted mb-0">
              Loading products and stock...
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Created by</th>
                  <th className="text-end">Cost</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Stock</th>
                  <th>Status</th>

                  {hasActions && (
                    <th className="text-end">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="text-center py-5 text-muted"
                    >
                      <i className="bi bi-box-seam fs-3 d-block mb-2" />

                      <strong>No products found.</strong>

                      <div className="small mt-1">
                        Try changing your search or filter settings.
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const brand = getBrand?.(product);
                    const category = getCategory?.(product);
                    const supplier = getSupplier?.(product);

                    const createdBy =
                      getCreatedBy?.(product) || "-";

                    const stock = getStock?.(product) ?? 0;

                    const status = getProductStatus?.(product) || {
                      text: "Unknown",
                      variant: "secondary",
                    };

                    const costPrice = toNumber(
                      product?.cost_price ?? product?.costPrice
                    );

                    const sellingPrice = toNumber(
                      product?.selling_price ?? product?.sellingPrice
                    );

                    const isDeleting =
                      deletingProductId === product.id;

                    return (
                      <tr key={product.id}>
                        {/* PRODUCT NAME */}
                        <td>
                          <strong>
                            {toTitleCase(
                              product.name || "Unnamed product"
                            )}
                          </strong>

                          {product.barcode && (
                            <small className="d-block text-muted">
                              Barcode: {product.barcode}
                            </small>
                          )}
                        </td>

                        {/* SKU: KEEP UPPERCASE */}
                        <td>
                          <code>
                            {product.sku
                              ? String(product.sku).toUpperCase()
                              : "-"}
                          </code>
                        </td>

                        {/* BRAND */}
                        <td>
                          {toTitleCase(brand?.name)}
                        </td>

                        {/* CATEGORY */}
                        <td>
                          {toTitleCase(category?.name)}
                        </td>

                        {/* SUPPLIER */}
                        <td>
                          {toTitleCase(supplier?.name)}
                        </td>

                        {/* CREATED BY */}
                        <td>
                          <span className="fw-semibold">
                            {toTitleCase(createdBy)}
                          </span>
                        </td>

                        {/* COST PRICE */}
                        <td className="text-end text-nowrap">
                          {formatCurrency(costPrice)}
                        </td>

                        {/* SELLING PRICE */}
                        <td className="text-end text-nowrap">
                          <strong>
                            {formatCurrency(sellingPrice)}
                          </strong>
                        </td>

                        {/* BRANCH STOCK */}
                        <td className="text-end">
                          <strong>
                            {formatNumber(stock)}
                          </strong>
                        </td>

                        {/* STOCK STATUS */}
                        <td>
                          <Badge bg={status.variant}>
                            {toTitleCase(status.text)}
                          </Badge>
                        </td>

                        {/* ACTIONS */}
                        {hasActions && (
                          <td className="text-end">
                            <Dropdown align="end">
                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="border-0"
                                disabled={isDeleting}
                                aria-label={`Actions for ${
                                  product.name || "product"
                                }`}
                              >
                                {isDeleting ? (
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                  />
                                ) : (
                                  <i className="bi bi-three-dots-vertical" />
                                )}
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                {canEditProduct && (
                                  <Dropdown.Item
                                    onClick={() => onEdit?.(product)}
                                  >
                                    <i className="bi bi-pencil me-2" />
                                    Edit
                                  </Dropdown.Item>
                                )}

                                {canEditProduct && canDeleteProduct && (
                                  <Dropdown.Divider />
                                )}

                                {canDeleteProduct && (
                                  <Dropdown.Item
                                    className="text-danger"
                                    onClick={() => onDelete?.(product)}
                                  >
                                    <i className="bi bi-trash me-2" />
                                    Delete
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductTable;
