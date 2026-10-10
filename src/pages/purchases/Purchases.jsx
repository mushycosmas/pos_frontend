import React, { useState } from "react";

import PurchaseModal from "../../components/inventory/PurchaseModal";

import usePurchases from "./components/hooks/usePurchases";

import PurchasesHeader from "./components/PurchasesHeader";
import PurchasesAlerts from "./components/PurchasesAlerts";
import PurchaseStatistics from "./components/PurchaseStatistics";
import PurchaseTable from "./components/PurchaseTable";

const Purchases = () => {
  const [showModal, setShowModal] = useState(false);

  const {
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
    clearError,
    clearSuccess,
  } = usePurchases();

  const savePurchase = async (purchaseData) => {
    const saved = await handleSave(purchaseData);

    if (saved) {
      setShowModal(false);
    }
  };

  return (
    <div>
      <PurchasesHeader
        onNewPurchase={() => setShowModal(true)}
        disabled={loading || saving || receiving}
      />

      <PurchasesAlerts
        error={error}
        success={success}
        onClearError={clearError}
        onClearSuccess={clearSuccess}
      />

      <PurchaseStatistics statistics={statistics} />

      <PurchaseTable
        purchases={sortedPurchases}
        suppliers={suppliers}
        branches={branches}
        loading={loading}
        saving={saving}
        receiving={receiving}
        deletingId={deletingId}
        onReceive={handleReceive}
        onDelete={handleDelete}
      />

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
        currentBranch={currentBranch}
        currentBranchId={currentBranchId}
        onSave={savePurchase}
        saving={saving}
      />
    </div>
  );
};

export default Purchases;
