import React from "react";

const SettingsActions = ({ handleCancel }) => {
  return (
    <div className="d-flex justify-content-end gap-2">
      <button
        type="button"
        className="btn btn-light"
        onClick={handleCancel}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="btn btn-primary"
      >
        <i className="bi bi-check-lg me-2"></i>
        Save Changes
      </button>
    </div>
  );
};

export default SettingsActions;