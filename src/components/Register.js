import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { api } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendOtp = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/api/auth/send-otp', { phone: form.phone });
      setOtpSent(true);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/api/auth/verify-otp-register', form);
      setMessage(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/myapplogo.jpeg" alt="Astra Preschool" className="login-logo" />
          <h1>Register</h1>
          <p>Sign up with OTP verification</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
            <button type="button" onClick={sendOtp} className="login-button" style={{ marginTop: '10px' }}>
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>

          {otpSent && (
            <>
              <div className="form-group">
                <label>OTP</label>
                <input type="text" name="otp" value={form.otp} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="login-button">Register</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
