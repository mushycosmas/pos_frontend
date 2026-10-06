import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useNavigate } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";

import { useAuth } from "../context/AuthContext";

import salesApi from "../services/SalesApi";
import productApi from "../services/productsApi";


// ============================================================
// DASHBOARD
// Permission-driven dashboard
// ============================================================

const Dashboard = () => {
  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    user,
    loading: authLoading,
    hasPermission,
  } = useAuth();

  // ==========================================================
  // STATES
  // ==========================================================

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartPeriod, setChartPeriod] = useState("7");

  // ==========================================================
  // PERMISSIONS
  // ==========================================================
  //
  // IMPORTANT:
  // Dashboard authorization is based on permissions only.
  // There is intentionally NO role_name / admin / cashier /
  // manager / owner / storekeeper logic here.
  //
  // ==========================================================

  const canViewDashboard =
    hasPermission("dashboard.view_dashboard");

  const canViewSales =
    hasPermission("sales.view_sale");

  const canCreateSale =
    hasPermission("sales.add_sale");

  const canViewProducts =
    hasPermission("products.view_product");

  const canViewReports =
    hasPermission("reports.view_report");

  const canViewCustomers =
    hasPermission("customers.view_customer");

  // ==========================================================
  // USER
  // ==========================================================

  const userName =
    user?.first_name ||
    user?.username ||
    "User";

  // ==========================================================
  // FORMAT CURRENCY
  // ==========================================================

  const formatCurrency = useCallback(
    (value) => {
      const number = Number(value || 0);

      return (
        "TSh " +
        number.toLocaleString("en-TZ", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      );
    },
    []
  );

  // ==========================================================
  // EXTRACT API RESULTS
  // ==========================================================

  const extractResults = useCallback(
    (response) => {
      if (Array.isArray(response)) {
        return response;
      }

      if (Array.isArray(response?.results)) {
        return response.results;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      if (Array.isArray(response?.data?.results)) {
        return response.data.results;
      }

      return [];
    },
    []
  );

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboardData = useCallback(
    async () => {
      if (!user || !canViewDashboard) {
        setSales([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // ====================================================
        // SALES
        // ====================================================

        if (canViewSales) {
          try {
            const response = await salesApi.getAll({
              page_size: 1000,
            });

            const salesData =
              extractResults(response);

            setSales(salesData);
          } catch (salesError) {
            console.error(
              "Failed to load sales:",
              salesError
            );

            setSales([]);

            // Don't block the entire dashboard because
            // the sales API failed.
            setError(
              salesError?.response?.data?.detail ||
                salesError?.response?.data?.message ||
                "Failed to load sales data."
            );
          }
        } else {
          setSales([]);
        }

        // ====================================================
        // PRODUCTS
        // ====================================================

        if (canViewProducts) {
          try {
            const response =
              await productApi.getAll({
                page_size: 1000,
              });

            const productsData =
              extractResults(response);

            setProducts(productsData);
          } catch (productError) {
            console.error(
              "Failed to load products:",
              productError
            );

            setProducts([]);

            // Only show this if no previous error exists.
            setError((currentError) => {
              if (currentError) {
                return currentError;
              }

              return (
                productError?.response?.data?.detail ||
                productError?.response?.data?.message ||
                "Failed to load product data."
              );
            });
          }
        } else {
          setProducts([]);
        }
      } catch (dashboardError) {
        console.error(
          "Dashboard error:",
          dashboardError
        );

        setError(
          dashboardError?.response?.data?.detail ||
            dashboardError?.response?.data?.message ||
            dashboardError?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      canViewDashboard,
      canViewSales,
      canViewProducts,
      extractResults,
    ]
  );

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    if (!canViewDashboard) {
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

  // ==========================================================
  // CHECK DATE IS TODAY
  // ==========================================================

  const isToday = useCallback(
    (dateValue) => {
      if (!dateValue) {
        return false;
      }

      const saleDate =
        new Date(dateValue);

      const today =
        new Date();

      if (
        Number.isNaN(
          saleDate.getTime()
        )
      ) {
        return false;
      }

      return (
        saleDate.getFullYear() ===
          today.getFullYear() &&
        saleDate.getMonth() ===
          today.getMonth() &&
        saleDate.getDate() ===
          today.getDate()
      );
    },
    []
  );

  // ==========================================================
  // CHECK COMPLETED SALE
  // ==========================================================

  const isCompletedSale = useCallback(
    (sale) => {
      const status = String(
        sale?.status || ""
      )
        .trim()
        .toUpperCase();

      return (
        !sale?.status ||
        status === "COMPLETED" ||
        status === "PAID"
      );
    },
    []
  );

  // ==========================================================
  // TODAY'S COMPLETED SALES
  // ==========================================================

  const todaySales = useMemo(() => {
    if (!canViewSales) {
      return [];
    }

    return sales.filter((sale) => {
      if (!sale?.created_at) {
        return false;
      }

      return (
        isToday(sale.created_at) &&
        isCompletedSale(sale)
      );
    });
  }, [
    sales,
    canViewSales,
    isToday,
    isCompletedSale,
  ]);

  // ==========================================================
  // GET SALE USER ID
  // ==========================================================

  const getSaleUserId = useCallback(
    (sale) => {
      if (
        sale?.created_by_id !== undefined &&
        sale?.created_by_id !== null
      ) {
        return sale.created_by_id;
      }

      if (
        sale?.created_by?.id !== undefined &&
        sale?.created_by?.id !== null
      ) {
        return sale.created_by.id;
      }

      if (
        sale?.cashier_id !== undefined &&
        sale?.cashier_id !== null
      ) {
        return sale.cashier_id;
      }

      if (
        sale?.cashier?.id !== undefined &&
        sale?.cashier?.id !== null
      ) {
        return sale.cashier.id;
      }

      if (
        sale?.user_id !== undefined &&
        sale?.user_id !== null
      ) {
        return sale.user_id;
      }

      if (
        sale?.user?.id !== undefined &&
        sale?.user?.id !== null
      ) {
        return sale.user.id;
      }

      return null;
    },
    []
  );

  // ==========================================================
  // GET SALE USER NAME
  // ==========================================================

  const getSaleUserName = useCallback(
    (sale) => {
      if (sale?.created_by_name) {
        return sale.created_by_name;
      }

      if (sale?.cashier_name) {
        return sale.cashier_name;
      }

      if (sale?.user_name) {
        return sale.user_name;
      }

      if (sale?.created_by?.full_name) {
        return sale.created_by.full_name;
      }

      if (sale?.created_by?.username) {
        return sale.created_by.username;
      }

      if (sale?.cashier?.full_name) {
        return sale.cashier.full_name;
      }

      if (sale?.cashier?.username) {
        return sale.cashier.username;
      }

      if (sale?.user?.full_name) {
        return sale.user.full_name;
      }

      if (sale?.user?.username) {
        return sale.user.username;
      }

      return "Unknown Cashier";
    },
    []
  );

  // ==========================================================
  // TODAY SALES AMOUNT
  // ==========================================================

  const todaySalesAmount = useMemo(() => {
    if (!canViewSales) {
      return 0;
    }

    return todaySales.reduce(
      (total, sale) =>
        total +
        Number(sale?.total || 0),
      0
    );
  }, [
    todaySales,
    canViewSales,
  ]);

  // ==========================================================
  // TODAY ORDERS
  // ==========================================================

  const todayOrders =
    canViewSales
      ? todaySales.length
      : 0;

  // ==========================================================
  // PROFIT
  // ==========================================================
  //
  // Profit is only displayed when the user has reporting
  // permission.
  //
  // ==========================================================

  const todayProfit = useMemo(() => {
    if (!canViewReports) {
      return 0;
    }

    return todaySales.reduce(
      (totalProfit, sale) => {
        const items =
          Array.isArray(sale?.items)
            ? sale.items
            : [];

        const saleProfit =
          items.reduce(
            (
              itemProfit,
              item
            ) => {
              const quantity =
                Number(
                  item?.quantity || 0
                );

              const sellingPrice =
                Number(
                  item?.unit_price || 0
                );

              const costPrice =
                Number(
                  item
                    ?.product_details
                    ?.cost_price ||
                    item
                      ?.product
                      ?.cost_price ||
                    0
                );

              return (
                itemProfit +
                (
                  sellingPrice -
                  costPrice
                ) *
                  quantity
              );
            },
            0
          );

        return (
          totalProfit +
          saleProfit
        );
      },
      0
    );
  }, [
    todaySales,
    canViewReports,
  ]);

  // ==========================================================
  // LOW STOCK PRODUCTS
  // ==========================================================

  const lowStockProducts = useMemo(() => {
    if (!canViewProducts) {
      return [];
    }

    return products
      .filter((product) => {
        const currentStock =
          Number(
            product?.current_stock ??
              product?.stock ??
              product?.quantity ??
              0
          );

        const minimumStock =
          Number(
            product?.minimum_stock ??
              product?.reorder_level ??
              0
          );

        return (
          currentStock <=
          minimumStock
        );
      })
      .sort((a, b) => {
        const stockA =
          Number(
            a?.current_stock ??
              a?.stock ??
              a?.quantity ??
              0
          );

        const stockB =
          Number(
            b?.current_stock ??
              b?.stock ??
              b?.quantity ??
              0
          );

        return stockA - stockB;
      })
      .slice(0, 5);
  }, [
    products,
    canViewProducts,
  ]);

  const lowStockCount =
    lowStockProducts.length;

  // ==========================================================
  // SALES CHART DATA
  // ==========================================================

  const salesChartData = useMemo(() => {
    if (
      !canViewReports ||
      !canViewSales
    ) {
      return [];
    }

    const days =
      Number(chartPeriod);

    const data = [];

    for (
      let i = days - 1;
      i >= 0;
      i--
    ) {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() - i
      );

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      const dateKey =
        `${year}-${month}-${day}`;

      const dailySales =
        sales.filter((sale) => {
          if (!sale?.created_at) {
            return false;
          }

          const saleDate =
            new Date(
              sale.created_at
            );

          if (
            Number.isNaN(
              saleDate.getTime()
            )
          ) {
            return false;
          }

          const saleYear =
            saleDate.getFullYear();

          const saleMonth =
            String(
              saleDate.getMonth() + 1
            ).padStart(2, "0");

          const saleDay =
            String(
              saleDate.getDate()
            ).padStart(2, "0");

          const saleDateKey =
            `${saleYear}-${saleMonth}-${saleDay}`;

          return (
            saleDateKey ===
              dateKey &&
            isCompletedSale(sale)
          );
        });

      const totalSales =
        dailySales.reduce(
          (total, sale) =>
            total +
            Number(
              sale?.total || 0
            ),
          0
        );

      data.push({
        date: dateKey,
        sales: totalSales,
        orders:
          dailySales.length,
      });
    }

    return data;
  }, [
    sales,
    chartPeriod,
    canViewReports,
    canViewSales,
    isCompletedSale,
  ]);

  // ==========================================================
  // SALES BY CASHIER
  // ==========================================================

  const salesByCashier = useMemo(() => {
    if (
      !canViewReports ||
      !canViewSales
    ) {
      return [];
    }

    const cashierMap = {};

    todaySales.forEach((sale) => {
      const cashierId =
        getSaleUserId(sale);

      const cashierName =
        getSaleUserName(sale);

      const key =
        cashierId !== null &&
        cashierId !== undefined
          ? String(cashierId)
          : cashierName;

      if (!cashierMap[key]) {
        cashierMap[key] = {
          id:
            cashierId ?? key,

          name:
            cashierName,

          orders:
            0,

          sales:
            0,
        };
      }

      cashierMap[key].orders += 1;

      cashierMap[key].sales +=
        Number(
          sale?.total || 0
        );
    });

    return Object.values(
      cashierMap
    ).sort(
      (a, b) =>
        b.sales - a.sales
    );
  }, [
    todaySales,
    canViewReports,
    canViewSales,
    getSaleUserId,
    getSaleUserName,
  ]);

  // ==========================================================
  // RECENT SALES
  // ==========================================================

  const recentSales = useMemo(() => {
    if (!canViewSales) {
      return [];
    }

    return [...todaySales]
      .sort((a, b) => {
        return (
          new Date(
            b?.created_at || 0
          ) -
          new Date(
            a?.created_at || 0
          )
        );
      })
      .slice(0, 5);
  }, [
    todaySales,
    canViewSales,
  ]);

  // ==========================================================
  // DASHBOARD MESSAGE
  // ==========================================================

  const dashboardMessage =
    useMemo(() => {
      if (
        canViewSales &&
        canViewProducts
      ) {
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

  // ==========================================================
  // SALES STATS
  // ==========================================================

  const salesStats = useMemo(
    () => {
      const stats = [];

      if (canViewSales) {
        stats.push({
          title:
            "Today's Sales",

          value:
            formatCurrency(
              todaySalesAmount
            ),

          change:
            todayOrders +
            " order" +
            (
              todayOrders !== 1
                ? "s"
                : ""
            ),

          changeType:
            "positive",

          icon:
            "bi-cash-stack",

          iconColor:
            "primary",

          description:
            "Sales completed today",
        });

        stats.push({
          title:
            "Orders",

          value:
            todayOrders.toLocaleString(),

          change:
            "Today",

          changeType:
            "positive",

          icon:
            "bi-cart-check",

          iconColor:
            "success",

          description:
            "Completed orders today",
        });
      }

      if (canViewReports) {
        stats.push({
          title:
            "Profit",

          value:
            formatCurrency(
              todayProfit
            ),

          change:
            "Today",

          changeType:
            todayProfit >= 0
              ? "positive"
              : "negative",

          icon:
            "bi-graph-up-arrow",

          iconColor:
            "warning",

          description:
            "Estimated profit today",
        });
      }

      if (canViewProducts) {
        stats.push({
          title:
            "Products",

          value:
            products.length.toLocaleString(),

          change:
            lowStockCount +
            " low",

          changeType:
            lowStockCount > 0
              ? "negative"
              : "positive",

          icon:
            "bi-box-seam",

          iconColor:
            lowStockCount > 0
              ? "danger"
              : "success",

          description:
            "Products in inventory",
        });
      }

      return stats;
    },
    [
      canViewSales,
      canViewReports,
      canViewProducts,
      formatCurrency,
      todaySalesAmount,
      todayOrders,
      todayProfit,
      products.length,
      lowStockCount,
    ]
  );

  // ==========================================================
  // CUSTOM TOOLTIP
  // ==========================================================

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div
        style={{
          background: "#fff",
          border:
            "1px solid #dee2e6",
          borderRadius: "8px",
          padding: "12px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: "6px",
          }}
        >
          {new Date(
            label
          ).toLocaleDateString(
            "en-TZ",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )}
        </div>

        <div>
          Sales:{" "}
          <strong>
            {formatCurrency(
              payload[0]?.value
            )}
          </strong>
        </div>

        <div>
          Orders:{" "}
          <strong>
            {
              payload[0]
                ?.payload
                ?.orders || 0
            }
          </strong>
        </div>
      </div>
    );
  };

  // ==========================================================
  // AUTH LOADING
  // ==========================================================

  if (authLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />

        <div className="mt-2 text-muted">
          Loading user...
        </div>
      </div>
    );
  }

  // ==========================================================
  // NO USER
  // ==========================================================

  if (!user) {
    return (
      <Alert variant="warning">
        User session could not be loaded.
        Please login again.
      </Alert>
    );
  }

  // ==========================================================
  // NO DASHBOARD PERMISSION
  // ==========================================================

  if (!canViewDashboard) {
    return (
      <Alert
        variant="danger"
        className="mt-3"
      >
        <div className="d-flex align-items-center">
          <i
            className="bi bi-shield-lock me-2"
            style={{
              fontSize: "20px",
            }}
          ></i>

          <div>
            <strong>
              Dashboard access denied
            </strong>

            <div className="small mt-1">
              Your account does not have
              the{" "}
              <code>
                dashboard.view_dashboard
              </code>{" "}
              permission.
            </div>
          </div>
        </div>
      </Alert>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <div>

          <h2>
            Dashboard
          </h2>

          <p>
            Welcome back,{" "}
            <strong>
              {userName}
            </strong>
            .{" "}
            {dashboardMessage}
          </p>

        </div>

        {/* ====================================================
            NEW SALE
        ==================================================== */}

        {canCreateSale && (
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate("/pos")
            }
          >
            <i className="bi bi-plus-lg"></i>{" "}
            New Sale
          </button>
        )}

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="text-center py-4">

          <Spinner animation="border" />

          <div className="mt-2 text-muted">
            Loading dashboard...
          </div>

        </div>
      )}

      {/* ======================================================
          STATS
          ====================================================== */}

      {!loading &&
        salesStats.length > 0 && (
          <Row className="g-3">

            {salesStats.map(
              (stat) => (
                <Col
                  xl={
                    salesStats.length >= 4
                      ? 3
                      : salesStats.length === 3
                      ? 4
                      : 6
                  }
                  lg={
                    salesStats.length >= 4
                      ? 3
                      : salesStats.length === 3
                      ? 4
                      : 6
                  }
                  md={6}
                  sm={12}
                  key={stat.title}
                >

                  <StatCard
                    title={
                      stat.title
                    }

                    value={
                      stat.value
                    }

                    change={
                      stat.change
                    }

                    changeType={
                      stat.changeType
                    }

                    icon={
                      stat.icon
                    }

                    iconColor={
                      stat.iconColor
                    }

                    description={
                      stat.description
                    }
                  />

                </Col>
              )
            )}

          </Row>
        )}

      {/* ======================================================
          SALES CONTENT
      ====================================================== */}

      {!loading &&
        canViewSales && (
          <Row className="g-3 mt-1">

            {/* =================================================
                RECENT SALES
            ================================================= */}

            <Col
              xl={
                canViewProducts ||
                canViewReports
                  ? 8
                  : 12
              }
              lg={
                canViewProducts ||
                canViewReports
                  ? 8
                  : 12
              }
              md={12}
            >

              <Card className="dashboard-card border-0 h-100">

                <Card.Body>

                  <div className="card-heading">

                    <div>

                      <h5>
                        Recent Sales
                      </h5>

                      <span>
                        Latest transactions
                        recorded today
                      </span>

                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() =>
                        navigate(
                          "/sales"
                        )
                      }
                    >
                      View All
                    </button>

                  </div>

                  {recentSales.length === 0 ? (
                    <div className="text-center text-muted py-5">

                      <i
                        className="bi bi-receipt"
                        style={{
                          fontSize:
                            "40px",
                        }}
                      ></i>

                      <div className="mt-2">
                        No sales recorded
                        today.
                      </div>

                      {canCreateSale && (
                        <button
                          type="button"
                          className="primary-button mt-3"
                          onClick={() =>
                            navigate(
                              "/pos"
                            )
                          }
                        >
                          <i className="bi bi-cart-plus"></i>{" "}
                          Start New Sale
                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="table-responsive mt-3">

                      <table className="table align-middle">

                        <thead>
                          <tr>

                            <th>
                              Invoice
                            </th>

                            <th>
                              Time
                            </th>

                            <th>
                              Customer
                            </th>

                            <th>
                              Amount
                            </th>

                            <th>
                              Status
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {recentSales.map(
                            (sale) => {

                              const invoice =
                                sale?.invoice_number ||
                                sale?.reference ||
                                sale?.invoice ||
                                sale?.id ||
                                "-";

                              const customer =
                                sale?.customer?.name ||
                                sale?.customer_name ||
                                "Walk-in Customer";

                              const time =
                                sale?.created_at
                                  ? new Date(
                                      sale.created_at
                                    ).toLocaleTimeString(
                                      "en-TZ",
                                      {
                                        hour:
                                          "2-digit",
                                        minute:
                                          "2-digit",
                                      }
                                    )
                                  : "-";

                              const status =
                                String(
                                  sale?.status ||
                                    "Completed"
                                );

                              return (
                                <tr
                                  key={
                                    sale?.id ??
                                    invoice
                                  }
                                >

                                  <td>
                                    <strong>
                                      {invoice}
                                    </strong>
                                  </td>

                                  <td>
                                    {time}
                                  </td>

                                  <td>
                                    {customer}
                                  </td>

                                  <td>
                                    <strong>
                                      {formatCurrency(
                                        sale?.total
                                      )}
                                    </strong>
                                  </td>

                                  <td>
                                    <Badge bg="success">
                                      {status}
                                    </Badge>
                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>
                  )}

                </Card.Body>

              </Card>

            </Col>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <Col
              xl={
                canViewProducts ||
                canViewReports
                  ? 4
                  : 12
              }
              lg={
                canViewProducts ||
                canViewReports
                  ? 4
                  : 12
              }
              md={12}
            >

              <Card className="dashboard-card border-0 h-100">

                <Card.Body>

                  <div className="card-heading">

                    <div>

                      <h5>
                        Quick Actions
                      </h5>

                      <span>
                        Available actions
                      </span>

                    </div>

                  </div>

                  <div className="quick-action-list">

                    {/* =========================================
                        NEW SALE
                    ========================================= */}

                    {canCreateSale && (
                      <div
                        className="quick-action mb-3"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            "/pos"
                          )
                        }
                      >

                        <div className="quick-action-icon">

                          <i className="bi bi-cart-plus"></i>

                        </div>

                        <div>

                          <strong>
                            New Sale
                          </strong>

                          <small>
                            Create a new
                            transaction
                          </small>

                        </div>

                      </div>
                    )}

                    {/* =========================================
                        SALES
                    ========================================= */}

                    {canViewSales && (
                      <div
                        className="quick-action mb-3"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            "/sales"
                          )
                        }
                      >

                        <div className="quick-action-icon">

                          <i className="bi bi-receipt"></i>

                        </div>

                        <div>

                          <strong>
                            Sales
                          </strong>

                          <small>
                            View sales
                            transactions
                          </small>

                        </div>

                      </div>
                    )}

                    {/* =========================================
                        PRODUCTS
                    ========================================= */}

                    {canViewProducts && (
                      <div
                        className="quick-action mb-3"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            "/products"
                          )
                        }
                      >

                        <div className="quick-action-icon">

                          <i className="bi bi-box-seam"></i>

                        </div>

                        <div>

                          <strong>
                            Products
                          </strong>

                          <small>
                            Manage inventory
                          </small>

                        </div>

                      </div>
                    )}

                    {/* =========================================
                        CUSTOMERS
                    ========================================= */}

                    {canViewCustomers && (
                      <div
                        className="quick-action mb-3"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            "/customers"
                          )
                        }
                      >

                        <div className="quick-action-icon">

                          <i className="bi bi-people"></i>

                        </div>

                        <div>

                          <strong>
                            Customers
                          </strong>

                          <small>
                            View customers
                          </small>

                        </div>

                      </div>
                    )}

                  </div>

                </Card.Body>

              </Card>

            </Col>

          </Row>
        )}

      {/* ======================================================
          REPORTING SECTION
      ====================================================== */}

      {!loading &&
        canViewReports && (
          <>

            {/* ==================================================
                SALES CHART + LOW STOCK
            ================================================== */}

            <Row className="g-3 mt-1">

              {/* =================================================
                  SALES CHART
              ================================================= */}

              {canViewSales && (
                <Col
                  xl={
                    canViewProducts
                      ? 8
                      : 12
                  }
                  lg={
                    canViewProducts
                      ? 8
                      : 12
                  }
                  md={12}
                >

                  <Card className="dashboard-card border-0 h-100">

                    <Card.Body>

                      <div className="card-heading">

                        <div>

                          <h5>
                            Sales Overview
                          </h5>

                          <span>
                            Sales performance
                          </span>

                        </div>

                        <select
                          className="form-select form-select-sm"
                          value={
                            chartPeriod
                          }
                          onChange={(e) =>
                            setChartPeriod(
                              e.target.value
                            )
                          }
                          style={{
                            width:
                              "150px",
                          }}
                        >

                          <option value="7">
                            Last 7 days
                          </option>

                          <option value="30">
                            Last 30 days
                          </option>

                          <option value="365">
                            This year
                          </option>

                        </select>

                      </div>

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "350px",
                          marginTop:
                            "20px",
                        }}
                      >

                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >

                          <BarChart
                            data={
                              salesChartData
                            }
                          >

                            <CartesianGrid
                              strokeDasharray="3 3"
                            />

                            <XAxis
                              dataKey="date"
                              tickFormatter={(
                                value
                              ) =>
                                new Date(
                                  value
                                ).toLocaleDateString(
                                  "en-TZ",
                                  {
                                    day:
                                      "2-digit",
                                    month:
                                      "short",
                                  }
                                )
                              }
                            />

                            <YAxis
                              tickFormatter={(
                                value
                              ) => {

                                if (
                                  value >=
                                  1000000
                                ) {
                                  return (
                                    "TSh " +
                                    (
                                      value /
                                      1000000
                                    ).toFixed(
                                      1
                                    ) +
                                    "M"
                                  );
                                }

                                if (
                                  value >=
                                  1000
                                ) {
                                  return (
                                    "TSh " +
                                    (
                                      value /
                                      1000
                                    ).toFixed(
                                      0
                                    ) +
                                    "K"
                                  );
                                }

                                return (
                                  "TSh " +
                                  value
                                );
                              }}
                            />

                            <Tooltip
                              content={
                                <CustomTooltip />
                              }
                            />

                            <Bar
                              dataKey="sales"
                              name="Sales"
                              radius={[
                                6,
                                6,
                                0,
                                0,
                              ]}
                            />

                          </BarChart>

                        </ResponsiveContainer>

                      </div>

                    </Card.Body>

                  </Card>

                </Col>
              )}

              {/* =================================================
                  LOW STOCK
              ================================================= */}

              {canViewProducts && (
                <Col
                  xl={
                    canViewSales
                      ? 4
                      : 12
                  }
                  lg={
                    canViewSales
                      ? 4
                      : 12
                  }
                  md={12}
                >

                  <Card className="dashboard-card border-0 h-100">

                    <Card.Body>

                      <div className="card-heading">

                        <div>

                          <h5>
                            Low Stock
                          </h5>

                          <span>
                            Items requiring
                            attention
                          </span>

                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() =>
                            navigate(
                              "/products"
                            )
                          }
                        >
                          View All
                        </button>

                      </div>

                      {lowStockProducts.length === 0 ? (
                        <div className="text-center text-muted py-5">

                          <i className="bi bi-check-circle fs-4 text-success"></i>

                          <div className="mt-2">
                            All products have
                            sufficient stock.
                          </div>

                        </div>
                      ) : (
                        <div className="low-stock-list">

                          {lowStockProducts.map(
                            (product) => {

                              const currentStock =
                                Number(
                                  product?.current_stock ??
                                    product?.stock ??
                                    product?.quantity ??
                                    0
                                );

                              const minimumStock =
                                Number(
                                  product?.minimum_stock ??
                                    product?.reorder_level ??
                                    0
                                );

                              return (
                                <div
                                  className="stock-item"
                                  key={
                                    product?.id
                                  }
                                >

                                  <div className="stock-icon">

                                    <i className="bi bi-box"></i>

                                  </div>

                                  <div className="stock-info">

                                    <strong>
                                      {
                                        product?.name ||
                                        "Unnamed Product"
                                      }
                                    </strong>

                                    <small>
                                      {
                                        currentStock
                                      }
                                      {" • "}
                                      Min:{" "}
                                      {
                                        minimumStock
                                      }
                                    </small>

                                  </div>

                                  <i className="bi bi-exclamation-circle text-warning"></i>

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                    </Card.Body>

                  </Card>

                </Col>
              )}

            </Row>

            {/* ==================================================
                SALES BY CASHIER
            ================================================== */}

            {canViewSales && (
              <Row className="g-3 mt-1">

                <Col
                  xl={12}
                  lg={12}
                  md={12}
                >

                  <Card className="dashboard-card border-0">

                    <Card.Body>

                      <div className="card-heading">

                        <div>

                          <h5>
                            Sales by Cashier
                          </h5>

                          <span>
                            Today's sales
                            performance by cashier
                          </span>

                        </div>

                      </div>

                      {salesByCashier.length === 0 ? (
                        <div className="text-center text-muted py-5">

                          <i
                            className="bi bi-receipt"
                            style={{
                              fontSize:
                                "40px",
                            }}
                          ></i>

                          <div className="mt-2">
                            No cashier sales
                            recorded today.
                          </div>

                        </div>
                      ) : (
                        <div className="table-responsive mt-3">

                          <table className="table table-hover align-middle">

                            <thead>

                              <tr>

                                <th>
                                  #
                                </th>

                                <th>
                                  Cashier
                                </th>

                                <th>
                                  Orders
                                </th>

                                <th>
                                  Sales
                                </th>

                                <th>
                                  Average Order
                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {salesByCashier.map(
                                (
                                  cashier,
                                  index
                                ) => {

                                  const average =
                                    cashier.orders >
                                    0
                                      ? cashier.sales /
                                        cashier.orders
                                      : 0;

                                  return (
                                    <tr
                                      key={
                                        cashier.id
                                      }
                                    >

                                      <td>
                                        {
                                          index +
                                          1
                                        }
                                      </td>

                                      <td>
                                        <strong>
                                          {
                                            cashier.name
                                          }
                                        </strong>
                                      </td>

                                      <td>

                                        <Badge bg="secondary">

                                          {
                                            cashier.orders
                                          }

                                        </Badge>

                                      </td>

                                      <td>

                                        <strong>

                                          {
                                            formatCurrency(
                                              cashier.sales
                                            )
                                          }

                                        </strong>

                                      </td>

                                      <td>

                                        {
                                          formatCurrency(
                                            average
                                          )
                                        }

                                      </td>

                                    </tr>
                                  );
                                }
                              )}

                            </tbody>

                            <tfoot>

                              <tr>

                                <th colSpan="2">
                                  Total
                                </th>

                                <th>

                                  {
                                    salesByCashier.reduce(
                                      (
                                        total,
                                        cashier
                                      ) =>
                                        total +
                                        cashier.orders,
                                      0
                                    )
                                  }

                                </th>

                                <th>

                                  <strong>

                                    {
                                      formatCurrency(
                                        salesByCashier.reduce(
                                          (
                                            total,
                                            cashier
                                          ) =>
                                            total +
                                            cashier.sales,
                                          0
                                        )
                                      )
                                    }

                                  </strong>

                                </th>

                                <th>
                                  -
                                </th>

                              </tr>

                            </tfoot>

                          </table>

                        </div>
                      )}

                    </Card.Body>

                  </Card>

                </Col>

              </Row>
            )}

          </>
        )}

      {/* ======================================================
          INVENTORY-ONLY SECTION
      ====================================================== */}

      {!loading &&
        canViewProducts &&
        !canViewReports &&
        (
          <Row className="g-3 mt-1">

            <Col xl={12}>

              <Card className="dashboard-card border-0">

                <Card.Body>

                  <div className="card-heading">

                    <div>

                      <h5>
                        Low Stock
                      </h5>

                      <span>
                        Products requiring
                        attention
                      </span>

                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() =>
                        navigate(
                          "/products"
                        )
                      }
                    >
                      View Products
                    </button>

                  </div>

                  {lowStockProducts.length === 0 ? (
                    <div className="text-center text-muted py-5">

                      <i className="bi bi-check-circle fs-4 text-success"></i>

                      <div className="mt-2">
                        Stock levels are
                        healthy.
                      </div>

                    </div>
                  ) : (
                    <div className="low-stock-list mt-3">

                      {lowStockProducts.map(
                        (product) => {

                          const currentStock =
                            Number(
                              product?.current_stock ??
                                product?.stock ??
                                product?.quantity ??
                                0
                            );

                          const minimumStock =
                            Number(
                              product?.minimum_stock ??
                                product?.reorder_level ??
                                0
                            );

                          return (
                            <div
                              className="stock-item"
                              key={
                                product?.id
                              }
                            >

                              <div className="stock-icon">

                                <i className="bi bi-box"></i>

                              </div>

                              <div className="stock-info">

                                <strong>
                                  {
                                    product?.name ||
                                    "Unnamed Product"
                                  }
                                </strong>

                                <small>
                                  Current:{" "}
                                  {
                                    currentStock
                                  }
                                  {" • "}
                                  Minimum:{" "}
                                  {
                                    minimumStock
                                  }
                                </small>

                              </div>

                              <i className="bi bi-exclamation-circle text-warning"></i>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </Card.Body>

              </Card>

            </Col>

          </Row>
        )}

    </div>
  );
};

export default Dashboard;