
import React from "react";
import { Form, InputGroup } from "react-bootstrap";

const ProductSearch = ({ search, setSearch }) => (
  <InputGroup className="mb-3">
    <InputGroup.Text>
      <i className="bi bi-search" />
    </InputGroup.Text>

    <Form.Control
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="Search product name, SKU or barcode..."
      aria-label="Search products"
    />

    {search && (
      <InputGroup.Text
        role="button"
        onClick={() => setSearch("")}
      >
        Clear
      </InputGroup.Text>
    )}
  </InputGroup>
);

export default ProductSearch;
