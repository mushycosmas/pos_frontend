
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import userApi from "../services/User";
import branchesApi from "../services/branchesApi";

const Users = () => {
  // =========================================================
  // USERS STATE
  // =========================================================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // BRANCHES STATE
  // =========================================================
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // =========================================================
  // GENERAL STATE
  // =========================================================
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // =========================================================
  // PAGINATION
  // =========================================================
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // =========================================================
  // MODALS
  // =========================================================
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // =========================================================
  // FORM
  // =========================================================
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "cashier",
    branch: "",
    is_active: true,
  });

  // =========================================================
  // LOAD BRANCHES
  // =========================================================
  const loadBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);

      const data = await branchesApi.getAll({
        page_size: 1000,
      });

      // DRF paginated response
      if (data && Array.isArray(data.results)) {
        setBranches(data.results);
      }

      // Non-paginated response
      else if (Array.isArray(data)) {
        setBranches(data);
      }

      else {
        setBranches([]);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load branches."
      );

      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD USERS
  // =========================================================
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter !== "") {
        params.is_active = statusFilter;
      }

      const data = await userApi.getAll(params);

      // DRF pagination
      if (data && Array.isArray(data.results)) {
        setUsers(data.results);
        setTotalUsers(data.count || 0);

        setTotalPages(
          Math.max(
            1,
            Math.ceil((data.count || 0) / pageSize)
          )
        );
      }

      // Non-paginated response
      else if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsers(data.length);
        setTotalPages(1);
      }

      else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load users. Please try again."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    roleFilter,
    search,
    statusFilter,
  ]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // =========================================================
  // FORM CHANGE
  // =========================================================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "cashier",
      branch: "",
      is_active: true,
    });
  };

  // =========================================================
  // ADD USER
  // =========================================================
  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // EDIT USER
  // =========================================================
  const handleEditUser = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      password: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "cashier",
      branch: user.branch || "",
      is_active: user.is_active ?? true,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // SAVE USER
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branch: formData.branch
          ? Number(formData.branch)
          : null,
        is_active: formData.is_active,
      };

      // CREATE
      if (!editingUser) {
        if (!formData.password) {
          setError(
            "Password is required when creating a user."
          );

          setSaving(false);
          return;
        }

        payload.password = formData.password;

        await userApi.create(payload);
      }

      // UPDATE
      else {
        await userApi.update(
          editingUser.id,
          payload
        );
      }

      setShowModal(false);
      resetForm();
      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to save user:",
        err
      );

      const responseData =
        err?.response?.data;

      if (
        typeof responseData === "object" &&
        responseData !== null
      ) {
        const messages = Object.entries(
          responseData
        )
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(
          messages ||
            "Failed to save user."
        );
      } else {
        setError(
          "Failed to save user. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE
  // =========================================================
  const handleToggleStatus = async (user) => {
    try {
      setError("");

      if (user.is_active) {
        await userApi.deactivate(user.id);
      } else {
        await userApi.activate(user.id);
      }

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to update user status."
      );
    }
  };

  // =========================================================
  // DELETE CONFIRMATION
  // =========================================================
  const confirmDelete = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  // =========================================================
  // DELETE USER
  // =========================================================
  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      setSaving(true);
      setError("");

      await userApi.delete(
        deletingUser.id
      );

      setShowDeleteModal(false);
      setDeletingUser(null);

      if (
        users.length === 1 &&
        page > 1
      ) {
        setPage((prev) => prev - 1);
      } else {
        await loadUsers();
      }
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to delete user."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // =========================================================
  // STATISTICS
  // =========================================================
  const statistics = useMemo(() => {
    const active = users.filter(
      (user) => user.is_active
    ).length;

    const inactive = users.filter(
      (user) => !user.is_active
    ).length;

    return {
      active,
      inactive,
    };
  }, [users]);

  // =========================================================
  // PAGINATION
  // =========================================================
  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const items = [];

    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() =>
          setPage((prev) =>
            Math.max(1, prev - 1)
          )
        }
      />
    );

    for (
      let number = 1;
      number <= totalPages;
      number++
    ) {
      if (
        number === 1 ||
        number === totalPages ||
        Math.abs(number - page) <= 2
      ) {
        items.push(
          <Pagination.Item
            key={number}
            active={number === page}
            onClick={() =>
              setPage(number)
            }
          >
            {number}
          </Pagination.Item>
        );
      }
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages}
        onClick={() =>
          setPage((prev) =>
            Math.min(
              totalPages,
              prev + 1
            )
          )
        }
      />
    );

    return (
      <Pagination className="mb-0">
        {items}
      </Pagination>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Users
          </h2>

          <p className="text-muted mb-0">
            Manage POS system users and permissions.
          </p>
        </div>

        <Button
          className="primary-button"
          onClick={handleAddUser}
        >
          <i className="bi bi-person-plus me-2"></i>
          Add User
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Total Users
                  </small>

                  <h3 className="mb-0 mt-1">
                    {totalUsers}
                  </h3>
                </div>

                <div className="fs-2">
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Active Users
                  </small>

                  <h3 className="mb-0 mt-1">
                    {statistics.active}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <i className="bi bi-person-check"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Inactive Users
                  </small>

                  <h3 className="mb-0 mt-1">
                    {statistics.inactive}
                  </h3>
                </div>

                <div className="fs-2 text-danger">
                  <i className="bi bi-person-x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          USERS CARD
      ===================================================== */}
      <div className="dashboard-card bg-white p-4">

        {/* ===================================================
            FILTERS
        =================================================== */}
        <Row className="g-3 mb-4">
          <Col md={5}>
            <Form.Group>
              <Form.Label>
                Search
              </Form.Label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <Form.Control
                  type="text"
                  placeholder="Search username, name, email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>
                Role
              </Form.Label>

              <Form.Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Roles
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="manager">
                  Manager
                </option>

                <option value="cashier">
                  Cashier
                </option>

                <option value="storekeeper">
                  Storekeeper
                </option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group>
              <Form.Label>
                Status
              </Form.Label>

              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All
                </option>

                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col
            md={2}
            className="d-flex align-items-end"
          >
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={clearFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Reset
            </Button>
          </Col>
        </Row>

        {/* ===================================================
            TABLE
        =================================================== */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />

            <p className="text-muted mt-3 mb-0">
              Loading users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-people fs-1 text-muted"></i>

            <h5 className="mt-3">
              No users found
            </h5>

            <p className="text-muted">
              Try changing your filters or add a new user.
            </p>

            <Button
              className="primary-button"
              onClick={handleAddUser}
            >
              <i className="bi bi-person-plus me-2"></i>
              Add User
            </Button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table
                hover
                align="middle"
                className="mb-0"
              >
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      {/* USER */}
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: 42,
                              height: 42,
                            }}
                          >
                            <i className="bi bi-person"></i>
                          </div>

                          <div>
                            <div className="fw-semibold">
                              {user.first_name ||
                              user.last_name
                                ? `${user.first_name || ""} ${
                                    user.last_name || ""
                                  }`.trim()
                                : user.username}
                            </div>

                            <small className="text-muted">
                              @{user.username}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div>
                          {user.email || "-"}
                        </div>

                        <small className="text-muted">
                          {user.phone || "-"}
                        </small>
                      </td>

                      {/* ROLE */}
                      <td>
                        <Badge bg="secondary">
                          {user.role_name ||
                            user.role ||
                            "-"}
                        </Badge>
                      </td>

                      {/* BRANCH */}
                      <td>
                        {user.branch_name || "-"}
                      </td>

                      {/* STATUS */}
                      <td>
                        {user.is_active ? (
                          <Badge bg="success">
                            Active
                          </Badge>
                        ) : (
                          <Badge bg="danger">
                            Inactive
                          </Badge>
                        )}
                      </td>

                      {/* LAST LOGIN */}
                      <td>
                        {user.last_login
                          ? new Date(
                              user.last_login
                            ).toLocaleString()
                          : "Never"}
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Edit user"
                            onClick={() =>
                              handleEditUser(
                                user
                              )
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>

                          <Button
                            variant={
                              user.is_active
                                ? "outline-warning"
                                : "outline-success"
                            }
                            size="sm"
                            title={
                              user.is_active
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                user
                              )
                            }
                          >
                            <i
                              className={
                                user.is_active
                                  ? "bi bi-person-x"
                                  : "bi bi-person-check"
                              }
                            ></i>
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete user"
                            onClick={() =>
                              confirmDelete(
                                user
                              )
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <small className="text-muted">
                Showing {users.length} of{" "}
                {totalUsers} users
              </small>

              {renderPagination()}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT USER MODAL
      ===================================================== */}
      <Modal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
        centered
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-person me-2"></i>

              {editingUser
                ? "Edit User"
                : "Add User"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className="g-3">

              {/* USERNAME */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Username{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="username"
                    value={
                      formData.username
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      !!editingUser
                    }
                  />
                </Form.Group>
              </Col>

              {/* PASSWORD */}
              {!editingUser && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Password{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </Form.Label>

                    <Form.Control
                      type="password"
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      required
                      autoComplete="new-password"
                    />
                  </Form.Group>
                </Col>
              )}

              {/* FIRST NAME */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    First Name
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="first_name"
                    value={
                      formData.first_name
                    }
                    onChange={
                      handleChange
                    }
                  />
                </Form.Group>
              </Col>

              {/* LAST NAME */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Last Name
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="last_name"
                    value={
                      formData.last_name
                    }
                    onChange={
                      handleChange
                    }
                  />
                </Form.Group>
              </Col>

              {/* EMAIL */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Email
                  </Form.Label>

                  <Form.Control
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                  />
                </Form.Group>
              </Col>

              {/* PHONE */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Phone
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="2557XXXXXXXX"
                  />
                </Form.Group>
              </Col>

              {/* ROLE */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Role{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="admin">
                      Admin
                    </option>

                    <option value="manager">
                      Manager
                    </option>

                    <option value="cashier">
                      Cashier
                    </option>

                    <option value="storekeeper">
                      Storekeeper
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* BRANCH */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Branch{" "}
                    <span className="text-danger">
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="branch"
                    value={
                      formData.branch
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      branchesLoading
                    }
                  >
                    <option value="">
                      {branchesLoading
                        ? "Loading branches..."
                        : "Select Branch"}
                    </option>

                    {branches.map(
                      (branch) => (
                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.name}
                        </option>
                      )
                    )}
                  </Form.Select>

                  {!branchesLoading &&
                    branches.length === 0 && (
                      <Form.Text className="text-danger">
                        No branches available.
                        Please create a branch first.
                      </Form.Text>
                    )}
                </Form.Group>
              </Col>

              {/* STATUS */}
              <Col md={12}>
                <Form.Check
                  type="switch"
                  id="user-active"
                  name="is_active"
                  label="User is active"
                  checked={
                    formData.is_active
                  }
                  onChange={
                    handleChange
                  }
                />
              </Col>
            </Row>
          </Modal.Body>

          {/* =================================================
              MODAL FOOTER
          ================================================= */}
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setShowModal(false)
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                branchesLoading ||
                branches.length === 0
              }
            >
              {saving ? (
                <>
                  <Spinner
                    size="sm"
                    className="me-2"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>

                  {editingUser
                    ? "Update User"
                    : "Create User"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}
      <Modal
        show={showDeleteModal}
        onHide={() =>
          setShowDeleteModal(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to delete{" "}
            <strong>
              {deletingUser?.username}
            </strong>
            ?
          </p>

          <small className="text-danger">
            This action cannot be undone.
          </small>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShowDeleteModal(false)
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner
                  size="sm"
                  className="me-2"
                />

                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Delete User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;

