import React, { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");

  const [company, setCompany] = useState({
    name: "",
    legal_name: "",
    registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    country: "Tanzania",
    currency: "TZS",
    timezone: "Africa/Dar_es_Salaam",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCompany((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // API integration will be added here
    console.log("Company settings:", company);
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div>
          <h2 className="mb-1">Settings</h2>
          <p className="text-muted mb-0">
            Configure your POS system and company information.
          </p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="dashboard-card bg-white">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-md-3 border-end">
            <div className="p-3">
              <h6 className="text-uppercase text-muted mb-3">
                Settings
              </h6>

              <div className="list-group list-group-flush">
                <button
                  type="button"
                  className={`list-group-item list-group-item-action ${
                    activeTab === "company" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("company")}
                >
                  <i className="bi bi-building me-2"></i>
                  Company
                </button>

                <button
                  type="button"
                  className={`list-group-item list-group-item-action ${
                    activeTab === "system" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("system")}
                >
                  <i className="bi bi-gear me-2"></i>
                  System
                </button>

                <button
                  type="button"
                  className={`list-group-item list-group-item-action ${
                    activeTab === "preferences" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("preferences")}
                >
                  <i className="bi bi-sliders me-2"></i>
                  Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="col-md-9">
            <div className="p-4">
              {/* Company Settings */}
              {activeTab === "company" && (
                <div>
                  <div className="mb-4">
                    <h5 className="mb-1">Company Information</h5>
                    <p className="text-muted mb-0">
                      Manage the company information displayed throughout
                      the POS system.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">
                        Basic Information
                      </h6>

                      <div className="row g-3 mt-1">
                        <div className="col-md-6">
                          <label className="form-label">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={company.name}
                            onChange={handleChange}
                            placeholder="Enter company name"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Legal Name
                          </label>
                          <input
                            type="text"
                            name="legal_name"
                            className="form-control"
                            value={company.legal_name}
                            onChange={handleChange}
                            placeholder="Enter legal company name"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            name="registration_number"
                            className="form-control"
                            value={company.registration_number}
                            onChange={handleChange}
                            placeholder="Registration number"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Tax Number
                          </label>
                          <input
                            type="text"
                            name="tax_number"
                            className="form-control"
                            value={company.tax_number}
                            onChange={handleChange}
                            placeholder="TIN / Tax number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
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

                    {/* Regional Settings */}
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

                    {/* Status */}
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

                    {/* Actions */}
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-light"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        <i className="bi bi-check-lg me-2"></i>
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* System Settings */}
              {activeTab === "system" && (
                <div>
                  <h5>System Settings</h5>
                  <p className="text-muted">
                    Configure general POS system settings.
                  </p>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    System configuration options will be added here.
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === "preferences" && (
                <div>
                  <h5>Preferences</h5>
                  <p className="text-muted">
                    Configure your POS user preferences.
                  </p>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Preference options will be added here.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;