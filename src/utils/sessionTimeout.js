// src/utils/sessionTimeout.js
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Session timeout duration (40 minutes in milliseconds)
  const SESSION_TIMEOUT = 40 * 60 * 1000; // 40 minutes
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  // Reset the session timer
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Only set timers if user is logged in AND not on login/register pages
    if (user && location.pathname !== '/login' && location.pathname !== '/register') {
      // Set warning timeout (35 minutes)
      warningTimeoutRef.current = setTimeout(() => {
        if (user && location.pathname !== '/login' && location.pathname !== '/register') {
          const confirmStay = window.confirm(
            'Your session will expire in 5 minutes due to inactivity. Do you want to continue?'
          );
          if (confirmStay) {
            resetTimer(); // Reset timer if user wants to continue
          } else {
            handleLogout();
          }
        }
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Set main timeout (40 minutes)
      timeoutRef.current = setTimeout(() => {
        if (user && location.pathname !== '/login' && location.pathname !== '/register') {
          handleLogout();
        }
      }, SESSION_TIMEOUT);
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear timeouts first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }

      // Show session expired message
      alert('Your session has expired due to inactivity. Please login again.');
      
      // Logout user
      logout();
      
      // Navigate to login with hash routing
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during session timeout logout:', error);
      // Force navigation even if logout fails
      window.location.hash = '#/login';
    }
  };

  // Activity event handler
  const handleActivity = () => {
    // Only reset timer if user is logged in and not on auth pages
    if (user && location.pathname !== '/login' && location.pathname !== '/register') {
      resetTimer();
    }
  };

  useEffect(() => {
    // Only start session timeout if user is logged in and not on auth pages
    if (user && location.pathname !== '/login' && location.pathname !== '/register') {
      // List of events to track for user activity
      const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click'
      ];

      // Add event listeners
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Start the timer
      resetTimer();

      // Cleanup function
      return () => {
        // Remove event listeners
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });

        // Clear timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
      };
    } else {
      // Clear timeouts if user is not logged in or on auth pages
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    }
  }, [user, location.pathname]); // Re-run when user login state or route changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);
};

export default useSessionTimeout;