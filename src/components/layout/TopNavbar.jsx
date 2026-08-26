import React from 'react';

const TopNavbar = () => {
  return (
    <header className="top-navbar">

      <div className="search-box">
        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Search products, customers, orders..."
        />

        <span className="search-shortcut">
          Ctrl K
        </span>
      </div>

      <div className="navbar-actions">

        <button className="icon-button">
          <i className="bi bi-bell"></i>
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">

          <div className="avatar">
            K
          </div>

          <div className="user-info">
            <strong>Kelvin</strong>
            <small>Administrator</small>
          </div>

          <i className="bi bi-chevron-down"></i>

        </div>

      </div>

    </header>
  );
};

export default TopNavbar;