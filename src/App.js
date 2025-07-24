import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import useSessionTimeout from './utils/sessionTimeout';
import { useAuth } from './context/AuthContext';
import './App.css';

// Component to handle session timeout inside AuthProvider
function AppContent() {
  const { user } = useAuth();
  
  // Only activate session timeout if user is logged in
  useSessionTimeout();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/students" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
        </Route>
        {/* Catch all route - redirect to login if not authenticated, students if authenticated */}
        <Route path="*" element={user ? <Navigate to="/students" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;