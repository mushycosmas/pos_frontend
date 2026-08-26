import React, { useEffect, useState } from "react";

import {
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";

import api from "../services/api";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingBrand, setEditingBrand] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  /* ==============================
     GET BRANDS
  ============================== */

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const response = await api.get("/brands/");

      console.log("Brands:", response.data);

      // Supports normal DRF list or paginated response
      setBrands(
        response.data.results || response.data
      );
    } catch (error) {
      console.error(
        "Failed to fetch brands:",
        error
      );

      alert("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  /* ==============================
     SEARCH
  ============================== */

  const filteredBrands = brands.filter((brand) => {
    const keyword = search.toLowerCase();

    return (
      brand.name
        ?.toLowerCase()
        .includes(keyword) ||
      brand.description
        ?.toLowerCase()
        .includes(keyword)
    );
  });

  /* ==============================
     ADD BRAND
  ============================== */

  const handleAddBrand = () => {
    setEditingBrand(null);

    setFormData({
      name: "",
      description: "",
      is_active: true,
    });

    setShowModal(true);
  };

  /* ==============================
     EDIT BRAND
  ============================== */

  const handleEdit = (brand) => {
    setEditingBrand(brand);

    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      is_active: brand.is_active,
    });

    setShowModal(true);
  };

  /* ==============================
     INPUT CHANGE
  ============================== */

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData({
      ...formData,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  /* ==============================
     SAVE BRAND
  ============================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingBrand) {
        await api.put(
          `/brands/${editingBrand.id}/`,
          formData
        );
      } else {
        await api.post(
          "/brands/",
          formData
        );
      }

      setShowModal(false);

      await fetchBrands();

    } catch (error) {
      console.error(
        "Failed to save brand:",
        error
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to save brand"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     DELETE BRAND
  ============================== */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this brand?"
      );

    if (!confirmed) return;

    try {
      await api.delete(`/brands/${id}/`);

      await fetchBrands();

    } catch (error) {
      console.error(
        "Failed to delete brand:",
        error
      );

      alert("Failed to delete brand");
    }
  };

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>
          <h2>Brands</h2>

          <p>
            Manage product brands.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleAddBrand}
        >
          <i className="bi bi-plus-lg me-2"></i>

          Add Brand
        </Button>

      </div>


      {/* BRANDS TABLE */}

      <Card className="dashboard-card border-0">

        <Card.Body>

          {/* SEARCH */}

          <div className="d-flex justify-content-between mb-4">

            <div style={{ width: "350px" }}>

              <InputGroup>

                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search brands..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </InputGroup>

            </div>


            <div className="text-muted">

              Total Brands:

              <strong className="ms-2">
                {brands.length}
              </strong>

            </div>

          </div>


          {/* TABLE */}

          {loading && brands.length === 0 ? (

            <div className="text-center py-5">

              <Spinner animation="border" />

              <p className="mt-3 text-muted">
                Loading brands...
              </p>

            </div>

          ) : (

            <Table
              hover
              responsive
              className="align-middle"
            >

              <thead>

                <tr>

                  <th>ID</th>

                  <th>BRAND NAME</th>

                  <th>DESCRIPTION</th>

                  <th>STATUS</th>

                  <th>CREATED</th>

                  <th className="text-end">
                    ACTIONS
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredBrands.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                    >

                      <i className="bi bi-tags fs-3 d-block mb-2"></i>

                      No brands found.

                    </td>

                  </tr>

                ) : (

                  filteredBrands.map(
                    (brand) => (

                      <tr key={brand.id}>

                        <td>
                          #{brand.id}
                        </td>


                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                              style={{
                                width: "38px",
                                height: "38px",
                              }}
                            >

                              <i className="bi bi-award text-primary"></i>

                            </div>


                            <strong>
                              {brand.name}
                            </strong>

                          </div>

                        </td>


                        <td>

                          {brand.description || (
                            <span className="text-muted">
                              -
                            </span>
                          )}

                        </td>


                        <td>

                          <Badge
                            bg={
                              brand.is_active
                                ? "success"
                                : "secondary"
                            }
                          >

                            {brand.is_active
                              ? "Active"
                              : "Inactive"}

                          </Badge>

                        </td>


                        <td>

                          {brand.created_at
                            ? new Date(
                                brand.created_at
                              ).toLocaleDateString()
                            : "-"}

                        </td>


                        <td className="text-end">

                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleEdit(brand)
                            }
                          >

                            <i className="bi bi-pencil"></i>

                          </Button>


                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDelete(brand.id)
                            }
                          >

                            <i className="bi bi-trash"></i>

                          </Button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </Table>

          )}

        </Card.Body>

      </Card>


      {/* ADD / EDIT MODAL */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >

        <Form onSubmit={handleSubmit}>

          <Modal.Header closeButton>

            <Modal.Title>

              {editingBrand
                ? "Edit Brand"
                : "Add New Brand"}

            </Modal.Title>

          </Modal.Header>


          <Modal.Body>

            {/* BRAND NAME */}

            <Form.Group className="mb-3">

              <Form.Label>
                Brand Name
              </Form.Label>

              <Form.Control
                type="text"
                name="name"
                placeholder="Example: Samsung"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </Form.Group>


            {/* DESCRIPTION */}

            <Form.Group className="mb-3">

              <Form.Label>
                Description
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={handleChange}
              />

            </Form.Group>


            {/* STATUS */}

            <Form.Check
              type="switch"
              id="brand-status"
              name="is_active"
              label="Active Brand"
              checked={formData.is_active}
              onChange={handleChange}
            />

          </Modal.Body>


          <Modal.Footer>

            <Button
              variant="light"
              onClick={() =>
                setShowModal(false)
              }
            >

              Cancel

            </Button>


            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : editingBrand
                ? "Update Brand"
                : "Save Brand"}

            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </div>
  );
};

export default Brands;