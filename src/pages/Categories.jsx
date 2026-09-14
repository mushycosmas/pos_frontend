
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
} from "react-bootstrap";

import CategoryModal
  from "../components/inventory/CategoryModal";

import categoriesApi
  from "../services/categoriesApi";

import { useInventory }
  from "../context/InventoryContext";

import { useAuth }
  from "../context/AuthContext";


// =========================================================
// HELPERS
// =========================================================

const getRoleName = (user) => {

  if (!user) {
    return "";
  }

  const role = user.role;

  // role = "cashier"
  if (typeof role === "string") {

    return role
      .trim()
      .toLowerCase();

  }

  // role = { name: "Cashier" }
  if (
    role &&
    typeof role === "object"
  ) {

    return String(
      role.name ??
      role.code ??
      ""
    )
      .trim()
      .toLowerCase();

  }

  // Other possible user formats
  return String(
    user.role_name ??
    user.roleName ??
    ""
  )
    .trim()
    .toLowerCase();
};


// =========================================================
// CATEGORY HELPERS
// =========================================================

const getCategoryName = (category) => {

  return (
    category?.name ??
    category?.category_name ??
    category?.categoryName ??
    "-"
  );
};


const getCategoryDescription = (category) => {

  return (
    category?.description ??
    "-"
  );
};


const getCategoryStatus = (category) => {

  if (
    category?.is_active === true ||
    category?.is_active === 1
  ) {
    return "Active";
  }

  if (
    category?.is_active === false ||
    category?.is_active === 0
  ) {
    return "Inactive";
  }

  if (
    String(
      category?.status ?? ""
    ).toLowerCase() === "active"
  ) {
    return "Active";
  }

  return "Inactive";
};


const getParentCategory = (category) => {

  return (
    category?.parent_name ??
    category?.parent?.name ??
    "-"
  );
};


// =========================================================
// COMPONENT
// =========================================================

