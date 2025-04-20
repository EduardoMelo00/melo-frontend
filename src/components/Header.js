import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <img src="/logo.png" alt="Melo Engenharia" className="logo-img" />
      </div>
      <nav className="header-nav">
        <Link to="/welcome" className="nav-link">Início</Link>
        <Link to="/login" className="nav-link">Login</Link>
      </nav>
    </header>
  );
}

export default Header;
