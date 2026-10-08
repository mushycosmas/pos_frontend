import React from "react";

const RegionalSettings = ({ company, handleChange }) => {
  return (
    <div className="mb-4">
      <h6 className="border-bottom pb-2">
        Regional Settings
      </h6>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">
            Currency
          </label>

          <select
            name="currency"
            className="form-select"
            value={company.currency}
            onChange={handleChange}
          >
            <option value="TZS">
              TZS - Tanzanian Shilling
            </option>

            <option value="USD">
              USD - US Dollar
            </option>

            <option value="KES">
              KES - Kenyan Shilling
            </option>

            <option value="UGX">
              UGX - Ugandan Shilling
            </option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Timezone
          </label>

          <select
            name="timezone"
            className="form-select"
            value={company.timezone}
            onChange={handleChange}
          >
            <option value="Africa/Dar_es_Salaam">
              Africa/Dar_es_Salaam
            </option>

            <option value="Africa/Nairobi">
              Africa/Nairobi
            </option>

            <option value="Africa/Kampala">
              Africa/Kampala
            </option>

            <option value="UTC">
              UTC
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RegionalSettings;