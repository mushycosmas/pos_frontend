import React from "react";
import { Button, Spinner } from "react-bootstrap";

const SalesHeader = (props) => {
  const {
    loading,
    onRefresh
  } = props;

  return (
    <div className="page-header mb-4">

            <div>

              <h2 className="mb-1">

                Sales

              </h2>



              <p className="text-muted mb-0">

                View and manage all sales

                transactions.

              </p>

            </div>



            <Button

              variant="primary"

              onClick={onRefresh}

              disabled={loading}

            >

              {loading ? (

                <Spinner

                  size="sm"

                  animation="border"

                  className="me-2"

                />

              ) : (

                <i className="bi bi-arrow-clockwise me-2"></i>

              )}



              Refresh

            </Button>

          </div>



  
  );
};

export default SalesHeader;
