import React, { useState } from 'react';

import {
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
} from 'react-bootstrap';

import PurchaseModal from '../components/inventory/PurchaseModal';

import { useInventory } from '../context/InventoryContext';

const Purchases = () => {
  const {
    purchases = [],
    products = [],
    suppliers = [],
    addPurchase,
    deletePurchase,
  } = useInventory();

  const [showModal, setShowModal] = useState(false);

  // -----------------------------------------
  // HELPERS
  // -----------------------------------------

  const formatCurrency = (value) => {
    const amount = Number(value ?? 0);

    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString();
  };

  const getSupplier = (id) => {
    return suppliers.find(
      (supplier) =>
        Number(supplier.id) === Number(id)
    );
  };

  // -----------------------------------------
  // STATISTICS
  // -----------------------------------------

  const totalPurchases = purchases.length;

  const totalPurchaseValue = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.total ?? 0),
    0
  );

  const totalItemsPurchased = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.items?.length ?? 0),
    0
  );

  // -----------------------------------------
  // SAVE
  // -----------------------------------------

  const handleSave = (purchase) => {
    addPurchase(purchase);

    setShowModal(false);
  };

  // -----------------------------------------
  // DELETE
  // -----------------------------------------

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      'Delete this purchase record? Stock will not be reversed automatically.'
    );

    if (confirmed) {
      deletePurchase(id);
    }
  };

  // -----------------------------------------
  // SORT PURCHASES
  // -----------------------------------------

  const sortedPurchases = [...purchases].reverse();

  return (
    <div>

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <div className="page-header">

        <div>

          <h2>Purchases</h2>

          <p>
            Manage purchases and receive stock.
          </p>

        </div>

        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>

          New Purchase
        </Button>

      </div>


      {/* =========================================
          STATISTICS
      ========================================== */}

      <Row className="g-3 mb-4">

        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <small className="text-muted">
                Total Purchases
              </small>

              <h4 className="mt-2 mb-0">
                {totalPurchases.toLocaleString()}
              </h4>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <small className="text-muted">
                Purchase Value
              </small>

              <h4 className="mt-2 mb-0">
                {formatCurrency(totalPurchaseValue)}
              </h4>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={4} md={12}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <small className="text-muted">
                Items Purchased
              </small>

              <h4 className="mt-2 mb-0">
                {totalItemsPurchased.toLocaleString()}
              </h4>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =========================================
          PURCHASE TABLE
      ========================================== */}

      <Card className="dashboard-card border-0">

        <Card.Body>

          <Table
            hover
            responsive
            className="align-middle"
          >

            <thead>

              <tr>

                <th>DATE</th>

                <th>INVOICE</th>

                <th>SUPPLIER</th>

                <th>ITEMS</th>

                <th>TOTAL</th>

                <th>STATUS</th>

                <th></th>

              </tr>

            </thead>


            <tbody>

              {sortedPurchases.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-5 text-muted"
                  >

                    <i
                      className="bi bi-bag fs-3 d-block mb-2"
                    ></i>

                    No purchases recorded.

                  </td>

                </tr>

              ) : (

                sortedPurchases.map((purchase) => {

                  const supplier =
                    getSupplier(
                      purchase.supplierId
                    );

                  const total =
                    Number(
                      purchase.total ?? 0
                    );

                  const itemsCount =
                    purchase.items?.length ?? 0;

                  const status =
                    purchase.status || 'Received';

                  return (

                    <tr key={purchase.id}>

                      {/* DATE */}

                      <td>
                        {formatDate(
                          purchase.date
                        )}
                      </td>


                      {/* INVOICE */}

                      <td>

                        <strong>
                          {purchase.invoice || '-'}
                        </strong>

                      </td>


                      {/* SUPPLIER */}

                      <td>

                        {supplier?.name || '-'}

                      </td>


                      {/* ITEMS */}

                      <td>

                        <Badge bg="light" text="dark">

                          {itemsCount}

                        </Badge>

                      </td>


                      {/* TOTAL */}

                      <td>

                        <strong>
                          {formatCurrency(total)}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <Badge
                          bg={
                            status === 'Received'
                              ? 'success'
                              : status === 'Pending'
                              ? 'warning'
                              : 'secondary'
                          }
                        >

                          {status}

                        </Badge>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              purchase.id
                            )
                          }
                        >

                          <i className="bi bi-trash"></i>

                        </Button>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </Table>

        </Card.Body>

      </Card>


      {/* =========================================
          PURCHASE MODAL
      ========================================== */}

      <PurchaseModal

        show={showModal}

        onHide={() =>
          setShowModal(false)
        }

        products={products}

        suppliers={suppliers}

        onSave={handleSave}

      />

    </div>
  );
};

export default Purchases;