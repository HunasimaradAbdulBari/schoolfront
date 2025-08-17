// src/context/AuthContext.js - COMPLETE FIXED VERSION with retry logic and better error handling
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, retryRequest, wakeUpServer, testConnection } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, connected, disconnected

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(parsedUser);
        console.log('✅ User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // ✅ NEW: Test connection on startup
    checkConnection();
    setLoading(false);
  }, []);

  // ✅ NEW: Connection check function
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const result = await testConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      
      if (!result.success) {
        console.log('🔄 Connection failed, attempting to wake up server...');
        await wakeUpServer();
        
        // Try connection test again after wake up
        const retryResult = await testConnection();
        setConnectionStatus(retryResult.success ? 'connected' : 'disconnected');
      }
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  // ✅ ENHANCED: Login function with retry logic and server wake-up
  const login = async (username, password) => {
    try {
      console.log('🔍 Frontend login attempt:', { username });
      
      // ✅ ADDED: Check connection first
      if (connectionStatus === 'disconnected') {
        console.log('🔄 Server appears to be asleep, attempting to wake up...');
        await wakeUpServer();
        await checkConnection();
      }
      
      // ✅ ENHANCED: Use retry wrapper for login request
      const response = await retryRequest(async () => {
        return await api.post('/api/auth/login', { 
          username: username.trim(), 
          password: password.trim() 
        });
      }, {
        maxRetries: 3,
        delay: 2000,
        backoff: true
      });
      
      console.log('✅ Login response received:', response.data);
      
      // ✅ Your existing response handling logic (unchanged)
      const { success, token, user: userData, message } = response.data;
      
      if (!success) {
        console.log('❌ Login failed - success is false:', message);
        return { 
          success: false, 
          message: message || 'Login failed' 
        };
      }
      
      if (!token || !userData || !userData._id) {
        console.error('❌ Missing critical data:', { 
          hasToken: !!token, 
          hasUserData: !!userData,
          hasUserId: !!(userData && userData._id)
        });
        return { 
          success: false, 
          message: 'Incomplete login data received. Please try again.' 
        };
      }
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setConnectionStatus('connected'); // Mark as connected after successful login
      
      console.log('✅ Login successful, user set:', userData);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error code:', error.code);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // ✅ ENHANCED: Better error messages for different scenarios
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. The server might be starting up, please wait a moment and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server. Please check your internet connection.';
        setConnectionStatus('disconnected');
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. The server might be starting up, please try again in a moment.';
        setConnectionStatus('disconnected');
      } else if (error.response.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
        setConnectionStatus('disconnected');
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.response.status === 429) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  // ✅ ENHANCED: Register function with retry logic
  const register = async ({ username, password, name, email }) => {
    try {
      console.log('🔍 Frontend register attempt:', { username, name, email });
      
      // ✅ ADDED: Check connection first
      if (connectionStatus === 'disconnected') {
        console.log('🔄 Server appears to be asleep, attempting to wake up...');
        await wakeUpServer();
        await checkConnection();
      }
      
      const requestData = { username, password, name };
      if (email && email.trim()) {
        requestData.email = email.trim();
      }
      
      // ✅ ENHANCED: Use retry wrapper for register request
      const response = await retryRequest(async () => {
        return await api.post('/api/auth/register', requestData);
      }, {
        maxRetries: 3,
        delay: 2000,
        backoff: true
      });
      
      console.log('✅ Registration successful:', response.data);
      
      const { success, message } = response.data;
      
      if (success !== false) {
        setConnectionStatus('connected'); // Mark as connected after successful registration
        return { 
          success: true, 
          message: message || 'Registration successful! Please login.' 
        };
      } else {
        return { 
          success: false, 
          message: message || 'Registration failed' 
        };
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // ✅ ENHANCED: Better error messages for different scenarios
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. The server might be starting up, please wait a moment and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server. Please check your internet connection.';
        setConnectionStatus('disconnected');
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. The server might be starting up, please try again in a moment.';
        setConnectionStatus('disconnected');
      } else if (error.response.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
        setConnectionStatus('disconnected');
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.response.status === 429) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    console.log('🔍 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('✅ Logout complete');
  };

  // Method to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // Method to refresh user data if needed
  const refreshUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('❌ Error refreshing user data:', error);
        logout();
        return null;
      }
    }
    return null;
  };

  // ✅ NEW: Retry connection function for UI
  const retryConnection = async () => {
    await checkConnection();
    return connectionStatus;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    refreshUser,
    connectionStatus, // ✅ NEW: Expose connection status
    retryConnection, // ✅ NEW: Expose retry function
    checkConnection  // ✅ NEW: Expose check function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};