import React from "react";
import { Badge, Button, Pagination, Spinner, Table } from "react-bootstrap";

export default function UsersTable({
  users, loading, totalUsers, page, setPage, totalPages,
  onEdit, onToggleStatus, onDelete,
}) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="text-muted mt-3">Loading users...</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-people fs-1 text-muted" />
        <h5 className="mt-3">No users found</h5>
        <p className="text-muted">Try changing your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover className="mb-0" align="middle">
          <thead>
            <tr>
              <th>User</th><th>Contact</th><th>Role</th>
              <th>Branch</th><th>Status</th><th>Last Login</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="fw-semibold">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}
                  </div>
                  <small className="text-muted">@{user.username}</small>
                </td>
                <td>
                  <div>{user.email || "-"}</div>
                  <small className="text-muted">{user.phone || "-"}</small>
                </td>
                <td>
                  <Badge bg="secondary">
                    {user.role_name || user.role?.name || user.role || "-"}
                  </Badge>
                </td>
                <td>{user.branch_name || user.branch?.name || "-"}</td>
                <td>
                  <Badge bg={user.is_active ? "success" : "danger"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                </td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => onEdit(user)} title="Edit user">
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button
                      size="sm"
                      variant={user.is_active ? "outline-warning" : "outline-success"}
                      onClick={() => onToggleStatus(user)}
                      title={user.is_active ? "Deactivate user" : "Activate user"}
                    >
                      <i className={`bi ${user.is_active ? "bi-person-x" : "bi-person-check"}`} />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => onDelete(user)} title="Delete user">
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <small className="text-muted">Showing {users.length} of {totalUsers} users</small>
        {totalPages > 1 && (
          <Pagination className="mb-0">
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
          </Pagination>
        )}
      </div>
    </>
  );
}