import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ParentRegister.css';

const ParentRegister = () => {
  const [step, setStep] = useState(1); // 1: Phone & Carrier, 2: OTP Verification
  const [formData, setFormData] = useState({
    phone: '',
    carrier: 'airtel',
    name: '',
    password: '',
    otp: ''
  });
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const { sendOTP, verifyOTPAndRegister, resendOTP, getCarriers } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCarriers();
  }, []);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else if (otpTimer === 0 && step === 2) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [otpTimer, step]);

  const loadCarriers = async () => {
    const result = await getCarriers();
    if (result.success) {
      setCarriers(result.carriers);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        phone: value
      }));
      setError('');
    }
  };

  const validatePhone = (phone) => {
    // Indian phone number validation
    const cleaned = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      setLoading(false);
      return;
    }

    try {
      const result = await sendOTP(formData.phone, formData.carrier);
      if (result.success) {
        setSuccess('OTP sent successfully to your phone number');
        setStep(2);
        setOtpTimer(300); // 5 minutes
        setCanResend(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await resendOTP(formData.phone, formData.carrier);
      if (result.success) {
        setSuccess('OTP resent successfully');
        setOtpTimer(300); // 5 minutes
        setCanResend(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form data
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.otp.trim()) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTPAndRegister({
        phone: formData.phone,
        otp: formData.otp,
        name: formData.name.trim(),
        password: formData.password,
        carrier: formData.carrier
      });

      if (result.success) {
        setSuccess(`Registration successful! ${result.studentsLinked} student(s) linked to your account.`);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="parent-register-container">
      <div className="register-card">
        <div className="register-header">
          <img src="/myapplogo.jpeg" alt="Astra Preschool" className="register-logo" />
          <h1>Parent Registration</h1>
          <p>Register with OTP verification to access your children's records</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Phone Number and Basic Info */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="register-form">
            <div className="step-indicator">
              <span className="step active">1</span>
              <span className="step-line"></span>
              <span className="step">2</span>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
                disabled={loading}
              />
              <small>Must be the same number provided to the school</small>
            </div>

            <div className="form-group">
              <label>Mobile Carrier *</label>
              <select
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Select your carrier</option>
                {carriers.length > 0 ? (
                  carriers.map(carrier => (
                    <option key={carrier.value} value={carrier.value}>
                      {carrier.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="airtel">Airtel</option>
                    <option value="jio">Jio</option>
                    <option value="vodafone">Vodafone</option>
                    <option value="tmobile">T-Mobile</option>
                    <option value="verizon">Verizon</option>
                    <option value="att">AT&T</option>
                    <option value="sprint">Sprint</option>
                  </>
                )}
              </select>
              <small>Select your mobile service provider for SMS delivery</small>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (min 6 characters)"
                minLength="6"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="register-info">
              <h4>Important Notes:</h4>
              <ul>
                <li>Use the same phone number you provided to the school</li>
                <li>Your children will be automatically linked to your account</li>
                <li>You'll be able to view fees and make payments after registration</li>
                <li>SMS charges may apply for OTP delivery</li>
              </ul>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} className="register-form">
            <div className="step-indicator">
              <span className="step completed">✓</span>
              <span className="step-line"></span>
              <span className="step active">2</span>
            </div>

            <div className="otp-info">
              <h3>Verify Your Phone Number</h3>
              <p>We've sent a 6-digit OTP to <strong>+91 {formData.phone}</strong></p>
              <p>Check your messages and enter the code below</p>
            </div>

            <div className="form-group">
              <label>Enter OTP *</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                disabled={loading}
                className="otp-input"
              />
            </div>

            {otpTimer > 0 && (
              <div className="otp-timer">
                <p>OTP expires in: <strong>{formatTime(otpTimer)}</strong></p>
              </div>
            )}

            <div className="otp-actions">
              <button type="submit" className="register-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>

              {canResend && (
                <button 
                  type="button" 
                  className="resend-button" 
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            <button 
              type="button" 
              className="back-button" 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              ← Change Phone Number
            </button>

            <div className="otp-help">
              <h4>Having trouble?</h4>
              <ul>
                <li>Check your message inbox and spam folder</li>
                <li>Make sure you selected the correct carrier</li>
                <li>OTP is valid for 5 minutes only</li>
                <li>Contact school office if you don't receive OTP</li>
              </ul>
            </div>
          </form>
        )}

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <p className="help-text">
            Need help? Call school office at <strong>9008887230</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentRegister;
