import React from "react";
import { Alert, Button, Card } from "react-bootstrap";

import useUsers from "./components/hooks/useUsers";
import UsersStats from "./components/UsersStats";
import UsersFilters from "./components/UsersFilters";
import UsersTable from "./components/UsersTable";
import UserFormModal from "./components/UserFormModal";
import DeleteUserModal from "./components/DeleteUserModal";

// Replace this with your real roles API/service.
// Each role must have its database primary key in `id`.
import rolesApi from "../../services/role";

export default function Users() {
  const page = useUsers();

  const [roles, setRoles] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;

    rolesApi.getAll({ page_size: 1000 })
      .then((data) => {
        if (!mounted) return;
        setRoles(
          Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data)
              ? data
              : []
        );
      })
      .catch((err) => {
        console.error("Failed to load roles:", err);
        if (mounted) page.setError("Failed to load roles. Check the roles API.");
      });

    return () => {
      mounted = false;
    };
    // Load roles once; do not depend on the changing page object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Users</h2>
          <p className="text-muted mb-0">
            Manage users for {page.currentBranch?.name || "the selected branch"}.
          </p>
        </div>
        <Button className="primary-button" onClick={page.openAdd} disabled={!page.currentBranchId}>
          <i className="bi bi-person-plus me-2" /> Add User
        </Button>
      </div>

      {!page.currentBranchId && (
        <Alert variant="warning">
          Select a branch from your branch switcher to view and manage users.
        </Alert>
      )}

      {page.error && (
        <Alert variant="danger" dismissible onClose={() => page.setError("")}>
          {page.error}
        </Alert>
      )}

      <UsersStats totalUsers={page.totalUsers} users={page.users} />

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <UsersFilters
            search={page.search}
            setSearch={page.setSearch}
            roleFilter={page.roleFilter}
            setRoleFilter={page.setRoleFilter}
            statusFilter={page.statusFilter}
            setStatusFilter={page.setStatusFilter}
            setPage={page.setPage}
            clearFilters={page.clearFilters}
            roles={roles}
          />

          <UsersTable
            users={page.users}
            loading={page.loading}
            totalUsers={page.totalUsers}
            page={page.page}
            setPage={page.setPage}
            totalPages={page.totalPages}
            onEdit={page.openEdit}
            onToggleStatus={page.toggleStatus}
            onDelete={page.openDelete}
          />
        </Card.Body>
      </Card>

      <UserFormModal
        show={page.showModal}
        onHide={() => page.setShowModal(false)}
        editingUser={page.editingUser}
        formData={page.formData}
        onChange={page.handleChange}
        onSubmit={page.submitUser}
        saving={page.saving}
        branches={page.branches}
        branchesLoading={page.branchesLoading}
        currentBranchId={page.currentBranchId}
        error={page.error}
        roles={roles}
      />

      <DeleteUserModal
        show={page.showDeleteModal}
        onHide={() => page.setShowDeleteModal(false)}
        user={page.deletingUser}
        onConfirm={page.deleteUser}
        saving={page.saving}
      />
    </div>
  );
}