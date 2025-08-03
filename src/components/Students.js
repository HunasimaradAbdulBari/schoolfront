import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  
  // 🔧 FIX #1: Add state for last added student
  const [lastAddedStudent, setLastAddedStudent] = useState(null);
  const [message, setMessage] = useState('');
  
  // 🔧 FIX #3: Add state for calculated age
  const [calculatedAge, setCalculatedAge] = useState('');
  const [formData, setFormData] = useState({
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
  const [showForm, setShowForm] = useState(false);
  
  const navigate = useNavigate();

  // Default Avatar SVG Component
  const DefaultAvatar = () => (
    <svg className="default-avatar-svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  // 🔧 FIX #3: Add age calculation function
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 🔧 FIX #3: Handle date of birth change with age calculation
  const handleDateOfBirthChange = (e) => {
    const birthDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      dateOfBirth: birthDate
    }));
    
    if (birthDate) {
      const age = calculateAge(birthDate);
      setCalculatedAge(age);
    } else {
      setCalculatedAge('');
    }
  };

  // Form handling functions
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
    setMessage('');

    try {
      const submitData = new FormData();
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

      // 🔧 FIX #1: Store last added student for link
      setLastAddedStudent(response.data);
      setMessage('Student added successfully!');
      
      // Reset form
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
      setCalculatedAge('');
      
      // Refresh students list
      fetchStudents();
      
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
    setCalculatedAge('');
    const fileInput = document.getElementById('studentPhoto');
    if (fileInput) fileInput.value = '';
    setError('');
    setMessage('');
    setLastAddedStudent(null);
  };

  // Effects
  useEffect(() => {
    fetchStudents();
  }, []);

  // API functions
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/api/students/${editForm._id}`, editForm);
      setStudents(prev => prev.map(s => s._id === res.data._id ? res.data : s));
      setSelectedStudent(res.data);
      setIsEditMode(false);
    } catch (err) {
      alert('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setLoading(true);
      try {
        await api.delete(`/api/students/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
        closeStudentDetails();
      } catch (err) {
        alert('Failed to delete student');
      } finally {
        setLoading(false);
      }
    }
  };

  // Optimized event handlers using useCallback
  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleClassFilter = useCallback((e) => setSelectedClass(e.target.value), []);
  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Optimized filtered students using useMemo
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === '' || student.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  // Modal functions
  const openStudentDetails = useCallback((student) => {
    setSelectedStudent(student);
    setEditForm(student);
    setIsEditMode(false);
  }, []);

  const closeStudentDetails = useCallback(() => {
    setSelectedStudent(null);
    setIsEditMode(false);
  }, []);

  // 🔧 FIX #1: Function to view student details from success message
  const handleViewLastAddedStudent = (student) => {
    setSelectedStudent(student);
    setEditForm(student);
    setIsEditMode(false);
    setLastAddedStudent(null);
    setMessage('');
  };

  // Optimized print functionality
  const handlePrint = useCallback(() => {
    const content = document.getElementById('print-area');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { line-height: 1.6; }
            .details p { margin: 8px 0; }
            .details strong { color: #333; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

  // Loading state
  if (loading && students.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="students-container">
      {/* Header Section */}
      <div className="students-header">
        <h1>Student Management</h1>
        <div className="header-actions">
          <button 
            className="add-student-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            {showForm ? 'Hide Form' : 'Add Student'}
          </button>
          <button className="print-btn" onClick={handlePrint}>
            <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            Print All
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      {showForm && (
        <div className="dashboard-content" style={{ marginBottom: '32px' }}>
          <div className="dashboard-header">
            <h2>Add New Student</h2>
            <p>Fill in the student details and fee information</p>
          </div>

          {/* 🔧 FIX #1: Success message with student link */}
          {message && (
            <div className="success-message">
              {message}
              {lastAddedStudent && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => handleViewLastAddedStudent(lastAddedStudent)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: '600',
                      marginLeft: '10px'
                    }}
                  >
                    View {lastAddedStudent.name}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-section">
              <h3>📋 Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter student's full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="class">Class *</label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Play Group">Play Group</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    placeholder="dd/mm/yyyy"
                    required
                  />
                </div>
                {/* 🔧 FIX #3: Age field appears when date of birth is entered */}
                {calculatedAge && (
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="text"
                      value={calculatedAge + ' years'}
                      readOnly
                      style={{
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        color: '#666'
                      }}
                    />
                  </div>
                )}
                {/* 🔧 FIX #2: Added asterisk (*) to Blood Group label */}
                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group *</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="allergies">Allergies/Medical Notes</label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Any allergies or medical conditions"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>👨‍👩‍👧‍👦 Parent Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="parentName">Parent Name</label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    placeholder="Enter parent's name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="parentPhone">Parent Phone</label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="Enter parent's phone number"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>💰 Fee Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="feePaid">Fee Paid *</label>
                  <input
                    type="number"
                    id="feePaid"
                    name="feePaid"
                    value={formData.feePaid}
                    onChange={handleInputChange}
                    placeholder="Enter fee amount paid"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="balance">Balance *</label>
                  <input
                    type="number"
                    id="balance"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    placeholder="Enter remaining balance"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Payment Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>📸 Student Photo</h3>
              <div className="form-row">
                <div className="form-group">
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
                      <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      Choose Photo
                    </label>
                    {formData.studentPhoto && (
                      <span className="file-name">{formData.studentPhoto.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Add Student
                  </>
                )}
              </button>
              <button type="button" className="clear-btn" onClick={handleClear}>
                <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Clear Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rest of your existing Students.js code continues exactly the same... */}
      {/* View Toggle, Filters, Students Grid, Modal, etc. */}
      
      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'grid' ? 'active-toggle' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
          </svg>
          Grid View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'list' ? 'active-toggle' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg className="icon-svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4"/>
          </svg>
          List View
        </button>
      </div>

      {/* Filters Section */}
      <div className="students-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <svg className="search-icon icon-svg-small" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <div className="filter-container">
          <select
            value={selectedClass}
            onChange={handleClassFilter}
            className="class-filter"
          >
            <option value="">All Classes</option>
            <option value="Play Group">Play Group</option>
            <option value="LKG">LKG</option>
            <option value="UKG">UKG</option>
            <option value="1st Grade">1st Grade</option>
            <option value="2nd Grade">2nd Grade</option>
            <option value="3rd Grade">3rd Grade</option>
            <option value="4th Grade">4th Grade</option>
            <option value="5th Grade">5th Grade</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Students Display */}
      {filteredStudents.length === 0 ? (
        <div className="no-students">
          <p>No students found</p>
        </div>
      ) : (
        <div className={`students-grid ${viewMode}-view`}>
          {filteredStudents.map(student => (
            <div key={student._id} className="student-card">
              <button 
                className="hover-delete-btn"
                onClick={() => handleDeleteStudent(student._id)}
                title="Delete Student"
              >
                <svg className="icon-svg-small" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                </svg>
              </button>
              
              <div className="student-avatar">
                <DefaultAvatar />
              </div>
              
              <div className="student-info">
                <h3>{student.name}</h3>
                <div className="student-class">{student.class}</div>
                <p><strong>Parent:</strong> {student.parentName || 'N/A'}</p>
                <p><strong>Phone:</strong> {student.parentPhone || 'N/A'}</p>
                <p><strong>Fee Paid:</strong> ₹{student.feePaid}</p>
                <p><strong>Balance:</strong> ₹{student.balance}</p>
                <p><strong>Date:</strong> {new Date(student.date).toLocaleDateString()}</p>
              </div>
              
              <div className="student-actions">
                <button 
                  className="details-btn"
                  onClick={() => openStudentDetails(student)}
                >
                  <svg className="icon-svg-small" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                  </svg>
                  Details
                </button>
                <button className="receipt-btn">
                  <svg className="icon-svg-small" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                  </svg>
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Student' : 'Student Details'}</h2>
              <button className="close-btn" onClick={closeStudentDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div id="print-area">
                <div className="student-detail-avatar">
                  <DefaultAvatar />
                </div>
                
                <div className="student-details">
                  <div className="detail-row">
                    <label>Full Name:</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span>{selectedStudent.name}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Class:</label>
                    {isEditMode ? (
                      <select
                        name="class"
                        value={editForm.class}
                        onChange={handleEditChange}
                      >
                        <option value="Play Group">Play Group</option>
                        <option value="LKG">LKG</option>
                        <option value="UKG">UKG</option>
                        <option value="1st Grade">1st Grade</option>
                        <option value="2nd Grade">2nd Grade</option>
                        <option value="3rd Grade">3rd Grade</option>
                        <option value="4th Grade">4th Grade</option>
                        <option value="5th Grade">5th Grade</option>
                      </select>
                    ) : (
                      <span>{selectedStudent.class}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Parent Name:</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="parentName"
                        value={editForm.parentName}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span>{selectedStudent.parentName || 'N/A'}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Parent Phone:</label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        name="parentPhone"
                        value={editForm.parentPhone}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span>{selectedStudent.parentPhone || 'N/A'}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Fee Paid:</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        name="feePaid"
                        value={editForm.feePaid}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span>₹{selectedStudent.feePaid}</span>
                    )}
                  </div>
                  
                  <div className="detail-row">
                    <label>Balance:</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        name="balance"
                        value={editForm.balance}
                        onChange={handleEditChange}
                      />
                    ) : (
                      <span>₹{selectedStudent.balance}</span>
                    )}
                  </div>
                  
                  {selectedStudent.address && (
                    <div className="detail-row">
                      <label>Address:</label>
                      <span>{selectedStudent.address}</span>
                    </div>
                  )}
                  
                  {selectedStudent.bloodGroup && (
                    <div className="detail-row">
                      <label>Blood Group:</label>
                      <span>{selectedStudent.bloodGroup}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <label>Date:</label>
                    <span>{new Date(selectedStudent.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button onClick={handleUpdateStudent} className="submit-btn">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditMode(false)} className="close-modal-btn">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditMode(true)} className="submit-btn">
                    Edit Student
                  </button>
                  <button onClick={handlePrint} className="print-btn">
                    Print Details
                  </button>
                  <button onClick={closeStudentDetails} className="close-modal-btn">
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
