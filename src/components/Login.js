import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'parent'
  const { login, user, isAdmin, isParent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (isAdmin()) {
        navigate('/students');
      } else if (isParent()) {
        navigate('/parent-dashboard');
      }
    }
  }, [user, navigate, isAdmin, isParent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        // Navigation is handled by useEffect above
        console.log('Login successful, user role:', result.user.role);
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (loginMode) {
      case 'parent':
        return 'Enter your phone number';
      case 'admin':
      default:
        return 'Enter your username';
    }
  };

  const getLoginInstructions = () => {
    switch (loginMode) {
      case 'parent':
        return (
          <div className="login-instructions">
            <h4>Parent Login Instructions:</h4>
            <ul>
              <li>Use your registered phone number as username</li>
              <li>If you haven't registered yet, click "Register as Parent" below</li>
              <li>After registration, you can view your children and make payments</li>
            </ul>
          </div>
        );
      case 'admin':
      default:
        return (
          <div className="login-instructions">
            <h4>Administrator Login:</h4>
            <ul>
              <li>Use your administrator username and password</li>
              <li>Access student management and payment verification</li>
              <li>Add new students and manage school records</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/myapplogo.jpeg" alt="Astra Preschool" className="login-logo" />
          <h1>ASTRA PRESCHOOL</h1>
          <p>Management System</p>
        </div>

        {/* Login Mode Toggle */}
        <div className="login-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => setLoginMode('admin')}
          >
            👨‍💼 Administrator
          </button>
          <button
            type="button"
            className={`mode-btn ${loginMode === 'parent' ? 'active' : ''}`}
            onClick={() => setLoginMode('parent')}
          >
            👨‍👩‍👧‍👦 Parent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>
              {loginMode === 'parent' ? 'Phone Number' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={getPlaceholderText()}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="login-options">
            {loginMode === 'parent' ? (
              <div className="parent-options">
                <p className="register-link">
                  New parent? <Link to="/parent-register">Register with OTP</Link>
                </p>
                <p className="help-text">
                  Registration is automatic when your child is enrolled. 
                  Use the phone number provided to the school.
                </p>
              </div>
            ) : (
              <p className="register-link">
                Need admin access? <Link to="/register">Register as Administrator</Link>
              </p>
            )}
          </div>
        </form>

        {/* Instructions Panel */}
        {getLoginInstructions()}

        {/* Demo Credentials (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            {loginMode === 'admin' ? (
              <div>
                <p><strong>Admin:</strong> admin / 123456</p>
              </div>
            ) : (
              <div>
                <p><strong>Parent:</strong> Use registered phone number</p>
                <p>Default password: 123456 (change after first login)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
