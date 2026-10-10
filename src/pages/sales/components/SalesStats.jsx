import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { formatCurrency } from "../utils/salesHelpers";

const SalesStats = (props) => {
  const {
    statistics
  } = props;

  return (
    <Row className="g-3 mb-4">



            <Col xl={3} md={6}>

              <Card className="dashboard-card border-0">

                <Card.Body>

                  <small className="text-muted">

                    Sales

                  </small>



                  <h4 className="mt-2 mb-0">

                    {

                      statistics.totalSales

                    }

                  </h4>

                </Card.Body>

              </Card>

            </Col>



            <Col xl={3} md={6}>

              <Card className="dashboard-card border-0">

                <Card.Body>

                  <small className="text-muted">

                    Completed

                  </small>



                  <h4 className="mt-2 mb-0 text-success">

                    {

                      statistics.completedSales

                    }

                  </h4>

                </Card.Body>

              </Card>

            </Col>



            <Col xl={3} md={6}>

              <Card className="dashboard-card border-0">

                <Card.Body>

                  <small className="text-muted">

                    Discount

                  </small>



                  <h4 className="mt-2 mb-0 text-warning">

                    {formatCurrency(

                      statistics.totalDiscount

                    )}

                  </h4>

                </Card.Body>

              </Card>

            </Col>



            <Col xl={3} md={6}>

              <Card className="dashboard-card border-0">

                <Card.Body>

                  <small className="text-muted">

                    Current Page Value

                  </small>



                  <h4 className="mt-2 mb-0">

                    {formatCurrency(

                      statistics.totalAmount

                    )}

                  </h4>

                </Card.Body>

              </Card>

            </Col>



          </Row>

  );
};

export default SalesStats;
