import React, { useState } from 'react';

import {
  Modal,
  Form,
  Button,
} from 'react-bootstrap';

const AdjustmentModal = ({
  show,
  onHide,
  products,
  onSave,
}) => {

  const [form, setForm] = useState({
    productId: '',
    type: 'ADD',
    quantity: '',
    reason: '',
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !form.productId ||
      !form.quantity ||
      !form.reason
    ) {
      return;
    }

    onSave({
      ...form,
      productId: Number(form.productId),
      quantity: Number(form.quantity),
    });

    setForm({
      productId: '',
      type: 'ADD',
      quantity: '',
      reason: '',
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
    >

      <Form onSubmit={handleSubmit}>

        <Modal.Header closeButton>

          <Modal.Title>
            Stock Adjustment
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <Form.Group className="mb-3">

            <Form.Label>
              Product
            </Form.Label>

            <Form.Select
              name="productId"
              value={form.productId}
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
                  {product.name} — Stock: {product.stock}
                </option>

              ))}

            </Form.Select>

          </Form.Group>


          <Form.Group className="mb-3">

            <Form.Label>
              Adjustment Type
            </Form.Label>

            <Form.Select
              name="type"
              value={form.type}
              onChange={handleChange}
            >

              <option value="ADD">
                Add Stock
              </option>

              <option value="REMOVE">
                Remove Stock
              </option>

              <option value="SET">
                Set Stock
              </option>

            </Form.Select>

          </Form.Group>


          <Form.Group className="mb-3">

            <Form.Label>
              Quantity
            </Form.Label>

            <Form.Control
              type="number"
              min="0"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />

          </Form.Group>


          <Form.Group>

            <Form.Label>
              Reason
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g. Damaged stock, stock count correction..."
              required
            />

          </Form.Group>

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="light"
            onClick={onHide}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
          >
            Save Adjustment
          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default AdjustmentModal;