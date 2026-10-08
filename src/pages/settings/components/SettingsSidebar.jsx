import React from "react";

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      key: "company",
      label: "Company",
      icon: "bi-building",
    },
    {
      key: "system",
      label: "System",
      icon: "bi-gear",
    },
    {
      key: "preferences",
      label: "Preferences",
      icon: "bi-sliders",
    },
  ];

  return (
    <div className="col-md-3 border-end">
      <div className="p-3">
        <h6 className="text-uppercase text-muted mb-3">
          Settings
        </h6>

        <div className="list-group list-group-flush">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`list-group-item list-group-item-action ${
                activeTab === tab.key ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon} me-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;