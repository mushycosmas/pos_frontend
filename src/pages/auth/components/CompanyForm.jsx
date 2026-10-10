import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Form,
  Card,
  Button,
  Image,
} from "react-bootstrap";

import {
  Building,
  Globe,
  Phone,
  Envelope,
  Hash,
  CurrencyExchange,
  Image as ImageIcon,
  X,
} from "react-bootstrap-icons";

const CompanyForm = ({
  formData,
  setFormData,
  errors = {},
  disabled = false,
}) => {
  const [logoPreview, setLogoPreview] = useState(null);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE LOGO CHANGE
  // =========================================================

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // Allowed image formats
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // Maximum file size: 2MB
    // -------------------------------------------------------

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size must not exceed 2MB.");

      e.target.value = "";
      return;
    }

    // -------------------------------------------------------
    // Store actual file
    // -------------------------------------------------------

    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));

    // -------------------------------------------------------
    // Create preview
    // -------------------------------------------------------

    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  };

  // =========================================================
  // REMOVE LOGO
  // =========================================================

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
    }));

    setLogoPreview(null);

    const input = document.getElementById(
      "company-logo"
    );

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // CLEANUP OBJECT URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="d-flex align-items-center mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary me-3"
            style={{
              width: "46px",
              height: "46px",
            }}
          >
            <Building size={22} />
          </div>

          <div>
            <h5 className="mb-1 fw-semibold">
              Company Information
            </h5>

            <p className="text-muted mb-0 small">
              Enter your company details
            </p>
          </div>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <Row className="g-3">

          {/* ===================================================
              COMPANY NAME
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-name">
              <Form.Label>
                Company Name{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Building size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter company name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.name}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              LEGAL NAME
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-legal-name">
              <Form.Label>
                Legal Name
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Building size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="legal_name"
                  placeholder="Enter legal company name"
                  value={formData.legal_name || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.legal_name}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.legal_name}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              REGISTRATION NUMBER
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="registration-number">
              <Form.Label>
                Registration Number
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Hash size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="registration_number"
                  placeholder="e.g. 12345678"
                  value={
                    formData.registration_number || ""
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={
                    !!errors.registration_number
                  }
                />

                <Form.Control.Feedback type="invalid">
                  {errors.registration_number}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              TIN / TAX NUMBER
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="tax-number">
              <Form.Label>
                TIN / Tax Number
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Hash size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="tax_number"
                  placeholder="Enter TIN"
                  value={formData.tax_number || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.tax_number}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.tax_number}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              PHONE
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-phone">
              <Form.Label>
                Phone{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Phone size={17} />
                </span>

                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="e.g. 0712345678"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.phone}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              EMAIL
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-email">
              <Form.Label>
                Email{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Envelope size={17} />
                </span>

                <Form.Control
                  type="email"
                  name="email"
                  placeholder="company@example.com"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.email}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              WEBSITE
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-website">
              <Form.Label>
                Website
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Globe size={17} />
                </span>

                <Form.Control
                  type="url"
                  name="website"
                  placeholder="https://example.com"
                  value={formData.website || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.website}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.website}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              CITY
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-city">
              <Form.Label>
                City{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Globe size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="city"
                  placeholder="e.g. Dodoma"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.city}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              COUNTRY
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-country">
              <Form.Label>
                Country
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <Globe size={17} />
                </span>

                <Form.Control
                  type="text"
                  name="country"
                  value={
                    formData.country || "Tanzania"
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.country}
                />

                <Form.Control.Feedback type="invalid">
                  {errors.country}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              CURRENCY
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-currency">
              <Form.Label>
                Currency
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <CurrencyExchange size={17} />
                </span>

                <Form.Select
                  name="currency"
                  value={
                    formData.currency || "TZS"
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  isInvalid={!!errors.currency}
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
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {errors.currency}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          {/* ===================================================
              TIMEZONE
          ==================================================== */}

          <Col md={6}>
            <Form.Group controlId="company-timezone">
              <Form.Label>
                Timezone
              </Form.Label>

              <Form.Select
                name="timezone"
                value={
                  formData.timezone ||
                  "Africa/Dar_es_Salaam"
                }
                onChange={handleChange}
                disabled={disabled}
                isInvalid={!!errors.timezone}
              >
                <option value="Africa/Dar_es_Salaam">
                  Africa/Dar_es_Salaam (EAT)
                </option>

                <option value="Africa/Nairobi">
                  Africa/Nairobi (EAT)
                </option>

                <option value="Africa/Kampala">
                  Africa/Kampala (EAT)
                </option>

                <option value="UTC">
                  UTC
                </option>
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.timezone}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* ===================================================
              ADDRESS
          ==================================================== */}

          <Col md={12}>
            <Form.Group controlId="company-address">
              <Form.Label>
                Address{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                placeholder="Enter company physical address"
                value={formData.address || ""}
                onChange={handleChange}
                disabled={disabled}
                isInvalid={!!errors.address}
              />

              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* ===================================================
              COMPANY LOGO
          ==================================================== */}

          <Col md={12}>
            <Form.Group controlId="company-logo">
              <Form.Label>
                Company Logo
              </Form.Label>

              <div
                className="border rounded p-3"
                style={{
                  backgroundColor: "#fafafa",
                }}
              >
                <Row className="align-items-center">

                  <Col md={8}>
                    <div className="d-flex align-items-center">

                      {/* ---------------------------------------
                          LOGO PREVIEW
                      ---------------------------------------- */}

                      <div
                        className="d-flex align-items-center justify-content-center rounded border bg-white me-3"
                        style={{
                          width: "90px",
                          height: "90px",
                          overflow: "hidden",
                        }}
                      >
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Company Logo Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <ImageIcon
                            size={32}
                            className="text-muted"
                          />
                        )}
                      </div>

                      {/* ---------------------------------------
                          FILE SELECTOR
                      ---------------------------------------- */}

                      <div>
                        <Form.Label
                          htmlFor="company-logo"
                          className="btn btn-outline-primary mb-1"
                        >
                          <ImageIcon
                            size={16}
                            className="me-2"
                          />

                          Choose Logo
                        </Form.Label>

                        <Form.Control
                          id="company-logo"
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                          onChange={handleLogoChange}
                          disabled={disabled}
                          className="d-none"
                        />

                        <div className="small text-muted">
                          PNG, JPG, JPEG or WEBP.
                          Maximum 2MB.
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* -----------------------------------------
                      REMOVE BUTTON
                  ------------------------------------------ */}

                  {logoPreview && (
                    <Col
                      md={4}
                      className="text-md-end mt-3 mt-md-0"
                    >
                      <Button
                        type="button"
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemoveLogo}
                        disabled={disabled}
                      >
                        <X
                          size={16}
                          className="me-1"
                        />

                        Remove
                      </Button>
                    </Col>
                  )}

                </Row>
              </div>

              {/* ---------------------------------------------
                  LOGO ERROR
              ---------------------------------------------- */}

              {errors.logo && (
                <div className="text-danger small mt-1">
                  {errors.logo}
                </div>
              )}
            </Form.Group>
          </Col>

        </Row>
      </Card.Body>
    </Card>
  );
};

export default CompanyForm;