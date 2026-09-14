
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

import SupplierModal from "../components/inventory/SupplierModal";
import suppliersApi from "../services/suppliersApi";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";


// =========================================================
// HELPERS
// =========================================================

const getRoleName = (user) => {
  if (!user) {
    return "";
  }

  const role = user.role;

  if (typeof role === "string") {
    return role.trim().toLowerCase();
  }

  if (role && typeof role === "object") {
    return String(
      role.name ??
      role.code ??
      ""
    )
      .trim()
      .toLowerCase();
  }

  return String(
    user.role_name ??
    user.roleName ??
    ""
  )
    .trim()
    .toLowerCase();
};


const getSupplierName = (supplier) => {
  return (
    supplier?.name ??
    supplier?.supplier_name ??
    supplier?.supplierName ??
    "-"
  );
};


const getSupplierPhone = (supplier) => {
  return (
    supplier?.phone ??
    supplier?.mobile ??
    supplier?.contact_phone ??
    "-"
  );
};


const getSupplierEmail = (supplier) => {
  return (
    supplier?.email ??
    "-"
  );
};


const getSupplierAddress = (supplier) => {
  return (
    supplier?.address ??
    "-"
  );
};


const getSupplierStatus = (supplier) => {
  if (
    supplier?.is_active === true ||
    supplier?.is_active === 1
  ) {
    return "Active";
  }

  if (
    supplier?.is_active === false ||
    supplier?.is_active === 0
  ) {
    return "Inactive";
  }

  if (
    String(
      supplier?.status ?? ""
    ).toLowerCase() === "active"
  ) {
    return "Active";
  }

  return "Inactive";
};


// =========================================================
// COMPONENT
// =========================================================

