import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Button,
} from 'react-bootstrap';

const CategoryModal = ({
  show,
  onHide,
  onSave,
  category,
}) => {

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Active',
  });

  useEffect(() => {

    if (category) {
      setForm(category);
    } else {
      setForm({
        name: '',
        description: '',
        status: 'Active',
      });
    }

  }, [category, show]);

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
      centered
    >

      <Form onSubmit={handleSubmit}>

        <Modal.Header closeButton>
          <Modal.Title>
            {category
              ? 'Edit Category'
              : 'Add Category'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form.Group className="mb-3">

            <Form.Label>
              Category Name
            </Form.Label>

            <Form.Control
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Accessories"
              required
            />

          </Form.Group>


          <Form.Group className="mb-3">

            <Form.Label>
              Description
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

          </Form.Group>


          <Form.Group>

            <Form.Label>
              Status
            </Form.Label>

            <Form.Select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </Form.Select>

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
            {category
              ? 'Update Category'
              : 'Save Category'}
          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default CategoryModal;