import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const CompanyBasicInfo = ({
  company = {},
  handleChange,
  handleLogoUpload,
  savingLogo = false,
}) => {
  const [preview, setPreview] = useState(null);
  const [logoError, setLogoError] = useState(false);

  // =========================================================
  // BACKEND BASE URL
  // =========================================================
  //
  // Example:
  // REACT_APP_API_URL =
  // http://127.0.0.1:8000/api/v1
  //
  // We remove /api/v1 so that:
  // /media/company/logo.png
  //
  // becomes:
  // http://127.0.0.1:8000/media/company/logo.png
  //
  // =========================================================

  const backendBaseUrl = useMemo(() => {
    const apiUrl =
      process.env.REACT_APP_API_URL || "";

    return apiUrl.replace(
      /\/api\/v1\/?$/,
      ""
    );
  }, []);

  // =========================================================
  // EXISTING LOGO
  // =========================================================

  const existingLogo =
    company?.logo ||
    company?.logo_url ||
    null;

  // =========================================================
  // BUILD LOGO URL
  // =========================================================

  const existingLogoUrl = useMemo(() => {
    if (!existingLogo) {
      return null;
    }

    // -------------------------------------------------------
    // Already an absolute URL
    // -------------------------------------------------------

    if (
      existingLogo.startsWith("http://") ||
      existingLogo.startsWith("https://") ||
      existingLogo.startsWith("blob:")
    ) {
      return existingLogo;
    }

    // -------------------------------------------------------
    // Relative Django media URL
    // -------------------------------------------------------

    if (existingLogo.startsWith("/")) {
      return `${backendBaseUrl}${existingLogo}`;
    }

    // -------------------------------------------------------
    // Relative path without /
    // -------------------------------------------------------

    return `${backendBaseUrl}/${existingLogo}`;
  }, [
    existingLogo,
    backendBaseUrl,
  ]);

  // =========================================================
  // CLEANUP PREVIEW URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================================================
  // RESET LOGO ERROR WHEN LOGO CHANGES
  // =========================================================

  useEffect(() => {
    setLogoError(false);
  }, [existingLogo]);

  // =========================================================
  // HANDLE LOGO CHANGE
  // =========================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // =======================================================
    // VALIDATE FILE TYPE
    // =======================================================

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please select a PNG, JPG, JPEG or WEBP image."
      );

      e.target.value = "";

      return;
    }

    // =======================================================
    // VALIDATE FILE SIZE
    // Maximum 2MB
    // =======================================================

    const maxSize =
      2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Logo image must not exceed 2MB."
      );

      e.target.value = "";

      return;
    }

    // =======================================================
    // CHECK UPLOAD HANDLER
    // =======================================================

    if (!handleLogoUpload) {
      console.error(
        "handleLogoUpload is not provided."
      );

      alert(
        "Logo upload is not configured."
      );

      e.target.value = "";

      return;
    }

    // =======================================================
    // CREATE LOCAL PREVIEW
    // =======================================================

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);

    setLogoError(false);

    // =======================================================
    // SEND FILE TO PARENT
    // =======================================================

    handleLogoUpload(file);

    // =======================================================
    // CLEAR INPUT VALUE
    // =======================================================
    //
    // This allows the user to select the same file again.
    //
    // =======================================================

    e.target.value = "";
  };

  // =========================================================
  // FINAL LOGO URL
  // =========================================================
  //
  // Local preview takes priority immediately after selection.
  //
  // =========================================================

  const logoUrl =
    preview ||
    existingLogoUrl;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mb-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <h6 className="border-bottom pb-2">
        Basic Information
      </h6>

      <div className="row g-3 mt-1">

        {/* ===================================================
            COMPANY LOGO
        ==================================================== */}

        <div className="col-12">

          <label
            htmlFor="company-logo"
            className="form-label"
          >
            Company Logo
          </label>

          <div className="d-flex align-items-center gap-3">

            {/* =================================================
                LOGO PREVIEW
            ================================================== */}

            <div
              className="border rounded bg-light d-flex align-items-center justify-content-center"
              style={{
                width: "120px",
                height: "120px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >

              {logoUrl && !logoError ? (

                <img
                  src={logoUrl}
                  alt={
                    company?.name
                      ? `${company.name} Logo`
                      : "Company Logo"
                  }
                  className="img-fluid"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onError={() => {
                    console.error(
                      "Failed to load company logo:",
                      logoUrl
                    );

                    setLogoError(true);
                  }}
                />

              ) : (

                <div className="text-center text-muted">

                  <i
                    className="bi bi-building"
                    style={{
                      fontSize: "32px",
                    }}
                  />

                  <div className="small mt-1">
                    No Logo
                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                UPLOAD CONTROL
            ================================================== */}

            <div>

              <input
                type="file"
                id="company-logo"
                name="logo"
                className="form-control"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleLogoChange}
                disabled={savingLogo}
              />

              <small className="text-muted d-block mt-1">
                PNG, JPG or WEBP. Maximum 2MB.
              </small>

              {/* =================================================
                  UPLOADING
              ================================================== */}

              {savingLogo && (

                <small className="text-primary d-block mt-2">

                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />

                  Uploading logo...

                </small>

              )}

            </div>

          </div>

        </div>

        {/* ===================================================
            COMPANY NAME
        ==================================================== */}

        <div className="col-md-6">

          <label
            htmlFor="company-name"
            className="form-label"
          >
            Company Name
          </label>

          <input
            id="company-name"
            type="text"
            name="name"
            className="form-control"
            value={
              company?.name || ""
            }
            onChange={handleChange}
            placeholder="Enter company name"
          />

        </div>

        {/* ===================================================
            LEGAL NAME
        ==================================================== */}

        <div className="col-md-6">

          <label
            htmlFor="company-legal-name"
            className="form-label"
          >
            Legal Name
          </label>

          <input
            id="company-legal-name"
            type="text"
            name="legal_name"
            className="form-control"
            value={
              company?.legal_name || ""
            }
            onChange={handleChange}
            placeholder="Enter legal company name"
          />

        </div>

        {/* ===================================================
            REGISTRATION NUMBER
        ==================================================== */}

        <div className="col-md-6">

          <label
            htmlFor="company-registration-number"
            className="form-label"
          >
            Registration Number
          </label>

          <input
            id="company-registration-number"
            type="text"
            name="registration_number"
            className="form-control"
            value={
              company?.registration_number || ""
            }
            onChange={handleChange}
            placeholder="Registration number"
          />

        </div>

        {/* ===================================================
            TAX NUMBER
        ==================================================== */}

        <div className="col-md-6">

          <label
            htmlFor="company-tax-number"
            className="form-label"
          >
            Tax Number
          </label>

          <input
            id="company-tax-number"
            type="text"
            name="tax_number"
            className="form-control"
            value={
              company?.tax_number || ""
            }
            onChange={handleChange}
            placeholder="TIN / Tax number"
          />

        </div>

      </div>

    </div>
  );
};

export default CompanyBasicInfo;