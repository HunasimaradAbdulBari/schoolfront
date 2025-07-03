import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Receipt from './Receipt';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class: 'Play Group',
    feePaid: '',
    balance: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchStudents();
    }
  }, [user, navigate]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      setError('Failed to fetch students');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/students', formData);
      setStudents([...students, response.data]);
      setCurrentReceipt(response.data);
      setShowReceipt(true);
      setFormData({
        name: '',
        class: 'Play Group',
        feePaid: '',
        balance: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        logout();
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to create student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      class: 'Play Group',
      feePaid: '',
      balance: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const response = await api.get(`/students?search=${value}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const generateReceipt = (student) => {
    setCurrentReceipt(student);
    setShowReceipt(true);
  };

  const downloadReceipt = (student) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${student.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: white; color: black; max-width: 600px; margin: auto; }
          .receipt-header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 30px; }
          .receipt-header h1 { margin: 0; color: #2c3e50; }
          .receipt-header p { margin: 4px 0; color: #666; }
          .receipt-details { margin-top: 30px; }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .receipt-footer { text-align: center; margin-top: 40px; font-size: 14px; color: #555; }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <h1>ASTRA PRESCHOOL</h1>
          <p>5th Cross, Ganesh Temple Road, Sadashiv Nagar, Tumkur - 572101</p>
          <p>Phone: 9008887230</p>
          <h2 style="margin-top: 20px;">PAYMENT RECEIPT</h2>
        </div>
        <div class="receipt-details">
          <div class="receipt-row"><strong>Student Name:</strong><span>${student.name}</span></div>
          <div class="receipt-row"><strong>Class:</strong><span>${student.class}</span></div>
          <div class="receipt-row"><strong>Fee Paid:</strong><span>₹${student.feePaid}</span></div>
          <div class="receipt-row"><strong>Balance:</strong><span>₹${student.balance}</span></div>
          <div class="receipt-row total-row"><strong>Total Amount:</strong><span>₹${parseInt(student.feePaid) + parseInt(student.balance)}</span></div>
          <div class="receipt-row"><strong>Payment Date:</strong><span>${new Date(student.date).toLocaleDateString('en-IN')}</span></div>
        </div>
        <div class="receipt-footer">
          <p>Thank you for your payment!</p>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
          <p style="margin-top: 20px; font-style: italic;">This is a computer generated receipt.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${student.name}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/myapplogo.jpeg" alt="Astra Preschool" className="header-logo" />
          <div className="school-info">
            <h1>ASTRA PRESCHOOL</h1>
            <p>5th Cross, Ganesh Temple Road, Sadashiv Nagar, Tumkur - 572101</p>
            <p>Phone: 9008887230</p>
          </div>
        </div>
        <div className="header-right">
          <div className="theme-toggle">
            <span>Light Mode</span>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider"></span>
            </label>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <form onSubmit={handleSubmit} className="student-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <select name="class" value={formData.class} onChange={handleInputChange} disabled={loading}>
                <option value="Play Group">Play Group</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fee Paid:</label>
              <input type="number" name="feePaid" value={formData.feePaid} onChange={handleInputChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label>Balance:</label>
              <input type="number" name="balance" value={formData.balance} onChange={handleInputChange} required disabled={loading} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required disabled={loading} />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
              <button type="button" onClick={handleClear} className="clear-btn" disabled={loading}>Clear</button>
              <button
                type="button"
                className="download-btn"
                onClick={() => formData.name && downloadReceipt(formData)}
                disabled={!formData.name}
              >
                Download Receipt
              </button>
            </div>
          </div>
        </form>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="students-list">
          <h3>Student Records</h3>
          <div className="students-grid">
            {students.map((student) => (
              <div key={student._id} className="student-card">
                <h4>{student.name}</h4>
                <p><strong>Class:</strong> {student.class}</p>
                <p><strong>Fee Paid:</strong> ₹{student.feePaid}</p>
                <p><strong>Balance:</strong> ₹{student.balance}</p>
                <p><strong>Date:</strong> {new Date(student.date).toLocaleDateString()}</p>
                <button onClick={() => downloadReceipt(student)} className="receipt-btn">Download Receipt</button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showReceipt && <Receipt student={currentReceipt} onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

export default Dashboard;
