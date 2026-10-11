// src/pages/users/hooks/useUsers.js

import { useCallback, useEffect, useState } from "react";
import userApi from "../../../../services/User";
import branchesApi from "../../../../services/branchesApi";
import { useBranch } from "../../../../context/BranchContext";

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
      .map(([field, messages]) =>
        `${field}: ${
          Array.isArray(messages)
            ? messages.join(", ")
            : String(messages)
        }`
      )
      .join(" | ");
  }

  return "An unexpected error occurred.";
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

  const loadBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);

      const data = await branchesApi.getAll({ page_size: 1000 });
      setBranches(
        Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

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

      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== "") params.is_active = statusFilter;

      const data = await userApi.getAll(params);
      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      // Client-side branch guard in addition to the API branch scope.
      const branchUsers = results.filter(
        (user) => String(getBranchId(user)) === String(currentBranchId)
      );

      setUsers(branchUsers);

      // Use server pagination metadata when available.
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
  }, [currentBranchId, page, roleFilter, search, statusFilter]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => setFormData({
    ...emptyForm,
    branch: currentBranchId ? String(currentBranchId) : "",
  });

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

  const submitUser = async (event) => {
    event.preventDefault();

    if (!currentBranchId) {
      setError("Select a branch before managing users.");
      return;
    }

    if (!formData.role || !Number.isInteger(Number(formData.role))) {
      setError("Select a valid role.");
      return;
    }

    if (!editingUser && formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        username: formData.username.trim(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: Number(formData.role),
        branch: Number(currentBranchId),
        is_active: formData.is_active,
      };

      if (!editingUser) {
        payload.password = formData.password;
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

  const toggleStatus = async (user) => {
    try {
      setError("");

      if (String(getBranchId(user)) !== String(currentBranchId)) {
        setError("You cannot change a user outside the selected branch.");
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

  const openDelete = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    if (!deletingUser) return;

    if (String(getBranchId(deletingUser)) !== String(currentBranchId)) {
      setError("You cannot delete a user outside the selected branch.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await userApi.delete(deletingUser.id);
      setShowDeleteModal(false);
      setDeletingUser(null);

      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  return {
    users, branches, loading, branchesLoading, saving, error, setError,
    search, setSearch, roleFilter, setRoleFilter,
    statusFilter, setStatusFilter, page, setPage, pageSize,
    totalPages, totalUsers, showModal, setShowModal,
    editingUser, showDeleteModal, setShowDeleteModal, deletingUser,
    formData, handleChange, loadUsers, openAdd, openEdit,
    submitUser, toggleStatus, openDelete, deleteUser, clearFilters,
    currentBranch, currentBranchId,
  };
}