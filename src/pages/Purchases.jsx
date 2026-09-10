
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { useAuth } from "../context/AuthContext";
import productsApi from "../services/productsApi";

const Products = () => {
  // =========================================================
  // AUTH / ROLE
  // =========================================================

  const { user } = useAuth();

  const userRole = String(
    user?.role ||
      user?.user_role ||
      user?.role_name ||
      ""
  ).toLowerCase();

  /*
   * Users allowed to see Cost Price:
   * - admin
   * - owner
   * - manager
   * - storekeeper
   *
   * Cashier can see Selling Price only.
   */
  const canViewCostPrice = [
    "admin",
    "owner",
    "manager",
    "storekeeper",
  ].includes(userRole);

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brand: "",
    category: "",
    supplier: "",
    cost_price: "",
    price: "",
    stock: "",
    min_stock: "",
  });

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductStock = (product) => {
    return Number(
      product?.stock ??
        product?.quantity ??
        product?.current_stock ??
        0
    );
  };

  const getMinimumStock = (product) => {
    return Number(
      product?.min_stock ??
        product?.minimum_stock ??
        product?.reorder_level ??
        0
    );
  };

  const getProductStatus = (product) => {
    const stock = getProductStock(product);
    const minimum = getMinimumStock(product);

    if (stock <= 0) {
      return "out";
    }

    if (minimum > 0 && stock <= minimum) {
      return "low";
    }

    return "available";
  };

  const getStatusBadge = (product) => {
    const status = getProductStatus(product);

    if (status === "out") {
      return (
        <Badge bg="danger">
          Out of Stock
        </Badge>
      );
    }

    if (status === "low") {
      return (
        <Badge bg="warning" text="dark">
          Low Stock
        </Badge>
      );
    }

    return (
      <Badge bg="success">
        In Stock
      </Badge>
    );
  };

  const getName = (object) => {
    if (!object) {
      return "-";
    }

    if (typeof object === "string") {
      return object;
    }

    return (
      object.name ||
      object.title ||
      object.label ||
      object.brand_name ||
      object.category_name ||
      "-"
    );
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * IMPORTANT:
       * The imported service is productsApi,
       * so we must use productsApi here.
       */
      const response = await productsApi.getAll();

      const data =
        response?.data?.results ||
        response?.data ||
        [];

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        String(product?.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(product?.sku || "")
          .toLowerCase()
          .includes(keyword) ||
        String(getName(product?.brand))
          .toLowerCase()
          .includes(keyword) ||
        String(getName(product?.category))
          .toLowerCase()
          .includes(keyword) ||
        String(getName(product?.supplier))
          .toLowerCase()
          .includes(keyword);

      const status =
        getProductStatus(product);

      const matchesStatus =
        statusFilter === "all" ||
        (
          statusFilter === "available" &&
          status === "available"
        ) ||
        (
          statusFilter === "low" &&
          status === "low"
        ) ||
        (
          statusFilter === "out" &&
          status === "out"
        );

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    statusFilter,
  ]);

  // =========================================================
  // FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      brand: "",
      category: "",
      supplier: "",
      cost_price: "",
      price: "",
      stock: "",
      min_stock: "",
    });

    setEditingProduct(null);
  };

  const handleShowAdd = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleShowEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product?.name || "",

      sku: product?.sku || "",

      brand:
        typeof product?.brand === "object"
          ? product?.brand?.id || ""
          : product?.brand || "",

      category:
        typeof product?.category === "object"
          ? product?.category?.id || ""
          : product?.category || "",

      supplier:
        typeof product?.supplier === "object"
          ? product?.supplier?.id || ""
          : product?.supplier || "",

      /*
       * Only load cost price into the form
       * for authorized users.
       */
      cost_price: canViewCostPrice
        ? product?.cost_price ?? ""
        : "",

      price: product?.price ?? "",

      stock:
        product?.stock ??
        product?.quantity ??
        product?.current_stock ??
        "",

      min_stock:
        product?.min_stock ??
        product?.minimum_stock ??
        product?.reorder_level ??
        "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name.trim(),

        sku: formData.sku.trim(),

        brand:
          formData.brand || null,

        category:
          formData.category || null,

        supplier:
          formData.supplier || null,

        price:
          Number(formData.price || 0),

        stock:
          Number(formData.stock || 0),

        min_stock:
          Number(formData.min_stock || 0),
      };

      /*
       * Only send cost_price when the current
       * user is allowed to manage it.
       */
      if (canViewCostPrice) {
        payload.cost_price =
          Number(
            formData.cost_price || 0
          );
      }

      if (editingProduct) {
        await productsApi.update(
          editingProduct.id,
          payload
        );

        setSuccess(
          "Product updated successfully."
        );
      } else {
        await productsApi.create(
          payload
        );

        setSuccess(
          "Product created successfully."
        );
      }

      setShowModal(false);

      resetForm();

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([field, message]) => {
                const value =
                  Array.isArray(message)
                    ? message.join(", ")
                    : String(message);

                return `${field}: ${value}`;
              }
            )
            .join(" | ");

        setError(
          messages ||
            "Failed to save product."
        );
      } else {
        setError(
          responseData ||
            "Failed to save product."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleShowDelete = (
    product
  ) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await productsApi.delete(
        deletingProduct.id
      );

      setSuccess(
        "Product deleted successfully."
      );

      setShowDeleteModal(false);

      setDeletingProduct(null);

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalProducts =
    products.length;

  const availableProducts =
    products.filter(
      (product) =>
        getProductStatus(product) ===
        "available"
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        getProductStatus(product) ===
        "low"
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        getProductStatus(product) ===
        "out"
    ).length;

  // =========================================================
  // TABLE COLUMN COUNT
  // =========================================================

  const tableColumnCount =
    canViewCostPrice ? 11 : 10;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-3">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Row className="align-items-center mb-3">

        <Col>
          <h4 className="mb-1">
            Products
          </h4>

          <p className="text-muted mb-0">
            Manage your products, prices
            and stock.
          </p>
        </Col>

        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleShowAdd}
          >
            + Add Product
          </Button>
        </Col>

      </Row>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() =>
            setSuccess("")
          }
        >
          {success}
        </Alert>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <Row className="g-3 mb-3">

        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="text-muted small">
                TOTAL PRODUCTS
              </div>

              <h4 className="mb-0">
                {totalProducts}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="text-muted small">
                IN STOCK
              </div>

              <h4 className="mb-0 text-success">
                {availableProducts}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="text-muted small">
                LOW STOCK
              </div>

              <h4 className="mb-0 text-warning">
                {lowStockProducts}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="text-muted small">
                OUT OF STOCK
              </div>

              <h4 className="mb-0 text-danger">
                {outOfStockProducts}
              </h4>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card className="mb-3">

        <Card.Body>

          <Row className="g-2">

            <Col md={8}>

              <InputGroup>

                <InputGroup.Text>
                  Search
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search by product, SKU, brand, category or supplier..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </InputGroup>

            </Col>

            <Col md={4}>

              <Form.Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="all">
                  All Status
                </option>

                <option value="available">
                  In Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>

              </Form.Select>

            </Col>

          </Row>

        </Card.Body>

      </Card>

      {/* =====================================================
          PRODUCTS TABLE
      ===================================================== */}

      <Card>

        <Card.Body className="p-0">

          <div className="table-responsive">

            <Table
              hover
              bordered
              className="mb-0 align-middle"
            >

              <thead className="table-light">

                <tr>

                  <th>
                    PRODUCT
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    BRAND
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    SUPPLIER
                  </th>

                  <th>
                    CREATED BY
                  </th>

                  {/* COST PRICE
                      ONLY AUTHORIZED USERS */}
                  {canViewCostPrice && (
                    <th>
                      COST PRICE
                    </th>
                  )}

                  {/* SELLING PRICE
                      EVERYONE CAN SEE */}
                  <th>
                    SELLING PRICE
                  </th>

                  <th>
                    STOCK
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={
                        tableColumnCount
                      }
                      className="text-center py-5"
                    >

                      <Spinner
                        animation="border"
                        size="sm"
                      />

                      <span className="ms-2">
                        Loading products...
                      </span>

                    </td>

                  </tr>

                ) : filteredProducts.length ===
                  0 ? (

                  <tr>

                    <td
                      colSpan={
                        tableColumnCount
                      }
                      className="text-center py-5 text-muted"
                    >
                      No products found.
                    </td>

                  </tr>

                ) : (

                  filteredProducts.map(
                    (product) => {

                      const stock =
                        getProductStock(
                          product
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                        >

                          {/* PRODUCT */}
                          <td>
                            <strong>
                              {
                                product?.name ||
                                "-"
                              }
                            </strong>
                          </td>

                          {/* SKU */}
                          <td>
                            {
                              product?.sku ||
                              "-"
                            }
                          </td>

                          {/* BRAND */}
                          <td>
                            {getName(
                              product?.brand
                            )}
                          </td>

                          {/* CATEGORY */}
                          <td>
                            {getName(
                              product?.category
                            )}
                          </td>

                          {/* SUPPLIER */}
                          <td>
                            {getName(
                              product?.supplier
                            )}
                          </td>

                          {/* CREATED BY */}
                          <td>
                            {getName(
                              product?.created_by
                            )}
                          </td>

                          {/* COST PRICE */}
                          {canViewCostPrice && (
                            <td>
                              {formatCurrency(
                                product?.cost_price
                              )}
                            </td>
                          )}

                          {/* SELLING PRICE */}
                          <td>
                            <strong>
                              {formatCurrency(
                                product?.price
                              )}
                            </strong>
                          </td>

                          {/* STOCK */}
                          <td>
                            {stock}
                          </td>

                          {/* STATUS */}
                          <td>
                            {getStatusBadge(
                              product
                            )}
                          </td>

                          {/* ACTION */}
                          <td>

                            <div className="d-flex gap-2">

                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  handleShowEdit(
                                    product
                                  )
                                }
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() =>
                                  handleShowDelete(
                                    product
                                  )
                                }
                              >
                                Delete
                              </Button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </Table>

          </div>

        </Card.Body>

      </Card>

      {/* =====================================================
          ADD / EDIT PRODUCT MODAL
      ===================================================== */}

      <Modal
        show={showModal}
        onHide={() => {
          if (!saving) {
            setShowModal(false);
          }
        }}
        size="lg"
        centered
      >

        <Form
          onSubmit={handleSubmit}
        >

          <Modal.Header closeButton>

            <Modal.Title>
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </Modal.Title>

          </Modal.Header>

          <Modal.Body>

            <Row className="g-3">

              {/* PRODUCT NAME */}
              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Product Name
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </Form.Group>

              </Col>

              {/* SKU */}
              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    SKU
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="sku"
                    value={
                      formData.sku
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </Form.Group>

              </Col>

              {/* BRAND */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Brand
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="brand"
                    value={
                      formData.brand
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Brand ID"
                  />

                </Form.Group>

              </Col>

              {/* CATEGORY */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Category
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Category ID"
                  />

                </Form.Group>

              </Col>

              {/* SUPPLIER */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Supplier
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="supplier"
                    value={
                      formData.supplier
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Supplier ID"
                  />

                </Form.Group>

              </Col>

              {/* COST PRICE
                  NOT SHOWN TO CASHIER */}
              {canViewCostPrice && (
                <Col md={4}>

                  <Form.Group>

                    <Form.Label>
                      Cost Price
                    </Form.Label>

                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      name="cost_price"
                      value={
                        formData.cost_price
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <Form.Text className="text-muted">
                      Purchase/cost price.
                    </Form.Text>

                  </Form.Group>

                </Col>
              )}

              {/* SELLING PRICE
                  VISIBLE TO CASHIER */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Selling Price
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={
                      formData.price
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </Form.Group>

              </Col>

              {/* STOCK */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Stock
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>

              </Col>

              {/* MINIMUM STOCK */}
              <Col md={4}>

                <Form.Group>

                  <Form.Label>
                    Minimum Stock
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="0"
                    name="min_stock"
                    value={
                      formData.min_stock
                    }
                    onChange={
                      handleChange
                    }
                  />

                </Form.Group>

              </Col>

            </Row>

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="secondary"
              onClick={() =>
                setShowModal(false)
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >

              {saving ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />

                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Save Product"
              )}

            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!saving) {
            setShowDeleteModal(
              false
            );
          }
        }}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Delete Product
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          Are you sure you want to
          delete{" "}

          <strong>
            {
              deletingProduct?.name ||
              "this product"
            }
          </strong>
          ?

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() =>
              setShowDeleteModal(
                false
              )
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={
              handleDelete
            }
            disabled={saving}
          >

            {saving ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />

                Deleting...
              </>
            ) : (
              "Delete"
            )}

          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
};

export default Products;

