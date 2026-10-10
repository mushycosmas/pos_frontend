import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";

import CompanyForm from "./CompanyForm";
import OwnerForm from "./OwnerForm";

// =========================================================
// DEFAULT DATA
// =========================================================

const DEFAULT_COMPANY_DATA = {
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
};

const DEFAULT_OWNER_DATA = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

// =========================================================
// REGISTRATION FORM
// =========================================================

const RegistrationForm = ({
  onSubmit,
  registering = false,
  serverError = "",
  initialCompanyData = {},
  initialOwnerData = {},
}) => {
  const [step, setStep] = useState(1);

  const [companyData, setCompanyData] = useState({
    ...DEFAULT_COMPANY_DATA,
    ...initialCompanyData,
  });

  const [ownerData, setOwnerData] = useState({
    ...DEFAULT_OWNER_DATA,
    ...initialOwnerData,
  });

  const [companyErrors, setCompanyErrors] = useState({});
  const [ownerErrors, setOwnerErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const TOTAL_STEPS = 2;

  // =======================================================
  // VALIDATE COMPANY
  // =======================================================

  const validateCompany = () => {
    const errors = {};

    if (!companyData.name?.trim()) {
      errors.name = "Company name is required.";
    }

    if (!companyData.phone?.trim()) {
      errors.phone = "Company phone number is required.";
    }

    if (!companyData.email?.trim()) {
      errors.email = "Company email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        companyData.email.trim()
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!companyData.address?.trim()) {
      errors.address = "Company address is required.";
    }

    if (!companyData.city?.trim()) {
      errors.city = "City is required.";
    }

    setCompanyErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =======================================================
  // VALIDATE OWNER
  // =======================================================

  const validateOwner = () => {
    const errors = {};

    if (!ownerData.first_name?.trim()) {
      errors.first_name = "First name is required.";
    }

    if (!ownerData.last_name?.trim()) {
      errors.last_name = "Last name is required.";
    }

    if (!ownerData.username?.trim()) {
      errors.username = "Username is required.";
    } else if (
      ownerData.username.trim().length < 3
    ) {
      errors.username =
        "Username must be at least 3 characters.";
    }

    if (!ownerData.email?.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        ownerData.email.trim()
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!ownerData.password) {
      errors.password = "Password is required.";
    } else if (ownerData.password.length < 8) {
      errors.password =
        "Password must be at least 8 characters.";
    }

    if (!ownerData.password_confirmation) {
      errors.password_confirmation =
        "Please confirm your password.";
    } else if (
      ownerData.password !==
      ownerData.password_confirmation
    ) {
      errors.password_confirmation =
        "Passwords do not match.";
    }

    setOwnerErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =======================================================
  // NEXT
  // =======================================================

  const handleNext = () => {
    setGeneralError("");

    if (step === 1) {
      if (!validateCompany()) {
        return;
      }

      setStep(2);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =======================================================
  // BACK
  // =======================================================

  const handlePrevious = () => {
    setGeneralError("");

    if (step > 1) {
      setStep((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setGeneralError("");

    if (!validateOwner()) {
      return;
    }

    if (typeof onSubmit !== "function") {
      setGeneralError(
        "Registration handler is not configured."
      );
      return;
    }

    try {
      await onSubmit({
        company: {
          ...companyData,
        },
        owner: {
          ...ownerData,
        },
      });
    } catch (error) {
      console.error(
        "Registration submission error:",
        error
      );

      setGeneralError(
        error?.message ||
          "Unable to complete registration."
      );
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Form
      onSubmit={handleSubmit}
      noValidate
    >
      {/* ===================================================
          PROGRESS
      ==================================================== */}

      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <strong>
            Step {step} of {TOTAL_STEPS}
          </strong>

          <span className="text-muted">
            {step === 1
              ? "Company Information"
              : "Administrator Account"}
          </span>
        </div>

        <ProgressBar
          now={(step / TOTAL_STEPS) * 100}
        />
      </div>

      {/* ===================================================
          ERROR
      ==================================================== */}

      {(generalError || serverError) && (
        <Alert
          variant="danger"
          onClose={() => setGeneralError("")}
          dismissible
        >
          {generalError || serverError}
        </Alert>
      )}

      {/* ===================================================
          COMPANY
      ==================================================== */}

      {step === 1 && (
        <CompanyForm
          formData={companyData}
          setFormData={setCompanyData}
          errors={companyErrors}
          disabled={registering}
        />
      )}

      {/* ===================================================
          OWNER
      ==================================================== */}

      {step === 2 && (
        <OwnerForm
          formData={ownerData}
          setFormData={setOwnerData}
          errors={ownerErrors}
          disabled={registering}
        />
      )}

      {/* ===================================================
          MAIN BRANCH
      ==================================================== */}

      {step === 2 && (
        <Alert
          variant="light"
          className="border mt-4"
        >
          <strong>
            Main Branch
          </strong>

          <div className="small text-muted mt-1">
            Your Main Branch will automatically
            be created with branch code{" "}
            <strong>MAIN</strong>.
          </div>

          <div className="small text-muted mt-1">
            Additional branches can be added
            later from the Branches management
            section.
          </div>
        </Alert>
      )}

      {/* ===================================================
          BUTTONS
      ==================================================== */}

      <div className="d-flex justify-content-between mt-4">
        <div>
          {step > 1 && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={registering}
            >
              ← Back
            </Button>
          )}
        </div>

        <div>
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={registering}
            >
              Continue →
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={registering}
            >
              {registering ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />

                  Creating Company...
                </>
              ) : (
                "Create Company"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ===================================================
          FOOTER
      ==================================================== */}

      <div className="text-center mt-4">
        <small className="text-muted">
          By creating your company account,
          you agree to use the POS system
          responsibly and securely.
        </small>
      </div>
    </Form>
  );
};

export default RegistrationForm;