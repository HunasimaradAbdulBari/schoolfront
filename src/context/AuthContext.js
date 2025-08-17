// src/context/AuthContext.js - FIXED LOGIN ISSUE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  // 🔧 FIXED: Simplified and corrected login function
  const login = async (username, password) => {
    try {
      console.log('🔍 Frontend login attempt:', { username });
      
      const response = await api.post('/api/auth/login', { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      console.log('✅ Login response received:', response.data);
      
      // 🔧 FIXED: Your backend returns { success: true, token, user }
      const { success, token, user: userData, message } = response.data;
      
      // Check if login was successful
      if (!success) {
        console.log('❌ Login failed - success is false:', message);
        return { 
          success: false, 
          message: message || 'Login failed' 
        };
      }
      
      // Validate that we have token and user data
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
      
      console.log('✅ Login successful, user set:', userData);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error code:', error.code);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server. Please check your internet connection.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again later.';
      } else if (error.response.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
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

  const register = async ({ username, password, name, email }) => {
    try {
      console.log('🔍 Frontend register attempt:', { username, name, email });
      
      const requestData = { username, password, name };
      if (email && email.trim()) {
        requestData.email = email.trim();
      }
      
      const response = await api.post('/api/auth/register', requestData);
      console.log('✅ Registration successful:', response.data);
      
      // 🔧 FIXED: Handle registration response properly
      const { success, message } = response.data;
      
      if (success !== false) {
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
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server. Please check your internet connection.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and try again later.';
      } else if (error.response.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
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

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};