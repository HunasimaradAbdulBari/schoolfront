import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    class: 'Play Group',
    feePaid: '',
    balance: '',
    date: new Date().toISOString().split('T')[0],
    // New fields
    studentPhoto: null,
    parentName: '',
    parentPhone: '',
    address: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await api.post('/api/students', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Student added successfully!');
      setFormData({
        name: '',
        class: 'Play Group',
        feePaid: '',
        balance: '',
        date: new Date().toISOString().split('T')[0],
        studentPhoto: null,
        parentName: '',
        parentPhone: '',
        address: '',
        dateOfBirth: '',
        bloodGroup: '',
        allergies: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('studentPhoto');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add student');
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
      date: new Date().toISOString().split('T')[0],
      studentPhoto: null,
      parentName: '',
      parentPhone: '',
      address: '',
      dateOfBirth: '',
      bloodGroup: '',
      allergies: ''
    });
    const fileInput = document.getElementById('studentPhoto');
    if (fileInput) fileInput.value = '';
    setError('');
    setSuccess('');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Add New Student</h1>
        <p>Fill in the student details and fee information</p>
      </div>

      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="student-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Student Photo */}
          <div className="form-section">
            <h3>Student Photo</h3>
            <div className="photo-upload">
              <input
                type="file"
                id="studentPhoto"
                name="studentPhoto"
                accept="image/*"
                onChange={handleInputChange}
                className="file-input"
              />
              <label htmlFor="studentPhoto" className="file-label">
                📷 Upload Photo
              </label>
              {formData.studentPhoto && (
                <span className="file-name">{formData.studentPhoto.name}</span>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div className="form-section">
            <h3>Student Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Enter student's full name"
                />
              </div>
              <div className="form-group">
                <label>Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="Play Group">Play Group</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter complete address"
                rows="3"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="form-section">
            <h3>Parent Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Parent Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter parent's name"
                />
              </div>
              <div className="form-group">
                <label>Parent Phone</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="form-section">
            <h3>Fee Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Fee Paid *</label>
                <input
                  type="number"
                  name="feePaid"
                  value={formData.feePaid}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Amount paid"
                />
              </div>
              <div className="form-group">
                <label>Balance *</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Remaining balance"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label>Allergies/Medical Notes</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Any allergies or medical conditions"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding Student...' : 'Add Student'}
            </button>
            <button type="button" onClick={handleClear} className="clear-btn" disabled={loading}>
              Clear Form
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;