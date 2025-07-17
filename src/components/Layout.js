import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  return (
    <div className={`layout ${darkMode ? 'dark' : ''}`}>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/myapplogo.jpeg" alt="Astra" className="logo-img" />
            <span className="logo-text">ASTRA PRESCHOOL</span>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/students" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Students
            </Link>
            <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Register
            </Link>
            <div className="nav-controls">
              <button onClick={toggleDarkMode} className="theme-btn">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>

          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ASTRA PRESCHOOL</h3>
            <p>5th Cross, Ganesh Temple Road</p>
            <p>Sadashiv Nagar, Tumkur - 572101</p>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 9008887230</p>
            <p>📧 info@astrapreschool.com</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/register">Dashboard</Link>
            <Link to="/students">Students</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Astra Preschool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
