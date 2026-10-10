import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import purchasesApi from "../../../../services/purchasesApi";
import productsApi from "../../../../services/productsApi";
import suppliersApi from "../../../../services/suppliersApi";
import branchesApi from "../../../../services/branchesApi";

import { useBranch } from "../../../../context/BranchContext";

import {
  buildPurchasePayload,
  getBackendError,
  getItems,
  getPurchaseTotal,
  getPurchaseNumber,
  normalizeResponse,
  isFullyReceived,
} from "../utils/purchaseUtils";

const getBranchId = (purchase) => {
  const branch =
    purchase?.branch ??
    purchase?.branch_id ??
    purchase?.branchId;

  if (branch && typeof branch === "object") {
    return branch.id == null ? "" : String(branch.id);
  }

  return branch == null ? "" : String(branch);
};

const usePurchases = () => {
  const { currentBranch } = useBranch();

  const currentBranchId =
    currentBranch?.id == null
      ? ""
      : String(currentBranch.id);

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load purchases for the currently selected branch.
  const loadPurchases = useCallback(async () => {
    if (!currentBranchId) {
      setPurchases([]);
      return [];
    }

    const response = await purchasesApi.getAll();
    const list = normalizeResponse(response);

    const branchPurchases = list.filter(
      (purchase) =>
        getBranchId(purchase) === currentBranchId
    );

    setPurchases(branchPurchases);

    return branchPurchases;
  }, [currentBranchId]);

  // Load products for the currently selected branch.
  const loadProducts = useCallback(async () => {
    if (!currentBranchId) {
      setProducts([]);
      return [];
    }

    const response = await productsApi.getAll({
      branch: currentBranchId,
    });

    const list = normalizeResponse(response);

    setProducts(list);

    return list;
  }, [currentBranchId]);

  const loadSuppliers = useCallback(async () => {
    const response = await suppliersApi.getAll();
    const list = normalizeResponse(response);

    setSuppliers(list);

    return list;
  }, []);

  const loadBranches = useCallback(async () => {
    const response = await branchesApi.getAll();
    const list = normalizeResponse(response);

    setBranches(list);

    return list;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        loadPurchases(),
        loadProducts(),
        loadSuppliers(),
        loadBranches(),
      ]);

      const failed = results.find(
        (result) => result.status === "rejected"
      );

      if (failed) {
        throw failed.reason;
      }
    } catch (err) {
      console.error("Failed to load purchase data:", err);
      console.error("Backend response:", err?.response?.data);

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

  // Reload purchases and products when the branch changes.
  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshPurchases = useCallback(async () => {
    await Promise.all([
      loadPurchases(),
      loadProducts(),
    ]);
  }, [loadPurchases, loadProducts]);

  const handleSave = useCallback(
    async (purchaseData) => {
      try {
        setSaving(true);
        setError("");
        setSuccess("");

        if (!currentBranchId) {
          throw new Error(
            "Please select a branch before creating a purchase."
          );
        }

        const payload = buildPurchasePayload({
          ...purchaseData,
          branch: currentBranchId,
        });

        await purchasesApi.create(payload);

        setSuccess("Purchase created successfully.");

        await refreshPurchases();

        return true;
      } catch (err) {
        console.error("Failed to save purchase:", err);
        console.error("Backend response:", err?.response?.data);

        setError(
          getBackendError(
            err,
            "Failed to save purchase."
          )
        );

        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentBranchId, refreshPurchases]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this purchase?"
      );

      if (!confirmed) return;

      try {
        setDeletingId(id);
        setError("");
        setSuccess("");

        await purchasesApi.delete(id);

        setSuccess("Purchase deleted successfully.");

        await refreshPurchases();
      } catch (err) {
        console.error("Failed to delete purchase:", err);
        console.error("Backend response:", err?.response?.data);

        setError(
          getBackendError(
            err,
            "Failed to delete purchase."
          )
        );
      } finally {
        setDeletingId(null);
      }
    },
    [refreshPurchases]
  );

  const handleReceive = useCallback(
    async (purchase) => {
      if (!purchase?.id || isFullyReceived(purchase)) {
        return;
      }

      if (purchase.status === "cancelled") {
        return;
      }

      const confirmed = window.confirm(
        `Receive purchase ${getPurchaseNumber(purchase)}?`
      );

      if (!confirmed) return;

      try {
        setReceiving(true);
        setError("");
        setSuccess("");

        if (typeof purchasesApi.receive !== "function") {
          throw new Error(
            "purchasesApi.receive() is not implemented."
          );
        }

        await purchasesApi.receive(purchase.id);

        setSuccess("Purchase received successfully.");

        await refreshPurchases();
      } catch (err) {
        console.error("Failed to receive purchase:", err);
        console.error("Backend response:", err?.response?.data);

        setError(
          getBackendError(
            err,
            "Failed to receive purchase."
          )
        );
      } finally {
        setReceiving(false);
      }
    },
    [refreshPurchases]
  );

  const sortedPurchases = useMemo(
    () =>
      [...purchases].sort((a, b) => {
        const dateA = new Date(
          a.created_at ?? a.order_date ?? 0
        ).getTime();

        const dateB = new Date(
          b.created_at ?? b.order_date ?? 0
        ).getTime();

        return dateB - dateA;
      }),
    [purchases]
  );

  const statistics = useMemo(
    () => ({
      totalPurchases: purchases.length,

      totalPurchaseValue: purchases.reduce(
        (sum, purchase) =>
          sum + getPurchaseTotal(purchase),
        0
      ),

      totalItemsPurchased: purchases.reduce(
        (sum, purchase) =>
          sum +
          getItems(purchase).reduce(
            (itemSum, item) =>
              itemSum + (Number(item.quantity) || 0),
            0
          ),
        0
      ),

      receivedPurchases: purchases.filter(
        (purchase) => purchase.status === "received"
      ).length,

      pendingPurchases: purchases.filter(
        (purchase) =>
          ["draft", "ordered"].includes(purchase.status)
      ).length,
    }),
    [purchases]
  );

  const clearError = useCallback(() => setError(""), []);
  const clearSuccess = useCallback(() => setSuccess(""), []);

  return {
    purchases,
    sortedPurchases,
    products,
    suppliers,
    branches,
    currentBranch,
    currentBranchId,
    loading,
    saving,
    receiving,
    deletingId,
    error,
    success,
    statistics,
    handleSave,
    handleDelete,
    handleReceive,
    loadData,
    refreshPurchases,
    clearError,
    clearSuccess,
  };
};

export default usePurchases;
