import React from "react";

const CompanyStatus = ({ company, handleChange }) => {
  return (
    <div className="mb-4">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="companyStatus"
          name="is_active"
          checked={company.is_active}
          onChange={handleChange}
        />

        <label
          className="form-check-label"
          htmlFor="companyStatus"
        >
          Active Company
        </label>
      </div>
    </div>
  );
};

export default CompanyStatus;