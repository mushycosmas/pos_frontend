import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Card,
  Table,
  Button,
  Badge,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap';

import SupplierModal
  from '../components/inventory/SupplierModal';

import suppliersApi
  from '../services/suppliersApi';

import { useInventory }
  from '../context/InventoryContext';


const Suppliers = () => {

  /*
  |--------------------------------------------------------------------------
  | Inventory Context
  |--------------------------------------------------------------------------
  */

  const {
    products = [],
  } = useInventory();


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [suppliers, setSuppliers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [showModal, setShowModal] =
    useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | Load Suppliers
  |--------------------------------------------------------------------------
  */

  const loadSuppliers = async () => {

    try {

      setLoading(true);

      setError('');

      const data =
        await suppliersApi.getAll();

      /*
       * DRF can return either:
       *
       * [...]
       *
       * OR:
       *
       * {
       *   count: 10,
       *   results: [...]
       * }
       */

      const supplierData =
        Array.isArray(data)
          ? data
          : data?.results || [];

      setSuppliers(
        supplierData
      );

    } catch (err) {

      console.error(
        'Failed to fetch suppliers:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Failed to load suppliers. Please try again.'
      );

    } finally {

      setLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Load on page start
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadSuppliers();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Product Count
  |--------------------------------------------------------------------------
  */

  const getProductCount = (supplierId) => {

    return products.filter(
      (product) => {

        const productSupplier =
          product.supplierId ??
          product.supplier_id ??
          product.supplier;

        return (
          Number(productSupplier) ===
          Number(supplierId)
        );

      }
    ).length;

  };


  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredSuppliers =
    useMemo(() => {

      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) => {

          const name =
            supplier.name?.toLowerCase() ||
            '';

          const phone =
            supplier.phone?.toLowerCase() ||
            '';

          const email =
            supplier.email?.toLowerCase() ||
            '';

          const address =
            supplier.address?.toLowerCase() ||
            '';

          return (
            name.includes(keyword) ||
            phone.includes(keyword) ||
            email.includes(keyword) ||
            address.includes(keyword)
          );

        }
      );

    }, [suppliers, search]);


  /*
  |--------------------------------------------------------------------------
  | Add Supplier
  |--------------------------------------------------------------------------
  */

  const handleAdd = () => {

    setEditingSupplier(null);

    setShowModal(true);

  };


  /*
  |--------------------------------------------------------------------------
  | Edit Supplier
  |--------------------------------------------------------------------------
  */

  const handleEdit = (supplier) => {

    setEditingSupplier(
      supplier
    );

    setShowModal(true);

  };


  /*
  |--------------------------------------------------------------------------
  | Save Supplier
  |--------------------------------------------------------------------------
  */

  const handleSave = async (data) => {

    try {

      setSaving(true);

      setError('');


      /*
       * Backend payload.
       *
       * Adjust these fields if your
       * Django Supplier model uses
       * different field names.
       */

      const payload = {

        name:
          data.name?.trim(),

        phone:
          data.phone?.trim() || '',

        email:
          data.email?.trim() || '',

        address:
          data.address?.trim() || '',

        is_active:
          data.is_active ??
          data.status === 'Active' ??
          true,

      };


      /*
       * UPDATE
       */

      if (editingSupplier) {

        await suppliersApi.update(
          editingSupplier.id,
          payload
        );

      }


      /*
       * CREATE
       */

      else {

        await suppliersApi.create(
          payload
        );

      }


      /*
       * Close modal
       */

      setShowModal(false);

      setEditingSupplier(null);


      /*
       * Reload data
       */

      await loadSuppliers();

    } catch (err) {

      console.error(
        'Failed to save supplier:',
        err
      );

      const backendError =
        err?.response?.data;


      if (
        backendError &&
        typeof backendError === 'object'
      ) {

        const firstError =
          Object.values(
            backendError
          )
            .flat()
            .join(' ');

        setError(
          firstError ||
          'Failed to save supplier.'
        );

      } else {

        setError(
          'Failed to save supplier. Please try again.'
        );

      }

    } finally {

      setSaving(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Delete Supplier
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {

    /*
     * Do not delete supplier if
     * products are still connected.
     */

    const used =
      products.some(
        (product) => {

          const productSupplier =
            product.supplierId ??
            product.supplier_id ??
            product.supplier;

          return (
            Number(productSupplier) ===
            Number(id)
          );

        }
      );


    if (used) {

      alert(
        'This supplier is assigned to products and cannot be deleted. Move the products to another supplier first.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        'Are you sure you want to delete this supplier?'
      );


    if (!confirmed) {
      return;
    }


    try {

      setError('');

      await suppliersApi.delete(id);

      await loadSuppliers();

    } catch (err) {

      console.error(
        'Failed to delete supplier:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Failed to delete supplier.'
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Toggle Supplier Status
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus =
    async (supplier) => {

      try {

        setError('');

        await suppliersApi.patch(
          supplier.id,
          {
            is_active:
              !supplier.is_active,
          }
        );

        await loadSuppliers();

      } catch (err) {

        console.error(
          'Failed to update supplier status:',
          err
        );

        setError(
          'Failed to update supplier status.'
        );

      }

    };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (

    <div>


      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="page-header">

        <div>

          <h2>
            Suppliers
          </h2>

          <p>
            Manage your product suppliers.
          </p>

        </div>


        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={saving}
        >

          <i className="bi bi-plus-lg me-2"></i>

          Add Supplier

        </Button>

      </div>


      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (

        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError('')
          }
        >

          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

        </Alert>

      )}


      {/* =========================================================
          SUMMARY CARDS
      ========================================================= */}

      <Row className="g-3 mb-4">


        {/* TOTAL */}

        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Total Suppliers
                  </small>

                  <h4 className="mt-2 mb-0">

                    {suppliers.length}

                  </h4>

                </div>


                <div className="stat-icon">

                  <i className="bi bi-truck"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* ACTIVE */}

        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Active Suppliers
                  </small>

                  <h4 className="mt-2 mb-0 text-success">

                    {
                      suppliers.filter(
                        (supplier) =>
                          supplier.is_active === true
                      ).length
                    }

                  </h4>

                </div>


                <div className="stat-icon">

                  <i className="bi bi-check-circle"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* PRODUCTS */}

        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Supplied Products
                  </small>

                  <h4 className="mt-2 mb-0">

                    {products.length}

                  </h4>

                </div>


                <div className="stat-icon">

                  <i className="bi bi-box-seam"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =========================================================
          SUPPLIERS TABLE
      ========================================================= */}

      <Card className="dashboard-card border-0">

        <Card.Body>


          {/* SEARCH */}

          <Row className="mb-3">

            <Col
              md={6}
              lg={5}
            >

              <InputGroup>

                <InputGroup.Text>

                  <i className="bi bi-search"></i>

                </InputGroup.Text>


                <Form.Control
                  placeholder="Search supplier..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </InputGroup>

            </Col>


            <Col
              md={6}
              lg={7}
              className="text-md-end mt-2 mt-md-0"
            >

              <Button
                variant="outline-secondary"
                onClick={loadSuppliers}
                disabled={loading}
              >

                <i className="bi bi-arrow-clockwise me-2"></i>

                Refresh

              </Button>

            </Col>

          </Row>


          {/* LOADING */}

          {loading ? (

            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <div className="text-muted mt-3">

                Loading suppliers...

              </div>

            </div>

          ) : (

            <Table
              hover
              responsive
              className="align-middle"
            >

              <thead>

                <tr>

                  <th>#</th>

                  <th>SUPPLIER</th>

                  <th>PHONE</th>

                  <th>EMAIL</th>

                  <th>ADDRESS</th>

                  <th>PRODUCTS</th>

                  <th>STATUS</th>

                  <th></th>

                </tr>

              </thead>


              <tbody>


                {filteredSuppliers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="text-center py-5 text-muted"
                    >

                      <i className="bi bi-truck fs-2 d-block mb-2"></i>

                      {search
                        ? 'No suppliers found.'
                        : 'No suppliers available.'}

                    </td>

                  </tr>

                ) : (

                  filteredSuppliers.map(
                    (supplier, index) => {

                      const productCount =
                        getProductCount(
                          supplier.id
                        );


                      const isActive =
                        supplier.is_active === true;


                      return (

                        <tr
                          key={
                            supplier.id
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>


                          {/* SUPPLIER */}

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <div className="stock-icon">

                                <i className="bi bi-truck"></i>

                              </div>


                              <div>

                                <strong>

                                  {supplier.name}

                                </strong>

                              </div>

                            </div>

                          </td>


                          {/* PHONE */}

                          <td>

                            {supplier.phone ||
                              '-'}

                          </td>


                          {/* EMAIL */}

                          <td>

                            {supplier.email ||
                              '-'}

                          </td>


                          {/* ADDRESS */}

                          <td>

                            {supplier.address ||
                              '-'}

                          </td>


                          {/* PRODUCTS */}

                          <td>

                            <Badge
                              bg="light"
                              text="dark"
                            >

                              {productCount}

                            </Badge>

                          </td>


                          {/* STATUS */}

                          <td>

                            <Badge
                              bg={
                                isActive
                                  ? 'success'
                                  : 'secondary'
                              }
                            >

                              {isActive
                                ? 'Active'
                                : 'Inactive'}

                            </Badge>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <Dropdown
                              align="end"
                            >

                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="border-0"
                              >

                                <i className="bi bi-three-dots-vertical"></i>

                              </Dropdown.Toggle>


                              <Dropdown.Menu>


                                {/* EDIT */}

                                <Dropdown.Item
                                  onClick={() =>
                                    handleEdit(
                                      supplier
                                    )
                                  }
                                >

                                  <i className="bi bi-pencil me-2"></i>

                                  Edit

                                </Dropdown.Item>


                                {/* STATUS */}

                                <Dropdown.Item
                                  onClick={() =>
                                    handleToggleStatus(
                                      supplier
                                    )
                                  }
                                >

                                  <i
                                    className={
                                      `bi ${
                                        isActive
                                          ? 'bi-toggle-off'
                                          : 'bi-toggle-on'
                                      } me-2`
                                    }
                                  ></i>

                                  {isActive
                                    ? 'Deactivate'
                                    : 'Activate'}

                                </Dropdown.Item>


                                <Dropdown.Divider />


                                {/* DELETE */}

                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() =>
                                    handleDelete(
                                      supplier.id
                                    )
                                  }
                                >

                                  <i className="bi bi-trash me-2"></i>

                                  Delete

                                </Dropdown.Item>

                              </Dropdown.Menu>

                            </Dropdown>

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </Table>

          )}

        </Card.Body>

      </Card>


      {/* =========================================================
          SUPPLIER MODAL
      ========================================================= */}

      <SupplierModal
        show={showModal}

        onHide={() => {

          setShowModal(false);

          setEditingSupplier(null);

        }}

        onSave={handleSave}

        supplier={editingSupplier}

        saving={saving}
      />

    </div>

  );

};


export default Suppliers;