import React, { useEffect, useState } from "react";
import { useBranch } from "../../../context/BranchContext";
import branchesApi from "../../../services/branchesApi";

const EMPTY_FORM = {
  name: "",
  code: "",
  location: "",
  phone: "",
  email: "",
  is_active: true,
};

const BranchSettings = () => {
  const {
    branches,
    activeBranches,
    currentBranch,
  } = useBranch();

  // ============================================================
  // STATE
  // ============================================================

  const [branchList, setBranchList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [editingBranch, setEditingBranch] = useState(null);

  const [form, setForm] = useState(
    EMPTY_FORM
  );

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [viewBranch, setViewBranch] = useState(null);

  // ============================================================
  // LOAD BRANCHES
  // ============================================================

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await branchesApi.getAll();

      console.log(
        "BRANCHES API RESPONSE:",
        response
      );

      let data = [];

      // Paginated response
      if (response?.results) {
        data = response.results;
      }

      // Array response
      else if (
        Array.isArray(response)
      ) {
        data = response;
      }

      // Single object
      else if (
        response &&
        typeof response === "object"
      ) {
        data = [response];
      }

      setBranchList(data);

    } catch (err) {
      console.error(
        "Failed to load branches:",
        err
      );

      console.error(
        "Server response:",
        err?.response?.data
      );

      setError(
        getApiError(
          err,
          "Failed to load branches."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadBranches();
  }, []);

  // ============================================================
  // API ERROR HELPER
  // ============================================================

  const getApiError = (
    err,
    fallback = "Something went wrong."
  ) => {
    const data =
      err?.response?.data;

    if (!data) {
      return (
        err?.message ||
        fallback
      );
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.error) {
      return data.error;
    }

    if (data.message) {
      return data.message;
    }

    if (
      typeof data === "object"
    ) {
      const messages =
        Object.entries(data)
          .map(
            ([field, message]) => {
              if (
                Array.isArray(message)
              ) {
                return `${field}: ${message.join(
                  ", "
                )}`;
              }

              if (
                typeof message ===
                "object"
              ) {
                return `${field}: ${JSON.stringify(
                  message
                )}`;
              }

              return `${field}: ${message}`;
            }
          )
          .join(" ");

      return (
        messages ||
        fallback
      );
    }

    return fallback;
  };

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const handleAddBranch = () => {
    setEditingBranch(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");

    setSuccess("");

    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleEditBranch = (
    branch
  ) => {
    setEditingBranch(branch);

    setForm({
      name:
        branch?.name || "",

      code:
        branch?.code || "",

      location:
        branch?.location || "",

      phone:
        branch?.phone || "",

      email:
        branch?.email || "",

      is_active:
        branch?.is_active !== false,
    });

    setError("");

    setSuccess("");

    setShowModal(true);
  };

  // ============================================================
  // VIEW BRANCH
  // ============================================================

  const handleViewBranch = (
    branch
  ) => {
    setViewBranch(branch);

    setError("");

    setSuccess("");
  };

  // ============================================================
  // CLOSE FORM MODAL
  // ============================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingBranch(null);

    setForm({
      ...EMPTY_FORM,
    });

    setError("");
  };

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");

    setSuccess("");
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    const name =
      form.name.trim();

    const code =
      form.code.trim();

    const location =
      form.location.trim();

    const phone =
      form.phone.trim();

    const email =
      form.email.trim();

    if (!name) {
      return "Branch name is required.";
    }

    if (!code) {
      return "Branch code is required.";
    }

    if (code.length > 10) {
      return "Branch code cannot exceed 10 characters.";
    }

    if (!location) {
      return "Branch location is required.";
    }

    if (!phone) {
      return "Branch phone number is required.";
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // ============================================================
  // SAVE BRANCH
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const payload = {
        name:
          form.name.trim(),

        code:
          form.code.trim().toUpperCase(),

        location:
          form.location.trim(),

        phone:
          form.phone.trim(),

        email:
          form.email.trim() ||
          null,

        is_active:
          Boolean(form.is_active),
      };

      let response;

      // ========================================================
      // UPDATE
      // ========================================================

      if (editingBranch?.id) {
        console.log(
          "Updating branch:",
          editingBranch.id
        );

        response =
          await branchesApi.update(
            editingBranch.id,
            payload
          );

        setSuccess(
          "Branch updated successfully."
        );
      }

      // ========================================================
      // CREATE
      // ========================================================

      else {
        console.log(
          "Creating branch:",
          payload
        );

        response =
          await branchesApi.create(
            payload
          );

        setSuccess(
          "Branch created successfully."
        );
      }

      console.log(
        "Branch save response:",
        response
      );

      // ========================================================
      // CLOSE MODAL
      // ========================================================

      setShowModal(false);

      setEditingBranch(null);

      setForm({
        ...EMPTY_FORM,
      });

      // ========================================================
      // RELOAD BRANCHES
      // ========================================================

      await loadBranches();

    } catch (err) {
      console.error(
        "Failed to save branch:",
        err
      );

      console.error(
        "Server response:",
        err?.response?.data
      );

      setError(
        getApiError(
          err,
          "Failed to save branch."
        )
      );

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE BRANCH
  // ============================================================

  const handleDeleteBranch = async (
    branch
  ) => {
    if (!branch?.id) {
      return;
    }

    // ========================================================
    // MAIN BRANCH PROTECTION
    // ========================================================

    if (branch.is_main) {
      window.alert(
        "The Main Branch cannot be deleted."
      );

      return;
    }

    // ========================================================
    // CURRENT BRANCH PROTECTION
    // ========================================================

    if (
      Number(branch.id) ===
      Number(currentBranch?.id)
    ) {
      window.alert(
        "You cannot delete the branch you are currently working in. Switch to another branch first."
      );

      return;
    }

    // ========================================================
    // CONFIRM
    // ========================================================

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${branch.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        branch.id
      );

      setError("");

      setSuccess("");

      await branchesApi.delete(
        branch.id
      );

      setSuccess(
        `Branch "${branch.name}" deleted successfully.`
      );

      await loadBranches();

    } catch (err) {
      console.error(
        "Failed to delete branch:",
        err
      );

      console.error(
        "Server response:",
        err?.response?.data
      );

      setError(
        getApiError(
          err,
          "Failed to delete branch."
        )
      );

    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // TOGGLE ACTIVE STATUS
  // ============================================================

  const handleToggleStatus = async (
    branch
  ) => {
    if (!branch?.id) {
      return;
    }

    // ========================================================
    // MAIN BRANCH
    // ========================================================

    if (branch.is_main) {
      window.alert(
        "The Main Branch cannot be deactivated."
      );

      return;
    }

    // ========================================================
    // CURRENT BRANCH
    // ========================================================

    if (
      Number(branch.id) ===
        Number(currentBranch?.id) &&
      branch.is_active
    ) {
      window.alert(
        "You cannot deactivate the branch you are currently working in."
      );

      return;
    }

    try {
      setError("");

      setSuccess("");

      await branchesApi.patch(
        branch.id,
        {
          is_active:
            !branch.is_active,
        }
      );

      setSuccess(
        branch.is_active
          ? "Branch deactivated successfully."
          : "Branch activated successfully."
      );

      await loadBranches();

    } catch (err) {
      console.error(
        "Failed to update branch status:",
        err
      );

      setError(
        getApiError(
          err,
          "Failed to update branch status."
        )
      );
    }
  };

  // ============================================================
  // RENDER BRANCH ICON
  // ============================================================

  const renderBranchIcon = (
    branch
  ) => {
    if (branch?.is_main) {
      return "bi-building";
    }

    return "bi-shop";
  };

  // ============================================================
  // RENDER STATUS
  // ============================================================

  const renderStatus = (
    branch
  ) => {
    if (
      branch?.is_active ===
      false
    ) {
      return (
        <span className="badge bg-secondary">
          Inactive
        </span>
      );
    }

    return (
      <span className="badge bg-success">
        Active
      </span>
    );
  };

  // ============================================================
  // USE API DATA WHEN AVAILABLE
  // ============================================================

  const displayedBranches =
    branchList.length > 0
      ? branchList
      : branches || [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-start mb-4">

        <div>
          <h5 className="mb-1">
            Branches
          </h5>

          <p className="text-muted mb-0">
            Manage your company branches and business locations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={
            handleAddBranch
          }
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Branch
        </button>

      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setError("")
            }
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>

          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setSuccess("")
            }
          ></button>
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="row g-3 mb-4">

        {/* TOTAL */}

        <div className="col-sm-6 col-lg-4">

          <div className="border rounded-3 p-3 h-100">

            <div className="d-flex align-items-center">

              <div
                className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "44px",
                  height: "44px",
                }}
              >
                <i className="bi bi-diagram-3 fs-5"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Total Branches
                </small>

                <strong className="fs-5">
                  {displayedBranches.length}
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* ACTIVE */}

        <div className="col-sm-6 col-lg-4">

          <div className="border rounded-3 p-3 h-100">

            <div className="d-flex align-items-center">

              <div
                className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "44px",
                  height: "44px",
                }}
              >
                <i className="bi bi-check-circle fs-5"></i>
              </div>

              <div>
                <small className="text-muted d-block">
                  Active Branches
                </small>

                <strong className="fs-5">
                  {
                    displayedBranches.filter(
                      (branch) =>
                        branch.is_active !==
                        false
                    ).length
                  }
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* CURRENT */}

        <div className="col-sm-12 col-lg-4">

          <div className="border rounded-3 p-3 h-100">

            <div className="d-flex align-items-center">

              <div
                className="bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "44px",
                  height: "44px",
                }}
              >
                <i className="bi bi-shop fs-5"></i>
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >

                <small className="text-muted d-block">
                  Current Branch
                </small>

                <strong
                  className="d-block text-truncate"
                  title={
                    currentBranch?.name ||
                    "Not selected"
                  }
                >
                  {currentBranch?.name ||
                    "Not selected"}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          CURRENT BRANCH
      ====================================================== */}

      {currentBranch && (
        <div className="alert alert-primary border-0 mb-4">

          <div className="d-flex align-items-center">

            <div
              className="bg-white rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{
                width: "46px",
                height: "46px",
              }}
            >
              <i className="bi bi-shop text-primary fs-5"></i>
            </div>

            <div>

              <small className="d-block text-primary-emphasis">
                Currently working in
              </small>

              <strong>
                {currentBranch.name}
              </strong>

              {currentBranch.code && (
                <span className="ms-2 text-muted">
                  ({currentBranch.code})
                </span>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          BRANCH TABLE
      ====================================================== */}

      <div className="border rounded-3 overflow-hidden">

        {/* TABLE HEADER */}

        <div className="p-3 border-bottom bg-light">

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h6 className="mb-1">
                Company Branches
              </h6>

              <small className="text-muted">
                All branches registered under your company.
              </small>
            </div>

            <span className="badge bg-secondary">
              {displayedBranches.length} Branch
              {displayedBranches.length ===
              1
                ? ""
                : "es"}
            </span>

          </div>

        </div>

        {/* TABLE */}

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">

              <tr>

                <th className="px-3">
                  Branch
                </th>

                <th>
                  Code
                </th>

                <th>
                  Location
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Status
                </th>

                <th className="text-end px-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (
                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-5"
                  >

                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    ></div>

                    <div className="text-muted">
                      Loading branches...
                    </div>

                  </td>

                </tr>
              ) : displayedBranches.length >
                0 ? (

                displayedBranches.map(
                  (branch) => {

                    const isCurrent =
                      Number(
                        branch.id
                      ) ===
                      Number(
                        currentBranch?.id
                      );

                    const isDeleting =
                      Number(
                        deletingId
                      ) ===
                      Number(
                        branch.id
                      );

                    return (
                      <tr
                        key={
                          branch.id
                        }
                      >

                        {/* BRANCH */}

                        <td className="px-3">

                          <div className="d-flex align-items-center">

                            <div
                              className={`rounded-3 d-flex align-items-center justify-content-center me-3 ${
                                isCurrent
                                  ? "bg-primary bg-opacity-10 text-primary"
                                  : "bg-light text-secondary"
                              }`}
                              style={{
                                width: "42px",
                                height: "42px",
                              }}
                            >

                              <i
                                className={`bi ${renderBranchIcon(
                                  branch
                                )}`}
                              ></i>

                            </div>

                            <div
                              style={{
                                minWidth: 0,
                              }}
                            >

                              <div className="fw-semibold">

                                {branch.name}

                                {branch.is_main && (
                                  <span className="badge bg-primary ms-2">
                                    Main
                                  </span>
                                )}

                                {isCurrent && (
                                  <span className="badge bg-success ms-2">
                                    Current
                                  </span>
                                )}

                              </div>

                              {branch.email && (
                                <small className="text-muted">
                                  {branch.email}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* CODE */}

                        <td>

                          {branch.code ? (
                            <span className="badge bg-light text-dark border">
                              {branch.code}
                            </span>
                          ) : (
                            <span className="text-muted">
                              -
                            </span>
                          )}

                        </td>

                        {/* LOCATION */}

                        <td>

                          <div className="d-flex align-items-center">

                            <i className="bi bi-geo-alt text-muted me-1"></i>

                            <span>
                              {branch.location ||
                                "-"}
                            </span>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td>

                          {branch.phone ? (
                            <div className="d-flex align-items-center">

                              <i className="bi bi-telephone text-muted me-1"></i>

                              <span>
                                {branch.phone}
                              </span>

                            </div>
                          ) : (
                            <span className="text-muted">
                              -
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td>
                          {renderStatus(
                            branch
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="text-end px-3">

                          <div className="btn-group">

                            {/* VIEW */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              title="View branch"
                              onClick={() =>
                                handleViewBranch(
                                  branch
                                )
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              title="Edit branch"
                              onClick={() =>
                                handleEditBranch(
                                  branch
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            {/* ACTIVATE / DEACTIVATE */}

                            {!branch.is_main && (
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  branch.is_active
                                    ? "btn-outline-warning"
                                    : "btn-outline-success"
                                }`}
                                title={
                                  branch.is_active
                                    ? "Deactivate branch"
                                    : "Activate branch"
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    branch
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                              >
                                <i
                                  className={`bi ${
                                    branch.is_active
                                      ? "bi-pause-circle"
                                      : "bi-play-circle"
                                  }`}
                                ></i>
                              </button>
                            )}

                            {/* DELETE */}

                            {!branch.is_main && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Delete branch"
                                onClick={() =>
                                  handleDeleteBranch(
                                    branch
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                              >
                                {isDeleting ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                /* EMPTY */

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-5"
                  >

                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        width: "70px",
                        height: "70px",
                      }}
                    >
                      <i
                        className="bi bi-building"
                        style={{
                          fontSize: "28px",
                        }}
                      ></i>
                    </div>

                    <h6 className="mb-2">
                      No branches found
                    </h6>

                    <p className="text-muted mb-3">
                      Add a branch to start
                      managing multiple
                      business locations.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        handleAddBranch
                      }
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Add Branch
                    </button>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <div className="alert alert-info mt-4 mb-0">

        <div className="d-flex">

          <i className="bi bi-info-circle me-2 mt-1"></i>

          <div>

            <strong>
              Main Branch
            </strong>

            <div className="mt-1">
              The Main Branch was automatically
              created when your company was
              registered. The Main Branch cannot
              be deleted or deactivated.
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
          >

            <div className="modal-content">

              {/* MODAL HEADER */}

              <div className="modal-header">

                <h5 className="modal-title">

                  <i
                    className={`bi ${
                      editingBranch
                        ? "bi-pencil-square"
                        : "bi-building-add"
                    } me-2`}
                  ></i>

                  {editingBranch
                    ? "Edit Branch"
                    : "Add Branch"}

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                ></button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="modal-body">

                  {/* ERROR */}

                  {error && (
                    <div className="alert alert-danger">

                      <i className="bi bi-exclamation-triangle me-2"></i>

                      {error}

                    </div>
                  )}

                  {/* NAME */}

                  <div className="mb-3">

                    <label className="form-label">
                      Branch Name
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Dar es Salaam Branch"
                      maxLength="100"
                      required
                      disabled={
                        saving
                      }
                    />

                  </div>

                  {/* CODE */}

                  <div className="mb-3">

                    <label className="form-label">
                      Branch Code
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      name="code"
                      className="form-control text-uppercase"
                      value={
                        form.code
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. DSM"
                      maxLength="10"
                      required
                      disabled={
                        saving
                      }
                    />

                    <small className="text-muted">
                      Maximum 10 characters.
                    </small>

                  </div>

                  {/* LOCATION */}

                  <div className="mb-3">

                    <label className="form-label">
                      Location
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      value={
                        form.location
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Kariakoo, Dar es Salaam"
                      maxLength="200"
                      required
                      disabled={
                        saving
                      }
                    />

                  </div>

                  {/* PHONE */}

                  <div className="mb-3">

                    <label className="form-label">
                      Phone
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 0712345678"
                      maxLength="15"
                      required
                      disabled={
                        saving
                      }
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="mb-3">

                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="branch@example.com"
                      disabled={
                        saving
                      }
                    />

                  </div>

                  {/* ACTIVE */}

                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="is_active"
                      id="branchIsActive"
                      className="form-check-input"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        saving
                      }
                    />

                    <label
                      htmlFor="branchIsActive"
                      className="form-check-label"
                    >
                      Branch is active
                    </label>

                  </div>

                </div>

                {/* MODAL FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      closeModal
                    }
                    disabled={
                      saving
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      saving
                    }
                  >

                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>

                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>

                        {editingBranch
                          ? "Update Branch"
                          : "Create Branch"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          VIEW BRANCH MODAL
      ====================================================== */}

      {viewBranch && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.5)",
          }}
        >

          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
          >

            <div className="modal-content">

              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title">

                  <i className="bi bi-shop me-2"></i>

                  Branch Details

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setViewBranch(
                      null
                    )
                  }
                ></button>

              </div>

              {/* BODY */}

              <div className="modal-body">

                <div className="text-center mb-4">

                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                    }}
                  >

                    <i
                      className={`bi ${renderBranchIcon(
                        viewBranch
                      )}`}
                      style={{
                        fontSize:
                          "28px",
                      }}
                    ></i>

                  </div>

                  <h5 className="mb-1">
                    {viewBranch.name}
                  </h5>

                  <div>
                    {renderStatus(
                      viewBranch
                    )}
                  </div>

                </div>

                <div className="border rounded-3">

                  {/* CODE */}

                  <div className="d-flex justify-content-between p-3 border-bottom">

                    <span className="text-muted">
                      Branch Code
                    </span>

                    <strong>
                      {viewBranch.code ||
                        "-"}
                    </strong>

                  </div>

                  {/* LOCATION */}

                  <div className="d-flex justify-content-between p-3 border-bottom">

                    <span className="text-muted">
                      Location
                    </span>

                    <strong>
                      {viewBranch.location ||
                        "-"}
                    </strong>

                  </div>

                  {/* PHONE */}

                  <div className="d-flex justify-content-between p-3 border-bottom">

                    <span className="text-muted">
                      Phone
                    </span>

                    <strong>
                      {viewBranch.phone ||
                        "-"}
                    </strong>

                  </div>

                  {/* EMAIL */}

                  <div className="d-flex justify-content-between p-3">

                    <span className="text-muted">
                      Email
                    </span>

                    <strong>
                      {viewBranch.email ||
                        "-"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setViewBranch(
                      null
                    )
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setViewBranch(
                      null
                    );

                    handleEditBranch(
                      viewBranch
                    );
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Branch
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BranchSettings;