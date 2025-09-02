import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ParentRegister from './components/ParentRegister';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import ParentDashboard from './components/ParentDashboard';
import PaymentManagement from './components/PaymentManagement';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import useSessionTimeout from './utils/sessionTimeout';
import './App.css';

function App() {
  useSessionTimeout(); // Activate the timeout logic

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/parent-register" element={<ParentRegister />} />
            
            {/* Protected Routes with Layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect based on role */}
              <Route index element={<RoleBasedRedirect />} />
              
              {/* Admin Only Routes */}
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="students" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Students />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="payments" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PaymentManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Parent Only Routes */}
              <Route 
                path="parent-dashboard" 
                element={
                  <ProtectedRoute requiredRole="parent">
                    <ParentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="payment-history" 
                element={
                  <ProtectedRoute requiredRole="parent">
                    <PaymentHistory />
                  </ProtectedRoute>
                } 
              />
              
              {/* Shared Routes (both roles can access) */}
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to handle role-based redirects
const RoleBasedRedirect = () => {
  // This will be handled by the ProtectedRoute component
  return null;
};

// Payment History Component for Parents
const PaymentHistory = () => {
  const [payments, setPayments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const { api } = await import('./services/api');
      const response = await api.get('/api/payments/history');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (payment) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.studentId.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 30px; padding-bottom: 20px; }
          .details { margin: 30px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ASTRA PRESCHOOL</h1>
          <p>Payment Receipt</p>
        </div>
        <div class="details">
          <div class="row"><strong>Receipt:</strong><span>${payment.receiptNumber}</span></div>
          <div class="row"><strong>Student:</strong><span>${payment.studentId.name}</span></div>
          <div class="row"><strong>Amount:</strong><span>₹${payment.amount}</span></div>
          <div class="row"><strong>Date:</strong><span>${new Date(payment.createdAt).toLocaleDateString()}</span></div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${payment.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading payment history...</p></div>;
  }

  return (
    <div className="payment-history-page">
      <h1>Payment History</h1>
      {payments.length === 0 ? (
        <p>No payment history found.</p>
      ) : (
        <div className="payments-list">
          {payments.map(payment => (
            <div key={payment._id} className="payment-card">
              <div className="payment-info">
                <h3>{payment.studentId.name}</h3>
                <p>Receipt: {payment.receiptNumber}</p>
                <p>Amount: ₹{payment.amount}</p>
                <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                <span className={`status ${payment.status}`}>{payment.status.toUpperCase()}</span>
              </div>
              <button onClick={() => downloadReceipt(payment)}>Download Receipt</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// User Profile Component
const UserProfile = () => {
  const { user } = require('./context/AuthContext').useAuth();
  
  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
        {user.studentIds && user.studentIds.length > 0 && (
          <p><strong>Children:</strong> {user.studentIds.length}</p>
        )}
      </div>
    </div>
  );
};

export default App;
