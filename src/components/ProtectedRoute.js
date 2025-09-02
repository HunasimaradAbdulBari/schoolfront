import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAdmin, isParent } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin()) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This page is only accessible to administrators.</p>
          <p>Current role: {user.role}</p>
        </div>
      );
    }
    
    if (requiredRole === 'parent' && !isParent()) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This page is only accessible to parents.</p>
          <p>Current role: {user.role}</p>
        </div>
      );
    }
  }

  // Handle default redirect for the root route
  if (window.location.hash === '#/' || window.location.hash === '#') {
    if (isAdmin()) {
      return <Navigate to="/students" replace />;
    } else if (isParent()) {
      return <Navigate to="/parent-dashboard" replace />;
    }
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
