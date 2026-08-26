import React, { useMemo, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Modal,
} from 'react-bootstrap';

import { useInventory } from '../context/InventoryContext';

const StockAdjustments = () => {
  const {
    products,
    adjustStock,
    stockAdjustments = [],
    deleteStockAdjustment,
  } = useInventory();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    productId: '',
    type: 'ADD',
    quantity: '',
    reason: '',
    notes: '',
  });

  const selectedProduct = products.find(
    (product) =>
      Number(product.id) === Number(formData.productId)
  );

  const filteredAdjustments = useMemo(() => {
    const keyword = search.toLowerCase();

    return stockAdjustments.filter((item) => {
      const product = products.find(
        (product) =>
          Number(product.id) === Number(item.productId)
      );

      const matchesSearch =
        product?.name?.toLowerCase().includes(keyword) ||
        product?.sku?.toLowerCase().includes(keyword) ||
        item.reason?.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === 'ALL' ||
        item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [
    stockAdjustments,
    products,
    search,
    typeFilter,
  ]);

  const totalAdjustments = stockAdjustments.length;

  const additions = stockAdjustments.filter(
    (item) => item.type === 'ADD'
  ).length;

  const deductions = stockAdjustments.filter(
    (item) => item.type === 'REMOVE'
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'ADD',
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.productId) {
      alert('Please select a product.');
      return;
    }

    const quantity = Number(formData.quantity);

    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    if (!formData.reason.trim()) {
      alert('Please enter a reason.');
      return;
    }

    if (
      formData.type === 'REMOVE' &&
      selectedProduct &&
      quantity > Number(selectedProduct.stock)
    ) {
      alert('Cannot remove more stock than available.');
      return;
    }

    const adjustment = {
      productId: Number(formData.productId),
      type: formData.type,
      quantity,
      reason: formData.reason,
      notes: formData.notes,
      date: new Date().toISOString(),
    };

    /*
      Expected InventoryContext function:

      adjustStock(adjustment)

      This should:
      1. Find the product
      2. Increase/decrease stock
      3. Save adjustment history
    */

    adjustStock(adjustment);

    handleClose();
  };

  const getProduct = (productId) => {
    return products.find(
      (product) =>
        Number(product.id) === Number(productId)
    );
  };

  const getNewStock = (item) => {
    const product = getProduct(item.productId);

    if (!product) return '-';

    const currentStock = Number(product.stock);

    if (item.type === 'ADD') {
      return currentStock + Number(item.quantity);
    }

    return Math.max(
      0,
      currentStock - Number(item.quantity)
    );
  };

  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h2>Stock Adjustments</h2>

          <p>
            Add, remove, and correct product stock levels.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Adjustment
        </Button>

      </div>


      {/* STATISTICS */}

      <Row className="g-3 mb-4">

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">
            <Card.Body>

              <small className="text-muted">
                Total Adjustments
              </small>

              <h4 className="mt-2 mb-0">
                {totalAdjustments}
              </h4>

            </Card.Body>
          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">
            <Card.Body>

              <small className="text-muted">
                Stock Added
              </small>

              <h4 className="mt-2 mb-0 text-success">
                {additions}
              </h4>

            </Card.Body>
          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">
            <Card.Body>

              <small className="text-muted">
                Stock Removed
              </small>

              <h4 className="mt-2 mb-0 text-danger">
                {deductions}
              </h4>

            </Card.Body>
          </Card>

        </Col>


        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">
            <Card.Body>

              <small className="text-muted">
                Products
              </small>

              <h4 className="mt-2 mb-0">
                {products.length}
              </h4>

            </Card.Body>
          </Card>

        </Col>

      </Row>


      {/* TABLE */}

      <Card className="dashboard-card border-0">

        <Card.Body>

          <Row className="mb-3 g-2">

            <Col md={6}>

              <InputGroup>

                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search product, SKU or reason..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </InputGroup>

            </Col>


            <Col md={3}>

              <Form.Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Adjustments
                </option>

                <option value="ADD">
                  Stock Added
                </option>

                <option value="REMOVE">
                  Stock Removed
                </option>
              </Form.Select>

            </Col>

          </Row>


          <Table
            hover
            responsive
            className="align-middle"
          >

            <thead>

              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>TYPE</th>
                <th>QUANTITY</th>
                <th>REASON</th>
                <th>NEW STOCK</th>
                <th>DATE</th>
                <th></th>
              </tr>

            </thead>


            <tbody>

              {filteredAdjustments.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-5"
                  >

                    <i
                      className="bi bi-sliders"
                      style={{ fontSize: '32px' }}
                    ></i>

                    <div className="mt-2 text-muted">
                      No stock adjustments found.
                    </div>

                  </td>

                </tr>

              ) : (

                filteredAdjustments.map((item) => {

                  const product =
                    getProduct(item.productId);

                  return (

                    <tr key={item.id}>

                      <td>
                        <strong>
                          {product?.name || 'Unknown Product'}
                        </strong>
                      </td>

                      <td>
                        <code>
                          {product?.sku || '-'}
                        </code>
                      </td>

                      <td>

                        <Badge
                          bg={
                            item.type === 'ADD'
                              ? 'success'
                              : 'danger'
                          }
                        >

                          {item.type === 'ADD'
                            ? 'Stock Added'
                            : 'Stock Removed'}

                        </Badge>

                      </td>

                      <td>

                        <strong>
                          {item.type === 'ADD'
                            ? '+'
                            : '-'}
                          {Number(
                            item.quantity
                          ).toLocaleString()}
                        </strong>

                      </td>

                      <td>
                        {item.reason}
                      </td>

                      <td>
                        {getNewStock(item)}
                      </td>

                      <td>
                        {item.date
                          ? new Date(
                              item.date
                            ).toLocaleDateString()
                          : '-'}
                      </td>

                      <td>

                        <Dropdown align="end">

                          <Dropdown.Toggle
                            variant="light"
                            size="sm"
                            className="border-0"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>

                            <Dropdown.Item
                              onClick={() => {

                                if (
                                  window.confirm(
                                    'Delete this stock adjustment?'
                                  )
                                ) {
                                  deleteStockAdjustment(
                                    item.id
                                  );
                                }

                              }}
                            >

                              <i className="bi bi-trash me-2"></i>

                              Delete

                            </Dropdown.Item>

                          </Dropdown.Menu>

                        </Dropdown>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </Table>

        </Card.Body>

      </Card>


      {/* NEW ADJUSTMENT MODAL */}

      <Modal
        show={showModal}
        onHide={handleClose}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            <i className="bi bi-sliders me-2"></i>
            Stock Adjustment
          </Modal.Title>

        </Modal.Header>


        <Form onSubmit={handleSubmit}>

          <Modal.Body>

            <Form.Group className="mb-3">

              <Form.Label>
                Product
              </Form.Label>

              <Form.Select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select product
                </option>

                {products.map((product) => (

                  <option
                    key={product.id}
                    value={product.id}
                  >

                    {product.name} — Stock:{' '}
                    {product.stock}

                  </option>

                ))}

              </Form.Select>

            </Form.Group>


            {selectedProduct && (

              <div className="bg-light rounded p-3 mb-3">

                <div className="d-flex justify-content-between">

                  <span>
                    Current Stock
                  </span>

                  <strong>
                    {selectedProduct.stock}
                  </strong>

                </div>

                <div className="d-flex justify-content-between mt-2">

                  <span>
                    SKU
                  </span>

                  <strong>
                    {selectedProduct.sku}
                  </strong>

                </div>

              </div>

            )}


            <Form.Group className="mb-3">

              <Form.Label>
                Adjustment Type
              </Form.Label>

              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >

                <option value="ADD">
                  + Add Stock
                </option>

                <option value="REMOVE">
                  − Remove Stock
                </option>

              </Form.Select>

            </Form.Group>


            <Form.Group className="mb-3">

              <Form.Label>
                Quantity
              </Form.Label>

              <Form.Control
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
              />

            </Form.Group>


            <Form.Group className="mb-3">

              <Form.Label>
                Reason
              </Form.Label>

              <Form.Select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select reason
                </option>

                {formData.type === 'ADD' ? (
                  <>
                    <option value="Purchase">
                      Purchase
                    </option>

                    <option value="Stock Count Correction">
                      Stock Count Correction
                    </option>

                    <option value="Customer Return">
                      Customer Return
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Damaged">
                      Damaged
                    </option>

                    <option value="Expired">
                      Expired
                    </option>

                    <option value="Stock Count Correction">
                      Stock Count Correction
                    </option>

                    <option value="Internal Use">
                      Internal Use
                    </option>

                    <option value="Lost">
                      Lost
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </>
                )}

              </Form.Select>

            </Form.Group>


            <Form.Group>

              <Form.Label>
                Notes
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
              />

            </Form.Group>

          </Modal.Body>


          <Modal.Footer>

            <Button
              variant="light"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              variant={
                formData.type === 'ADD'
                  ? 'success'
                  : 'danger'
              }
              type="submit"
            >

              <i className="bi bi-check-lg me-2"></i>

              Save Adjustment

            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </div>
  );
};

export default StockAdjustments;