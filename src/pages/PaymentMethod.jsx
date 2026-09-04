import React, { useEffect, useMemo, useState } from "react";
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
import {
  FaCheckCircle,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaMoneyBillWave,
  FaMobileAlt,
  FaCreditCard,
  FaUniversity,
  FaWallet,
} from "react-icons/fa";

import paymentMethodApi from "../services/paymentMethod";

const INITIAL_FORM = {
  name: "",
  code: "",
  payment_type: "cash",
  provider: "",
  is_active: true,
  allow_change: false,
  transaction_fee: "0.00",
  display_order: 0,
  description: "",
};

const PAYMENT_TYPES = [
  {
    value: "cash",
    label: "Cash",
    icon: FaMoneyBillWave,
  },
  {
    value: "mobile_money",
    label: "Mobile Money",
    icon: FaMobileAlt,
  },
  {
    value: "card",
    label: "Card",
    icon: FaCreditCard,
  },
  {
    value: "bank",
    label: "Bank",
    icon: FaUniversity,
  },
  {
    value: "credit",
    label: "Credit",
    icon: FaWallet,
  },
  {
    value: "other",
    label: "Other",
    icon: FaWallet,
  },
];

const PaymentMethod = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [typeFilter, setTypeFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingMethod, setEditingMethod] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // ==========================================
  // LOAD PAYMENT METHODS
  // ==========================================

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await paymentMethodApi.getAll();

      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payment methods:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load payment methods."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // ==========================================
  // AUTO-GENERATE CODE
  // ==========================================

  const generateCode = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Automatically generate code when creating
    // a new payment method.
    if (
      name === "name" &&
      !editingMethod
    ) {
      setFormData((previous) => ({
        ...previous,
        name: value,
        code: generateCode(value),
      }));
    }
  };

  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================

  const handleAdd = () => {
    setEditingMethod(null);

    setFormData({
      ...INITIAL_FORM,
      display_order: paymentMethods.length + 1,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEdit = (method) => {
    setEditingMethod(method);

    setFormData({
      name: method.name || "",
      code: method.code || "",
      payment_type: method.payment_type || "cash",
      provider: method.provider || "",
      is_active: method.is_active ?? true,
      allow_change: method.allow_change ?? false,
      transaction_fee:
        method.transaction_fee !== null &&
        method.transaction_fee !== undefined
          ? String(method.transaction_fee)
          : "0.00",
      display_order: method.display_order ?? 0,
      description: method.description || "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMethod(null);
    setFormData(INITIAL_FORM);
  };

  // ==========================================
  // SAVE PAYMENT METHOD
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const code = formData.code.trim().toLowerCase();

    if (!name) {
      setError("Payment method name is required.");
      return;
    }

    if (!code) {
      setError("Payment method code is required.");
      return;
    }

    if (!formData.payment_type) {
      setError("Payment type is required.");
      return;
    }

    if (
      formData.transaction_fee === "" ||
      Number(formData.transaction_fee) < 0
    ) {
      setError("Transaction fee cannot be negative.");
      return;
    }

    const payload = {
      name,
      code,
      payment_type: formData.payment_type,
      provider: formData.provider.trim() || null,
      is_active: formData.is_active,
      allow_change: formData.allow_change,
      transaction_fee: Number(
        formData.transaction_fee || 0
      ).toFixed(2),
      display_order: Number(
        formData.display_order || 0
      ),
      description:
        formData.description.trim() || null,
    };

    try {
      setSaving(true);

      if (editingMethod) {
        await paymentMethodApi.update(
          editingMethod.id,
          payload
        );

        setSuccess(
          "Payment method updated successfully."
        );
      } else {
        await paymentMethodApi.create(payload);

        setSuccess(
          "Payment method created successfully."
        );
      }

      handleCloseModal();

      await loadPaymentMethods();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save payment method:",
        err
      );

      const responseData = err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData
        )
          .map(([field, message]) => {
            const text = Array.isArray(message)
              ? message.join(", ")
              : String(message);

            return `${field}: ${text}`;
          })
          .join(" | ");

        setError(
          messages ||
            "Failed to save payment method."
        );
      } else {
        setError(
          "Failed to save payment method."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ACTIVATE / DEACTIVATE
  // ==========================================

  const handleToggleStatus = async (method) => {
    try {
      setActionId(method.id);
      setError("");
      setSuccess("");

      if (method.is_active) {
        await paymentMethodApi.deactivate(
          method.id
        );

        setSuccess(
          `${method.name} has been deactivated.`
        );
      } else {
        await paymentMethodApi.activate(
          method.id
        );

        setSuccess(
          `${method.name} has been activated.`
        );
      }

      await loadPaymentMethods();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to change payment method status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to change payment method status."
      );
    } finally {
      setActionId(null);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (method) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${method.name}"?`
    );

    if (!confirmed) return;

    try {
      setActionId(method.id);
      setError("");
      setSuccess("");

      await paymentMethodApi.delete(
        method.id
      );

      setSuccess(
        `${method.name} deleted successfully.`
      );

      await loadPaymentMethods();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to delete payment method:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete payment method."
      );
    } finally {
      setActionId(null);
    }
  };

  // ==========================================
  // FILTER PAYMENT METHODS
  // ==========================================

  const filteredPaymentMethods = useMemo(() => {
    return paymentMethods.filter((method) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        !search ||
        method.name
          ?.toLowerCase()
          .includes(search) ||
        method.code
          ?.toLowerCase()
          .includes(search) ||
        method.provider
          ?.toLowerCase()
          .includes(search);

      const matchesType =
        !typeFilter ||
        method.payment_type === typeFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" &&
          method.is_active) ||
        (statusFilter === "inactive" &&
          !method.is_active);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    paymentMethods,
    searchTerm,
    typeFilter,
    statusFilter,
  ]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalMethods = paymentMethods.length;

  const activeMethods = paymentMethods.filter(
    (method) => method.is_active
  ).length;

  const inactiveMethods =
    paymentMethods.filter(
      (method) => !method.is_active
    ).length;

  // ==========================================
  // PAYMENT TYPE ICON
  // ==========================================

  const getPaymentTypeIcon = (type) => {
    const paymentType = PAYMENT_TYPES.find(
      (item) => item.value === type
    );

    if (!paymentType) {
      return <FaWallet />;
    }

    const Icon = paymentType.icon;

    return <Icon />;
  };

  // ==========================================
  // PAYMENT TYPE LABEL
  // ==========================================

  const getPaymentTypeLabel = (type) => {
    const paymentType = PAYMENT_TYPES.find(
      (item) => item.value === type
    );

    return (
      paymentType?.label ||
      type ||
      "Other"
    );
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat(
      "en-TZ",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(number);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="container-fluid py-3">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="mb-1">
            Payment Methods
          </h3>

          <p className="text-muted mb-0">
            Manage payment methods available
            throughout your POS.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAdd}
        >
          <FaPlus className="me-2" />
          Add Payment Method
        </Button>

      </div>

      {/* ======================================
          ALERTS
      ======================================= */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ======================================
          STATISTICS
      ======================================= */}

      <Row className="g-3 mb-4">

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <div className="text-muted small">
                    Total Payment Methods
                  </div>

                  <h3 className="mb-0 mt-1">
                    {totalMethods}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <FaWallet />
                </div>

              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <div className="text-muted small">
                    Active
                  </div>

                  <h3 className="mb-0 mt-1">
                    {activeMethods}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <FaCheckCircle />
                </div>

              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <div className="text-muted small">
                    Inactive
                  </div>

                  <h3 className="mb-0 mt-1">
                    {inactiveMethods}
                  </h3>
                </div>

                <div className="fs-2 text-secondary">
                  <FaTimesCircle />
                </div>

              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* ======================================
          FILTERS
      ======================================= */}

      <Card className="shadow-sm border-0 mb-4">

        <Card.Body>

          <Row className="g-3">

            <Col md={5}>
              <InputGroup>

                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search payment methods..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
              >
                <option value="">
                  All Payment Types
                </option>

                {PAYMENT_TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </Form.Select>
            </Col>

            <Col md={1}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                  setStatusFilter("");
                }}
              >
                Clear
              </Button>
            </Col>

          </Row>

        </Card.Body>

      </Card>

      {/* ======================================
          PAYMENT METHODS TABLE
      ======================================= */}

      <Card className="shadow-sm border-0">

        <Card.Header className="bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="mb-0">
              Payment Methods
            </h5>

            <span className="text-muted small">
              Showing{" "}
              {filteredPaymentMethods.length}{" "}
              of {totalMethods}
            </span>

          </div>

        </Card.Header>

        <Card.Body className="p-0">

          {loading ? (
            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <div className="text-muted mt-2">
                Loading payment methods...
              </div>

            </div>
          ) : filteredPaymentMethods.length ===
            0 ? (
            <div className="text-center py-5">

              <div className="fs-1 text-muted mb-3">
                <FaWallet />
              </div>

              <h5>
                No payment methods found
              </h5>

              <p className="text-muted">
                Add a payment method to make it
                available in your POS.
              </p>

              <Button
                variant="primary"
                onClick={handleAdd}
              >
                <FaPlus className="me-2" />
                Add Payment Method
              </Button>

            </div>
          ) : (
            <div className="table-responsive">

              <Table
                hover
                responsive
                className="mb-0 align-middle"
              >

                <thead className="table-light">

                  <tr>
                    <th>#</th>
                    <th>Payment Method</th>
                    <th>Type</th>
                    <th>Provider</th>
                    <th>Transaction Fee</th>
                    <th>Change</th>
                    <th>Status</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredPaymentMethods.map(
                    (method, index) => {
                      const busy =
                        actionId === method.id;

                      return (
                        <tr key={method.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <div className="d-flex align-items-center">

                              <div className="me-3 fs-5 text-primary">
                                {getPaymentTypeIcon(
                                  method.payment_type
                                )}
                              </div>

                              <div>
                                <div className="fw-semibold">
                                  {method.name}
                                </div>

                                <small className="text-muted">
                                  {method.code}
                                </small>
                              </div>

                            </div>
                          </td>

                          <td>
                            <Badge
                              bg="light"
                              text="dark"
                            >
                              {getPaymentTypeLabel(
                                method.payment_type
                              )}
                            </Badge>
                          </td>

                          <td>
                            {method.provider || (
                              <span className="text-muted">
                                —
                              </span>
                            )}
                          </td>

                          <td>
                            TSh{" "}
                            {formatMoney(
                              method.transaction_fee
                            )}
                          </td>

                          <td>
                            {method.allow_change ? (
                              <Badge bg="success">
                                Allowed
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                Not Allowed
                              </Badge>
                            )}
                          </td>

                          <td>
                            {method.is_active ? (
                              <Badge bg="success">
                                <FaCheckCircle className="me-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                <FaTimesCircle className="me-1" />
                                Inactive
                              </Badge>
                            )}
                          </td>

                          <td className="text-end">

                            <div className="d-flex justify-content-end gap-1">

                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Edit"
                                disabled={busy}
                                onClick={() =>
                                  handleEdit(method)
                                }
                              >
                                <FaEdit />
                              </Button>

                              <Button
                                variant={
                                  method.is_active
                                    ? "outline-warning"
                                    : "outline-success"
                                }
                                size="sm"
                                title={
                                  method.is_active
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                disabled={busy}
                                onClick={() =>
                                  handleToggleStatus(
                                    method
                                  )
                                }
                              >
                                {busy ? (
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                  />
                                ) : method.is_active ? (
                                  <FaToggleOn />
                                ) : (
                                  <FaToggleOff />
                                )}
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete"
                                disabled={busy}
                                onClick={() =>
                                  handleDelete(method)
                                }
                              >
                                <FaTrash />
                              </Button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </Table>

            </div>
          )}

        </Card.Body>

      </Card>

      {/* ======================================
          ADD / EDIT MODAL
      ======================================= */}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >

        <Form onSubmit={handleSubmit}>

          <Modal.Header closeButton>
            <Modal.Title>
              {editingMethod
                ? "Edit Payment Method"
                : "Add Payment Method"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>

            <Row className="g-3">

              {/* NAME */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Payment Method Name{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="e.g. M-Pesa"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </Form.Group>
              </Col>

              {/* CODE */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Code{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="code"
                    placeholder="e.g. mpesa"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />

                  <Form.Text className="text-muted">
                    Unique internal code.
                  </Form.Text>

                </Form.Group>
              </Col>

              {/* TYPE */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Payment Type{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    required
                  >

                    {PAYMENT_TYPES.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      )
                    )}

                  </Form.Select>

                </Form.Group>
              </Col>

              {/* PROVIDER */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Provider
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="provider"
                    placeholder="e.g. Vodacom"
                    value={formData.provider}
                    onChange={handleChange}
                  />

                  <Form.Text className="text-muted">
                    Optional. Example: Vodacom,
                    Airtel, CRDB.
                  </Form.Text>

                </Form.Group>
              </Col>

              {/* TRANSACTION FEE */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Transaction Fee
                  </Form.Label>

                  <InputGroup>

                    <InputGroup.Text>
                      TSh
                    </InputGroup.Text>

                    <Form.Control
                      type="number"
                      name="transaction_fee"
                      min="0"
                      step="0.01"
                      value={
                        formData.transaction_fee
                      }
                      onChange={handleChange}
                    />

                  </InputGroup>

                </Form.Group>
              </Col>

              {/* DISPLAY ORDER */}

              <Col md={6}>
                <Form.Group>

                  <Form.Label>
                    Display Order
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="display_order"
                    min="0"
                    value={
                      formData.display_order
                    }
                    onChange={handleChange}
                  />

                </Form.Group>
              </Col>

              {/* ALLOW CHANGE */}

              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="allow-change"
                  name="allow_change"
                  label="Allow Change"
                  checked={
                    formData.allow_change
                  }
                  onChange={handleChange}
                />

                <Form.Text className="text-muted">
                  Enable this when the cashier can
                  return change to the customer.
                </Form.Text>
              </Col>

              {/* ACTIVE */}

              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="payment-active"
                  name="is_active"
                  label="Active"
                  checked={
                    formData.is_active
                  }
                  onChange={handleChange}
                />

                <Form.Text className="text-muted">
                  Only active payment methods will
                  appear at POS checkout.
                </Form.Text>
              </Col>

              {/* DESCRIPTION */}

              <Col md={12}>
                <Form.Group>

                  <Form.Label>
                    Description
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Optional description..."
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                  />

                </Form.Group>
              </Col>

            </Row>

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
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
              ) : (
                <>
                  <FaCheckCircle className="me-2" />
                  {editingMethod
                    ? "Update Payment Method"
                    : "Create Payment Method"}
                </>
              )}

            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </div>
  );
};

export default PaymentMethod;