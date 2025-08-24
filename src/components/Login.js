import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 Login component - current user:', user);
    if (user) {
      console.log('✅ User already logged in, redirecting to students');
      navigate('/students');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Login form submitted');
    
    // Clear previous errors
    setError('');
    setLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Attempting login with:', { username: username.trim() });
      
      const result = await login(username.trim(), password.trim());
      console.log('🔍 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to students');
        navigate('/students');
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Login error in component:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/myapplogo.jpeg" alt="Astra Preschool" className="login-logo" />
          <h1>ASTRA PRESCHOOL</h1>
          <p>Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;