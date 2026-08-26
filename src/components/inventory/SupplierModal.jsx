import React, { useEffect, useState } from 'react';

import {
  Modal,
  Form,
  Button,
  Row,
  Col,
} from 'react-bootstrap';

const SupplierModal = ({
  show,
  onHide,
  onSave,
  supplier,
}) => {

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
  });

  useEffect(() => {

    setForm(
      supplier || {
        name: '',
        phone: '',
        email: '',
        address: '',
        status: 'Active',
      }
    );

  }, [supplier, show]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onSave(form);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >

      <Form onSubmit={handleSubmit}>

        <Modal.Header closeButton>

          <Modal.Title>
            {supplier
              ? 'Edit Supplier'
              : 'Add Supplier'}
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <Row className="g-3">

            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Supplier Name
                </Form.Label>

                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

              </Form.Group>

            </Col>


            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Phone
                </Form.Label>

                <Form.Control
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />

              </Form.Group>

            </Col>


            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Email
                </Form.Label>

                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

              </Form.Group>

            </Col>


            <Col md={6}>

              <Form.Group>

                <Form.Label>
                  Status
                </Form.Label>

                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >

                  <option>
                    Active
                  </option>

                  <option>
                    Inactive
                  </option>

                </Form.Select>

              </Form.Group>

            </Col>


            <Col md={12}>

              <Form.Group>

                <Form.Label>
                  Address
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />

              </Form.Group>

            </Col>

          </Row>

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
            {supplier
              ? 'Update Supplier'
              : 'Save Supplier'}
          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default SupplierModal;