const Suppliers = () => {

  // =======================================================
  // AUTH
  // =======================================================

  const { user } = useAuth();

  const roleName = getRoleName(user);

  const isCashier =
    roleName === "cashier";


  // =======================================================
  // INVENTORY
  // =======================================================

  const {
    products = [],
  } = useInventory();


  // =======================================================
  // STATE
  // =======================================================

  const [suppliers, setSuppliers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingSupplier, setEditingSupplier] =
    useState(null);


  // =======================================================
  // LOAD SUPPLIERS
  // =======================================================

  const loadSuppliers = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await suppliersApi.getAll();

      const supplierData =
        Array.isArray(data)
          ? data
          : data?.results || [];

      setSuppliers(
        supplierData
      );

    } catch (err) {

      console.error(
        "Failed to fetch suppliers:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load suppliers. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // LOAD ON PAGE START
  // =======================================================

  useEffect(() => {

    loadSuppliers();

  }, []);


  // =======================================================
  // PRODUCT COUNT
  // =======================================================

  const getProductCount = (supplierId) => {

    return products.filter(
      (product) => {

        const productSupplier =
          product?.supplierId ??
          product?.supplier_id ??
          product?.supplier?.id ??
          product?.supplier;

        return (
          Number(productSupplier) ===
          Number(supplierId)
        );
      }
    ).length;
  };


  // =======================================================
  // FILTER SUPPLIERS
  // =======================================================

  const filteredSuppliers =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) => {

          const name =
            String(
              getSupplierName(
                supplier
              )
            ).toLowerCase();

          const phone =
            String(
              getSupplierPhone(
                supplier
              )
            ).toLowerCase();

          const email =
            String(
              getSupplierEmail(
                supplier
              )
            ).toLowerCase();

          const address =
            String(
              getSupplierAddress(
                supplier
              )
            ).toLowerCase();

          return (
            name.includes(keyword) ||
            phone.includes(keyword) ||
            email.includes(keyword) ||
            address.includes(keyword)
          );
        }
      );

    }, [
      suppliers,
      search,
    ]);


  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics =
    useMemo(() => {

      const total =
        suppliers.length;

      const active =
        suppliers.filter(
          (supplier) =>
            getSupplierStatus(
              supplier
            ) === "Active"
        ).length;

      const inactive =
        suppliers.filter(
          (supplier) =>
            getSupplierStatus(
              supplier
            ) === "Inactive"
        ).length;

      const suppliersWithProducts =
        suppliers.filter(
          (supplier) =>
            getProductCount(
              supplier.id
            ) > 0
        ).length;

      return {
        total,
        active,
        inactive,
        suppliersWithProducts,
      };

    }, [suppliers, products]);


  // =======================================================
  // ADD SUPPLIER
  // =======================================================

  const handleAdd = () => {

    // Cashier cannot add
    if (isCashier) {
      return;
    }

    setEditingSupplier(null);

    setShowModal(true);
  };


  // =======================================================
  // EDIT SUPPLIER
  // =======================================================

  const handleEdit = (supplier) => {

    // Cashier cannot edit
    if (isCashier) {
      return;
    }

    setEditingSupplier(
      supplier
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

    setEditingSupplier(null);
  };


  // =======================================================
  // SAVE SUPPLIER
  // =======================================================

  const handleSave = async (data) => {

    // Cashier cannot save
    if (isCashier) {
      return;
    }

    try {

      setSaving(true);

      setError("");

      const payload = {

        name:
          data?.name?.trim() || "",

        phone:
          data?.phone?.trim() || "",

        email:
          data?.email?.trim() || "",

        address:
          data?.address?.trim() || "",

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

      if (editingSupplier) {

        await suppliersApi.update(
          editingSupplier.id,
          payload
        );

      }

      // ===================================================
      // CREATE
      // ===================================================

      else {

        await suppliersApi.create(
          payload
        );
      }


      // ===================================================
      // CLOSE
      // ===================================================

      setShowModal(false);

      setEditingSupplier(null);


      // ===================================================
      // RELOAD
      // ===================================================

      await loadSuppliers();

    } catch (err) {

      console.error(
        "Failed to save supplier:",
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
          "Failed to save supplier."
        );

      } else {

        setError(
          err?.message ||
          "Failed to save supplier. Please try again."
        );
      }

    } finally {

      setSaving(false);

    }
  };


  // =======================================================
  // DELETE SUPPLIER
  // =======================================================

  const handleDelete = async (id) => {

    // Cashier cannot delete
    if (isCashier) {
      return;
    }


    // =====================================================
    // CHECK PRODUCTS
    // =====================================================

    const used =
      products.some(
        (product) => {

          const productSupplier =
            product?.supplierId ??
            product?.supplier_id ??
            product?.supplier?.id ??
            product?.supplier;

          return (
            Number(productSupplier) ===
            Number(id)
          );
        }
      );


    if (used) {

      alert(
        "This supplier is assigned to products and cannot be deleted. Move the products to another supplier first."
      );

      return;
    }


    // =====================================================
    // CONFIRM
    // =====================================================

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this supplier?"
      );

    if (!confirmed) {
      return;
    }


    // =====================================================
    // DELETE
    // =====================================================

    try {

      setError("");

      await suppliersApi.delete(
        id
      );

      await loadSuppliers();

    } catch (err) {

      console.error(
        "Failed to delete supplier:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete supplier."
      );
    }
  };


  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus =
    async (supplier) => {

      // Cashier cannot activate/deactivate
      if (isCashier) {
        return;
      }

      try {

        setError("");

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
          "Failed to update supplier status:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to update supplier status."
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
            Suppliers
          </h2>

          <p>
            Manage your product suppliers.
          </p>

          {isCashier && (

            <small className="text-muted">
              You have view-only access to suppliers.
            </small>

          )}

        </div>


        {/* ===============================================
            ADD BUTTON
        =============================================== */}

        {!isCashier && (

          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={saving}
          >

            <i className="bi bi-plus-lg me-2"></i>

            Add Supplier

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
          SUMMARY CARDS
      =================================================== */}

      <Row className="g-3 mb-4">

        {/* TOTAL */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Total Suppliers
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.total}
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

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Active Suppliers
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
                    Inactive Suppliers
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


        {/* PRODUCTS */}

        <Col xl={3} md={6}>

          <Card className="dashboard-card border-0">

            <Card.Body>

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small className="text-muted">
                    Suppliers in Use
                  </small>

                  <h4 className="mt-2 mb-0">
                    {statistics.suppliersWithProducts}
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
          SUPPLIER CARD
      =================================================== */}

      <Card className="border-0 shadow-sm">

        <Card.Body>


          {/* ===============================================
              SEARCH
          =============================================== */}

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
                  placeholder="Search suppliers..."
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


          {/* ===============================================
              LOADING
          =============================================== */}

          {loading ? (

            <div className="text-center py-5">

              <Spinner
                animation="border"
                variant="primary"
              />

              <div className="mt-2 text-muted">
                Loading suppliers...
              </div>

            </div>

          ) : filteredSuppliers.length === 0 ? (

            /* =============================================
               EMPTY
            ============================================= */

            <div className="text-center py-5">

              <i
                className="bi bi-truck fs-1 text-muted"
              ></i>

              <h5 className="mt-3">
                No suppliers found
              </h5>

              <p className="text-muted">
                {search
                  ? "No suppliers match your search."
                  : "No suppliers have been added yet."
                }
              </p>

              {!isCashier && !search && (

                <Button
                  variant="primary"
                  onClick={handleAdd}
                >

                  <i className="bi bi-plus-lg me-2"></i>

                  Add Supplier

                </Button>

              )}

            </div>

          ) : (

            /* =============================================
               TABLE
            ============================================= */

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
                      Supplier
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Address
                    </th>

                    <th className="text-center">
                      Products
                    </th>

                    <th className="text-center">
                      Status
                    </th>

                    {!isCashier && (

                      <th className="text-end">
                        Actions
                      </th>

                    )}

                  </tr>

                </thead>


                <tbody>

                  {filteredSuppliers.map(
                    (supplier, index) => (

                      <tr
                        key={
                          supplier.id ??
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>


                        {/* SUPPLIER */}

                        <td>

                          <div className="fw-semibold">

                            {getSupplierName(
                              supplier
                            )}

                          </div>

                        </td>


                        {/* PHONE */}

                        <td>

                          {getSupplierPhone(
                            supplier
                          )}

                        </td>


                        {/* EMAIL */}

                        <td>

                          {getSupplierEmail(
                            supplier
                          )}

                        </td>


                        {/* ADDRESS */}

                        <td>

                          {getSupplierAddress(
                            supplier
                          )}

                        </td>


                        {/* PRODUCTS */}

                        <td className="text-center">

                          <Badge
                            bg="secondary"
                          >

                            {getProductCount(
                              supplier.id
                            )}

                          </Badge>

                        </td>


                        {/* STATUS */}

                        <td className="text-center">

                          {getSupplierStatus(
                            supplier
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


                        {/* ACTIONS */}

                        {!isCashier && (

                          <td className="text-end">

                            <Dropdown align="end">

                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                id={`supplier-actions-${supplier.id}`}
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


                                {/* ACTIVATE / DEACTIVATE */}

                                <Dropdown.Item
                                  onClick={() =>
                                    handleToggleStatus(
                                      supplier
                                    )
                                  }
                                >

                                  {getSupplierStatus(
                                    supplier
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
          SUPPLIER MODAL
      =================================================== */}

      {!isCashier && (

        <SupplierModal
          show={showModal}
          onHide={handleCloseModal}
          supplier={editingSupplier}
          onSave={handleSave}
          saving={saving}
        />

      )}

    </div>
  );
};


export default Suppliers;

