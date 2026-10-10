import React from "react";
import {
  Badge,
  Card,
  Dropdown,
  Spinner,
  Table,
} from "react-bootstrap";

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
  const hasActions =
    canEditProduct || canDeleteProduct;

  const columnCount = hasActions ? 11 : 10;

  if (!currentBranch?.id && !loading) {
    return (
      <Card className="dashboard-card border-0">
        <Card.Body className="text-center py-5">
          <i className="bi bi-building fs-2 d-block mb-3 text-muted" />

          <h6>Select a Branch</h6>

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
              <h6 className="mb-1">Products & Inventory</h6>

              <small className="text-muted">
                Branch:{" "}
                <strong>
                  {currentBranch.name || `Branch ${currentBranch.id}`}
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
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>BRAND</th>
                  <th>CATEGORY</th>
                  <th>SUPPLIER</th>
                  <th>CREATED BY</th>
                  <th className="text-end">COST</th>
                  <th className="text-end">PRICE</th>
                  <th className="text-end">STOCK</th>
                  <th>STATUS</th>

                  {hasActions && (
                    <th className="text-end">ACTIONS</th>
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
                      product?.cost_price ??
                        product?.costPrice
                    );

                    const sellingPrice = toNumber(
                      product?.selling_price ??
                        product?.sellingPrice
                    );

                    const isDeleting =
                      deletingProductId === product.id;

                    return (
                      <tr key={product.id}>
                        {/* PRODUCT */}
                        <td>
                          <strong>
                            {product.name || "Unnamed Product"}
                          </strong>

                          {product.barcode && (
                            <small className="d-block text-muted">
                              Barcode: {product.barcode}
                            </small>
                          )}
                        </td>

                        {/* SKU */}
                        <td>
                          <code>{product.sku || "-"}</code>
                        </td>

                        {/* BRAND */}
                        <td>{brand?.name || "-"}</td>

                        {/* CATEGORY */}
                        <td>{category?.name || "-"}</td>

                        {/* SUPPLIER */}
                        <td>{supplier?.name || "-"}</td>

                        {/* CREATED BY */}
                        <td>
                          <span className="fw-semibold">
                            {createdBy}
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
                            {status.text}
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
                                aria-label={`Actions for ${product.name || "product"}`}
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
                                    onClick={() =>
                                      onEdit?.(product)
                                    }
                                  >
                                    <i className="bi bi-pencil me-2" />
                                    Edit
                                  </Dropdown.Item>
                                )}

                                {canEditProduct &&
                                  canDeleteProduct && (
                                    <Dropdown.Divider />
                                  )}

                                {canDeleteProduct && (
                                  <Dropdown.Item
                                    className="text-danger"
                                    onClick={() =>
                                      onDelete?.(product)
                                    }
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
