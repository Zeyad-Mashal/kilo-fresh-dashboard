import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">Kilo Fresh</span>
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/category"
            className={`navbar-link ${isActive("/category") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            الفئات
          </Link>
          <Link
            to="/product"
            className={`navbar-link ${isActive("/product") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            المنتجات
          </Link>
          <Link
            to="/order"
            className={`navbar-link ${isActive("/order") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            الطلبات
          </Link>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <HiX /> : <HiMenu />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
