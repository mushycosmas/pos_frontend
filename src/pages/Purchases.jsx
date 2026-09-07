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
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import PurchaseModal from "../components/inventory/PurchaseModal";

import purchasesApi from "../services/purchasesApi";
import productsApi from "../services/productsApi";
import suppliersApi from "../services/suppliersApi";
import branchesApi from "../services/branchesApi";

// ==========================================================
// CONSTANTS
// ==========================================================

const PURCHASE_STATUSES = [
  "draft",
  "ordered",
  "received",
  "partially_received",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "partial",
];

// ==========================================================
// PURCHASES PAGE
// ==========================================================

const Purchases = () => {
  // ========================================================
  // STATE
  // ========================================================

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [saving, setSaving] = useState(false);

  // ========================================================
  // NORMALIZE API RESPONSE
  // ========================================================

  const normalizeResponse = useCallback((data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  }, []);

  // ========================================================
  // LOAD PURCHASES
  // ========================================================

  const loadPurchases = useCallback(async () => {
    const data = await purchasesApi.getAll();

    const purchaseList = normalizeResponse(data);

    setPurchases(purchaseList);

    return purchaseList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD PRODUCTS
  // ========================================================

  const loadProducts = useCallback(async () => {
    const data = await productsApi.getAll();

    const productList = normalizeResponse(data);

    setProducts(productList);

    return productList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD SUPPLIERS
  // ========================================================

  const loadSuppliers = useCallback(async () => {
    const data = await suppliersApi.getAll();

    const supplierList = normalizeResponse(data);

    setSuppliers(supplierList);

    return supplierList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD BRANCHES
  // ========================================================

  const loadBranches = useCallback(async () => {
    const data = await branchesApi.getAll();

    const branchList = normalizeResponse(data);

    setBranches(branchList);

    return branchList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD ALL DATA
  // ========================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadPurchases(),
        loadProducts(),
        loadSuppliers(),
        loadBranches(),
      ]);
    } catch (err) {
      console.error(
        "Failed to load purchase data:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );

      setError(
        "Failed to load purchase data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadPurchases,
    loadProducts,
    loadSuppliers,
    loadBranches,
  ]);

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================================
  // HELPERS
  // ========================================================

  const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  // ========================================================
  // FORMAT CURRENCY
  // ========================================================

  const formatCurrency = (value) => {
    return `TSh ${toNumber(value).toLocaleString(
      "en-TZ",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ========================================================
  // FORMAT DATE
  // ========================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-TZ",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }
    );
  };

  // ========================================================
  // GET SUPPLIER
  // ========================================================

  const getSupplier = (purchase) => {
    if (purchase?.supplier_name) {
      return {
        name: purchase.supplier_name,
      };
    }

    if (
      purchase?.supplier &&
      typeof purchase.supplier === "object"
    ) {
      return purchase.supplier;
    }

    const supplierId =
      purchase?.supplier ??
      purchase?.supplier_id ??
      purchase?.supplierId;

    return suppliers.find(
      (supplier) =>
        Number(supplier.id) ===
        Number(supplierId)
    );
  };

  // ========================================================
  // GET BRANCH
  // ========================================================

  const getBranch = (purchase) => {
    if (purchase?.branch_name) {
      return {
        name: purchase.branch_name,
      };
    }

    if (
      purchase?.branch &&
      typeof purchase.branch === "object"
    ) {
      return purchase.branch;
    }

    const branchId =
      purchase?.branch ??
      purchase?.branch_id ??
      purchase?.branchId;

    return branches.find(
      (branch) =>
        Number(branch.id) ===
        Number(branchId)
    );
  };

  // ========================================================
  // GET CREATED BY
  // ========================================================

  const getCreatedBy = (purchase) => {
    // Preferred backend field
    if (
      purchase?.created_by_name &&
      typeof purchase.created_by_name === "string"
    ) {
      return purchase.created_by_name;
    }

    // Alternative camelCase field
    if (
      purchase?.createdByName &&
      typeof purchase.createdByName === "string"
    ) {
      return purchase.createdByName;
    }

    // If API returns created_by as a string
    if (
      typeof purchase?.created_by === "string"
    ) {
      return purchase.created_by;
    }

    // If API returns createdBy as a string
    if (
      typeof purchase?.createdBy === "string"
    ) {
      return purchase.createdBy;
    }

    // Nested created_by object
    if (
      purchase?.created_by &&
      typeof purchase.created_by === "object"
    ) {
      return (
        purchase.created_by.full_name ||
        purchase.created_by.name ||
        purchase.created_by.username ||
        purchase.created_by.email ||
        "-"
      );
    }

    // Nested createdBy object
    if (
      purchase?.createdBy &&
      typeof purchase.createdBy === "object"
    ) {
      return (
        purchase.createdBy.full_name ||
        purchase.createdBy.name ||
        purchase.createdBy.username ||
        purchase.createdBy.email ||
        "-"
      );
    }

    return "-";
  };

  // ========================================================
  // GET PURCHASE ITEMS
  // ========================================================

  const getItems = (purchase) => {
    if (Array.isArray(purchase?.items)) {
      return purchase.items;
    }

    if (
      Array.isArray(
        purchase?.purchase_items
      )
    ) {
      return purchase.purchase_items;
    }

    return [];
  };

  // ========================================================
  // GET PURCHASE TOTAL
  // ========================================================

  const getPurchaseTotal = (purchase) => {
    return toNumber(
      purchase?.total ??
        purchase?.total_amount ??
        purchase?.grand_total
    );
  };

  // ========================================================
  // GET PURCHASE NUMBER
  // ========================================================

  const getPurchaseNumber = (purchase) => {
    return (
      purchase?.purchase_number ||
      purchase?.purchaseNumber ||
      "-"
    );
  };

  // ========================================================
  // GET PRODUCT NAME
  // ========================================================

  const getProductName = (item) => {
    if (item?.product_name) {
      return item.product_name;
    }

    if (
      item?.product &&
      typeof item.product === "object"
    ) {
      return (
        item.product.name ||
        item.product.product_name ||
        "-"
      );
    }

    const productId =
      item?.product ??
      item?.product_id ??
      item?.productId;

    const product = products.find(
      (product) =>
        Number(product.id) ===
        Number(productId)
    );

    return product?.name || "-";
  };

  // ========================================================
  // GET STATUS
  // ========================================================

  const getStatus = (purchase) => {
    return PURCHASE_STATUSES.includes(
      purchase?.status
    )
      ? purchase.status
      : "draft";
  };

  // ========================================================
  // GET PAYMENT STATUS
  // ========================================================

  const getPaymentStatus = (purchase) => {
    return PAYMENT_STATUSES.includes(
      purchase?.payment_status
    )
      ? purchase.payment_status
      : "pending";
  };

  // ========================================================
  // STATUS LABEL
  // ========================================================

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Draft",
      ordered: "Ordered",
      received: "Received",
      partially_received:
        "Partially Received",
      cancelled: "Cancelled",
    };

    return labels[status] || status;
  };

  // ========================================================
  // STATUS BADGE
  // ========================================================

  const getStatusVariant = (status) => {
    switch (status) {
      case "draft":
        return "secondary";

      case "ordered":
        return "info";

      case "received":
        return "success";

      case "partially_received":
        return "warning";

      case "cancelled":
        return "danger";

      default:
        return "secondary";
    }
  };

  // ========================================================
  // PAYMENT STATUS LABEL
  // ========================================================

  const getPaymentStatusLabel = (
    paymentStatus
  ) => {
    const labels = {
      pending: "Pending",
      paid: "Paid",
      partial: "Partial",
    };

    return (
      labels[paymentStatus] ||
      "Pending"
    );
  };

  // ========================================================
  // PAYMENT STATUS BADGE
  // ========================================================

  const getPaymentStatusVariant = (
    paymentStatus
  ) => {
    switch (paymentStatus) {
      case "paid":
        return "success";

      case "partial":
        return "warning";

      case "pending":
        return "secondary";

      default:
        return "secondary";
    }
  };

  // ========================================================
  // STATISTICS
  // ========================================================

  const statistics = useMemo(() => {
    const totalPurchases =
      purchases.length;

    const totalPurchaseValue =
      purchases.reduce(
        (sum, purchase) =>
          sum +
          getPurchaseTotal(
            purchase
          ),
        0
      );

    const totalItemsPurchased =
      purchases.reduce(
        (sum, purchase) =>
          sum +
          getItems(purchase).reduce(
            (
              itemSum,
              item
            ) =>
              itemSum +
              toNumber(
                item.quantity
              ),
            0
          ),
        0
      );

    const receivedPurchases =
      purchases.filter(
        (purchase) =>
          purchase.status ===
          "received"
      ).length;

    return {
      totalPurchases,
      totalPurchaseValue,
      totalItemsPurchased,
      receivedPurchases,
    };
  }, [purchases]);

  // ========================================================
  // OPEN CREATE MODAL
  // ========================================================

  const handleCreate = () => {
    setEditingPurchase(null);
    setError("");
    setShowModal(true);
  };

  // ========================================================
  // OPEN EDIT MODAL
  // ========================================================

  const handleEdit = (purchase) => {
    setError("");
    setEditingPurchase(purchase);
    setShowModal(true);
  };

  // ========================================================
  // CLOSE MODAL
  // ========================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingPurchase(null);
  };

  // ========================================================
  // PREPARE ITEM
  // ========================================================

  const prepareItem = (item) => {
    const quantity = Number(
      item?.quantity ?? 0
    );

    const unitCost = Number(
      item?.unit_cost ?? 0
    );

    const discount = Number(
      item?.discount ?? 0
    );

    const tax = Number(
      item?.tax ?? 0
    );

    return {
      product: Number(
        item?.product?.id ??
          item?.product_id ??
          item?.product
      ),

      quantity,

      received_quantity: Number(
        item?.received_quantity ?? 0
      ),

      unit_cost: unitCost,

      discount,

      tax,

      // Backend recalculates this.
      // Keep it only if the serializer accepts it.
      total: Number(
        item?.total ?? 0
      ),
    };
  };

  // ========================================================
  // PREPARE PURCHASE PAYLOAD
  // ========================================================

  const preparePayload = (
    purchaseData
  ) => {
    const status =
      PURCHASE_STATUSES.includes(
        purchaseData?.status
      )
        ? purchaseData.status
        : "draft";

    const paymentStatus =
      PAYMENT_STATUSES.includes(
        purchaseData?.payment_status
      )
        ? purchaseData.payment_status
        : "pending";

    const items =
      Array.isArray(
        purchaseData?.items
      )
        ? purchaseData.items.map(
            prepareItem
          )
        : [];

    return {
      supplier: Number(
        purchaseData?.supplier?.id ??
          purchaseData?.supplier
      ),

      branch: Number(
        purchaseData?.branch?.id ??
          purchaseData?.branch
      ),

      status,

      payment_status:
        paymentStatus,

      notes:
        String(
          purchaseData?.notes || ""
        ).trim(),

      items,

      // IMPORTANT:
      // Do NOT send created_by here.
      // The backend automatically sets
      // created_by = request.user.
    };
  };

  // ========================================================
  // VALIDATE PAYLOAD
  // ========================================================

  const validatePayload = (
    payload
  ) => {
    if (
      !payload.supplier ||
      Number.isNaN(
        payload.supplier
      )
    ) {
      throw new Error(
        "Supplier is required."
      );
    }

    if (
      !payload.branch ||
      Number.isNaN(
        payload.branch
      )
    ) {
      throw new Error(
        "Branch is required."
      );
    }

    if (
      !Array.isArray(
        payload.items
      ) ||
      payload.items.length === 0
    ) {
      throw new Error(
        "At least one purchase item is required."
      );
    }

    payload.items.forEach(
      (item, index) => {
        if (
          !item.product ||
          Number.isNaN(
            item.product
          )
        ) {
          throw new Error(
            `Item ${
              index + 1
            }: Product is required.`
          );
        }

        if (
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity <= 0
        ) {
          throw new Error(
            `Item ${
              index + 1
            }: Quantity must be greater than zero.`
          );
        }

        if (
          !Number.isFinite(
            item.unit_cost
          ) ||
          item.unit_cost < 0
        ) {
          throw new Error(
            `Item ${
              index + 1
            }: Unit cost is invalid.`
          );
        }

        if (
          !Number.isFinite(
            item.discount
          ) ||
          item.discount < 0
        ) {
          throw new Error(
            `Item ${
              index + 1
            }: Discount is invalid.`
          );
        }

        if (
          !Number.isFinite(
            item.tax
          ) ||
          item.tax < 0 ||
          item.tax > 100
        ) {
          throw new Error(
            `Item ${
              index + 1
            }: Tax must be between 0 and 100.`
          );
        }
      }
    );
  };

  // ========================================================
  // HANDLE SAVE
  // CREATE OR UPDATE
  // ========================================================

  const handleSave = async (
    purchaseData
  ) => {
    try {
      setSaving(true);
      setError("");

      const payload =
        preparePayload(
          purchaseData
        );

      validatePayload(
        payload
      );

      console.log(
        "=========================================="
      );

      console.log(
        editingPurchase
          ? "UPDATE PURCHASE PAYLOAD:"
          : "CREATE PURCHASE PAYLOAD:"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "=========================================="
      );

      // ====================================================
      // UPDATE
      // ====================================================

      if (editingPurchase?.id) {
        await purchasesApi.update(
          editingPurchase.id,
          payload
        );
      }

      // ====================================================
      // CREATE
      // ====================================================

      else {
        await purchasesApi.create(
          payload
        );
      }

      // ====================================================
      // CLOSE MODAL
      // ====================================================

      setShowModal(false);
      setEditingPurchase(null);

      // ====================================================
      // RELOAD
      // ====================================================

      await Promise.all([
        loadPurchases(),
        loadProducts(),
      ]);
    } catch (err) {
      console.error(
        "Failed to save purchase:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );

      // ====================================================
      // FRONTEND ERROR
      // ====================================================

      if (
        err instanceof Error &&
        !err?.response
      ) {
        setError(
          err.message ||
            "Failed to save purchase."
        );

        return;
      }

      // ====================================================
      // BACKEND ERROR
      // ====================================================

      const backendError =
        err?.response?.data;

      let message =
        "Failed to save purchase.";

      if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        message =
          Object.entries(
            backendError
          )
            .map(
              ([field, messages]) => {
                const formatted =
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        ", "
                      )
                    : String(
                        messages
                      );

                return `${field}: ${formatted}`;
              }
            )
            .join("\n");
      } else if (
        backendError
      ) {
        message =
          String(
            backendError
          );
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // DELETE PURCHASE
  // ========================================================

  const handleDelete = async (
    id
  ) => {
    if (!id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this purchase?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await purchasesApi.delete(
        id
      );

      await Promise.all([
        loadPurchases(),
        loadProducts(),
      ]);
    } catch (err) {
      console.error(
        "Failed to delete purchase:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );

      const backendError =
        err?.response?.data;

      let message =
        "Failed to delete purchase.";

      if (
        backendError &&
        typeof backendError ===
          "object"
      ) {
        message =
          Object.entries(
            backendError
          )
            .map(
              ([field, messages]) => {
                const formatted =
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        ", "
                      )
                    : String(
                        messages
                      );

                return `${field}: ${formatted}`;
              }
            )
            .join("\n");
      } else if (
        backendError
      ) {
        message =
          String(
            backendError
          );
      }

      setError(message);
    }
  };

  // ========================================================
  // SORT PURCHASES
  // ========================================================

  const sortedPurchases =
    useMemo(() => {
      return [...purchases].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.created_at ??
                a.order_date ??
                0
            ).getTime();

          const dateB =
            new Date(
              b.created_at ??
                b.order_date ??
                0
            ).getTime();

          return (
            dateB - dateA
          );
        }
      );
    }, [purchases]);

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <div>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2>
            Purchases
          </h2>

          <p className="mb-0">
            Manage purchases and receive stock.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={
            loading ||
            saving
          }
        >
          <i className="bi bi-plus-lg me-2" />
          New Purchase
        </Button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          <strong>
            Error
          </strong>

          <div
            className="mt-1"
            style={{
              whiteSpace:
                "pre-line",
            }}
          >
            {error}
          </div>
        </Alert>
      )}

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <Row className="g-3 mb-4">

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Total Purchases
              </small>

              <h4 className="mt-2 mb-0">
                {statistics.totalPurchases.toLocaleString(
                  "en-TZ"
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Purchase Value
              </small>

              <h4 className="mt-2 mb-0">
                {formatCurrency(
                  statistics.totalPurchaseValue
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Items Purchased
              </small>

              <h4 className="mt-2 mb-0">
                {statistics.totalItemsPurchased.toLocaleString(
                  "en-TZ"
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="dashboard-card border-0 h-100">
            <Card.Body>
              <small className="text-muted">
                Received Purchases
              </small>

              <h4 className="mt-2 mb-0 text-success">
                {statistics.receivedPurchases.toLocaleString(
                  "en-TZ"
                )}
              </h4>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* ==================================================
          PURCHASE TABLE
      ================================================== */}

      <Card className="dashboard-card border-0">

        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>
              <h5 className="mb-1">
                Purchase List
              </h5>

              <small className="text-muted">
                {sortedPurchases.length}{" "}
                purchases recorded
              </small>
            </div>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <p className="mt-3 text-muted">
                Loading purchases...
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <Table
                hover
                bordered
                className="align-middle"
              >

                <thead>

                  <tr>

                    <th>
                      DATE
                    </th>

                    <th>
                      PURCHASE NUMBER
                    </th>

                    <th>
                      SUPPLIER
                    </th>

                    <th>
                      BRANCH
                    </th>

                    <th>
                      CREATED BY
                    </th>

                    <th>
                      ITEMS
                    </th>

                    <th>
                      TOTAL
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      PAYMENT
                    </th>

                    <th>
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {sortedPurchases.length === 0 ? (

                    <tr>

                      <td
                        colSpan="10"
                        className="text-center py-5 text-muted"
                      >

                        <i className="bi bi-bag fs-3 d-block mb-2" />

                        No purchases recorded.

                      </td>

                    </tr>

                  ) : (

                    sortedPurchases.map(
                      (purchase) => {

                        const supplier =
                          getSupplier(
                            purchase
                          );

                        const branch =
                          getBranch(
                            purchase
                          );

                        const createdBy =
                          getCreatedBy(
                            purchase
                          );

                        const items =
                          getItems(
                            purchase
                          );

                        const total =
                          getPurchaseTotal(
                            purchase
                          );

                        const status =
                          getStatus(
                            purchase
                          );

                        const paymentStatus =
                          getPaymentStatus(
                            purchase
                          );

                        return (

                          <tr
                            key={
                              purchase.id
                            }
                          >

                            {/* DATE */}

                            <td>
                              {formatDate(
                                purchase.order_date ??
                                  purchase.created_at
                              )}
                            </td>

                            {/* PURCHASE NUMBER */}

                            <td>
                              <strong>
                                {getPurchaseNumber(
                                  purchase
                                )}
                              </strong>
                            </td>

                            {/* SUPPLIER */}

                            <td>
                              {supplier?.name ||
                                "-"}
                            </td>

                            {/* BRANCH */}

                            <td>
                              {branch?.name ||
                                "-"}
                            </td>

                            {/* CREATED BY */}

                            <td>
                              <strong>
                                {createdBy}
                              </strong>
                            </td>

                            {/* ITEMS */}

                            <td>

                              {items.length > 0 ? (

                                <div>

                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="mb-2"
                                  >
                                    {
                                      items.length
                                    }{" "}
                                    product
                                    {items.length !== 1
                                      ? "s"
                                      : ""}
                                  </Badge>

                                  <div
                                    style={{
                                      minWidth:
                                        "300px",
                                    }}
                                  >

                                    {items.map(
                                      (
                                        item,
                                        index
                                      ) => (

                                        <div
                                          key={
                                            item.id ??
                                            index
                                          }
                                          className="border-bottom py-1"
                                        >

                                          <div className="d-flex justify-content-between">

                                            <strong>
                                              {getProductName(
                                                item
                                              )}
                                            </strong>

                                            <span>
                                              x{" "}
                                              {
                                                item.quantity
                                              }
                                            </span>

                                          </div>

                                          <small className="text-muted">

                                            Unit:
                                            {" "}
                                            {formatCurrency(
                                              item.unit_cost
                                            )}

                                            {" | "}

                                            Discount:
                                            {" "}
                                            {toNumber(
                                              item.discount
                                            )}
                                            %

                                            {" | "}

                                            Tax:
                                            {" "}
                                            {toNumber(
                                              item.tax
                                            )}
                                            %

                                          </small>

                                          <div>

                                            <small>

                                              Total:
                                              {" "}

                                              <strong>
                                                {formatCurrency(
                                                  item.total
                                                )}
                                              </strong>

                                            </small>

                                          </div>

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              ) : (

                                <Badge
                                  bg="secondary"
                                >
                                  No items
                                </Badge>

                              )}

                            </td>

                            {/* TOTAL */}

                            <td>
                              <strong>
                                {formatCurrency(
                                  total
                                )}
                              </strong>
                            </td>

                            {/* STATUS */}

                            <td>

                              <Badge
                                bg={getStatusVariant(
                                  status
                                )}
                              >
                                {getStatusLabel(
                                  status
                                )}
                              </Badge>

                            </td>

                            {/* PAYMENT */}

                            <td>

                              <Badge
                                bg={getPaymentStatusVariant(
                                  paymentStatus
                                )}
                              >
                                {getPaymentStatusLabel(
                                  paymentStatus
                                )}
                              </Badge>

                            </td>

                            {/* ACTION */}

                            <td>

                              <div className="d-flex gap-2">

                                {/* EDIT */}

                                <Button
                                  type="button"
                                  variant="outline-primary"
                                  size="sm"
                                  disabled={
                                    saving
                                  }
                                  onClick={() =>
                                    handleEdit(
                                      purchase
                                    )
                                  }
                                  title="Edit Purchase"
                                >
                                  <i className="bi bi-pencil" />
                                </Button>

                                {/* DELETE */}

                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  disabled={
                                    saving
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      purchase.id
                                    )
                                  }
                                  title="Delete Purchase"
                                >
                                  <i className="bi bi-trash" />
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

          )}

        </Card.Body>

      </Card>

      {/* ==================================================
          PURCHASE MODAL
      ================================================== */}

      <PurchaseModal
        show={showModal}

        onHide={
          handleCloseModal
        }

        products={products}

        suppliers={suppliers}

        branches={branches}

        purchase={
          editingPurchase
        }

        editing={
          Boolean(
            editingPurchase
          )
        }

        onSave={handleSave}

        saving={saving}
      />

    </div>
  );
};

export default Purchases;