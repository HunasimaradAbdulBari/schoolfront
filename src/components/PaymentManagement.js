import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/PaymentManagement.css';

const PaymentManagement = () => {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, failed
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reminders, setReminders] = useState({});

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>This page is only accessible to administrators.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/api/payments/history', { params });
      setPayments(response.data.payments || []);
    } catch (error) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/payments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleVerifyPayment = async (paymentId, verified) => {
    try {
      const response = await api.post('/api/payments/verify', {
        paymentId,
        verified
      });

      if (response.data.success) {
        fetchPayments(); // Refresh payments
        fetchStats(); // Refresh stats
        setModalOpen(false);
        alert(`Payment ${verified ? 'verified' : 'rejected'} successfully`);
      }
    } catch (error) {
      alert('Failed to update payment status');
      console.error('Error verifying payment:', error);
    }
  };

  const handleSendReminder = async (studentId) => {
    try {
      setReminders(prev => ({ ...prev, [studentId]: true }));
      
      const response = await api.post('/api/payments/send-reminder', {
        studentId
      });

      if (response.data.success) {
        alert('Payment reminder sent successfully');
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      alert('Failed to send reminder');
      console.error('Error sending reminder:', error);
    } finally {
      setReminders(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1>Payment Management</h1>
        <p>Manage and verify student fee payments</p>
      </div>

      {/* Payment Statistics */}
      <div className="payment-stats">
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-number">₹{stats.monthlyStats?.totalAmount || 0}</div>
          <p>{stats.monthlyStats?.totalPayments || 0} payments</p>
        </div>
        
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-number completed">
            {stats.monthlyStats?.completedPayments || 0}
          </div>
          <p>verified payments</p>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-number pending">
            {payments.filter(p => p.status === 'pending').length}
          </div>
          <p>awaiting verification</p>
        </div>

        <div className="stat-card">
          <h3>Failed</h3>
          <div className="stat-number failed">
            {payments.filter(p => p.status === 'failed').length}
          </div>
          <p>rejected payments</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <h3>Filter Payments</h3>
        <div className="filter-buttons">
          {['all', 'pending', 'completed', 'failed'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="filter-count">
                  {payments.filter(p => p.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Payments List */}
      <div className="payments-section">
        <h3>Payment Records</h3>
        
        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <p>No payments found for the selected filter.</p>
          </div>
        ) : (
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment._id}>
                    <td className="receipt-number">{payment.receiptNumber}</td>
                    <td>
                      <div className="student-info">
                        <strong>{payment.studentId.name}</strong>
                        <small>{payment.studentId.studentId} - {payment.studentId.class}</small>
                      </div>
                    </td>
                    <td>
                      <div className="parent-info">
                        <strong>{payment.parentId.name}</strong>
                        <small>{payment.parentId.phone}</small>
                      </div>
                    </td>
                    <td className="amount">₹{payment.amount}</td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(payment.status) }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="view-btn"
                        onClick={() => openPaymentDetails(payment)}
                      >
                        View
                      </button>
                      
                      {payment.status === 'pending' && (
                        <>
                          <button
                            className="verify-btn"
                            onClick={() => handleVerifyPayment(payment._id, true)}
                          >
                            ✓ Verify
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleVerifyPayment(payment._id, false)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      
                      <button
                        className="reminder-btn"
                        onClick={() => handleSendReminder(payment.studentId._id)}
                        disabled={reminders[payment.studentId._id]}
                      >
                        {reminders[payment.studentId._id] ? 'Sending...' : '📱 Remind'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {modalOpen && selectedPayment && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            
            <div className="payment-details">
              <div className="detail-section">
                <h4>Payment Information</h4>
                <div className="detail-grid">
                  <div><strong>Receipt Number:</strong> {selectedPayment.receiptNumber}</div>
                  <div><strong>Amount:</strong> ₹{selectedPayment.amount}</div>
                  <div><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedPayment.status), marginLeft: '8px' }}
                    >
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Method:</strong> {selectedPayment.method.toUpperCase()}</div>
                  <div><strong>Date:</strong> {new Date(selectedPayment.createdAt).toLocaleString()}</div>
                  {selectedPayment.upiTransactionId && (
                    <div><strong>UPI Transaction ID:</strong> {selectedPayment.upiTransactionId}</div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Student Information</h4>
                <div className="detail-grid">
                  <div><strong>Name:</strong> {selectedPayment.studentId.name}</div>
                  <div><strong>Student ID:</strong> {selectedPayment.studentId.studentId}</div>
                  <div><strong>Class:</strong> {selectedPayment.studentId.class}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Parent Information</h4>
                <div className="detail-grid">
                  <div><strong>Name:</strong> {selectedPayment.parentId.name}</div>
                  <div><strong>Phone:</strong> {selectedPayment.parentId.phone}</div>
                </div>
              </div>

              {selectedPayment.verifiedBy && (
                <div className="detail-section">
                  <h4>Verification Details</h4>
                  <div className="detail-grid">
                    <div><strong>Verified By:</strong> {selectedPayment.verifiedBy.name}</div>
                    <div><strong>Verified On:</strong> {new Date(selectedPayment.verifiedAt).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {selectedPayment.status === 'pending' && (
              <div className="modal-actions">
                <button
                  className="verify-payment-btn"
                  onClick={() => handleVerifyPayment(selectedPayment._id, true)}
                >
                  ✓ Verify Payment
                </button>
                <button
                  className="reject-payment-btn"
                  onClick={() => handleVerifyPayment(selectedPayment._id, false)}
                >
                  ✗ Reject Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
