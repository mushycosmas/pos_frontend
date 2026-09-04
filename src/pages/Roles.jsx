import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaEdit,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaSave,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";

import roleApi from "../services/role";
import permissionApi from "../services/permission";

const Roles = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Role modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  // Permission modal
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await roleApi.getAll();

      /*
       * DRF pagination can return:
       * {
       *   count: 10,
       *   next: "...",
       *   previous: null,
       *   results: []
       * }
       *
       * Or a direct array.
       */
      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load roles."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setPermissionsLoading(true);
      setError("");

      const response = await permissionApi.getAll();

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setPermissions(data);

      return data;
    } catch (err) {
      console.error("Failed to load permissions:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load permissions."
      );

      return [];
    } finally {
      setPermissionsLoading(false);
    }
  };

  // =========================================================
  // FILTER ROLES
  // =========================================================

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        role.name?.toLowerCase().includes(searchText) ||
        role.code?.toLowerCase().includes(searchText) ||
        role.description?.toLowerCase().includes(searchText);

      const isActive =
        role.is_active !== false &&
        role.is_active !== 0;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalRoles = roles.length;

  const activeRoles = roles.filter(
    (role) =>
      role.is_active !== false &&
      role.is_active !== 0
  ).length;

  const inactiveRoles = totalRoles - activeRoles;

  // =========================================================
  // ROLE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingRole(null);

    setRoleForm({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });

    setError("");
    setSuccess("");

    setShowRoleModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);

    setRoleForm({
      name: role.name || "",
      code: role.code || "",
      description: role.description || "",
      is_active:
        role.is_active !== false &&
        role.is_active !== 0,
    });

    setError("");
    setSuccess("");

    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    if (saving) return;

    setShowRoleModal(false);
    setEditingRole(null);

    setRoleForm({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
  };

  // =========================================================
  // AUTO CODE
  // =========================================================

  const generateCode = (name) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleRoleNameChange = (value) => {
    setRoleForm((previous) => ({
      ...previous,
      name: value,
      ...(editingRole
        ? {}
        : {
            code: generateCode(value),
          }),
    }));
  };

  // =========================================================
  // SAVE ROLE
  // =========================================================

  const handleRoleSubmit = async (event) => {
    event.preventDefault();

    const name = roleForm.name.trim();
    const code = roleForm.code.trim().toLowerCase();

    if (!name) {
      setError("Role name is required.");
      return;
    }

    if (!code) {
      setError("Role code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name,
        code,
        description: roleForm.description.trim(),
        is_active: roleForm.is_active,
      };

      if (editingRole) {
        await roleApi.update(
          editingRole.id,
          payload
        );

        setSuccess("Role updated successfully.");
      } else {
        await roleApi.create(payload);

        setSuccess("Role created successfully.");
      }

      closeRoleModal();

      await loadRoles();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save role:", err);

      const data = err?.response?.data;

      if (typeof data === "object" && data !== null) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field}: ${value.join(", ")}`;
            }

            return `${field}: ${value}`;
          })
          .join(" | ");

        setError(
          messages || "Failed to save role."
        );
      } else {
        setError(
          data ||
            "Failed to save role."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE ROLE
  // =========================================================

  const handleDeleteRole = async (role) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${role.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await roleApi.delete(role.id);

      setSuccess(
        `Role "${role.name}" deleted successfully.`
      );

      await loadRoles();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete role:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete role."
      );
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE
  // =========================================================

  const handleToggleStatus = async (role) => {
    const isActive =
      role.is_active !== false &&
      role.is_active !== 0;

    try {
      setError("");
      setSuccess("");

      if (isActive) {
        await roleApi.deactivate(role.id);

        setSuccess(
          `Role "${role.name}" has been deactivated.`
        );
      } else {
        await roleApi.activate(role.id);

        setSuccess(
          `Role "${role.name}" has been activated.`
        );
      }

      await loadRoles();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to change role status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to change role status."
      );
    }
  };

  // =========================================================
  // PERMISSION MODAL
  // =========================================================

  const openPermissionModal = async (role) => {
    setSelectedRole(role);
    setSelectedPermissions([]);

    setShowPermissionModal(true);

    try {
      setPermissionsLoading(true);
      setError("");

      const [allPermissionsResponse, rolePermissionsResponse] =
        await Promise.all([
          permissionApi.getAll(),
          roleApi.getPermissions(role.id),
        ]);

      const allPermissions = Array.isArray(
        allPermissionsResponse
      )
        ? allPermissionsResponse
        : allPermissionsResponse?.results || [];

      const rolePermissions = Array.isArray(
        rolePermissionsResponse
      )
        ? rolePermissionsResponse
        : rolePermissionsResponse?.results ||
          rolePermissionsResponse?.permissions ||
          [];

      setPermissions(allPermissions);

      /*
       * Backend may return:
       *
       * [
       *   { id: 1, name: "View Sales" }
       * ]
       *
       * OR
       *
       * [
       *   1,
       *   2,
       *   3
       * ]
       */
      const ids = rolePermissions
        .map((permission) => {
          if (
            typeof permission === "object"
          ) {
            return permission.id;
          }

          return permission;
        })
        .filter(Boolean);

      setSelectedPermissions(ids);
    } catch (err) {
      console.error(
        "Failed to load role permissions:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load role permissions."
      );
    } finally {
      setPermissionsLoading(false);
    }
  };

  const closePermissionModal = () => {
    if (saving) return;

    setShowPermissionModal(false);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  // =========================================================
  // TOGGLE PERMISSION
  // =========================================================

  const togglePermission = (permissionId) => {
    setSelectedPermissions((previous) => {
      if (previous.includes(permissionId)) {
        return previous.filter(
          (id) => id !== permissionId
        );
      }

      return [
        ...previous,
        permissionId,
      ];
    });
  };

  // =========================================================
  // GROUP PERMISSIONS
  // =========================================================

  const groupedPermissions = useMemo(() => {
    const groups = {};

    permissions.forEach((permission) => {
      const moduleName =
        permission.module ||
        permission.module_name ||
        "Other";

      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }

      groups[moduleName].push(permission);
    });

    return groups;
  }, [permissions]);

  // =========================================================
  // SELECT / DESELECT MODULE
  // =========================================================

  const toggleModulePermissions = (
    modulePermissions
  ) => {
    const ids = modulePermissions
      .map((permission) => permission.id)
      .filter(Boolean);

    const allSelected = ids.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      setSelectedPermissions((previous) =>
        previous.filter(
          (id) => !ids.includes(id)
        )
      );
    } else {
      setSelectedPermissions((previous) => [
        ...new Set([
          ...previous,
          ...ids,
        ]),
      ]);
    }
  };

  // =========================================================
  // SAVE PERMISSIONS
  // =========================================================

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await roleApi.assignPermissions(
        selectedRole.id,
        selectedPermissions
      );

      setSuccess(
        `Permissions updated for "${selectedRole.name}".`
      );

      closePermissionModal();

      await loadRoles();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to assign permissions:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to update permissions."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container-fluid py-4">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaShieldAlt className="me-2" />
            Roles & Permissions
          </h2>

          <p className="text-muted mb-0">
            Manage system roles and control user access.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={loadRoles}
            disabled={loading}
          >
            <FaSyncAlt className="me-2" />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={openCreateModal}
          >
            <FaPlus className="me-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* =====================================================
          ALERTS
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

      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess("")}
        >
          {success}
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
                    TOTAL ROLES
                  </small>

                  <h3 className="mb-0 mt-2">
                    {totalRoles}
                  </h3>
                </div>

                <div className="fs-2 text-primary">
                  <FaShieldAlt />
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
                    ACTIVE ROLES
                  </small>

                  <h3 className="mb-0 mt-2">
                    {activeRoles}
                  </h3>
                </div>

                <div className="fs-2 text-success">
                  <FaCheckCircle />
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
                    INACTIVE ROLES
                  </small>

                  <h3 className="mb-0 mt-2">
                    {inactiveRoles}
                  </h3>
                </div>

                <div className="fs-2 text-secondary">
                  <FaTimesCircle />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>

          <Row className="g-3">

            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </InputGroup>
            </Col>

            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </Form.Select>
            </Col>

          </Row>

        </Card.Body>
      </Card>

      {/* =====================================================
          ROLES TABLE
      ===================================================== */}

      <Card className="border-0 shadow-sm">

        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">

            <div>
              <strong>
                System Roles
              </strong>

              <div className="text-muted small">
                {filteredRoles.length} role
                {filteredRoles.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

          </div>
        </Card.Header>

        <Card.Body className="p-0">

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="text-muted mt-2">
                Loading roles...
              </div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-5">

              <FaShieldAlt
                className="text-muted mb-3"
                size={45}
              />

              <h5>
                No roles found
              </h5>

              <p className="text-muted">
                Create a role to start managing
                user access.
              </p>

              <Button
                variant="primary"
                onClick={openCreateModal}
              >
                <FaPlus className="me-2" />
                Create Role
              </Button>

            </div>
          ) : (
            <div className="table-responsive">

              <Table
                hover
                className="mb-0 align-middle"
              >

                <thead className="table-light">
                  <tr>
                    <th>Role</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th className="text-center">
                      Users
                    </th>
                    <th className="text-center">
                      Permissions
                    </th>
                    <th>Status</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRoles.map((role) => {

                    const isActive =
                      role.is_active !== false &&
                      role.is_active !== 0;

                    const permissionCount =
                      role.permission_count ??
                      role.permissions_count ??
                      role.permissions?.length ??
                      0;

                    const userCount =
                      role.user_count ??
                      role.users_count ??
                      role.users?.length ??
                      0;

                    return (
                      <tr key={role.id}>

                        <td>
                          <div className="d-flex align-items-center">

                            <div
                              className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: 40,
                                height: 40,
                              }}
                            >
                              <FaShieldAlt />
                            </div>

                            <div>
                              <strong>
                                {role.name}
                              </strong>
                            </div>

                          </div>
                        </td>

                        <td>
                          <code>
                            {role.code}
                          </code>
                        </td>

                        <td>
                          <span className="text-muted">
                            {role.description ||
                              "No description"}
                          </span>
                        </td>

                        <td className="text-center">
                          <Badge bg="light" text="dark">
                            <FaUsers className="me-1" />
                            {userCount}
                          </Badge>
                        </td>

                        <td className="text-center">
                          <Badge bg="light" text="dark">
                            <FaKey className="me-1" />
                            {permissionCount}
                          </Badge>
                        </td>

                        <td>
                          {isActive ? (
                            <Badge bg="success">
                              <FaCheckCircle className="me-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge bg="secondary">
                              <FaTimesCircle className="me-1" />
                              Inactive
                            </Badge>
                          )}
                        </td>

                        <td>
                          <div className="d-flex justify-content-end gap-1">

                            <Button
                              size="sm"
                              variant="outline-primary"
                              title="Manage Permissions"
                              onClick={() =>
                                openPermissionModal(role)
                              }
                            >
                              <FaKey />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-secondary"
                              title="Edit Role"
                              onClick={() =>
                                openEditModal(role)
                              }
                            >
                              <FaEdit />
                            </Button>

                            <Button
                              size="sm"
                              variant={
                                isActive
                                  ? "outline-warning"
                                  : "outline-success"
                              }
                              title={
                                isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  role
                                )
                              }
                            >
                              {isActive ? (
                                <FaTimesCircle />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              title="Delete Role"
                              onClick={() =>
                                handleDeleteRole(
                                  role
                                )
                              }
                            >
                              <FaTrash />
                            </Button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </Table>

            </div>
          )}

        </Card.Body>
      </Card>

      {/* =====================================================
          CREATE / EDIT ROLE MODAL
      ===================================================== */}

      <Modal
        show={showRoleModal}
        onHide={closeRoleModal}
        centered
      >

        <Modal.Header closeButton>
          <Modal.Title>
            <FaShieldAlt className="me-2" />

            {editingRole
              ? "Edit Role"
              : "Create Role"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleRoleSubmit}>

          <Modal.Body>

            <Form.Group className="mb-3">
              <Form.Label>
                Role Name
                <span className="text-danger">
                  {" "}*
                </span>
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="e.g. Cashier"
                value={roleForm.name}
                onChange={(e) =>
                  handleRoleNameChange(
                    e.target.value
                  )
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Role Code
                <span className="text-danger">
                  {" "}*
                </span>
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="e.g. cashier"
                value={roleForm.code}
                onChange={(e) =>
                  setRoleForm((previous) => ({
                    ...previous,
                    code: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "_"),
                  }))
                }
                required
              />

              <Form.Text className="text-muted">
                Use a unique system-friendly code.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Description
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe what this role is responsible for..."
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm((previous) => ({
                    ...previous,
                    description:
                      e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="role-active"
              label="Active Role"
              checked={roleForm.is_active}
              onChange={(e) =>
                setRoleForm((previous) => ({
                  ...previous,
                  is_active:
                    e.target.checked,
                }))
              }
            />

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="secondary"
              onClick={closeRoleModal}
              disabled={saving}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={saving}
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
                  <FaSave className="me-2" />
                  {editingRole
                    ? "Update Role"
                    : "Create Role"}
                </>
              )}
            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

      {/* =====================================================
          PERMISSIONS MODAL
      ===================================================== */}

      <Modal
        show={showPermissionModal}
        onHide={closePermissionModal}
        size="lg"
        centered
        scrollable
      >

        <Modal.Header closeButton>

          <Modal.Title>
            <FaKey className="me-2" />

            Manage Permissions

            {selectedRole && (
              <div className="small text-muted mt-1">
                Role:{" "}
                <strong>
                  {selectedRole.name}
                </strong>
              </div>
            )}

          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          {permissionsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />

              <div className="text-muted mt-2">
                Loading permissions...
              </div>
            </div>
          ) : permissions.length === 0 ? (
            <Alert variant="warning">
              No permissions have been configured
              in the system yet.
            </Alert>
          ) : (
            <div>

              {/* SUMMARY */}
              <Card className="bg-light border-0 mb-3">
                <Card.Body className="py-3">

                  <div className="d-flex justify-content-between align-items-center">

                    <div>
                      <strong>
                        Selected Permissions
                      </strong>

                      <div className="text-muted small">
                        Choose what this role can
                        access.
                      </div>
                    </div>

                    <Badge bg="primary" pill>
                      {selectedPermissions.length}
                      {" / "}
                      {permissions.length}
                    </Badge>

                  </div>

                </Card.Body>
              </Card>

              {/* PERMISSION GROUPS */}

              {Object.entries(
                groupedPermissions
              ).map(
                ([
                  moduleName,
                  modulePermissions,
                ]) => {

                  const moduleIds =
                    modulePermissions
                      .map(
                        (permission) =>
                          permission.id
                      )
                      .filter(Boolean);

                  const selectedCount =
                    moduleIds.filter(
                      (id) =>
                        selectedPermissions.includes(
                          id
                        )
                    ).length;

                  const allSelected =
                    moduleIds.length > 0 &&
                    selectedCount ===
                      moduleIds.length;

                  return (
                    <Card
                      key={moduleName}
                      className="mb-3"
                    >

                      <Card.Header className="bg-white">

                        <div className="d-flex justify-content-between align-items-center">

                          <div>
                            <strong>
                              {moduleName}
                            </strong>

                            <span className="text-muted ms-2">
                              ({selectedCount}/
                              {moduleIds.length})
                            </span>
                          </div>

                          <Form.Check
                            type="checkbox"
                            label={
                              allSelected
                                ? "Deselect All"
                                : "Select All"
                            }
                            checked={
                              allSelected
                            }
                            onChange={() =>
                              toggleModulePermissions(
                                modulePermissions
                              )
                            }
                          />

                        </div>

                      </Card.Header>

                      <Card.Body>

                        <Row>

                          {modulePermissions.map(
                            (permission) => {

                              const checked =
                                selectedPermissions.includes(
                                  permission.id
                                );

                              return (
                                <Col
                                  md={6}
                                  key={
                                    permission.id
                                  }
                                  className="mb-3"
                                >

                                  <div
                                    className={`border rounded p-3 ${
                                      checked
                                        ? "border-primary bg-light"
                                        : ""
                                    }`}
                                  >

                                    <Form.Check
                                      type="checkbox"
                                      id={`permission-${permission.id}`}
                                      checked={
                                        checked
                                      }
                                      onChange={() =>
                                        togglePermission(
                                          permission.id
                                        )
                                      }
                                      label={
                                        <div>
                                          <strong>
                                            {
                                              permission.name
                                            }
                                          </strong>

                                          {permission.code && (
                                            <div>
                                              <code className="small">
                                                {
                                                  permission.code
                                                }
                                              </code>
                                            </div>
                                          )}

                                          {permission.description && (
                                            <div className="text-muted small mt-1">
                                              {
                                                permission.description
                                              }
                                            </div>
                                          )}
                                        </div>
                                      }
                                    />

                                  </div>

                                </Col>
                              );
                            }
                          )}

                        </Row>

                      </Card.Body>

                    </Card>
                  );
                }
              )}

            </div>
          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={closePermissionModal}
            disabled={saving}
          >
            <FaTimes className="me-2" />
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSavePermissions}
            disabled={
              saving ||
              permissionsLoading ||
              !selectedRole
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
                <FaSave className="me-2" />
                Save Permissions
              </>
            )}
          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
};

export default Roles;