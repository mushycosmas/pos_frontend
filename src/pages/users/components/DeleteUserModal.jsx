import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

export default function DeleteUserModal({
  show, onHide, user, onConfirm, saving,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete <strong>{user?.username}</strong>?
        <p className="text-danger mb-0 mt-2">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={saving}>
          {saving ? <><Spinner size="sm" className="me-2" />Deleting...</> : "Delete User"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}