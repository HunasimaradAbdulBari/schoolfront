import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout, isAdmin, isParent } = useAuth();
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
            <div className="logo-text-container">
              <span className="logo-text">ASTRA PRESCHOOL</span>
              <span className="user-role-badge">
                {isAdmin() ? 'Administrator' : 'Parent Portal'}
              </span>
            </div>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            {/* Role-based navigation */}
            {isAdmin() && (
              <>
                <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Add Student
                </Link>
                <Link to="/students" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Manage Students
                </Link>
                <Link to="/payments" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Payment Management
                </Link>
              </>
            )}
            
            {isParent() && (
              <>
                <Link to="/parent-dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  My Children
                </Link>
                <Link to="/payment-history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Payment History
                </Link>
              </>
            )}

            <div className="nav-user-info">
              <span className="user-name">Hello, {user.name}</span>
              {isParent() && user.studentIds && (
                <span className="student-count">
                  {user.studentIds.length} Child{user.studentIds.length !== 1 ? 'ren' : ''}
                </span>
              )}
            </div>

            <div className="nav-controls">
              <button onClick={toggleDarkMode} className="theme-btn" title="Toggle theme">
                {darkMode ? (
                  <svg className="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-[19px] h-[19px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.675 2.015a.998.998 0 0 0-.403.011C6.09 2.4 2 6.722 2 12c0 5.523 4.477 10 10 10 4.356 0 8.058-2.784 9.43-6.667a1 1 0 0 0-1.02-1.33c-.08.006-.105.005-.127.005h-.001l-.028-.002A5.227 5.227 0 0 0 20 14a8 8 0 0 1-8-8c0-.952.121-1.752.404-2.558a.996.996 0 0 0 .096-.428V3a1 1 0 0 0-.825-.985Z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
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
            {isParent() && (
              <div className="parent-footer-info">
                <p><strong>Your Account:</strong> Parent Portal</p>
                <p><strong>Phone:</strong> {user.phone}</p>
              </div>
            )}
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              <a href="tel:9008887230">
                <i className="fa fa-phone" style={{ fontSize: '20px', marginRight: '6px' }}></i>
                9008887230
              </a>
            </p>
            <p>
              <a href="mailto:info@astrapreschool.com">
                <i className="fa fa-envelope" style={{ fontSize: '20px', marginRight: '6px' }}></i>
                info@astrapreschool.com
              </a>
            </p>
            {isParent() && (
              <p className="parent-support">
                <strong>Need Help?</strong><br />
                Call us for payment support or account issues
              </p>
            )}
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            {isAdmin() && (
              <>
                <Link to="/dashboard">Add Student</Link>
                <Link to="/students">Manage Students</Link>
                <Link to="/payments">Payments</Link>
              </>
            )}
            {isParent() && (
              <>
                <Link to="/parent-dashboard">My Children</Link>
                <Link to="/payment-history">Payment History</Link>
              </>
            )}
          </div>

          {isParent() && (
            <div className="footer-section">
              <h4>Payment Methods</h4>
              <div className="payment-methods">
                <p>💳 UPI Payment Available</p>
                <p>📱 GPay, PhonePe, Paytm, BHIM</p>
                <p>🔒 Secure & Fast</p>
                <p>📧 SMS Confirmations</p>
              </div>
            </div>
          )}
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Astra Preschool. All rights reserved.</p>
          {isParent() && (
            <p className="parent-footer-note">
              For technical support with payments, contact school administration
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
