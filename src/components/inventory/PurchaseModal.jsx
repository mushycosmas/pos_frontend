import React, { useState } from 'react';

import {
  Modal,
  Form,
  Button,
  Table,
} from 'react-bootstrap';

const PurchaseModal = ({
  show,
  onHide,
  products,
  suppliers,
  onSave,
}) => {

  const [supplierId, setSupplierId] =
    useState('');

  const [invoice, setInvoice] =
    useState('');

  const [items, setItems] =
    useState([]);

  const [productId, setProductId] =
    useState('');

  const [quantity, setQuantity] =
    useState(1);

  const addItem = () => {

    if (!productId || quantity <= 0) {
      return;
    }

    const product = products.find(
      (item) =>
        Number(item.id) === Number(productId)
    );

    if (!product) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        quantity: Number(quantity),
        cost: Number(product.costPrice),
      },
    ]);

    setProductId('');
    setQuantity(1);
  };

  const removeItem = (index) => {

    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const total = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
      item.cost,
    0
  );

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!supplierId || items.length === 0) {
      return;
    }

    onSave({
      supplierId: Number(supplierId),
      invoice,
      items,
      total,
      status: 'Received',
    });

    setSupplierId('');
    setInvoice('');
    setItems([]);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
    >

      <Form onSubmit={handleSubmit}>

        <Modal.Header closeButton>

          <Modal.Title>
            New Purchase
          </Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <div className="mb-4">

            <div className="row g-3">

              <div className="col-md-6">

                <Form.Label>
                  Supplier
                </Form.Label>

                <Form.Select
                  value={supplierId}
                  onChange={(e) =>
                    setSupplierId(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select supplier
                  </option>

                  {suppliers.map((supplier) => (

                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>

                  ))}

                </Form.Select>

              </div>


              <div className="col-md-6">

                <Form.Label>
                  Invoice Number
                </Form.Label>

                <Form.Control
                  value={invoice}
                  onChange={(e) =>
                    setInvoice(e.target.value)
                  }
                  placeholder="INV-001"
                />

              </div>

            </div>

          </div>


          <div className="row g-2 mb-3">

            <div className="col-md-6">

              <Form.Select
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
              >

                <option value="">
                  Select product
                </option>

                {products.map((product) => (

                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>

                ))}

              </Form.Select>

            </div>


            <div className="col-md-3">

              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
              />

            </div>


            <div className="col-md-3">

              <Button
                type="button"
                variant="success"
                className="w-100"
                onClick={addItem}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Item
              </Button>

            </div>

          </div>


          <Table
            bordered
            hover
            responsive
          >

            <thead>

              <tr>
                <th>PRODUCT</th>
                <th>QUANTITY</th>
                <th>COST</th>
                <th>TOTAL</th>
                <th></th>
              </tr>

            </thead>

            <tbody>

              {items.map((item, index) => (

                <tr key={index}>

                  <td>
                    {item.name}
                  </td>

                  <td>
                    {item.quantity}
                  </td>

                  <td>
                    TSh {item.cost.toLocaleString()}
                  </td>

                  <td>
                    TSh {(
                      item.quantity *
                      item.cost
                    ).toLocaleString()}
                  </td>

                  <td>

                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      onClick={() =>
                        removeItem(index)
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </Button>

                  </td>

                </tr>

              ))}

            </tbody>

          </Table>


          <div className="text-end mt-3">

            <strong>
              Total: TSh {total.toLocaleString()}
            </strong>

          </div>

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
            disabled={items.length === 0}
          >
            Receive Purchase
          </Button>

        </Modal.Footer>

      </Form>

    </Modal>
  );
};

export default PurchaseModal;