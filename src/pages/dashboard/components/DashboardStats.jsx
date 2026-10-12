
import React from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import StatCard from "../../../components/dashboard/StatCard";

const DashboardStats = ({ stats = [] }) => {
  const { t } = useTranslation();

  if (!Array.isArray(stats) || stats.length === 0) {
    return null;
  }

  const columns = stats.length >= 4 ? 3 : stats.length === 3 ? 4 : 6;

  // Supports both translation keys and existing English labels.
  const translateStat = (value) => {
    if (!value) return value;

    const normalizedKey = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    return t(normalizedKey, {
      defaultValue: t(value, { defaultValue: value }),
    });
  };

  return (
    <Row className="g-3">
      {stats.map((stat, index) => (
        <Col
          key={stat.id ?? stat.title ?? index}
          xl={columns}
          lg={columns}
          md={6}
          sm={12}
        >
          <StatCard
            title={translateStat(stat.title)}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={stat.iconColor}
            description={translateStat(stat.description)}
          />
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
