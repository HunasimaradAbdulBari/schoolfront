import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Students.css';

const Students = () => {
  // State declarations
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

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

  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleClassFilter = (e) => setSelectedClass(e.target.value);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Print functionality
  const handlePrint = () => {
    const content = document.getElementById('print-area');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Students List - Astra Preschool</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 30px; }
          .student-item { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .student-name { font-weight: bold; font-size: 16px; }
          .student-details { margin-top: 5px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Modal functions
  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setEditForm(student);
    setIsEditMode(false);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
    setIsEditMode(false);
  };

  // Utility functions
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const downloadReceipt = (student) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${student.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: white; 
            color: black; 
            max-width: 600px; 
            margin: auto; 
          }
          .receipt-header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
          }
          .receipt-header h1 { 
            margin: 0; 
            color: #2c3e50; 
            font-size: 24px;
          }
          .receipt-header p { 
            margin: 4px 0; 
            color: #666; 
          }
          .receipt-details { 
            margin: 30px 0; 
          }
          .receipt-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #ddd; 
          }
          .total-row { 
            font-weight: bold; 
            background: #f0f0f0; 
            padding: 15px 10px;
            margin-top: 10px;
          }
          .receipt-footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 14px; 
            color: #555; 
          }
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
          <div class="receipt-row"><strong>Parent Name:</strong><span>${student.parentName || 'N/A'}</span></div>
          <div class="receipt-row"><strong>Parent Phone:</strong><span>${student.parentPhone || 'N/A'}</span></div>
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

  const handleStudentPrint = (student) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .detail-row { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ASTRA PRESCHOOL</h2>
            <p>Student Detail Printout</p>
            <hr />
          </div>
          <div class="details">
            <div class="detail-row"><strong>Name:</strong> ${student.name}</div>
            <div class="detail-row"><strong>Class:</strong> ${student.class}</div>
            <div class="detail-row"><strong>Parent:</strong> ${student.parentName || 'N/A'}</div>
            <div class="detail-row"><strong>Phone:</strong> ${student.parentPhone || 'N/A'}</div>
            <div class="detail-row"><strong>Date of Birth:</strong> ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><strong>Blood Group:</strong> ${student.bloodGroup || 'N/A'}</div>
            <div class="detail-row"><strong>Address:</strong> ${student.address || 'N/A'}</div>
            <div class="detail-row"><strong>Fee Paid:</strong> ₹${student.feePaid}</div>
            <div class="detail-row"><strong>Balance:</strong> ₹${student.balance}</div>
            <div class="detail-row"><strong>Payment Date:</strong> ${student.date ? new Date(student.date).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><strong>Allergies:</strong> ${student.allergies || 'N/A'}</div>
          </div>
          <p style="margin-top: 30px; font-style: italic; text-align: center;">Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading students...</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="students-container">
      {/* Header Section */}
      <div className="students-header">
        <h1>Student Records</h1>
        <div className="header-actions">
          <button onClick={handlePrint} className="print-btn">
            🖨️ Print
          </button>
          <button onClick={() => navigate('/dashboard')} className="add-student-btn">
            Add New Student
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'grid' ? 'active-toggle' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
          Grid View
        </button>
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active-toggle' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/>
          </svg>
          List View
        </button>
      </div>

      {/* Filters Section */}
      <div className="students-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-container">
          <select
            value={selectedClass}
            onChange={handleClassFilter}
            className="class-filter"
          >
            <option value="">All Classes</option>
            <option value="Play Group">Play Group</option>
            <option value="Nursery">Nursery</option>
            <option value="LKG">LKG</option>
            <option value="UKG">UKG</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Print Area - Hidden content for printing */}
      <div id="print-area" style={{ display: 'none' }}>
        <div className="print-header">
          <h1>ASTRA PRESCHOOL - STUDENT RECORDS</h1>
          <p>5th Cross, Ganesh Temple Road, Sadashiv Nagar, Tumkur - 572101</p>
          <p>Phone: 9008887230</p>
          <p>Generated on: {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</p>
          <hr />
        </div>
        {filteredStudents.map(student => (
          <div key={student._id} className="student-item">
            <div className="student-name">{student.name} - {student.class}</div>
            <div className="student-details">
              <p><strong>Parent:</strong> {student.parentName || 'N/A'} | <strong>Phone:</strong> {student.parentPhone || 'N/A'}</p>
              <p><strong>Fee Paid:</strong> ₹{student.feePaid} | <strong>Balance:</strong> ₹{student.balance}</p>
              <p><strong>Date:</strong> {new Date(student.date).toLocaleDateString()}</p>
              {student.address && <p><strong>Address:</strong> {student.address}</p>}
              {student.bloodGroup && <p><strong>Blood Group:</strong> {student.bloodGroup}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Students Grid */}
      <div className={`students-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {filteredStudents.length === 0 ? (
          <div className="no-students"><p>No students found</p></div>
        ) : (
          filteredStudents.map(student => (
            <div key={student._id} className="student-card">
              <div className="student-photo">
                {student.studentPhoto ? (
                  <img src={student.studentPhoto} alt={student.name} />
                ) : (
                  <div className="photo-placeholder"><span>📷</span></div>
                )}
              </div>
              <div className="student-info">
                <h3>{student.name}</h3>
                <p className="student-class">{student.class}</p>
                <p><strong>Parent:</strong> {student.parentName || 'N/A'}</p>
                <p><strong>Phone:</strong> {student.parentPhone || 'N/A'}</p>
                <p><strong>Fee Paid:</strong> ₹{student.feePaid}</p>
                <p><strong>Balance:</strong> ₹{student.balance}</p>
                <p><strong>Date:</strong> {new Date(student.date).toLocaleDateString()}</p>
              </div>
              <div className="student-actions">
                <button onClick={() => openStudentDetails(student)} className="details-btn">
                  View Details
                </button>
                <button onClick={() => downloadReceipt(student)} className="receipt-btn">
                  Download Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Student Details */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button onClick={closeStudentDetails} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {isEditMode ? (
                <div className="student-details-form">
                  {["name","class","parentName","parentPhone","address","dateOfBirth","bloodGroup","feePaid","balance","date","allergies"].map(f => (
                    <div className="detail-row" key={f}>
                      <label>{f.charAt(0).toUpperCase() + f.slice(1)}:</label>
                      <input
                        name={f}
                        type={f.includes("date") ? "date" : "text"}
                        value={editForm[f] || ''}
                        onChange={handleEditChange}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="student-detail-photo">
                    {selectedStudent.studentPhoto ? (
                      <img src={selectedStudent.studentPhoto} alt={selectedStudent.name} />
                    ) : (
                      <div className="photo-placeholder-large"><span>📷</span></div>
                    )}
                  </div>
                  <div className="student-details">
                    {["Name","Class","Date of Birth","Blood Group","Address","Parent Name","Parent Phone","Fee Paid","Balance","Payment Date","Allergies/Medical Notes"].map((label, idx) => {
                      const keyMap = {
                        0: "name", 1: "class", 2: "dateOfBirth",
                        3: "bloodGroup", 4: "address", 5: "parentName",
                        6: "parentPhone", 7: "feePaid", 8: "balance",
                        9: "date", 10: "allergies"
                      };
                      const val = selectedStudent[keyMap[idx]];
                      const display = keyMap[idx]==="date" || keyMap[idx]==="dateOfBirth"
                        ? val ? new Date(val).toLocaleDateString() : 'N/A'
                        : val || 'N/A';
                      return (
                        <div className="detail-row" key={label}>
                          <label>{label}:</label><span>{display}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button onClick={handleUpdateStudent} className="details-btn">Save</button>
                  <button onClick={() => setIsEditMode(false)} className="close-modal-btn">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => downloadReceipt(selectedStudent)} className="receipt-btn">Download Receipt</button>
                  <button onClick={() => handleStudentPrint(selectedStudent)} className="details-btn">🖨️ Print</button>
                  <button onClick={() => setIsEditMode(true)} className="details-btn">Edit</button>
                  <button onClick={() => handleDeleteStudent(selectedStudent._id)} className="delete-btn">Delete</button>
                  <button onClick={closeStudentDetails} className="close-modal-btn">Close</button>
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