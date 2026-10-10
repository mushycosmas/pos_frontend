import React from "react";

const CustomerSearch = ({
  searchTerm,
  onSearchChange,
  total,
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h5 className="mb-1">Customer Management</h5>

        <small className="text-muted">
          {total} customer{total !== 1 ? "s" : ""}
        </small>
      </div>

      <div
        className="input-group"
        style={{ maxWidth: "350px" }}
      >
        <span className="input-group-text bg-white">
          <i className="bi bi-search" />
        </span>

        <input
          type="text"
          className="form-control"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
        />

        {searchTerm && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <i className="bi bi-x" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerSearch;