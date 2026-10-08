import React from "react";

const CompanyContactInfo = ({ company, handleChange }) => {
  return (
    <div className="mb-4">
      <h6 className="border-bottom pb-2">
        Contact Information
      </h6>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <label className="form-label">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            className="form-control"
            value={company.phone}
            onChange={handleChange}
            placeholder="+255..."
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Email
          </label>

          <input
            type="email"
            name="email"
            className="form-control"
            value={company.email}
            onChange={handleChange}
            placeholder="company@example.com"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Website
          </label>

          <input
            type="url"
            name="website"
            className="form-control"
            value={company.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            City
          </label>

          <input
            type="text"
            name="city"
            className="form-control"
            value={company.city}
            onChange={handleChange}
            placeholder="Dar es Salaam"
          />
        </div>

        <div className="col-12">
          <label className="form-label">
            Address
          </label>

          <textarea
            name="address"
            className="form-control"
            rows="3"
            value={company.address}
            onChange={handleChange}
            placeholder="Company physical address"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Country
          </label>

          <input
            type="text"
            name="country"
            className="form-control"
            value={company.country}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyContactInfo;