import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../services/api";
import expensesApi from "../../services/expensesApi";
import branchesApi from "../../services/branchesApi";
import paymentMethodApi from "../../services/paymentMethod";

import { useBranch } from "../../context/BranchContext";

import ExpensePageHeader from "./components/ExpensePageHeader";
import ExpenseAlerts from "./components/ExpenseAlerts";
import ExpenseStats from "./components/ExpenseStats";
import ExpenseTable from "./components/ExpenseTable";
import ExpenseFormModal from "./components/ExpenseFormModal";

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

const getToday = () => new Date().toISOString().split("T")[0];

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  expense_type: "other",
  amount: "",
  tax: "0",
  expense_date: getToday(),
  due_date: "",
  branch: "",
  payment_status: "pending",
  payment_method: "",
  payment_date: "",
  invoice_number: "",
  reference: "",
  receipt: null,
};

// =========================================================
// GENERAL HELPERS
// =========================================================

const extractList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.results)) {
    return data.data.results;
  }

  return [];
};

const getApiErrorMessage = (err, fallback) => {
  const apiError = err?.response?.data;

  if (!apiError) {
    return fallback;
  }

  if (typeof apiError === "string") {
    return apiError;
  }

  if (typeof apiError === "object") {
    if (apiError.detail) {
      return apiError.detail;
    }

    return Object.entries(apiError)
      .map(([field, message]) => {
        if (Array.isArray(message)) {
          return `${field}: ${message.join(", ")}`;
        }

        if (typeof message === "object" && message !== null) {
          return `${field}: ${JSON.stringify(message)}`;
        }

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return fallback;
};

const getExpenseBranchId = (expense) => {
  if (expense?.branch && typeof expense.branch === "object") {
    return expense.branch.id ?? "";
  }

  return expense?.branch ?? "";
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

const getExpenseTotal = (expense) => {
  if (expense?.total !== null && expense?.total !== undefined) {
    return Number(expense.total);
  }

  return (
    Number(expense?.amount || 0) +
    Number(expense?.tax || 0)
  );
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

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

// =========================================================
// MAIN COMPONENT
// =========================================================

const Expenses = () => {
  // =======================================================
  // BRANCH CONTEXT
  // =======================================================

  const { currentBranch } = useBranch();

  const currentBranchId =
    currentBranch?.id !== null &&
    currentBranch?.id !== undefined
      ? String(currentBranch.id)
      : "";

  // =======================================================
  // STATE
  // =======================================================

  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [approvingExpenseId, setApprovingExpenseId] =
    useState(null);

  const [rejectingExpenseId, setRejectingExpenseId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
  });

  // =======================================================
  // DISPLAY HELPERS
  // =======================================================

  const getExpenseTypeName = useCallback((type) => {
    const found = EXPENSE_TYPES.find(
      (item) => item.value === type
    );

    return found?.label || type || "Other";
  }, []);

  const getPaymentStatusName = useCallback((status) => {
    const found = PAYMENT_STATUSES.find(
      (item) => item.value === status
    );

    return found?.label || status || "Pending";
  }, []);

  const getBranchName = useCallback(
    (expense) => {
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

      const branchId = getExpenseBranchId(expense);

      const branch = branches.find(
        (item) => String(item.id) === String(branchId)
      );

      return branch?.name || "—";
    },
    [branches]
  );

  const getCreatedByName = useCallback(
    (expense) =>
      expense?.created_by_name ||
      getUserName(expense?.created_by),
    []
  );

  const getUpdatedByName = useCallback(
    (expense) =>
      expense?.updated_by_name ||
      getUserName(expense?.updated_by),
    []
  );

  const getApprovedByName = useCallback(
    (expense) =>
      expense?.approved_by_name ||
      getUserName(expense?.approved_by),
    []
  );

  const getRejectedByName = useCallback(
    (expense) =>
      expense?.rejected_by_name ||
      getUserName(expense?.rejected_by),
    []
  );

  // =======================================================
  // RESET FORM
  // =======================================================

  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      expense_date: getToday(),
      branch: currentBranchId,
    });
  }, [currentBranchId]);

  // =======================================================
  // LOAD EXPENSES FOR CURRENT BRANCH
  // =======================================================

  const loadExpenses = useCallback(async () => {
    if (!currentBranchId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await expensesApi.getAll();
      const rows = extractList(response?.data ?? response);

      const branchExpenses = rows.filter((expense) => {
        const expenseBranchId = getExpenseBranchId(expense);

        return String(expenseBranchId) === currentBranchId;
      });

      setExpenses(branchExpenses);
    } catch (err) {
      console.error("Failed to load expenses:", err);

      setExpenses([]);

      setError(
        getApiErrorMessage(
          err,
          "Failed to load expenses. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [currentBranchId]);

  // =======================================================
  // LOAD BRANCHES
  // =======================================================

  const loadBranches = useCallback(async () => {
    try {
      setLoadingOptions(true);

      const response = await branchesApi.getAll();

      setBranches(
        extractList(response?.data ?? response)
      );
    } catch (err) {
      console.error("Failed to load branches:", err);

      setError(
        getApiErrorMessage(
          err,
          "Failed to load branches. Please try again."
        )
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  // =======================================================
  // LOAD ACTIVE PAYMENT METHODS
  // Try getActive() first, then fall back to getAll().
// =======================================================

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      setError("");

      let methods = [];

      try {
        const response = await paymentMethodApi.getActive();

        methods = extractList(response?.data ?? response);
      } catch (activeErr) {
        console.log(
          "Active endpoint failed, trying getAll:",
          activeErr
        );

        const response = await paymentMethodApi.getAll({
          is_active: true,
        });

        methods = extractList(response?.data ?? response);
      }

      if (methods.length === 0) {
        setError(
          "No active payment methods found. Please contact the administrator."
        );
      }

      setPaymentMethods(methods);
    } catch (err) {
      console.error("Failed to load payment methods:", err);

      setPaymentMethods([]);

      let message = "Failed to load payment methods. ";

      if (err?.response?.status === 404) {
        message += "Payment methods endpoint not found.";
      } else if (err?.response?.status === 403) {
        message +=
          "You don't have permission to view payment methods.";
      } else if (err?.response?.status === 500) {
        message += "Server error. Please try again later.";
      } else {
        message += "Please refresh the page.";
      }

      setError(message);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  // =======================================================
  // EFFECTS
  // =======================================================

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    loadBranches();
    loadPaymentMethods();
  }, [loadBranches, loadPaymentMethods]);

  // Keep the new-expense branch synchronized with the selected branch.
  useEffect(() => {
    if (!showModal || editingExpense || !currentBranchId) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      branch: currentBranchId,
    }));
  }, [currentBranchId, showModal, editingExpense]);

  // =======================================================
  // SEARCH AND FILTER
  // =======================================================

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
    getExpenseTypeName,
    getBranchName,
    getCreatedByName,
    getUpdatedByName,
    getApprovedByName,
    getRejectedByName,
  ]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + getExpenseTotal(expense),
        0
      ),
    [expenses]
  );

  const paidExpenses = useMemo(
    () =>
      expenses
        .filter(
          (expense) =>
            String(expense?.payment_status || "").toLowerCase() ===
            "paid"
        )
        .reduce(
          (total, expense) => total + getExpenseTotal(expense),
          0
        ),
    [expenses]
  );

  const pendingExpenses = useMemo(
    () =>
      expenses
        .filter(
          (expense) =>
            String(expense?.payment_status || "").toLowerCase() ===
            "pending"
        )
        .reduce(
          (total, expense) => total + getExpenseTotal(expense),
          0
        ),
    [expenses]
  );

  const approvedExpenses = useMemo(
    () =>
      expenses
        .filter((expense) => expense?.is_approved === true)
        .reduce(
          (total, expense) => total + getExpenseTotal(expense),
          0
        ),
    [expenses]
  );

  // =======================================================
  // OPEN ADD MODAL
  // =======================================================

  const handleAddExpense = () => {
    if (!currentBranchId) {
      setError("Select a branch before adding an expense.");
      setSuccess("");
      return;
    }

    setEditingExpense(null);
    resetForm();

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  const handleEditExpense = (expense) => {
    if (
      String(getExpenseBranchId(expense)) !== currentBranchId
    ) {
      setError(
        "You can only edit expenses belonging to the selected branch."
      );
      return;
    }

    setEditingExpense(expense);

    setFormData({
      title: expense?.title || "",
      description: expense?.description || "",
      expense_type: expense?.expense_type || "other",

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
        : getToday(),

      due_date: expense?.due_date
        ? String(expense.due_date).substring(0, 10)
        : "",

      branch: String(getExpenseBranchId(expense) || ""),

      payment_status: expense?.payment_status || "pending",

      payment_method:
        expense?.payment_method !== null &&
        expense?.payment_method !== undefined
          ? String(
              typeof expense.payment_method === "object"
                ? expense.payment_method.id ?? ""
                : expense.payment_method
            )
          : "",

      payment_date: expense?.payment_date
        ? String(expense.payment_date).substring(0, 10)
        : "",

      invoice_number: expense?.invoice_number || "",
      reference: expense?.reference || "",
      receipt: null,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingExpense(null);
    resetForm();
  };

  // =======================================================
  // HANDLE FORM CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Keep the branch fixed when creating an expense.
    if (name === "branch" && !editingExpense) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // =======================================================
  // VALIDATE FORM
  // =======================================================

  const validateForm = () => {
    if (!currentBranchId) {
      return "Select a branch before saving an expense.";
    }

    if (!formData.title.trim()) {
      return "Expense title is required.";
    }

    if (!formData.expense_type) {
      return "Expense type is required.";
    }

    if (
      formData.amount === "" ||
      !Number.isFinite(Number(formData.amount)) ||
      Number(formData.amount) < 0
    ) {
      return "Enter a valid, non-negative expense amount.";
    }

    if (
      !Number.isFinite(Number(formData.tax || 0)) ||
      Number(formData.tax || 0) < 0
    ) {
      return "Enter a valid, non-negative tax amount.";
    }

    if (!formData.expense_date) {
      return "Expense date is required.";
    }

    if (!formData.branch) {
      return "Branch is required.";
    }

    if (
      !editingExpense &&
      String(formData.branch) !== currentBranchId
    ) {
      return "The expense branch must match the selected branch.";
    }

    if (
      editingExpense &&
      String(getExpenseBranchId(editingExpense)) !== currentBranchId
    ) {
      return "You can only edit expenses belonging to the selected branch.";
    }

    if (!formData.payment_status) {
      return "Payment status is required.";
    }

    return "";
  };

  // =======================================================
  // PREPARE PAYLOAD
  // =======================================================

  const preparePayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    expense_type: formData.expense_type,
    amount: formData.amount,
    tax: formData.tax || "0",
    expense_date: formData.expense_date,
    due_date: formData.due_date || null,
    branch: Number(formData.branch),
    payment_status: formData.payment_status,
    payment_method: formData.payment_method || null,
    payment_date: formData.payment_date || null,
    invoice_number: formData.invoice_number.trim() || null,
    reference: formData.reference.trim() || null,
  });

  // =======================================================
  // SAVE EXPENSE
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    const isEditing = Boolean(editingExpense);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = preparePayload();

      if (formData.receipt) {
        const multipartData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            multipartData.append(key, value);
          }
        });

        multipartData.append("receipt", formData.receipt);

        if (isEditing) {
          await api.patch(
            `/expenses/${editingExpense.id}/`,
            multipartData
          );
        } else {
          await api.post("/expenses/", multipartData);
        }
      } else if (isEditing) {
        await expensesApi.update(
          editingExpense.id,
          payload
        );
      } else {
        await expensesApi.create(payload);
      }

      setShowModal(false);
      setEditingExpense(null);
      resetForm();

      setSuccess(
        isEditing
          ? "Expense updated successfully."
          : "Expense created successfully."
      );

      await loadExpenses();
    } catch (err) {
      console.error("Failed to save expense:", err);

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

  // =======================================================
  // APPROVE EXPENSE
  // =======================================================

  const handleApprove = async (expense) => {
    if (!expense?.id) {
      return;
    }

    if (
      String(getExpenseBranchId(expense)) !== currentBranchId
    ) {
      setError(
        "You can only approve expenses in the selected branch."
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve "${expense.title}"?`
      )
    ) {
      return;
    }

    try {
      setApprovingExpenseId(expense.id);
      setError("");
      setSuccess("");

      await api.post(`/expenses/${expense.id}/approve/`);

      setSuccess(
        `"${expense.title}" has been approved successfully.`
      );

      await loadExpenses();
    } catch (err) {
      console.error("Failed to approve expense:", err);

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

  // =======================================================
  // REJECT EXPENSE
  // =======================================================

  const handleReject = async (expense) => {
    if (!expense?.id) {
      return;
    }

    if (
      String(getExpenseBranchId(expense)) !== currentBranchId
    ) {
      setError(
        "You can only reject expenses in the selected branch."
      );
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
      setError("Rejection reason is required.");
      return;
    }

    try {
      setRejectingExpenseId(expense.id);
      setError("");
      setSuccess("");

      await api.post(
        `/expenses/${expense.id}/reject/`,
        { rejection_reason: trimmedReason }
      );

      setSuccess(
        `"${expense.title}" has been rejected successfully.`
      );

      await loadExpenses();
    } catch (err) {
      console.error("Failed to reject expense:", err);

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

  // =======================================================
  // DELETE EXPENSE
  // =======================================================

  const handleDelete = async (expense) => {
    if (
      String(getExpenseBranchId(expense)) !== currentBranchId
    ) {
      setError(
        "You can only delete expenses in the selected branch."
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${expense.title}"?`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await expensesApi.delete(expense.id);

      setExpenses((prev) =>
        prev.filter((item) => item.id !== expense.id)
      );

      setSuccess("Expense deleted successfully.");
    } catch (err) {
      console.error("Failed to delete expense:", err);

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

  // =======================================================
  // PAYMENT STATUS BADGE
  // =======================================================

  const renderPaymentStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") {
      return <span className="badge bg-success">Paid</span>;
    }

    if (normalized === "partially_paid") {
      return (
        <span className="badge bg-info text-dark">
          Partially Paid
        </span>
      );
    }

    if (normalized === "overdue") {
      return <span className="badge bg-danger">Overdue</span>;
    }

    return (
      <span className="badge bg-warning text-dark">
        Pending
      </span>
    );
  };

  // =======================================================
  // APPROVAL BADGE
  // =======================================================

  const renderApprovalBadge = (expense) => {
    if (expense?.is_rejected) {
      return (
        <div>
          <span className="badge bg-danger">
            <i className="bi bi-x-circle me-1" />
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
            <i className="bi bi-check-circle me-1" />
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
        <i className="bi bi-clock me-1" />
        Pending Approval
      </span>
    );
  };

  // =======================================================
  // APPROVAL ACTIONS
  // =======================================================

  const renderApprovalActions = (expense) => {
    const isApproving = approvingExpenseId === expense.id;
    const isRejecting = rejectingExpenseId === expense.id;
    const isProcessing = isApproving || isRejecting;

    if (expense?.is_approved) {
      return (
        <span className="text-success small">
          <i className="bi bi-check-circle me-1" />
          Approved
        </span>
      );
    }

    if (expense?.is_rejected) {
      return (
        <span className="text-danger small">
          <i className="bi bi-x-circle me-1" />
          Rejected
        </span>
      );
    }

    return (
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          title="Approve expense"
          onClick={() => handleApprove(expense)}
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
              />
              Approving...
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-1" />
              Approve
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          title="Reject expense"
          onClick={() => handleReject(expense)}
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
              />
              Rejecting...
            </>
          ) : (
            <>
              <i className="bi bi-x-lg me-1" />
              Reject
            </>
          )}
        </button>
      </div>
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div>
      <ExpensePageHeader
        handleAddExpense={handleAddExpense}
        approvingExpenseId={approvingExpenseId}
        rejectingExpenseId={rejectingExpenseId}
      />

      <ExpenseAlerts
        error={error}
        setError={setError}
        success={success}
        setSuccess={setSuccess}
      />

      <ExpenseStats
        formatMoney={formatMoney}
        totalExpenses={totalExpenses}
        paidExpenses={paidExpenses}
        pendingExpenses={pendingExpenses}
        approvedExpenses={approvedExpenses}
      />

      <div className="dashboard-card bg-white p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
          <div>
            <h5 className="mb-1">Expense Management</h5>

            <small className="text-muted">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1 ? "s" : ""}
              {currentBranch?.name
                ? ` · ${currentBranch.name}`
                : ""}
            </small>
          </div>

          <div className="d-flex flex-column flex-md-row gap-2">
            {/* SEARCH */}
            <div
              className="input-group"
              style={{ maxWidth: "350px" }}
            >
              <span className="input-group-text bg-white">
                <i className="bi bi-search" />
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>

            {/* PAYMENT STATUS FILTER */}
            <select
              className="form-select"
              style={{ minWidth: "180px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Statuses</option>

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

        <ExpenseTable
          loading={loading}
          filteredExpenses={filteredExpenses}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          handleAddExpense={handleAddExpense}
          formatDate={formatDate}
          getExpenseTypeName={getExpenseTypeName}
          getBranchName={getBranchName}
          formatMoney={formatMoney}
          getExpenseTotal={getExpenseTotal}
          renderPaymentStatusBadge={renderPaymentStatusBadge}
          renderApprovalBadge={renderApprovalBadge}
          getCreatedByName={getCreatedByName}
          getUpdatedByName={getUpdatedByName}
          renderApprovalActions={renderApprovalActions}
          handleEditExpense={handleEditExpense}
          handleDelete={handleDelete}
          deleting={deleting}
          approvingExpenseId={approvingExpenseId}
          rejectingExpenseId={rejectingExpenseId}
        />
      </div>

      <ExpenseFormModal
        showModal={showModal}
        editingExpense={editingExpense}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        EXPENSE_TYPES={EXPENSE_TYPES}
        branches={branches}
        currentBranch={currentBranch}
        paymentMethods={paymentMethods}
        loadingOptions={loadingOptions}
        loadingPaymentMethods={loadingPaymentMethods}
        PAYMENT_STATUSES={PAYMENT_STATUSES}
        formatMoney={formatMoney}
        saving={saving}
      />
    </div>
  );
};

export default Expenses;

