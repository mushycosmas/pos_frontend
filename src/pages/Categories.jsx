import React, { useEffect, useMemo, useState } from 'react';

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

import CategoryModal from '../components/inventory/CategoryModal';

import categoriesApi from '../services/categoriesApi';

import { useInventory } from '../context/InventoryContext';


const Categories = () => {

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

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | Load Categories
  |--------------------------------------------------------------------------
  */

  const loadCategories = async () => {

    try {

      setLoading(true);

      setError('');

      const data =
        await categoriesApi.getAll();

      /*
       * DRF pagination returns:
       *
       * {
       *   count: 10,
       *   next: null,
       *   previous: null,
       *   results: [...]
       * }
       *
       * If pagination is disabled,
       * it returns an array directly.
       */

      const categoryData =
        Array.isArray(data)
          ? data
          : data?.results || [];

      setCategories(categoryData);

    } catch (err) {

      console.error(
        'Failed to fetch categories:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Failed to load categories. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | Load On Page Start
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadCategories();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Product Count
  |--------------------------------------------------------------------------
  */

  const getProductCount = (categoryId) => {

    return products.filter(
      (product) =>
        Number(
          product.categoryId ??
          product.category_id ??
          product.category
        ) === Number(categoryId)
    ).length;

  };


  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredCategories = useMemo(() => {

    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) => {

      const name =
        category.name?.toLowerCase() || '';

      const description =
        category.description?.toLowerCase() || '';

      return (
        name.includes(keyword) ||
        description.includes(keyword)
      );

    });

  }, [categories, search]);


  /*
  |--------------------------------------------------------------------------
  | Open Add Modal
  |--------------------------------------------------------------------------
  */

  const handleAdd = () => {

    setEditingCategory(null);

    setShowModal(true);

  };


  /*
  |--------------------------------------------------------------------------
  | Open Edit Modal
  |--------------------------------------------------------------------------
  */

  const handleEdit = (category) => {

    setEditingCategory(category);

    setShowModal(true);

  };


  /*
  |--------------------------------------------------------------------------
  | Save Category
  |--------------------------------------------------------------------------
  */

  const handleSave = async (data) => {

    try {

      setSaving(true);

      setError('');

      /*
       * Convert frontend fields to Django fields.
       */

      const payload = {

        name:
          data.name?.trim(),

        description:
          data.description?.trim() || '',

        parent:
          data.parent || null,

        is_active:
          data.is_active ??
          data.status === 'Active' ??
          true,

      };


      /*
       * UPDATE
       */

      if (editingCategory) {

        await categoriesApi.update(
          editingCategory.id,
          payload
        );

      }

      /*
       * CREATE
       */

      else {

        await categoriesApi.create(
          payload
        );

      }


      /*
       * Close modal
       */

      setShowModal(false);

      setEditingCategory(null);


      /*
       * Reload latest data
       */

      await loadCategories();

    } catch (err) {

      console.error(
        'Failed to save category:',
        err
      );

      const backendError =
        err?.response?.data;

      if (
        backendError &&
        typeof backendError === 'object'
      ) {

        const firstError =
          Object.values(backendError)
            .flat()
            .join(' ');

        setError(
          firstError ||
          'Failed to save category.'
        );

      } else {

        setError(
          'Failed to save category. Please try again.'
        );

      }

    } finally {

      setSaving(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Delete Category
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {

    /*
     * Prevent deletion when products
     * are still using this category.
     */

    const hasProducts =
      products.some((product) => {

        const productCategory =
          product.categoryId ??
          product.category_id ??
          product.category;

        return (
          Number(productCategory) ===
          Number(id)
        );

      });


    if (hasProducts) {

      alert(
        'This category contains products. Move the products to another category before deleting it.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        'Are you sure you want to delete this category?'
      );


    if (!confirmed) {
      return;
    }


    try {

      setError('');

      await categoriesApi.delete(id);

      await loadCategories();

    } catch (err) {

      console.error(
        'Failed to delete category:',
        err
      );

      setError(
        err?.response?.data?.detail ||
        'Failed to delete category.'
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Toggle Active Status
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (category) => {

    try {

      setError('');

      await categoriesApi.patch(
        category.id,
        {
          is_active:
            !category.is_active,
        }
      );

      await loadCategories();

    } catch (err) {

      console.error(
        'Failed to update category status:',
        err
      );

      setError(
        'Failed to update category status.'
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
            Categories
          </h2>

          <p>
            Organize your products into categories.
          </p>

        </div>


        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={saving}
        >

          <i className="bi bi-plus-lg me-2"></i>

          Add Category

        </Button>

      </div>


      {/* =========================================================
          ERROR MESSAGE
      ========================================================= */}

      {error && (

        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
        >

          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

        </Alert>

      )}


      {/* =========================================================
          SUMMARY
      ========================================================= */}

      <Row className="g-3 mb-4">

        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Total Categories
                  </small>

                  <h4 className="mt-2 mb-0">
                    {categories.length}
                  </h4>

                </div>

                <div className="stat-icon">

                  <i className="bi bi-tags"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Active Categories
                  </small>

                  <h4 className="mt-2 mb-0 text-success">

                    {
                      categories.filter(
                        (category) =>
                          category.is_active === true
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


        <Col xl={4} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Products Categorized
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
          CATEGORY TABLE
      ========================================================= */}

      <Card className="dashboard-card border-0">

        <Card.Body>


          {/* =====================================================
              SEARCH
          ===================================================== */}

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
                  placeholder="Search category..."
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
                onClick={loadCategories}
                disabled={loading}
              >

                <i className="bi bi-arrow-clockwise me-2"></i>

                Refresh

              </Button>

            </Col>

          </Row>


          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading ? (

            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <div className="text-muted mt-3">

                Loading categories...

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

                  <th>CATEGORY</th>

                  <th>DESCRIPTION</th>

                  <th>PRODUCTS</th>

                  <th>STATUS</th>

                  <th></th>

                </tr>

              </thead>


              <tbody>


                {filteredCategories.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >

                      <i className="bi bi-tags fs-2 d-block mb-2"></i>

                      {search
                        ? 'No categories found.'
                        : 'No categories available.'}

                    </td>

                  </tr>

                ) : (

                  filteredCategories.map(
                    (category, index) => {

                      const productCount =
                        getProductCount(
                          category.id
                        );


                      const isActive =
                        category.is_active === true;


                      return (

                        <tr
                          key={
                            category.id
                          }
                        >

                          {/* NUMBER */}

                          <td>

                            {index + 1}

                          </td>


                          {/* CATEGORY */}

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <div
                                className="stock-icon"
                              >

                                <i className="bi bi-tag"></i>

                              </div>

                              <div>

                                <strong>
                                  {category.name}
                                </strong>

                                {category.parent_name && (

                                  <small className="text-muted d-block">

                                    Parent:
                                    {' '}
                                    {category.parent_name}

                                  </small>

                                )}

                              </div>

                            </div>

                          </td>


                          {/* DESCRIPTION */}

                          <td>

                            <span className="text-muted">

                              {category.description ||
                                '-'}

                            </span>

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
                                      category
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
                                      category
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
                                      category.id
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
          CATEGORY MODAL
      ========================================================= */}

      <CategoryModal
        show={showModal}

        onHide={() => {

          setShowModal(false);

          setEditingCategory(null);

        }}

        onSave={handleSave}

        category={editingCategory}

        saving={saving}
      />

    </div>

  );

};


export default Categories;