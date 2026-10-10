
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { useBranch } from "../../../context/BranchContext";

import salesApi from "../../../services/SalesApi";
import productApi from "../../../services/productsApi";

import {
  extractResults,
  formatCurrency,
  getErrorMessage,
  getMinimumStock,
  getProductStock,
  getSaleDateKey,
  getSaleUserId,
  getSaleUserName,
  isCompletedSale,
  isToday,
} from "../utils/dashboardHelpers";

/**
 * Resolve the selected branch ID from BranchContext.
 * Supports common branch context property names.
 */
const resolveBranchId = (context) => {
  const branch =
    context?.currentBranch ??
    context?.selectedBranch ??
    context?.activeBranch ??
    context?.branch ??
    null;

  // Some contexts expose the selected branch as an ID directly.
  const directBranchId =
    typeof branch === "number" || typeof branch === "string"
      ? branch
      : null;

  const id =
    context?.branchId ??
    context?.selectedBranchId ??
    context?.currentBranchId ??
    directBranchId ??
    branch?.id ??
    branch?.branch_id ??
    branch?.branchId ??
    null;

  return id === null || id === undefined || id === ""
    ? null
    : id;
};

const useDashboard = () => {
  const {
    user,
    loading: authLoading,
    hasPermission,
  } = useAuth();

  const branchContext = useBranch();
  const branchId = resolveBranchId(branchContext);

  // ---------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------

  const canViewDashboard = hasPermission("dashboard.view_dashboard");
  const canViewSales = hasPermission("sales.view_sale");
  const canCreateSale = hasPermission("sales.add_sale");
  const canViewProducts = hasPermission("products.view_product");
  const canViewReports = hasPermission("reports.view_report");
  const canViewCustomers = hasPermission("customers.view_customer");

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7");

  // ---------------------------------------------------------
  // Load dashboard data for the selected branch
  // ---------------------------------------------------------

  const loadDashboardData = useCallback(async () => {
    if (!user || !canViewDashboard) {
      setSales([]);
      setProducts([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    /*
     * SalesApi.getAll() supports the `branch` query parameter.
     * The selected branch is included whenever an ID is available.
     *
     * Example:
     * /api/v1/sales/?page_size=1000&branch=2
     */
    const params = {
      page_size: 1000,
      ...(branchId !== null ? { branch: branchId } : {}),
    };

    const errors = [];

    try {
      // Load sales
      if (canViewSales) {
        try {
          const response = await salesApi.getAll(params);
          setSales(extractResults(response));
        } catch (err) {
          console.error("Failed to load dashboard sales:", err);
          setSales([]);
          errors.push(
            getErrorMessage(err, "Failed to load sales data.")
          );
        }
      } else {
        setSales([]);
      }

      // Load products
      if (canViewProducts) {
        try {
          const response = await productApi.getAll(params);
          setProducts(extractResults(response));
        } catch (err) {
          console.error("Failed to load dashboard products:", err);
          setProducts([]);
          errors.push(
            getErrorMessage(err, "Failed to load product data.")
          );
        }
      } else {
        setProducts([]);
      }

      setError(errors.join(" "));
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        getErrorMessage(err, "Failed to load dashboard data.")
      );
    } finally {
      setLoading(false);
    }
  }, [
    user,
    canViewDashboard,
    canViewSales,
    canViewProducts,
    branchId,
  ]);

  // ---------------------------------------------------------
  // Reload when authentication, permissions, or branch changes
  // ---------------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!user || !canViewDashboard) {
      setSales([]);
      setProducts([]);
      setError("");
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [
    authLoading,
    user,
    canViewDashboard,
    loadDashboardData,
  ]);

  // ---------------------------------------------------------
  // User information
  // ---------------------------------------------------------

  const userName =
    user?.first_name ||
    user?.username ||
    "User";

  // ---------------------------------------------------------
  // Today's completed sales
  // ---------------------------------------------------------

  const todaySales = useMemo(() => {
    if (!canViewSales) return [];

    return sales.filter(
      (sale) =>
        isToday(sale?.created_at) &&
        isCompletedSale(sale)
    );
  }, [sales, canViewSales]);

  const todaySalesAmount = useMemo(
    () =>
      todaySales.reduce(
        (total, sale) => total + Number(sale?.total || 0),
        0
      ),
    [todaySales]
  );

  const todayOrders = todaySales.length;

  // ---------------------------------------------------------
  // Estimated profit for today
  // ---------------------------------------------------------

  const todayProfit = useMemo(() => {
    if (!canViewReports) return 0;

    return todaySales.reduce((total, sale) => {
      const items = Array.isArray(sale?.items)
        ? sale.items
        : [];

      const saleProfit = items.reduce((sum, item) => {
        const quantity = Number(item?.quantity || 0);
        const sellingPrice = Number(item?.unit_price || 0);

        const costPrice = Number(
          item?.product_details?.cost_price ??
            item?.product?.cost_price ??
            0
        );

        return sum + (sellingPrice - costPrice) * quantity;
      }, 0);

      return total + saleProfit;
    }, 0);
  }, [todaySales, canViewReports]);

  // ---------------------------------------------------------
  // Low-stock products
  // ---------------------------------------------------------

  const lowStockProducts = useMemo(() => {
    if (!canViewProducts) return [];

    return products
      .filter(
        (product) =>
          getProductStock(product) <= getMinimumStock(product)
      )
      .sort(
        (a, b) =>
          getProductStock(a) - getProductStock(b)
      )
      .slice(0, 5);
  }, [products, canViewProducts]);

  // ---------------------------------------------------------
  // Sales chart
  // ---------------------------------------------------------

  const salesChartData = useMemo(() => {
    if (!canViewReports || !canViewSales) return [];

    const days = Number(chartPeriod);
    const dailyTotals = new Map();
    const data = [];

    // Aggregate completed sales once.
    sales.forEach((sale) => {
      if (!isCompletedSale(sale)) return;

      const dateKey = getSaleDateKey(sale?.created_at);

      if (!dateKey) return;

      dailyTotals.set(
        dateKey,
        (dailyTotals.get(dateKey) || 0) +
          Number(sale?.total || 0)
      );
    });

    // Generate one entry per day for the selected period.
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const dateKey = getSaleDateKey(date);

      data.push({
        date: dateKey,
        sales: dailyTotals.get(dateKey) || 0,
      });
    }

    return data;
  }, [
    sales,
    chartPeriod,
    canViewReports,
    canViewSales,
  ]);

  // ---------------------------------------------------------
  // Sales grouped by cashier
  // ---------------------------------------------------------

  const salesByCashier = useMemo(() => {
    if (!canViewReports || !canViewSales) return [];

    const cashierMap = {};

    todaySales.forEach((sale) => {
      const cashierId = getSaleUserId(sale);
      const cashierName = getSaleUserName(sale);

      const key =
        cashierId != null
          ? String(cashierId)
          : cashierName;

      if (!cashierMap[key]) {
        cashierMap[key] = {
          id: cashierId ?? key,
          name: cashierName,
          orders: 0,
          sales: 0,
        };
      }

      cashierMap[key].orders += 1;
      cashierMap[key].sales += Number(sale?.total || 0);
    });

    return Object.values(cashierMap).sort(
      (a, b) => b.sales - a.sales
    );
  }, [
    todaySales,
    canViewReports,
    canViewSales,
  ]);

  // ---------------------------------------------------------
  // Recent sales
  // ---------------------------------------------------------

  const recentSales = useMemo(
    () =>
      [...todaySales]
        .sort(
          (a, b) =>
            new Date(b?.created_at || 0) -
            new Date(a?.created_at || 0)
        )
        .slice(0, 5),
    [todaySales]
  );

  // ---------------------------------------------------------
  // Dashboard welcome message
  // ---------------------------------------------------------

  const dashboardMessage = useMemo(() => {
    if (canViewSales && canViewProducts) {
      return "Here's today's business overview.";
    }

    if (canViewSales) {
      return "Here's your sales overview.";
    }

    if (canViewProducts) {
      return "Here's your inventory overview.";
    }

    if (canViewReports) {
      return "Here's your business reports overview.";
    }

    return "Here's your dashboard overview.";
  }, [
    canViewSales,
    canViewProducts,
    canViewReports,
  ]);

  // ---------------------------------------------------------
  // Dashboard statistic cards
  // ---------------------------------------------------------

  const salesStats = useMemo(() => {
    const stats = [];

    if (canViewSales) {
      stats.push({
        title: "Today's Sales",
        value: formatCurrency(todaySalesAmount),
        change: `${todayOrders} order${
          todayOrders !== 1 ? "s" : ""
        }`,
        changeType: "positive",
        icon: "bi-cash-stack",
        iconColor: "primary",
        description: "Sales completed today",
      });

      stats.push({
        title: "Orders",
        value: todayOrders.toLocaleString(),
        change: "Today",
        changeType: "positive",
        icon: "bi-cart-check",
        iconColor: "success",
        description: "Completed orders today",
      });
    }

    if (canViewReports) {
      stats.push({
        title: "Profit",
        value: formatCurrency(todayProfit),
        change: "Today",
        changeType:
          todayProfit >= 0 ? "positive" : "negative",
        icon: "bi-graph-up-arrow",
        iconColor: "warning",
        description: "Estimated profit today",
      });
    }

    if (canViewProducts) {
      stats.push({
        title: "Products",
        value: products.length.toLocaleString(),
        change: `${lowStockProducts.length} low`,
        changeType:
          lowStockProducts.length > 0
            ? "negative"
            : "positive",
        icon: "bi-box-seam",
        iconColor:
          lowStockProducts.length > 0
            ? "danger"
            : "success",
        description: "Products in selected branch",
      });
    }

    return stats;
  }, [
    canViewSales,
    canViewReports,
    canViewProducts,
    todaySalesAmount,
    todayOrders,
    todayProfit,
    products.length,
    lowStockProducts.length,
  ]);

  // ---------------------------------------------------------
  // Expose data and actions to Dashboard.jsx
  // ---------------------------------------------------------

  return {
    user,
    userName,
    authLoading,
    loading,
    error,
    setError,
    loadDashboardData,
    branchId,

    canViewDashboard,
    canViewSales,
    canCreateSale,
    canViewProducts,
    canViewReports,
    canViewCustomers,

    chartPeriod,
    setChartPeriod,

    salesStats,
    recentSales,
    lowStockProducts,
    salesChartData,
    salesByCashier,
    dashboardMessage,
    formatCurrency,
  };
};

export default useDashboard;
