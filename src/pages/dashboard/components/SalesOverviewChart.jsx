
import React from "react";
import { Card } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dee2e6",
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {new Date(`${label}T00:00:00`).toLocaleDateString("en-TZ", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </div>
      <div>
        Sales: <strong>{formatCurrency(payload[0]?.value)}</strong>
      </div>
    </div>
  );
};

const SalesOverviewChart = ({
  data,
  chartPeriod,
  setChartPeriod,
  formatCurrency,
}) => (
  <Card className="dashboard-card border-0 h-100">
    <Card.Body>
      <div className="card-heading">
        <div>
          <h5>Sales Overview</h5>
          <span>Sales performance for the selected branch</span>
        </div>

        <select
          aria-label="Sales chart period"
          className="form-select form-select-sm"
          value={chartPeriod}
          onChange={(event) => setChartPeriod(event.target.value)}
          style={{ width: 150 }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="365">Last 365 days</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 350, marginTop: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString("en-TZ", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `TSh ${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `TSh ${(value / 1000).toFixed(0)}K`;
                return `TSh ${value}`;
              }}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} formatCurrency={formatCurrency} />
              )}
            />
            <Bar dataKey="sales" name="Sales" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card.Body>
  </Card>
);

export default SalesOverviewChart;
