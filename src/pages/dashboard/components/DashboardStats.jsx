
import React from "react";
import { Col, Row } from "react-bootstrap";
import StatCard from "../../../components/dashboard/StatCard";

const DashboardStats = ({ stats }) => {
  if (!stats.length) return null;

  const columns = stats.length >= 4 ? 3 : stats.length === 3 ? 4 : 6;

  return (
    <Row className="g-3">
      {stats.map((stat) => (
        <Col
          key={stat.title}
          xl={columns}
          lg={columns}
          md={6}
          sm={12}
        >
          <StatCard
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={stat.iconColor}
            description={stat.description}
          />
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
