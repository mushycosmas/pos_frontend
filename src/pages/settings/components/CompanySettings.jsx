import React from "react";

import CompanyBasicInfo from "./CompanyBasicInfo";
import CompanyContactInfo from "./CompanyContactInfo";
import RegionalSettings from "./RegionalSettings";
import CompanyStatus from "./CompanyStatus";
import SettingsActions from "./SettingsActions";

const CompanySettings = ({
  company,
  handleChange,
  handleLogoUpload,
  handleSubmit,
  handleCancel,
  savingLogo,
}) => {
  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4">
        <h5 className="mb-1">
          Company Information
        </h5>

        <p className="text-muted mb-0">
          Manage the company information displayed
          throughout the POS system.
        </p>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <form onSubmit={handleSubmit}>

        {/* ===================================================
            BASIC INFORMATION
        ==================================================== */}

        <CompanyBasicInfo
          company={company}
          handleChange={handleChange}
          handleLogoUpload={handleLogoUpload}
          savingLogo={savingLogo}
        />

        {/* ===================================================
            CONTACT INFORMATION
        ==================================================== */}

        <CompanyContactInfo
          company={company}
          handleChange={handleChange}
        />

        {/* ===================================================
            REGIONAL SETTINGS
        ==================================================== */}

        <RegionalSettings
          company={company}
          handleChange={handleChange}
        />

        {/* ===================================================
            COMPANY STATUS
        ==================================================== */}

        <CompanyStatus
          company={company}
          handleChange={handleChange}
        />

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <SettingsActions
          handleCancel={handleCancel}
        />

      </form>
    </div>
  );
};

export default CompanySettings;