const Categories = () => {

  // =======================================================
  // AUTH
  // =======================================================

  const { user } = useAuth();

  const roleName =
    getRoleName(user);

  const isCashier =
    roleName === "cashier";


  // =======================================================
  // INVENTORY CONTEXT
  // =======================================================

  const {
    products = [],
  } = useInventory();


  // =======================================================
  // STATE
  // =======================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState(null);


  // =======================================================
  // LOAD CATEGORIES
  // =======================================================

  const loadCategories = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await categoriesApi.getAll();


      // ===================================================
      // DRF PAGINATION
      // ===================================================

      const categoryData =
        Array.isArray(data)
          ? data
          : data?.results || [];


      setCategories(
        categoryData
      );

    } catch (err) {

      console.error(
        "Failed to fetch categories:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load categories. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // LOAD ON PAGE START
  // =======================================================

  useEffect(() => {

    loadCategories();

  }, []);


  // =======================================================
  // PRODUCT COUNT
  // =======================================================

  const getProductCount = (
    categoryId
  ) => {

    return products.filter(
      (product) => {

        const productCategory =
          product?.categoryId ??
          product?.category_id ??
          product?.category?.id ??
          product?.category;

        return (
          Number(productCategory) ===
          Number(categoryId)
        );

      }
    ).length;

  };


  // =======================================================
  // SEARCH
  // =======================================================

  const filteredCategories =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {

        return categories;

      }


      return categories.filter(
        (category) => {

          const name =
            String(
              getCategoryName(
                category
              )
            ).toLowerCase();

          const description =
            String(
              getCategoryDescription(
                category
              )
            ).toLowerCase();

          const parent =
            String(
              getParentCategory(
                category
              )
            ).toLowerCase();


          return (
            name.includes(keyword) ||
            description.includes(keyword) ||
            parent.includes(keyword)
          );

        }
      );

    }, [
      categories,
      search,
    ]);


  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics =
    useMemo(() => {

      const total =
        categories.length;


      const active =
        categories.filter(
          (category) =>
            getCategoryStatus(
              category
            ) === "Active"
        ).length;


      const inactive =
        categories.filter(
          (category) =>
            getCategoryStatus(
              category
            ) === "Inactive"
        ).length;


      const categoriesInUse =
        categories.filter(
          (category) =>
            getProductCount(
              category.id
            ) > 0
        ).length;


      return {
        total,
        active,
        inactive,
        categoriesInUse,
      };

    }, [
      categories,
      products,
    ]);


  // =======================================================
  // ADD CATEGORY
  // =======================================================

  const handleAdd = () => {

    // Cashier cannot add
    if (isCashier) {
      return;
    }

    setEditingCategory(null);

    setShowModal(true);

  };


  // =======================================================
  // EDIT CATEGORY
  // =======================================================

  const handleEdit = (
    category
  ) => {

    // Cashier cannot edit
    if (isCashier) {
      return;
    }

    setEditingCategory(
      category
    );

    setShowModal(true);

  };


  // =======================================================
  // CLOSE MODAL
  // =======================================================

  const handleCloseModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingCategory(null);

  };


  // =======================================================
  // SAVE CATEGORY
  // =======================================================

  const handleSave = async (
    data
  ) => {

    // Cashier cannot create/update
    if (isCashier) {
      return;
    }


    try {

      setSaving(true);

      setError("");


      // ===================================================
      // PAYLOAD
      // ===================================================

      const payload = {

        name:
          data?.name?.trim() || "",

        description:
          data?.description?.trim() || "",

        parent:
          data?.parent || null,

        is_active:
          data?.is_active ??
          (
            String(
              data?.status ?? ""
            ).toLowerCase() ===
            "active"
          ),

      };


      // ===================================================
      // UPDATE
      // ===================================================

      if (editingCategory) {

        await categoriesApi.update(
          editingCategory.id,
          payload
        );

      }


      // ===================================================
      // CREATE
      // ===================================================

      else {

        await categoriesApi.create(
          payload
        );

      }


      // ===================================================
      // CLOSE
      // ===================================================

      setShowModal(false);

      setEditingCategory(null);


      // ===================================================
      // RELOAD
      // ===================================================

      await loadCategories();

    } catch (err) {

      console.error(
        "Failed to save category:",
        err
      );

      const backendError =
        err?.response?.data;


      if (
        backendError &&
        typeof backendError === "object"
      ) {

        const firstError =
          Object.values(
            backendError
          )
            .flat()
            .join(" ");


        setError(
          firstError ||
          "Failed to save category."
        );

      } else {

        setError(
          err?.message ||
          "Failed to save category. Please try again."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // =======================================================
  // DELETE CATEGORY
  // =======================================================

  const handleDelete = async (
    id
  ) => {

    // Cashier cannot delete
    if (isCashier) {
      return;
    }


    // ===================================================
    // CHECK PRODUCTS
    // ===================================================

    const hasProducts =
      products.some(
        (product) => {

          const productCategory =
            product?.categoryId ??
            product?.category_id ??
            product?.category?.id ??
            product?.category;


          return (
            Number(productCategory) ===
            Number(id)
          );

        }
      );


    if (hasProducts) {

      alert(
        "This category contains products. Move the products to another category before deleting it."
      );

      return;

    }


    // ===================================================
    // CONFIRM
    // ===================================================

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this category?"
      );


    if (!confirmed) {
      return;
    }


    // ===================================================
    // DELETE
    // ===================================================

    try {

      setError("");

      await categoriesApi.delete(
        id
      );

      await loadCategories();

    } catch (err) {

      console.error(
        "Failed to delete category:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete category."
      );

    }

  };


  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus =
    async (
      category
    ) => {

      // Cashier cannot activate/deactivate
      if (isCashier) {
        return;
      }


      try {

        setError("");


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
          "Failed to update category status:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to update category status."
        );

      }

    };


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div>

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="page-header">

        <div>

          <h2>
            Categories
          </h2>

          <p>
            Organize your products into categories.
          </p>


          {isCashier && (

            <small className="text-muted">

              <i className="bi bi-eye me-1"></i>

              You have view-only access to categories.

            </small>

          )}

        </div>


        {/* =================================================
            ADD BUTTON
        ================================================= */}

        {!isCashier && (

          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={saving}
          >

            <i className="bi bi-plus-lg me-2"></i>

            Add Category

          </Button>

        )}

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            setError("")
          }
        >

          <i className="bi bi-exclamation-triangle me-2"></i>

          {error}

        </Alert>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <Row className="g-3 mb-4">

        {/* TOTAL */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Total Categories
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.total}
                  </h4>

                </div>

                <div className="stat-icon">

                  <i className="bi bi-grid"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* ACTIVE */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Active Categories
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.active}
                  </h4>

                </div>

                <div className="stat-icon">

                  <i className="bi bi-check-circle"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* INACTIVE */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Inactive Categories
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.inactive}
                  </h4>

                </div>

                <div className="stat-icon">

                  <i className="bi bi-x-circle"></i>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* IN USE */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Categories in Use
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.categoriesInUse}
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


      {/* ===================================================
          MAIN CARD
      =================================================== */}

      <Card className="border-0 shadow-sm">

        <Card.Body>


          {/* =================================================
              SEARCH
          ================================================= */}

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
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </InputGroup>

            </Col>

          </Row>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <div className="mt-2 text-muted">

                Loading categories...

              </div>

            </div>

          ) : filteredCategories.length === 0 ? (

            /* ===============================================
               EMPTY
            =============================================== */

            <div className="text-center py-5">

              <i
                className="bi bi-grid fs-1 text-muted"
              ></i>


              <h5 className="mt-3">

                No categories found

              </h5>


              <p className="text-muted">

                {search
                  ? "No categories match your search."
                  : "No categories have been added yet."
                }

              </p>


              {!isCashier && !search && (

                <Button
                  variant="primary"
                  onClick={handleAdd}
                >

                  <i className="bi bi-plus-lg me-2"></i>

                  Add Category

                </Button>

              )}

            </div>

          ) : (

            /* ===============================================
               TABLE
            =============================================== */

            <div className="table-responsive">

              <Table
                hover
                responsive
                className="align-middle mb-0"
              >

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Parent
                    </th>

                    <th className="text-center">
                      Products
                    </th>

                    <th className="text-center">
                      Status
                    </th>


                    {/* ACTIONS ONLY FOR NON-CASHIER */}

                    {!isCashier && (

                      <th className="text-end">
                        Actions
                      </th>

                    )}

                  </tr>

                </thead>


                <tbody>

                  {filteredCategories.map(
                    (
                      category,
                      index
                    ) => (

                      <tr
                        key={
                          category.id ??
                          index
                        }
                      >

                        {/* NUMBER */}

                        <td>
                          {index + 1}
                        </td>


                        {/* CATEGORY */}

                        <td>

                          <div className="fw-semibold">

                            {getCategoryName(
                              category
                            )}

                          </div>

                        </td>


                        {/* DESCRIPTION */}

                        <td>

                          <span className="text-muted">

                            {getCategoryDescription(
                              category
                            )}

                          </span>

                        </td>


                        {/* PARENT */}

                        <td>

                          {getParentCategory(
                            category
                          )}

                        </td>


                        {/* PRODUCTS */}

                        <td className="text-center">

                          <Badge bg="secondary">

                            {getProductCount(
                              category.id
                            )}

                          </Badge>

                        </td>


                        {/* STATUS */}

                        <td className="text-center">

                          {getCategoryStatus(
                            category
                          ) === "Active" ? (

                            <Badge bg="success">

                              Active

                            </Badge>

                          ) : (

                            <Badge bg="secondary">

                              Inactive

                            </Badge>

                          )}

                        </td>


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        {!isCashier && (

                          <td className="text-end">

                            <Dropdown align="end">

                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                id={`category-actions-${category.id}`}
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


                                {/* ACTIVATE / DEACTIVATE */}

                                <Dropdown.Item
                                  onClick={() =>
                                    handleToggleStatus(
                                      category
                                    )
                                  }
                                >

                                  {getCategoryStatus(
                                    category
                                  ) === "Active" ? (

                                    <>

                                      <i className="bi bi-toggle-off me-2"></i>

                                      Deactivate

                                    </>

                                  ) : (

                                    <>

                                      <i className="bi bi-toggle-on me-2"></i>

                                      Activate

                                    </>

                                  )}

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

                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </Table>

            </div>

          )}

        </Card.Body>

      </Card>


      {/* ===================================================
          CATEGORY MODAL
      =================================================== */}

      {!isCashier && (

        <CategoryModal
          show={showModal}
          onHide={handleCloseModal}
          category={editingCategory}
          onSave={handleSave}
          saving={saving}
        />

      )}

    </div>

  );

};


export default Categories;

