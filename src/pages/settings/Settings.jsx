import React, { useEffect, useState } from "react";

import SettingsSidebar from "./components/SettingsSidebar";
import CompanySettings from "./components/CompanySettings";
import SystemSettings from "./components/SystemSettings";
import PreferencesSettings from "./components/PreferencesSettings";

import CompanyApi from "../../services/CompanyApi";

// =========================================================
// DEFAULT COMPANY
// =========================================================

const DEFAULT_COMPANY = {
  id: null,
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
  logo: null,
  is_active: true,
};

// =========================================================
// SETTINGS COMPONENT
// =========================================================

const Settings = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState("company");

  const [company, setCompany] = useState(
    DEFAULT_COMPANY
  );

  const [companyId, setCompanyId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [savingLogo, setSavingLogo] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD COMPANY WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadCompany();
  }, []);

  // =========================================================
  // LOAD COMPANY
  // =========================================================

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await CompanyApi.getCompanies();

      console.log(
        "================================="
      );
      console.log(
        "COMPANY API RESPONSE:"
      );
      console.log(data);
      console.log(
        "================================="
      );

      let companyData = null;

      // =====================================================
      // PAGINATED RESPONSE
      // =====================================================

      if (data?.results) {
        if (data.results.length > 0) {
          companyData = data.results[0];
        }
      }

      // =====================================================
      // ARRAY RESPONSE
      // =====================================================

      else if (Array.isArray(data)) {
        if (data.length > 0) {
          companyData = data[0];
        }
      }

      // =====================================================
      // SINGLE OBJECT RESPONSE
      // =====================================================

      else if (
        data &&
        typeof data === "object"
      ) {
        companyData = data;
      }

      // =====================================================
      // SET COMPANY
      // =====================================================

      if (companyData) {
        console.log(
          "Company loaded:",
          companyData
        );

        console.log(
          "Company ID:",
          companyData.id
        );

        console.log(
          "Company Logo:",
          companyData.logo
        );

        setCompanyId(companyData.id);

        setCompany({
          ...DEFAULT_COMPANY,
          ...companyData,
        });
      } else {
        console.log(
          "No company record found."
        );

        setCompanyId(null);

        setCompany(
          DEFAULT_COMPANY
        );
      }

    } catch (err) {
      console.error(
        "Failed to load company:",
        err
      );

      console.error(
        "Server response:",
        err?.response?.data
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages =
          Object.entries(responseData)
            .map(
              ([field, message]) => {
                if (
                  Array.isArray(message)
                ) {
                  return `${field}: ${message.join(
                    ", "
                  )}`;
                }

                return `${field}: ${message}`;
              }
            )
            .join(" ");

        setError(
          messages ||
            "Failed to load company information."
        );
      } else {
        setError(
          "Failed to load company information."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE NORMAL FIELD CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setCompany((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // HANDLE LOGO UPLOAD
  // =========================================================
  //
  // This function receives the actual File object from
  // CompanyBasicInfo.jsx and sends it to Django.
  //
  // =========================================================

  const handleLogoUpload = async (
    logoFile
  ) => {

    console.log(
      "================================="
    );

    console.log(
      "HANDLE LOGO UPLOAD"
    );

    console.log(
      "Selected file:",
      logoFile
    );

    console.log(
      "Company ID:",
      companyId
    );

    console.log(
      "================================="
    );

    // =======================================================
    // CHECK FILE
    // =======================================================

    if (!logoFile) {
      console.warn(
        "No logo file selected."
      );

      return;
    }

    // =======================================================
    // CHECK COMPANY
    // =======================================================

    if (!companyId) {

      setError(
        "Please save the company before uploading a logo."
      );

      return;
    }

    // =======================================================
    // VALIDATE FILE TYPE
    // =======================================================

    if (
      !logoFile.type ||
      !logoFile.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Please select a valid image file."
      );

      return;
    }

    // =======================================================
    // VALIDATE FILE SIZE
    // Maximum 5 MB
    // =======================================================

    const maxSize =
      5 * 1024 * 1024;

    if (
      logoFile.size > maxSize
    ) {

      setError(
        "Logo image must not exceed 5 MB."
      );

      return;
    }

    // =======================================================
    // UPLOAD
    // =======================================================

    try {

      setSavingLogo(true);

      setError("");

      setSuccess("");

      console.log(
        "Starting logo upload..."
      );

      console.log(
        "File name:",
        logoFile.name
      );

      console.log(
        "File type:",
        logoFile.type
      );

      console.log(
        "File size:",
        logoFile.size
      );

      console.log(
        "Company ID:",
        companyId
      );

      // =====================================================
      // CALL API
      // =====================================================

      const response =
        await CompanyApi.uploadLogo(
          companyId,
          logoFile
        );

      console.log(
        "================================="
      );

      console.log(
        "LOGO UPLOAD RESPONSE:"
      );

      console.log(response);

      console.log(
        "================================="
      );

      // =====================================================
      // UPDATE COMPANY STATE
      // =====================================================

      if (response) {

        setCompany((prev) => ({
          ...prev,
          ...response,
        }));

      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Company logo updated successfully."
      );

      // =====================================================
      // RELOAD COMPANY FROM SERVER
      // =====================================================
      //
      // This makes sure we have the actual logo URL returned
      // by Django.
      //
      // =====================================================

      await loadCompany();

    } catch (err) {

      console.error(
        "================================="
      );

      console.error(
        "LOGO UPLOAD FAILED"
      );

      console.error(err);

      console.error(
        "Server response:",
        err?.response?.data
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "================================="
      );

      const responseData =
        err?.response?.data;

      // =====================================================
      // DJANGO VALIDATION ERROR
      // =====================================================

      if (
        responseData &&
        typeof responseData ===
          "object"
      ) {

        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([field, message]) => {

                if (
                  Array.isArray(
                    message
                  )
                ) {

                  return `${field}: ${message.join(
                    ", "
                  )}`;

                }

                return `${field}: ${message}`;
              }
            )
            .join(" ");

        setError(
          messages ||
            "Failed to upload company logo."
        );

      }

      // =====================================================
      // NORMAL ERROR
      // =====================================================

      else {

        setError(
          responseData ||
            err?.message ||
            "Failed to upload company logo."
        );

      }

    } finally {

      setSavingLogo(false);

    }
  };

  // =========================================================
  // SAVE COMPANY INFORMATION
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      setError("");

      setSuccess("");

      let response;

      // =====================================================
      // UPDATE EXISTING COMPANY
      // =====================================================

      if (companyId) {

        console.log(
          "Updating company:",
          companyId
        );

        response =
          await CompanyApi.updateCompany(
            companyId,
            company
          );

      }

      // =====================================================
      // CREATE COMPANY
      // =====================================================

      else {

        console.log(
          "Creating company..."
        );

        response =
          await CompanyApi.createCompany(
            company
          );

        if (response?.id) {

          setCompanyId(
            response.id
          );

        }

      }

      // =====================================================
      // UPDATE STATE
      // =====================================================

      if (response) {

        setCompany((prev) => ({
          ...prev,
          ...response,
        }));

      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Company information saved successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 4000);

    } catch (err) {

      console.error(
        "Failed to save company:",
        err
      );

      console.error(
        "Server response:",
        err?.response?.data
      );

      const responseData =
        err?.response?.data;

      if (
        responseData &&
        typeof responseData ===
          "object"
      ) {

        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([field, message]) => {

                if (
                  Array.isArray(
                    message
                  )
                ) {

                  return `${field}: ${message.join(
                    ", "
                  )}`;

                }

                return `${field}: ${message}`;
              }
            )
            .join(" ");

        setError(
          messages ||
            "Failed to save company information."
        );

      } else {

        setError(
          responseData ||
            err?.message ||
            "Failed to save company information."
        );

      }

    } finally {

      setSaving(false);

    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {

    loadCompany();

  };

  // =========================================================
  // RENDER CONTENT
  // =========================================================

  const renderContent = () => {

    switch (activeTab) {

      // =====================================================
      // COMPANY
      // =====================================================

      case "company":

        return (
          <CompanySettings
            company={company}

            handleChange={
              handleChange
            }

            handleLogoUpload={
              handleLogoUpload
            }

            handleSubmit={
              handleSubmit
            }

            handleCancel={
              handleCancel
            }

            loading={loading}

            saving={saving}

            savingLogo={
              savingLogo
            }

            error={error}

            success={success}
          />
        );

      // =====================================================
      // SYSTEM
      // =====================================================

      case "system":

        return (
          <SystemSettings />
        );

      // =====================================================
      // PREFERENCES
      // =====================================================

      case "preferences":

        return (
          <PreferencesSettings />
        );

      // =====================================================
      // DEFAULT
      // =====================================================

      default:

        return null;
    }
  };

  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <div className="container-fluid px-0">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header mb-4">

        <div>

          <h2 className="mb-1">
            Settings
          </h2>

          <p className="text-muted mb-0">
            Configure your POS system and company
            information.
          </p>

        </div>

      </div>

      {/* =====================================================
          SETTINGS CARD
      ====================================================== */}

      <div className="dashboard-card bg-white">

        <div className="row g-0">

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <SettingsSidebar
            activeTab={
              activeTab
            }
            setActiveTab={
              setActiveTab
            }
          />

          {/* =================================================
              CONTENT
          ================================================== */}

          <div className="col-md-9">

            <div className="p-4">

              {renderContent()}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;