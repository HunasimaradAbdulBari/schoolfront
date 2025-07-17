import React, { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleClassFilter = (e) => setSelectedClass(e.target.value);

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

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="students-container">
      <div className="students-header">
        <h1>Student Records</h1>
        <button onClick={() => navigate('/dashboard')} className="add-student-btn">
          Add New Student
        </button>
      </div>

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

      {error && <div className="error-message">{error}</div>}

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div className="no-students">
            <p>No students found</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student._id} className="student-card">
              <div className="student-photo">
                {student.studentPhoto ? (
                  <img src={student.studentPhoto} alt={student.name} />
                ) : (
                  <div className="photo-placeholder">
                    <span>📷</span>
                  </div>
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
                <button 
                  onClick={() => openStudentDetails(student)} 
                  className="details-btn"
                >
                  View Details
                </button>
                <button 
                  onClick={() => downloadReceipt(student)} 
                  className="receipt-btn"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button onClick={closeStudentDetails} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="student-detail-photo">
                {selectedStudent.studentPhoto ? (
                  <img src={selectedStudent.studentPhoto} alt={selectedStudent.name} />
                ) : (
                  <div className="photo-placeholder-large">
                    <span>📷</span>
                  </div>
                )}
              </div>
              
              <div className="student-details">
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{selectedStudent.name}</span>
                </div>
                <div className="detail-row">
                  <label>Class:</label>
                  <span>{selectedStudent.class}</span>
                </div>
                <div className="detail-row">
                  <label>Date of Birth:</label>
                  <span>{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Blood Group:</label>
                  <span>{selectedStudent.bloodGroup || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Address:</label>
                  <span>{selectedStudent.address || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Parent Name:</label>
                  <span>{selectedStudent.parentName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Parent Phone:</label>
                  <span>{selectedStudent.parentPhone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Fee Paid:</label>
                  <span>₹{selectedStudent.feePaid}</span>
                </div>
                <div className="detail-row">
                  <label>Balance:</label>
                  <span>₹{selectedStudent.balance}</span>
                </div>
                <div className="detail-row">
                  <label>Payment Date:</label>
                  <span>{new Date(selectedStudent.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <label>Allergies/Medical Notes:</label>
                  <span>{selectedStudent.allergies || 'None'}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => downloadReceipt(selectedStudent)} className="download-btn">
                Download Receipt
              </button>
              <br />
              <button onClick={() => handleUpdateStudent(true)} className="details-btn">Edit</button>
              <br />
                    <button onClick={() => handleDeleteStudent(selectedStudent._id)} className="close-modal-btn">Delete</button>
                    <br />
              <button onClick={closeStudentDetails} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;