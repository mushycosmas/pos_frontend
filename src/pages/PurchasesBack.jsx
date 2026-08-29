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
// PURCHASES PAGE
// ==========================================================

const PurchasesBack = () => {
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

    const purchaseList =
      normalizeResponse(data);

    setPurchases(purchaseList);

    return purchaseList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD PRODUCTS
  // ========================================================

  const loadProducts = useCallback(async () => {
    const data = await productsApi.getAll();

    const productList =
      normalizeResponse(data);

    setProducts(productList);

    return productList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD SUPPLIERS
  // ========================================================

  const loadSuppliers = useCallback(async () => {
    const data = await suppliersApi.getAll();

    const supplierList =
      normalizeResponse(data);

    setSuppliers(supplierList);

    return supplierList;
  }, [normalizeResponse]);

  // ========================================================
  // LOAD BRANCHES
  // ========================================================

  const loadBranches = useCallback(async () => {
    const data = await branchesApi.getAll();

    const branchList =
      normalizeResponse(data);

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
    return `TSh ${toNumber(
      value
    ).toLocaleString("en-TZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
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
    // Backend may return supplier_name
    if (purchase?.supplier_name) {
      return {
        name: purchase.supplier_name,
      };
    }

    // Backend may return supplier object
    if (
      purchase?.supplier &&
      typeof purchase.supplier === "object"
    ) {
      return purchase.supplier;
    }

    // Backend may return supplier ID
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
  // GET STATUS
  // ========================================================

  const getStatus = (purchase) => {
    return (
      purchase?.status ||
      "draft"
    );
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

    return (
      labels[status] ||
      status
    );
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
  // HANDLE SAVE PURCHASE
  // ========================================================

  const handleSave = async (
    purchaseData
  ) => {
    try {
      setSaving(true);
      setError("");

      // ====================================================
      // IMPORTANT
      //
      // The backend now calculates:
      //
      // subtotal
      // tax
      // total
      //
      // Therefore we DO NOT send those values
      // from the frontend.
      // ====================================================

      const payload = {
        purchase_number:
          String(
            purchaseData.purchase_number ||
              ""
          ).trim(),

        supplier:
          Number(
            purchaseData.supplier
          ),

        branch:
          Number(
            purchaseData.branch
          ),

        order_date:
          purchaseData.order_date ||
          null,

        status:
          purchaseData.status ||
          "received",

        payment_status:
          purchaseData.payment_status ||
          "pending",

        notes:
          purchaseData.notes ||
          "",

        // ==================================================
        // ITEMS
        // ==================================================

        items:
          Array.isArray(
            purchaseData.items
          )
            ? purchaseData.items.map(
                (item) => ({
                  product:
                    Number(
                      item.product
                    ),

                  quantity:
                    Number(
                      item.quantity
                    ),

                  unit_cost:
                    Number(
                      item.unit_cost
                    ),

                  discount:
                    Number(
                      item.discount ??
                        0
                    ),

                  tax:
                    Number(
                      item.tax ??
                        0
                    ),

                  total:
                    Number(
                      item.total ??
                        0
                    ),
                })
              )
            : [],
      };

      // ====================================================
      // VALIDATE PAYLOAD
      // ====================================================

      if (!payload.supplier) {
        throw new Error(
          "Supplier is required."
        );
      }

      if (!payload.branch) {
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

      // ====================================================
      // DEBUG
      // ====================================================

      console.log(
        "=========================================="
      );

      console.log(
        "CREATE PURCHASE PAYLOAD:"
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
      // CREATE PURCHASE
      // ====================================================

      await purchasesApi.create(
        payload
      );

      // ====================================================
      // CLOSE MODAL
      // ====================================================

      setShowModal(false);

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
      // HANDLE FRONTEND ERROR
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
      // HANDLE BACKEND ERROR
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
                const formattedMessages =
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        ", "
                      )
                    : String(
                        messages
                      );

                return `${field}: ${formattedMessages}`;
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
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(
                    messages
                  )
                    ? messages.join(
                        ", "
                      )
                    : messages
                }`
            )
            .join("\n");
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
          onClick={() =>
            setShowModal(true)
          }
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
          <div
            style={{
              whiteSpace:
                "pre-line",
            }}
          >
            <strong>
              Error
            </strong>

            <div className="mt-1">
              {error}
            </div>
          </div>
        </Alert>
      )}

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <Row className="g-3 mb-4">

        {/* TOTAL PURCHASES */}

        <Col
          xl={3}
          md={6}
        >
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

        {/* PURCHASE VALUE */}

        <Col
          xl={3}
          md={6}
        >
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

        {/* ITEMS */}

        <Col
          xl={3}
          md={6}
        >
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

        {/* RECEIVED */}

        <Col
          xl={3}
          md={6}
        >
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
                      ITEMS
                    </th>

                    <th>
                      TOTAL
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

                  {sortedPurchases.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan="8"
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

                            {/* ITEMS */}

                            <td>

                              <Badge
                                bg="light"
                                text="dark"
                              >
                                {items.length}
                              </Badge>

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

                            {/* ACTION */}

                            <td>

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
                              >

                                <i className="bi bi-trash" />

                              </Button>

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

        onHide={() => {
          if (!saving) {
            setShowModal(false);
          }
        }}

        products={products}

        suppliers={suppliers}

        branches={branches}

        onSave={handleSave}
      />

    </div>
  );
};

export default PurchasesBack;