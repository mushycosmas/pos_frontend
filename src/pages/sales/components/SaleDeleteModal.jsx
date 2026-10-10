import React from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { getInvoiceNumber } from "../utils/salesHelpers";

const SaleDeleteModal = (props) => {
  const {
    showDeleteModal,
    setShowDeleteModal,
    deleting,
    saleToDelete,
    handleDelete,
  } = props;

  return (
    <Modal
      show={showDeleteModal}
      onHide={() => {
        if (!deleting) {
          setShowDeleteModal(false);
        }
      }}
      centered
    >
      <Modal.Header closeButton={!deleting}>
        <Modal.Title>Delete Sale</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Deleting a sale may affect stock, payments, and financial records.
        </Alert>

        <p className="mb-0">
          Are you sure you want to delete{" "}
          <strong>
            {saleToDelete ? getInvoiceNumber(saleToDelete) : "-"}
          </strong>
          ?
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="light"
          disabled={deleting}
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? (
            <>
              <Spinner
                size="sm"
                animation="border"
                className="me-2"
              />
              Deleting...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              Delete Sale
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SaleDeleteModal;
