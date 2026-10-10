import React from "react";
import { Alert } from "react-bootstrap";

const SalesError = (props) => {
  const {
    error,
    onDismiss
  } = props;

  return (
    <>
      {error && (

            <Alert

              variant="danger"

              dismissible

              onClose={onDismiss}

            >

              <i className="bi bi-exclamation-triangle me-2"></i>



              {error}

            </Alert>

          )}



    </>
  );
};

export default SalesError;
