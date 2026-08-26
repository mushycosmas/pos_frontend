import React, {
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
  Dropdown,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import ProductModal from "../components/inventory/ProductModal";

import productsApi from "../services/productsApi";
import brandsApi from "../services/brandsApi";
import categoriesApi from "../services/categoriesApi";
import suppliersApi from "../services/suppliersApi";

const Products = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // =====================================================
  // HELPERS
  // =====================================================

  const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const formatNumber = (value) => {
    return toNumber(value).toLocaleString("en-TZ");
  };

  const formatCurrency = (value) => {
    return `TSh ${formatNumber(value)}`;
  };

  const normalizeResponse = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.results || [];
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await productsApi.getAll();

      setProducts(normalizeResponse(data));
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setError(
        "Failed to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD BRANDS
  // =====================================================

  const loadBrands = async () => {
    try {
      const data = await brandsApi.getAll();

      setBrands(normalizeResponse(data));
    } catch (err) {
      console.error(
        "Failed to load brands:",
        err
      );
    }
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();

      setCategories(normalizeResponse(data));
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err
      );
    }
  };

  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  const loadSuppliers = async () => {
    try {
      const data = await suppliersApi.getAll();

      setSuppliers(normalizeResponse(data));
    } catch (err) {
      console.error(
        "Failed to load suppliers:",
        err
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadProducts(),
        loadBrands(),
        loadCategories(),
        loadSuppliers(),
      ]);
    };

    loadInitialData();
  }, []);

  // =====================================================
  // GET BRAND
  // =====================================================

  const getBrand = (product) => {
    if (product.brand_name) {
      return {
        name: product.brand_name,
      };
    }

    const brandId =
      product.brand ??
      product.brand_id ??
      product.brandId;

    return brands.find(
      (brand) =>
        Number(brand.id) === Number(brandId)
    );
  };

  // =====================================================
  // GET CATEGORY
  // =====================================================

  const getCategory = (product) => {
    if (product.category_name) {
      return {
        name: product.category_name,
      };
    }

    const categoryId =
      product.category ??
      product.category_id ??
      product.categoryId;

    return categories.find(
      (category) =>
        Number(category.id) === Number(categoryId)
    );
  };

  // =====================================================
  // GET SUPPLIER
  // =====================================================

  const getSupplier = (product) => {
    if (product.supplier_name) {
      return {
        name: product.supplier_name,
      };
    }

    const supplierId =
      product.supplier ??
      product.supplier_id ??
      product.supplierId;

    return suppliers.find(
      (supplier) =>
        Number(supplier.id) === Number(supplierId)
    );
  };

  // =====================================================
  // GET STOCK
  // =====================================================

  const getStock = (product) => {
    return toNumber(
      product.stock ??
        product.quantity ??
        product.stock_quantity
    );
  };

  // =====================================================
  // GET MINIMUM STOCK
  // =====================================================

  const getMinStock = (product) => {
    return toNumber(
      product.min_stock ??
        product.minStock ??
        product.reorder_level
    );
  };

  // =====================================================
  // PRODUCT STATUS
  // =====================================================

  const getProductStatus = (product) => {
    const stock = getStock(product);
    const minStock = getMinStock(product);

    if (stock <= 0) {
      return {
        text: "Out of Stock",
        variant: "danger",
      };
    }

    if (
      minStock > 0 &&
      stock <= minStock
    ) {
      return {
        text: "Low Stock",
        variant: "warning",
      };
    }

    return {
      text: "In Stock",
      variant: "success",
    };
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const name = String(
        product.name || ""
      ).toLowerCase();

      const sku = String(
        product.sku || ""
      ).toLowerCase();

      const barcode = String(
        product.barcode || ""
      ).toLowerCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        sku.includes(keyword) ||
        barcode.includes(keyword);

      // -----------------------------------------------
      // BRAND FILTER
      // -----------------------------------------------

      const productBrand =
        product.brand ??
        product.brand_id ??
        product.brandId;

      const matchesBrand =
        brandFilter === "all" ||
        Number(productBrand) ===
          Number(brandFilter);

      // -----------------------------------------------
      // CATEGORY FILTER
      // -----------------------------------------------

      const productCategory =
        product.category ??
        product.category_id ??
        product.categoryId;

      const matchesCategory =
        categoryFilter === "all" ||
        Number(productCategory) ===
          Number(categoryFilter);

      // -----------------------------------------------
      // STATUS FILTER
      // -----------------------------------------------

      const stock = getStock(product);
      const minStock = getMinStock(product);

      let matchesStatus = true;

      if (statusFilter === "in-stock") {
        matchesStatus =
          stock > minStock;
      }

      if (statusFilter === "low-stock") {
        matchesStatus =
          stock > 0 &&
          minStock > 0 &&
          stock <= minStock;
      }

      if (statusFilter === "out-of-stock") {
        matchesStatus =
          stock <= 0;
      }

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    brandFilter,
    categoryFilter,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (sum, product) =>
        sum + getStock(product),
      0
    );

  const inventoryValue =
    products.reduce(
      (sum, product) => {
        const stock =
          getStock(product);

        const cost =
          toNumber(
            product.cost_price ??
              product.costPrice
          );

        return sum + stock * cost;
      },
      0
    );

  const lowStockProducts =
    products.filter(
      (product) => {
        const stock =
          getStock(product);

        const minStock =
          getMinStock(product);

        return (
          stock > 0 &&
          minStock > 0 &&
          stock <= minStock
        );
      }
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        getStock(product) <= 0
    ).length;

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await productsApi.delete(id);

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !== id
          )
      );
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      alert(
        "Failed to delete product."
      );
    }
  };

  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  const handleSave = async (data) => {
    try {
      if (editingProduct) {
        await productsApi.update(
          editingProduct.id,
          data
        );
      } else {
        await productsApi.create(data);
      }

      setShowModal(false);
      setEditingProduct(null);

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      alert(
        "Failed to save product."
      );
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleReset = () => {
    setSearch("");
    setBrandFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Products</h2>

          <p className="mb-0">
            Manage your products, pricing and stock.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAddProduct}
        >
          <i className="bi bi-plus-lg me-2" />
          Add Product
        </Button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert variant="danger">
          {error}

          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={loadProducts}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <Row className="g-3 mb-4">

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Total Products
              </small>

              <h4 className="mt-2 mb-0">
                {formatNumber(
                  totalProducts
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Total Stock
              </small>

              <h4 className="mt-2 mb-0">
                {formatNumber(
                  totalStock
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Inventory Value
              </small>

              <h4 className="mt-2 mb-0">
                {formatCurrency(
                  inventoryValue
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Low / Out Stock
              </small>

              <h4 className="mt-2 mb-0 text-danger">
                {formatNumber(
                  lowStockProducts +
                    outOfStockProducts
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* =================================================
          PRODUCTS TABLE
      ================================================= */}

      <Card className="dashboard-card border-0">
        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">
                Product List
              </h5>

              <small className="text-muted">
                {filteredProducts.length} products
                displayed
              </small>
            </div>
          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <Row className="g-2 mb-4">

            {/* SEARCH */}

            <Col lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search product, SKU or barcode..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />
              </InputGroup>
            </Col>

            {/* BRAND */}

            <Col lg={2}>
              <Form.Select
                value={brandFilter}
                onChange={(e) =>
                  setBrandFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Brands
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
            </Col>

            {/* CATEGORY */}

            <Col lg={2}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Categories
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
            </Col>

            {/* STATUS */}

            <Col lg={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Status
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>
              </Form.Select>
            </Col>

            {/* RESET */}

            <Col lg={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-clockwise me-1" />
                Reset
              </Button>
            </Col>

          </Row>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <p className="mt-3 text-muted">
                Loading products...
              </p>

            </div>
          ) : (

            <div className="table-responsive">

              <Table
                hover
                className="align-middle"
              >

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>BRAND</th>
                    <th>CATEGORY</th>
                    <th>SUPPLIER</th>
                    <th>COST</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.length === 0 ? (

                    <tr>
                      <td
                        colSpan="10"
                        className="text-center py-5 text-muted"
                      >
                        No products found.
                      </td>
                    </tr>

                  ) : (

                    filteredProducts.map(
                      (product) => {

                        const brand =
                          getBrand(product);

                        const category =
                          getCategory(product);

                        const supplier =
                          getSupplier(product);

                        const stock =
                          getStock(product);

                        const status =
                          getProductStatus(
                            product
                          );

                        const costPrice =
                          toNumber(
                            product.cost_price ??
                              product.costPrice
                          );

                        const sellingPrice =
                          toNumber(
                            product.selling_price ??
                              product.sellingPrice
                          );

                        return (
                          <tr
                            key={product.id}
                          >

                            {/* PRODUCT */}

                            <td>
                              <strong>
                                {product.name}
                              </strong>

                              {product.barcode && (
                                <small className="d-block text-muted">
                                  {product.barcode}
                                </small>
                              )}
                            </td>

                            {/* SKU */}

                            <td>
                              <code>
                                {product.sku ||
                                  "-"}
                              </code>
                            </td>

                            {/* BRAND */}

                            <td>
                              {brand?.name ||
                                "-"}
                            </td>

                            {/* CATEGORY */}

                            <td>
                              {category?.name ||
                                "-"}
                            </td>

                            {/* SUPPLIER */}

                            <td>
                              {supplier?.name ||
                                "-"}
                            </td>

                            {/* COST */}

                            <td>
                              {formatCurrency(
                                costPrice
                              )}
                            </td>

                            {/* PRICE */}

                            <td>
                              <strong>
                                {formatCurrency(
                                  sellingPrice
                                )}
                              </strong>
                            </td>

                            {/* STOCK */}

                            <td>
                              <strong>
                                {formatNumber(
                                  stock
                                )}
                              </strong>
                            </td>

                            {/* STATUS */}

                            <td>
                              <Badge
                                bg={
                                  status.variant
                                }
                              >
                                {
                                  status.text
                                }
                              </Badge>
                            </td>

                            {/* ACTION */}

                            <td>

                              <Dropdown align="end">

                                <Dropdown.Toggle
                                  variant="light"
                                  size="sm"
                                  className="border-0"
                                >
                                  <i className="bi bi-three-dots-vertical" />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>

                                  <Dropdown.Item
                                    onClick={() =>
                                      handleEdit(
                                        product
                                      )
                                    }
                                  >
                                    <i className="bi bi-pencil me-2" />
                                    Edit
                                  </Dropdown.Item>

                                  <Dropdown.Item
                                    className="text-danger"
                                    onClick={() =>
                                      handleDelete(
                                        product.id
                                      )
                                    }
                                  >
                                    <i className="bi bi-trash me-2" />
                                    Delete
                                  </Dropdown.Item>

                                </Dropdown.Menu>

                              </Dropdown>

                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>

              </Table>

            </div>

          )}

        </Card.Body>
      </Card>

      {/* =================================================
          PRODUCT MODAL
      ================================================= */}

      <ProductModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        product={editingProduct}
        brands={brands}
        categories={categories}
        suppliers={suppliers}
      />

    </div>
  );
};

export default Products;