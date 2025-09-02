import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import UpiPayment from './UpiPayment';
import '../styles/ParentDashboard.css';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchPaymentHistory();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      setError('Failed to fetch student data');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/api/payments/history');
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePayFees = (student) => {
    setSelectedStudent(student);
    setPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
    setPaymentModalOpen(false);
    setSelectedStudent(null);
    fetchStudents(); // Refresh student data
    fetchPaymentHistory(); // Refresh payment history
  };

  const downloadReceipt = (payment) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.studentId.name}</title>
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
          <div class="receipt-row"><strong>Receipt Number:</strong><span>${payment.receiptNumber}</span></div>
          <div class="receipt-row"><strong>Student ID:</strong><span>${payment.studentId.studentId || 'N/A'}</span></div>
          <div class="receipt-row"><strong>Student Name:</strong><span>${payment.studentId.name}</span></div>
          <div class="receipt-row"><strong>Class:</strong><span>${payment.studentId.class}</span></div>
          <div class="receipt-row"><strong>Parent Name:</strong><span>${user.name}</span></div>
          <div class="receipt-row"><strong>Amount Paid:</strong><span>₹${payment.amount}</span></div>
          <div class="receipt-row"><strong>Payment Method:</strong><span>UPI</span></div>
          <div class="receipt-row"><strong>Payment Date:</strong><span>${new Date(payment.createdAt).toLocaleDateString('en-IN')}</span></div>
          <div class="receipt-row"><strong>Status:</strong><span>${payment.status.toUpperCase()}</span></div>
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
    link.download = `Receipt_${payment.receiptNumber}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading your children's data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchStudents}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <p>Manage your children's school fees and view payment history</p>
      </div>

      {students.length === 0 ? (
        <div className="no-students">
          <h2>No Students Found</h2>
          <p>No students are linked to your account. Please contact the school administration.</p>
        </div>
      ) : (
        <>
          {/* Students Overview */}
          <div className="students-section">
            <h2>Your Children</h2>
            <div className="students-grid">
              {students.map(student => (
                <div key={student._id} className="student-card">
                  <div className="student-header">
                    <h3>{student.name}</h3>
                    <span className="student-id">ID: {student.studentId}</span>
                    <span className="student-class">{student.class}</span>
                  </div>
                  
                  <div className="fee-info">
                    <div className="fee-item">
                      <span className="label">Fee Paid:</span>
                      <span className="amount paid">₹{student.feePaid || 0}</span>
                    </div>
                    <div className="fee-item">
                      <span className="label">Balance:</span>
                      <span className={`amount ${student.balance > 0 ? 'pending' : 'cleared'}`}>
                        ₹{student.balance || 0}
                      </span>
                    </div>
                  </div>

                  <div className="student-actions">
                    {student.balance > 0 ? (
                      <button 
                        className="pay-btn"
                        onClick={() => handlePayFees(student)}
                      >
                        Pay Fees (₹{student.balance})
                      </button>
                    ) : (
                      <button className="paid-btn" disabled>
                        Fees Paid ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="payment-history-section">
            <h2>Recent Payment History</h2>
            {paymentHistory.length === 0 ? (
              <p>No payment history found.</p>
            ) : (
              <div className="payment-history">
                {paymentHistory.slice(0, 5).map(payment => (
                  <div key={payment._id} className="payment-item">
                    <div className="payment-info">
                      <h4>{payment.studentId.name}</h4>
                      <p>Receipt: {payment.receiptNumber}</p>
                      <p>Date: {new Date(payment.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">₹{payment.amount}</span>
                      <span className={`status status-${payment.status}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <button 
                      className="download-btn"
                      onClick={() => downloadReceipt(payment)}
                      title="Download Receipt"
                    >
                      📄 Receipt
                    </button>
                  </div>
                ))}
                
                {paymentHistory.length > 5 && (
                  <div className="view-all">
                    <p>Showing recent 5 payments. Total: {paymentHistory.length}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* UPI Payment Modal */}
      {paymentModalOpen && selectedStudent && (
        <UpiPayment
          student={selectedStudent}
          onClose={() => setPaymentModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
