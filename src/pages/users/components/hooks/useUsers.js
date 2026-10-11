
import { useCallback, useEffect, useState } from "react";

import userApi from "../../../../services/User";
import branchesApi from "../../../../services/branchesApi";
import { useBranch } from "../../../../context/BranchContext";

const DEFAULT_PASSWORD = "ChangeMe@123";

const emptyForm = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  branch: "",
  is_active: true,
};

const getErrorMessage = (err) => {
  const data = err?.response?.data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(", ")
          : typeof messages === "object" && messages !== null
            ? JSON.stringify(messages)
            : String(messages);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return err?.message || "An unexpected error occurred.";
};

const getBranchId = (user) => {
  const branch = user?.branch;

  if (branch && typeof branch === "object") {
    return branch.id ?? branch.branch_id ?? null;
  }

  return branch ?? user?.branch_id ?? null;
};

export { emptyForm, getErrorMessage, getBranchId };

export default function useUsers() {
  const { currentBranch } = useBranch();

  const currentBranchId =
    currentBranch?.id ?? currentBranch?.branch_id ?? null;

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // --------------------------------------------------
  // LOAD BRANCHES
  // --------------------------------------------------

  const loadBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);

      const data = await branchesApi.getAll({ page_size: 1000 });

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      setBranches(results);
    } catch (err) {
      setError(getErrorMessage(err));
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // LOAD USERS FOR CURRENT BRANCH
  // --------------------------------------------------

  const loadUsers = useCallback(async () => {
    if (!currentBranchId) {
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: pageSize,
        branch: currentBranchId,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter !== "") {
        params.is_active = statusFilter;
      }

      const data = await userApi.getAll(params);

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      // Only display users belonging to the selected branch.
      const branchUsers = results.filter(
        (user) =>
          String(getBranchId(user)) === String(currentBranchId)
      );

      setUsers(branchUsers);

      const count = data?.count ?? branchUsers.length;

      setTotalUsers(count);

      setTotalPages(
        Array.isArray(data?.results)
          ? Math.max(1, Math.ceil(count / pageSize))
          : 1
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    currentBranchId,
    page,
    roleFilter,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      branch: currentBranchId ? String(currentBranchId) : "",
    });
  };

  const openAdd = () => {
    setEditingUser(null);
    resetForm();
    setError("");
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      password: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: String(
        user.role_id ??
          (typeof user.role === "object" ? user.role?.id : user.role) ??
          ""
      ),
      branch: String(getBranchId(user) ?? currentBranchId ?? ""),
      is_active: user.is_active ?? true,
    });

    setError("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CREATE / UPDATE USER
  // --------------------------------------------------

  const submitUser = async (event, submittedData) => {
    event?.preventDefault?.();

    if (saving) {
      return;
    }

    if (!currentBranchId) {
      setError("Select a branch before managing users.");
      return;
    }

    // Accept the direct payload passed by UserFormModal.
    // Fall back to the current form state if none is provided.
    const source = submittedData || formData;

    if (!String(source.username || "").trim()) {
      setError("Username is required.");
      return;
    }

    if (
      !source.role ||
      !Number.isInteger(Number(source.role))
    ) {
      setError("Select a valid role.");
      return;
    }

    // New users always receive the default password when blank.
    // Editing a user does not change their existing password.
    const password = editingUser
      ? ""
      : String(source.password || "").trim() || DEFAULT_PASSWORD;

    if (!editingUser && password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        username: String(source.username).trim(),
        first_name: source.first_name || "",
        last_name: source.last_name || "",
        email: source.email || "",
        phone: source.phone || "",
        role: Number(source.role),
        branch: Number(currentBranchId),
        is_active: source.is_active ?? true,
      };

      if (!editingUser) {
        payload.password = password;

        await userApi.create(payload);
      } else {
        await userApi.update(editingUser.id, payload);
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();

      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE / DEACTIVATE USER
  // --------------------------------------------------

  const toggleStatus = async (user) => {
    if (saving) {
      return;
    }

    try {
      setError("");

      if (
        String(getBranchId(user)) !== String(currentBranchId)
      ) {
        setError(
          "You cannot change a user outside the selected branch."
        );
        return;
      }

      if (user.is_active) {
        await userApi.deactivate(user.id);
      } else {
        await userApi.activate(user.id);
      }

      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const openDelete = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
    setError("");
  };

  const deleteUser = async () => {
    if (!deletingUser || saving) {
      return;
    }

    if (
      String(getBranchId(deletingUser)) !== String(currentBranchId)
    ) {
      setError(
        "You cannot delete a user outside the selected branch."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await userApi.delete(deletingUser.id);

      setShowDeleteModal(false);
      setDeletingUser(null);

      if (users.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // --------------------------------------------------
  // RETURN HOOK API
  // --------------------------------------------------

  return {
    users,
    branches,

    loading,
    branchesLoading,
    saving,
    error,
    setError,

    search,
    setSearch,

    roleFilter,
    setRoleFilter,

    statusFilter,
    setStatusFilter,

    page,
    setPage,
    pageSize,

    totalPages,
    totalUsers,

    showModal,
    setShowModal,

    editingUser,

    showDeleteModal,
    setShowDeleteModal,

    deletingUser,

    formData,
    handleChange,

    loadUsers,
    openAdd,
    openEdit,
    submitUser,
    toggleStatus,
    openDelete,
    deleteUser,
    clearFilters,

    currentBranch,
    currentBranchId,
  };
}
