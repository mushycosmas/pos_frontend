import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import expensesApi from "../services/expensesApi";
import branchesApi from "../services/branchesApi";

const Expenses = () => {
  // =========================================================
  // CONSTANTS
  // =========================================================

  const EXPENSE_TYPES = [
    { value: "operational", label: "Operational" },
    { value: "utilities", label: "Utilities" },
    { value: "salary", label: "Salary" },
    { value: "rent", label: "Rent" },
    { value: "transport", label: "Transport" },
    { value: "maintenance", label: "Maintenance" },
    { value: "marketing", label: "Marketing" },
    { value: "food", label: "Food & Beverage" },
    { value: "supplies", label: "Office Supplies" },
    { value: "equipment", label: "Equipment" },
    { value: "insurance", label: "Insurance" },
    { value: "tax", label: "Tax" },
    { value: "licenses", label: "Licenses & Permits" },
    { value: "training", label: "Training" },
    { value: "travel", label: "Travel" },
    { value: "communication", label: "Communication" },
    { value: "other", label: "Other" },
  ];

  const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  // =========================================================
  // STATE
  // =========================================================

  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Approval states
  const [approvingExpenseId, setApprovingExpenseId] = useState(null);
  const [rejectingExpenseId, setRejectingExpenseId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    expense_type: "other",

    amount: "",
    tax: "0",

    expense_date: new Date().toISOString().split("T")[0],
    due_date: "",

    branch: "",

    payment_status: "pending",
    payment_method: "",
    payment_date: "",

    invoice_number: "",
    reference: "",

    receipt: null,
  });

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const extractList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const getExpenseTypeName = (type) => {
    const found = EXPENSE_TYPES.find(
      (item) => item.value === type
    );

    return found?.label || type || "Other";
  };

  const getPaymentStatusName = (status) => {
    const found = PAYMENT_STATUSES.find(
      (item) => item.value === status
    );

    return found?.label || status || "Pending";
  };

  const getBranchName = (expense) => {
    if (expense?.branch_name) {
      return expense.branch_name;
    }

    if (
      expense?.branch &&
      typeof expense.branch === "object" &&
      expense.branch.name
    ) {
      return expense.branch.name;
    }

    const branchId =
      typeof expense?.branch === "object"
        ? expense.branch?.id
        : expense?.branch;

    const branch = branches.find(
      (item) => String(item.id) === String(branchId)
    );

    return branch?.name || "—";
  };

  const getUserName = (user, fallback = "—") => {
    if (!user) {
      return fallback;
    }

    if (typeof user === "string") {
      return user;
    }

    if (typeof user === "object") {
      return (
        user.full_name ||
        user.name ||
        user.username ||
        user.email ||
        fallback
      );
    }

    return fallback;
  };

  const getCreatedByName = (expense) => {
    if (expense?.created_by_name) {
      return expense.created_by_name;
    }

    return getUserName(expense?.created_by);
  };

  const getUpdatedByName = (expense) => {
    if (expense?.updated_by_name) {
      return expense.updated_by_name;
    }

    return getUserName(expense?.updated_by);
  };

  const getApprovedByName = (expense) => {
    if (expense?.approved_by_name) {
      return expense.approved_by_name;
    }

    return getUserName(expense?.approved_by);
  };

  const getRejectedByName = (expense) => {
    if (expense?.rejected_by_name) {
      return expense.rejected_by_name;
    }

    return getUserName(expense?.rejected_by);
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("en-TZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-TZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpenseTotal = (expense) => {
    if (
      expense?.total !== null &&
      expense?.total !== undefined
    ) {
      return Number(expense.total);
    }

    return (
      Number(expense?.amount || 0) +
      Number(expense?.tax || 0)
    );
  };

  const getApiErrorMessage = (err, fallback) => {
    const apiError = err?.response?.data;

    if (!apiError) {
      return fallback;
    }

    if (typeof apiError === "string") {
      return apiError;
    }

    if (
      typeof apiError === "object" &&
      apiError !== null
    ) {
      if (apiError.detail) {
        return apiError.detail;
      }

      return Object.entries(apiError)
        .map(([field, message]) => {
          if (Array.isArray(message)) {
            return `${field}: ${message.join(", ")}`;
          }

          if (
            typeof message === "object" &&
            message !== null
          ) {
            return `${field}: ${JSON.stringify(message)}`;
          }

          return `${field}: ${message}`;
        })
        .join(" | ");
    }

    return fallback;
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      expense_type: "other",

      amount: "",
      tax: "0",

      expense_date: new Date().toISOString().split("T")[0],
      due_date: "",

      branch: "",

      payment_status: "pending",
      payment_method: "",
      payment_date: "",

      invoice_number: "",
      reference: "",

      receipt: null,
    });
  };

  // =========================================================
  // LOAD EXPENSES
  // =========================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await expensesApi.getAll();

      setExpenses(extractList(response));
    } catch (err) {
      console.error("Failed to load expenses:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load expenses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD BRANCHES
  // =========================================================

  const loadBranches = async () => {
    try {
      setLoadingOptions(true);

      const response = await branchesApi.getAll();

      setBranches(extractList(response));
    } catch (err) {
      console.error("Failed to load branches:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load branches. Please try again."
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadExpenses();
    loadBranches();
  }, []);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredExpenses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return expenses.filter((expense) => {
      const title = expense?.title || "";
      const description = expense?.description || "";
      const invoiceNumber = expense?.invoice_number || "";
      const reference = expense?.reference || "";

      const expenseType = getExpenseTypeName(
        expense?.expense_type
      );

      const branchName = getBranchName(expense);

      const createdBy = getCreatedByName(expense);
      const updatedBy = getUpdatedByName(expense);

      const approvedBy = getApprovedByName(expense);
      const rejectedBy = getRejectedByName(expense);

      const matchesSearch =
        !search ||
        String(title).toLowerCase().includes(search) ||
        String(expenseType).toLowerCase().includes(search) ||
        String(description).toLowerCase().includes(search) ||
        String(invoiceNumber).toLowerCase().includes(search) ||
        String(reference).toLowerCase().includes(search) ||
        String(branchName).toLowerCase().includes(search) ||
        String(createdBy).toLowerCase().includes(search) ||
        String(updatedBy).toLowerCase().includes(search) ||
        String(approvedBy).toLowerCase().includes(search) ||
        String(rejectedBy).toLowerCase().includes(search);

      const paymentStatus = String(
        expense?.payment_status || ""
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    expenses,
    searchTerm,
    statusFilter,
    branches,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total + getExpenseTotal(expense),
      0
    );
  }, [expenses]);

  const paidExpenses = useMemo(() => {
    return expenses
      .filter(
        (expense) =>
          String(expense?.payment_status || "").toLowerCase() ===
          "paid"
      )
      .reduce(
        (total, expense) =>
          total + getExpenseTotal(expense),
        0
      );
  }, [expenses]);

  const pendingExpenses = useMemo(() => {
    return expenses
      .filter(
        (expense) =>
          String(expense?.payment_status || "").toLowerCase() ===
          "pending"
      )
      .reduce(
        (total, expense) =>
          total + getExpenseTotal(expense),
        0
      );
  }, [expenses]);

  const approvedExpenses = useMemo(() => {
    return expenses
      .filter(
        (expense) => expense?.is_approved === true
      )
      .reduce(
        (total, expense) =>
          total + getExpenseTotal(expense),
        0
      );
  }, [expenses]);

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const handleAddExpense = () => {
    setEditingExpense(null);
    resetForm();

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);

    setFormData({
      title: expense?.title || "",

      description: expense?.description || "",

      expense_type:
        expense?.expense_type || "other",

      amount:
        expense?.amount !== null &&
        expense?.amount !== undefined
          ? String(expense.amount)
          : "",

      tax:
        expense?.tax !== null &&
        expense?.tax !== undefined
          ? String(expense.tax)
          : "0",

      expense_date: expense?.expense_date
        ? String(expense.expense_date).substring(0, 10)
        : new Date().toISOString().split("T")[0],

      due_date: expense?.due_date
        ? String(expense.due_date).substring(0, 10)
        : "",

      branch:
        expense?.branch !== null &&
        expense?.branch !== undefined
          ? String(
              typeof expense.branch === "object"
                ? expense.branch?.id
                : expense.branch
            )
          : "",

      payment_status:
        expense?.payment_status || "pending",

      payment_method:
        expense?.payment_method || "",

      payment_date: expense?.payment_date
        ? String(expense.payment_date).substring(0, 10)
        : "",

      invoice_number:
        expense?.invoice_number || "",

      reference:
        expense?.reference || "",

      receipt: null,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingExpense(null);
    resetForm();
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Expense title is required.";
    }

    if (!formData.expense_type) {
      return "Expense type is required.";
    }

    if (
      formData.amount === "" ||
      formData.amount === null ||
      formData.amount === undefined
    ) {
      return "Expense amount is required.";
    }

    if (Number.isNaN(Number(formData.amount))) {
      return "Expense amount must be a valid number.";
    }

    if (Number(formData.amount) < 0) {
      return "Expense amount cannot be negative.";
    }

    if (Number.isNaN(Number(formData.tax || 0))) {
      return "Tax must be a valid number.";
    }

    if (Number(formData.tax || 0) < 0) {
      return "Tax cannot be negative.";
    }

    if (!formData.expense_date) {
      return "Expense date is required.";
    }

    if (!formData.branch) {
      return "Branch is required.";
    }

    if (!formData.payment_status) {
      return "Payment status is required.";
    }

    return "";
  };

  // =========================================================
  // PREPARE PAYLOAD
  // =========================================================

  const preparePayload = () => {
    return {
      title: formData.title.trim(),

      description: formData.description.trim(),

      expense_type: formData.expense_type,

      amount: formData.amount,

      tax: formData.tax || "0",

      expense_date: formData.expense_date,

      due_date: formData.due_date || null,

      branch: Number(formData.branch),

      payment_status: formData.payment_status,

      payment_method:
        formData.payment_method.trim() || null,

      payment_date: formData.payment_date || null,

      invoice_number:
        formData.invoice_number.trim() || null,

      reference:
        formData.reference.trim() || null,
    };
  };

  // =========================================================
  // SAVE EXPENSE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = preparePayload();

      let response;

      // =====================================================
      // WITH RECEIPT
      // =====================================================

      if (formData.receipt) {
        const multipartData = new FormData();

        Object.entries(payload).forEach(
          ([key, value]) => {
            if (
              value !== null &&
              value !== undefined
            ) {
              multipartData.append(key, value);
            }
          }
        );

        multipartData.append(
          "receipt",
          formData.receipt
        );

        if (editingExpense) {
          response = await api.patch(
            `/expenses/${editingExpense.id}/`,
            multipartData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
        } else {
          response = await api.post(
            "/expenses/",
            multipartData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
        }
      }

      // =====================================================
      // WITHOUT RECEIPT
      // =====================================================

      else {
        if (editingExpense) {
          response = await expensesApi.update(
            editingExpense.id,
            payload
          );
        } else {
          response = await expensesApi.create(
            payload
          );
        }
      }

      const savedExpense =
        response?.data || response;

      if (editingExpense) {
        setExpenses((prev) =>
          prev.map((expense) =>
            expense.id === editingExpense.id
              ? savedExpense
              : expense
          )
        );

        setSuccess(
          "Expense updated successfully."
        );
      } else {
        setExpenses((prev) => [
          savedExpense,
          ...prev,
        ]);

        setSuccess(
          "Expense created successfully."
        );
      }

      setShowModal(false);
      setEditingExpense(null);
      resetForm();

      await loadExpenses();
    } catch (err) {
      console.error(
        "Failed to save expense:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to save expense. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // APPROVE EXPENSE
  // =========================================================

  const handleApprove = async (expense) => {
    if (!expense?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve "${expense.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setApprovingExpenseId(expense.id);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/expenses/${expense.id}/approve/`
      );

      const approvedExpense =
        response?.data || response;

      setExpenses((prev) =>
        prev.map((item) =>
          item.id === expense.id
            ? approvedExpense
            : item
        )
      );

      setSuccess(
        `"${expense.title}" has been approved successfully.`
      );

      // Make sure all server-generated fields are current
      await loadExpenses();
    } catch (err) {
      console.error(
        "Failed to approve expense:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to approve expense. Please try again."
        )
      );
    } finally {
      setApprovingExpenseId(null);
    }
  };

  // =========================================================
  // REJECT EXPENSE
  // =========================================================

  const handleReject = async (expense) => {
    if (!expense?.id) {
      return;
    }

    const reason = window.prompt(
      `Enter the reason for rejecting "${expense.title}":`
    );

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(
        "Rejection reason is required."
      );
      return;
    }

    try {
      setRejectingExpenseId(expense.id);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/expenses/${expense.id}/reject/`,
        {
          rejection_reason: trimmedReason,
        }
      );

      const rejectedExpense =
        response?.data || response;

      setExpenses((prev) =>
        prev.map((item) =>
          item.id === expense.id
            ? rejectedExpense
            : item
        )
      );

      setSuccess(
        `"${expense.title}" has been rejected successfully.`
      );

      await loadExpenses();
    } catch (err) {
      console.error(
        "Failed to reject expense:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to reject expense. Please try again."
        )
      );
    } finally {
      setRejectingExpenseId(null);
    }
  };

  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await expensesApi.delete(expense.id);

      setExpenses((prev) =>
        prev.filter(
          (item) => item.id !== expense.id
        )
      );

      setSuccess(
        "Expense deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete expense:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "Failed to delete expense. Please try again."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // PAYMENT STATUS BADGE
  // =========================================================

  const renderPaymentStatusBadge = (status) => {
    const normalized = String(
      status || ""
    ).toLowerCase();

    if (normalized === "paid") {
      return (
        <span className="badge bg-success">
          Paid
        </span>
      );
    }

    if (normalized === "partially_paid") {
      return (
        <span className="badge bg-info text-dark">
          Partially Paid
        </span>
      );
    }

    if (normalized === "overdue") {
      return (
        <span className="badge bg-danger">
          Overdue
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        Pending
      </span>
    );
  };

  // =========================================================
  // APPROVAL BADGE
  // =========================================================

  const renderApprovalBadge = (expense) => {
    if (expense?.is_rejected) {
      return (
        <div>
          <span className="badge bg-danger">
            <i className="bi bi-x-circle me-1"></i>
            Rejected
          </span>

          {expense?.rejection_reason && (
            <small className="d-block text-muted mt-1">
              {expense.rejection_reason}
            </small>
          )}

          {expense?.rejected_by_name && (
            <small className="d-block text-muted">
              By: {expense.rejected_by_name}
            </small>
          )}
        </div>
      );
    }

    if (expense?.is_approved) {
      return (
        <div>
          <span className="badge bg-success">
            <i className="bi bi-check-circle me-1"></i>
            Approved
          </span>

          {expense?.approved_by_name && (
            <small className="d-block text-muted mt-1">
              By: {expense.approved_by_name}
            </small>
          )}
        </div>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        <i className="bi bi-clock me-1"></i>
        Pending Approval
      </span>
    );
  };

  // =========================================================
  // APPROVAL ACTIONS
  // =========================================================

  const renderApprovalActions = (expense) => {
    const isApproving =
      approvingExpenseId === expense.id;

    const isRejecting =
      rejectingExpenseId === expense.id;

    const isProcessing =
      isApproving || isRejecting;

    // Already approved
    if (expense?.is_approved) {
      return (
        <span className="text-success small">
          <i className="bi bi-check-circle me-1"></i>
          Approved
        </span>
      );
    }

    // Already rejected
    if (expense?.is_rejected) {
      return (
        <span className="text-danger small">
          <i className="bi bi-x-circle me-1"></i>
          Rejected
        </span>
      );
    }

    return (
      <div className="btn-group">
        {/* APPROVE */}

        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          title="Approve expense"
          onClick={() =>
            handleApprove(expense)
          }
          disabled={
            isProcessing ||
            approvingExpenseId !== null ||
            rejectingExpenseId !== null ||
            deleting
          }
        >
          {isApproving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              Approving...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-1"></i>
              Approve
            </>
          )}
        </button>

        {/* REJECT */}

        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          title="Reject expense"
          onClick={() =>
            handleReject(expense)
          }
          disabled={
            isProcessing ||
            approvingExpenseId !== null ||
            rejectingExpenseId !== null ||
            deleting
          }
        >
          {isRejecting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
              ></span>
              Rejecting...
            </>
          ) : (
            <>
              <i className="bi bi-x-lg me-1"></i>
              Reject
            </>
          )}
        </button>
      </div>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Expenses
          </h2>

          <p className="text-muted mb-0">
            Manage business expenses and spending.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAddExpense}
          disabled={
            approvingExpenseId !== null ||
            rejectingExpenseId !== null
          }
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Expense
        </button>
      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>

          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="row g-3 mb-4">
        {/* TOTAL */}

        <div className="col-md-3">
          <div className="dashboard-card bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  Total Expenses
                </p>

                <h4 className="mb-0">
                  TSh {formatMoney(totalExpenses)}
                </h4>
              </div>

              <div className="fs-2 text-primary">
                <i className="bi bi-wallet2"></i>
              </div>
            </div>
          </div>
        </div>

        {/* PAID */}

        <div className="col-md-3">
          <div className="dashboard-card bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  Paid Expenses
                </p>

                <h4 className="mb-0 text-success">
                  TSh {formatMoney(paidExpenses)}
                </h4>
              </div>

              <div className="fs-2 text-success">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* PENDING PAYMENT */}

        <div className="col-md-3">
          <div className="dashboard-card bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  Pending Payment
                </p>

                <h4 className="mb-0 text-warning">
                  TSh {formatMoney(pendingExpenses)}
                </h4>
              </div>

              <div className="fs-2 text-warning">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
          </div>
        </div>

        {/* APPROVED */}

        <div className="col-md-3">
          <div className="dashboard-card bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  Approved
                </p>

                <h4 className="mb-0 text-success">
                  TSh {formatMoney(approvedExpenses)}
                </h4>
              </div>

              <div className="fs-2 text-success">
                <i className="bi bi-shield-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="dashboard-card bg-white p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
          <div>
            <h5 className="mb-1">
              Expense Management
            </h5>

            <small className="text-muted">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1
                ? "s"
                : ""}
            </small>
          </div>

          <div className="d-flex flex-column flex-md-row gap-2">
            {/* SEARCH */}

            <div
              className="input-group"
              style={{
                maxWidth: "350px",
              }}
            >
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setSearchTerm("")
                  }
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            {/* PAYMENT FILTER */}

            <select
              className="form-select"
              style={{
                minWidth: "180px",
              }}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Payment Statuses
              </option>

              {PAYMENT_STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-3 mb-0">
              Loading expenses...
            </p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================== */

          <div className="text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-receipt"
                style={{
                  fontSize: "3rem",
                }}
              ></i>
            </div>

            <h5>
              {searchTerm ||
              statusFilter !== "all"
                ? "No expenses found"
                : "No expenses yet"}
            </h5>

            <p className="text-muted">
              {searchTerm ||
              statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Add your first expense to get started."}
            </p>

            {!searchTerm &&
              statusFilter === "all" && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleAddExpense}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Expense
                </button>
              )}
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================== */

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Approval</th>
                  <th>Created By</th>
                  <th>Updated By</th>
                  <th className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map(
                  (expense, index) => (
                    <tr key={expense.id}>
                      {/* NUMBER */}

                      <td>
                        {index + 1}
                      </td>

                      {/* DATE */}

                      <td>
                        {formatDate(
                          expense.expense_date
                        )}
                      </td>

                      {/* TITLE */}

                      <td>
                        <div>
                          <div className="fw-semibold">
                            {expense.title || "—"}
                          </div>

                          {expense.description && (
                            <small className="text-muted">
                              {expense.description.length >
                              60
                                ? `${expense.description.substring(
                                    0,
                                    60
                                  )}...`
                                : expense.description}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: "36px",
                              height: "36px",
                            }}
                          >
                            <i className="bi bi-receipt"></i>
                          </div>

                          <div>
                            <span className="fw-semibold">
                              {getExpenseTypeName(
                                expense.expense_type
                              )}
                            </span>

                            <br />

                            <small className="text-muted">
                              {expense.expense_type ||
                                "other"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* BRANCH */}

                      <td>
                        {getBranchName(expense)}
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <span className="fw-semibold">
                          TSh{" "}
                          {formatMoney(
                            getExpenseTotal(
                              expense
                            )
                          )}
                        </span>

                        {Number(
                          expense.tax || 0
                        ) > 0 && (
                          <small className="d-block text-muted">
                            Tax: TSh{" "}
                            {formatMoney(
                              expense.tax
                            )}
                          </small>
                        )}
                      </td>

                      {/* PAYMENT */}

                      <td>
                        {renderPaymentStatusBadge(
                          expense.payment_status
                        )}
                      </td>

                      {/* APPROVAL */}

                      <td>
                        {renderApprovalBadge(
                          expense
                        )}
                      </td>

                      {/* CREATED BY */}

                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-plus text-muted me-2"></i>

                          <div>
                            <span className="fw-semibold">
                              {getCreatedByName(
                                expense
                              )}
                            </span>

                            {expense.created_at && (
                              <small className="d-block text-muted">
                                {formatDate(
                                  expense.created_at
                                )}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* UPDATED BY */}

                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-check text-muted me-2"></i>

                          <div>
                            <span className="fw-semibold">
                              {getUpdatedByName(
                                expense
                              )}
                            </span>

                            {expense.updated_at && (
                              <small className="d-block text-muted">
                                {formatDate(
                                  expense.updated_at
                                )}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td className="text-end">
                        <div className="d-flex justify-content-end align-items-center gap-1 flex-wrap">
                          {/* APPROVAL ACTIONS */}

                          {renderApprovalActions(
                            expense
                          )}

                          {/* EDIT */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            title="Edit expense"
                            onClick={() =>
                              handleEditExpense(
                                expense
                              )
                            }
                            disabled={
                              deleting ||
                              approvingExpenseId !==
                                null ||
                              rejectingExpenseId !==
                                null
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete expense"
                            onClick={() =>
                              handleDelete(
                                expense
                              )
                            }
                            disabled={
                              deleting ||
                              approvingExpenseId !==
                                null ||
                              rejectingExpenseId !==
                                null
                            }
                          >
                            {deleting ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></span>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

              {/* =================================================
                  TABLE FOOTER
              ================================================== */}

              <tfoot>
                <tr>
                  <td
                    colSpan="5"
                    className="text-end fw-semibold"
                  >
                    Total:
                  </td>

                  <td className="fw-bold">
                    TSh{" "}
                    {formatMoney(
                      filteredExpenses.reduce(
                        (total, expense) =>
                          total +
                          getExpenseTotal(
                            expense
                          ),
                        0
                      )
                    )}
                  </td>

                  <td colSpan="5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title">
                  <i
                    className={`bi ${
                      editingExpense
                        ? "bi-pencil-square"
                        : "bi-receipt"
                    } me-2`}
                  ></i>

                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={saving}
                ></button>
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* TITLE */}

                    <div className="col-md-8">
                      <label className="form-label">
                        Expense Title{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="e.g. Office electricity bill"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* TYPE */}

                    <div className="col-md-4">
                      <label className="form-label">
                        Expense Type{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <select
                        name="expense_type"
                        className="form-select"
                        value={
                          formData.expense_type
                        }
                        onChange={handleChange}
                        required
                      >
                        {EXPENSE_TYPES.map(
                          (type) => (
                            <option
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* BRANCH */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Branch{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <select
                        name="branch"
                        className="form-select"
                        value={formData.branch}
                        onChange={handleChange}
                        disabled={loadingOptions}
                        required
                      >
                        <option value="">
                          {loadingOptions
                            ? "Loading branches..."
                            : "Select branch"}
                        </option>

                        {branches.map(
                          (branch) => (
                            <option
                              key={branch.id}
                              value={branch.id}
                            >
                              {branch.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* EXPENSE DATE */}

                    <div className="col-md-3">
                      <label className="form-label">
                        Expense Date{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <input
                        type="date"
                        name="expense_date"
                        className="form-control"
                        value={
                          formData.expense_date
                        }
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* DUE DATE */}

                    <div className="col-md-3">
                      <label className="form-label">
                        Due Date
                      </label>

                      <input
                        type="date"
                        name="due_date"
                        className="form-control"
                        value={formData.due_date}
                        onChange={handleChange}
                      />
                    </div>

                    {/* AMOUNT */}

                    <div className="col-md-3">
                      <label className="form-label">
                        Amount{" "}
                        <span className="text-danger">
                          *
                        </span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          TSh
                        </span>

                        <input
                          type="number"
                          name="amount"
                          className="form-control"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={
                            formData.amount
                          }
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* TAX */}

                    <div className="col-md-3">
                      <label className="form-label">
                        Tax
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          TSh
                        </span>

                        <input
                          type="number"
                          name="tax"
                          className="form-control"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={formData.tax}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* PAYMENT STATUS */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Payment Status
                      </label>

                      <select
                        name="payment_status"
                        className="form-select"
                        value={
                          formData.payment_status
                        }
                        onChange={handleChange}
                      >
                        {PAYMENT_STATUSES.map(
                          (status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* PAYMENT METHOD */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Payment Method
                      </label>

                      <input
                        type="text"
                        name="payment_method"
                        className="form-control"
                        placeholder="e.g. Cash, Bank, M-Pesa"
                        value={
                          formData.payment_method
                        }
                        onChange={handleChange}
                      />
                    </div>

                    {/* PAYMENT DATE */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Payment Date
                      </label>

                      <input
                        type="date"
                        name="payment_date"
                        className="form-control"
                        value={
                          formData.payment_date
                        }
                        onChange={handleChange}
                      />
                    </div>

                    {/* INVOICE */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Invoice Number
                      </label>

                      <input
                        type="text"
                        name="invoice_number"
                        className="form-control"
                        placeholder="Optional invoice number"
                        value={
                          formData.invoice_number
                        }
                        onChange={handleChange}
                      />
                    </div>

                    {/* REFERENCE */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Reference
                      </label>

                      <input
                        type="text"
                        name="reference"
                        className="form-control"
                        placeholder="Optional reference"
                        value={
                          formData.reference
                        }
                        onChange={handleChange}
                      />
                    </div>

                    {/* RECEIPT */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Receipt
                      </label>

                      <input
                        type="file"
                        name="receipt"
                        className="form-control"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                      />

                      <small className="text-muted">
                        PDF, JPG, JPEG or PNG.
                      </small>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="col-12">
                      <label className="form-label">
                        Description
                      </label>

                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        placeholder="Enter expense description"
                        value={
                          formData.description
                        }
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  {/* TOTAL PREVIEW */}

                  <div className="alert alert-light border mt-4 mb-0">
                    <div className="d-flex justify-content-between">
                      <span>Amount</span>

                      <strong>
                        TSh{" "}
                        {formatMoney(
                          formData.amount
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Tax</span>

                      <strong>
                        TSh{" "}
                        {formatMoney(
                          formData.tax
                        )}
                      </strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                      <strong>Total</strong>

                      <strong className="text-primary">
                        TSh{" "}
                        {formatMoney(
                          Number(
                            formData.amount || 0
                          ) +
                            Number(
                              formData.tax || 0
                            )
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      saving ||
                      loadingOptions
                    }
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editingExpense
                          ? "Update Expense"
                          : "Save Expense"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;