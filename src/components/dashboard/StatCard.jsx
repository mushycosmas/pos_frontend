import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'positive',
  iconColor = 'primary',
  description,
}) => {
  return (
    <Card className="stat-card border-0 h-100">
      <Card.Body>

        <div className="stat-top">

          {/* Icon */}
          <div className={`stat-icon ${iconColor}`}>
            <i className={`bi ${icon}`}></i>
          </div>

          {/* Change */}
          {change && (
            <div className={`stat-change ${changeType}`}>
              <i
                className={`bi ${
                  changeType === 'negative'
                    ? 'bi-arrow-down'
                    : 'bi-arrow-up'
                }`}
              ></i>

              {change}
            </div>
          )}

        </div>

        {/* Title */}
        <div className="stat-title">
          {title}
        </div>

        {/* Value */}
        <div className="stat-value">
          {value}
        </div>

        {/* Description */}
        {description && (
          <div className="stat-description">
            {description}
          </div>
        )}

      </Card.Body>
    </Card>
  );
};

export default StatCard;