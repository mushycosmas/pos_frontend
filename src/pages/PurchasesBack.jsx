
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

const Purchases = () => {
  // ========================================================
  // STATE
  // ========================================================

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);

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
        getBackendError(
          err,
          "Failed to load purchase data."
        )
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
  // BACKEND ERROR
  // ========================================================

  const getBackendError = (
    err,
    fallback = "Something went wrong."
  ) => {
    const backendError =
      err?.response?.data;

    if (!backendError) {
      return err?.message || fallback;
    }

    if (
      typeof backendError ===
      "string"
    ) {
      return backendError;
    }

    if (
      backendError.detail
    ) {
      return String(
        backendError.detail
      );
    }

    if (
      backendError.message
    ) {
      return String(
        backendError.message
      );
    }

    if (
      typeof backendError ===
      "object"
    ) {
      return Object.entries(
        backendError
      )
        .map(
          ([field, messages]) => {
            const text =
              Array.isArray(
                messages
              )
                ? messages.join(
                    ", "
                  )
                : String(
                    messages
                  );

            return `${field}: ${text}`;
          }
        )
        .join("\n");
    }

    return fallback;
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
    if (purchase?.supplier_name) {
      return {
        name: purchase.supplier_name,
      };
    }

    if (
      purchase?.supplier &&
      typeof purchase.supplier ===
        "object"
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
      typeof purchase.branch ===
        "object"
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
  // GET ITEMS
  // ========================================================

  const getItems = (purchase) => {
    if (
      Array.isArray(
        purchase?.items
      )
    ) {
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
  // GET TOTAL
  // ========================================================

  const getPurchaseTotal = (
    purchase
  ) => {
    return toNumber(
      purchase?.total ??
        purchase?.total_amount ??
        purchase?.grand_total
    );
  };

  // ========================================================
  // GET PURCHASE NUMBER
  // ========================================================

  const getPurchaseNumber = (
    purchase
  ) => {
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

  const getStatusLabel = (
    status
  ) => {
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

  const getStatusVariant = (
    status
  ) => {
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
  // IS FULLY RECEIVED
  // ========================================================

  const isFullyReceived = (
    purchase
  ) => {
    if (
      purchase?.is_fully_received !==
      undefined
    ) {
      return Boolean(
        purchase.is_fully_received
      );
    }

    const ordered =
      toNumber(
        purchase?.total_ordered_quantity
      );

    const received =
      toNumber(
        purchase?.total_received_quantity
      );

    return (
      ordered > 0 &&
      received >= ordered
    );
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
          getItems(
            purchase
          ).reduce(
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

    const pendingPurchases =
      purchases.filter(
        (purchase) =>
          purchase.status ===
            "draft" ||
          purchase.status ===
            "ordered"
      ).length;

    return {
      totalPurchases,
      totalPurchaseValue,
      totalItemsPurchased,
      receivedPurchases,
      pendingPurchases,
    };
  }, [purchases]);

  // ========================================================
  // HANDLE SAVE
  // ========================================================

  const handleSave = async (
    purchaseData
  ) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ====================================================
      // BACKEND EXPECTS
      //
      // supplier
      // branch
      // company (if available)
      // order_date
      // expected_delivery_date
      // discount
      // shipping_cost
      // status
      // payment_status
      // notes
      // items
      //
      // Backend calculates:
      // subtotal
      // tax
      // total
      //
      // DO NOT send:
      // purchase_number
      // created_by
      // received_quantity
      // subtotal
      // total
      // ====================================================

      const payload = {
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

        expected_delivery_date:
          purchaseData.expected_delivery_date ||
          null,

        discount:
          Number(
            purchaseData.discount ??
              0
          ),

        shipping_cost:
          Number(
            purchaseData.shipping_cost ??
              0
          ),

        status:
          purchaseData.status ||
          "draft",

        payment_status:
          purchaseData.payment_status ||
          "unpaid",

        notes:
          purchaseData.notes ||
          "",

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
                      item.unit_cost ??
                        0
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
                })
              )
            : [],
      };

      // ====================================================
      // OPTIONAL COMPANY
      // ====================================================

      if (
        purchaseData.company
      ) {
        payload.company =
          Number(
            purchaseData.company
          );
      }

      // ====================================================
      // VALIDATION
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

      payload.items.forEach(
        (item, index) => {
          if (!item.product) {
            throw new Error(
              `Product is required for item ${
                index + 1
              }.`
            );
          }

          if (
            item.quantity <= 0
          ) {
            throw new Error(
              `Quantity must be greater than 0 for item ${
                index + 1
              }.`
            );
          }

          if (
            item.unit_cost < 0
          ) {
            throw new Error(
              `Unit cost cannot be negative for item ${
                index + 1
              }.`
            );
          }

          if (
            item.discount < 0 ||
            item.discount > 100
          ) {
            throw new Error(
              `Discount must be between 0 and 100 for item ${
                index + 1
              }.`
            );
          }

          if (
            item.tax < 0 ||
            item.tax > 100
          ) {
            throw new Error(
              `Tax must be between 0 and 100 for item ${
                index + 1
              }.`
            );
          }
        }
      );

      // ====================================================
      // DEBUG
      // ====================================================

      console.log(
        "CREATE PURCHASE PAYLOAD:",
        payload
      );

      // ====================================================
      // CREATE
      // ====================================================

      await purchasesApi.create(
        payload
      );

      // ====================================================
      // SUCCESS
      // ====================================================

      setShowModal(false);

      setSuccess(
        "Purchase created successfully."
      );

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

      setError(
        getBackendError(
          err,
          "Failed to save purchase."
        )
      );
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
      setSuccess("");

      await purchasesApi.delete(
        id
      );

      setSuccess(
        "Purchase deleted successfully."
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

      setError(
        getBackendError(
          err,
          "Failed to delete purchase."
        )
      );
    }
  };

  // ========================================================
  // RECEIVE PURCHASE
  // ========================================================

  const handleReceive = async (
    purchase
  ) => {
    if (!purchase?.id) {
      return;
    }

    if (
      isFullyReceived(
        purchase
      )
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Receive purchase ${getPurchaseNumber(
          purchase
        )}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setReceiving(true);
      setError("");
      setSuccess("");

      // ====================================================
      // RECEIVE ENDPOINT
      // ====================================================

      if (
        typeof purchasesApi.receive !==
        "function"
      ) {
        throw new Error(
          "purchasesApi.receive() is not implemented. Add the receive endpoint to purchasesApi."
        );
      }

      await purchasesApi.receive(
        purchase.id
      );

      setSuccess(
        "Purchase received successfully."
      );

      await Promise.all([
        loadPurchases(),
        loadProducts(),
      ]);
    } catch (err) {
      console.error(
        "Failed to receive purchase:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );

      setError(
        getBackendError(
          err,
          "Failed to receive purchase."
        )
      );
    } finally {
      setReceiving(false);
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
            saving ||
            receiving
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
          SUCCESS
      ================================================== */}

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
                      RECEIVING
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
                        colSpan="9"
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

                        const fullyReceived =
                          isFullyReceived(
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


                            {/* RECEIVING */}

                            <td>

                              <div className="small">

                                <div>
                                  Ordered:{" "}
                                  <strong>
                                    {
                                      purchase.total_ordered_quantity ??
                                      0
                                    }
                                  </strong>
                                </div>

                                <div>
                                  Received:{" "}
                                  <strong>
                                    {
                                      purchase.total_received_quantity ??
                                      0
                                    }
                                  </strong>
                                </div>

                                <div>
                                  Remaining:{" "}
                                  <strong>
                                    {
                                      purchase.total_remaining_quantity ??
                                      0
                                    }
                                  </strong>
                                </div>

                              </div>

                            </td>


                            {/* ACTION */}

                            <td>

                              <div className="d-flex gap-1">

                                {!fullyReceived &&
                                  status !==
                                    "cancelled" && (
                                    <Button
                                      type="button"
                                      variant="outline-success"
                                      size="sm"
                                      disabled={
                                        receiving
                                      }
                                      onClick={() =>
                                        handleReceive(
                                          purchase
                                        )
                                      }
                                    >

                                      {receiving ? (
                                        <Spinner
                                          animation="border"
                                          size="sm"
                                        />
                                      ) : (
                                        <>
                                          <i className="bi bi-box-arrow-in-down me-1" />

                                          Receive
                                        </>
                                      )}

                                    </Button>
                                  )}


                                {status !==
                                  "received" && (
                                  <Button
                                    type="button"
                                    variant="outline-danger"
                                    size="sm"
                                    disabled={
                                      saving ||
                                      receiving
                                    }
                                    onClick={() =>
                                      handleDelete(
                                        purchase.id
                                      )
                                    }
                                  >

                                    <i className="bi bi-trash" />

                                  </Button>
                                )}

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

        onHide={() => {
          if (
            !saving
          ) {
            setShowModal(false);
          }
        }}

        products={products}

        suppliers={suppliers}

        branches={branches}

        onSave={handleSave}

        saving={saving}
      />

    </div>
  );
};

export default Purchases;