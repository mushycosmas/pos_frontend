import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import customerApi from "../../services/customerApi";
import { useBranch } from "../../context/BranchContext";

import CustomerHeader from "./components/CustomerHeader";
import CustomerSearch from "./components/CustomerSearch";
import CustomerTable from "./components/CustomerTable";
import CustomerFormModal from "./components/CustomerFormModal";

const Customers = () => {
  const { currentBranch } = useBranch();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const loadCustomers = useCallback(async () => {
    if (!currentBranch?.id) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await customerApi.getAll();

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setCustomers(rows);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setCustomers([]);
      setError(
        err?.response?.data?.detail ||
          "Failed to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentBranch?.id]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.customer_type_display,
        customer.customer_type,
        customer.tax_number,
        customer.company_name,
        customer.branch_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      )
    );
  }, [customers, searchTerm]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-TZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const handleAddCustomer = () => {
    if (!currentBranch?.id) {
      setError("Select a branch before adding a customer.");
      return;
    }

    setEditingCustomer(null);
    setError("");
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError("");

      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, payload);
      } else {
        await customerApi.create(payload);
      }

      setShowModal(false);
      setEditingCustomer(null);

      // Fetch authoritative data from the API.
      await loadCustomers();
    } catch (err) {
      console.error("Failed to save customer:", err);

      const data = err?.response?.data;
      const message =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, value]) =>
                `${field}: ${
                  Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : value
                }`
              )
              .join(" | ")
          : "Failed to save customer. Please try again.";

      setError(message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${customer.name}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      await customerApi.delete(customer.id);
      await loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to delete customer. Please try again."
      );
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      setError("");

      await customerApi.patch(customer.id, {
        is_active: !customer.is_active,
      });

      await loadCustomers();
    } catch (err) {
      console.error("Failed to update customer status:", err);
      setError(
        err?.response?.data?.detail ||
          "Failed to update customer status."
      );
    }
  };

  return (
    <div>
      <CustomerHeader
        onAddCustomer={handleAddCustomer}
        branchName={currentBranch?.name}
      />

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2" />
          {error}

          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="dashboard-card bg-white p-4">
        <CustomerSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          total={filteredCustomers.length}
        />

        <CustomerTable
          customers={filteredCustomers}
          loading={loading}
          searchTerm={searchTerm}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onToggleStatus={handleToggleStatus}
          formatMoney={formatMoney}
          onAddCustomer={handleAddCustomer}
        />
      </div>

      <CustomerFormModal
        show={showModal}
        customer={editingCustomer}
        currentBranch={currentBranch}
        saving={saving}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Customers;