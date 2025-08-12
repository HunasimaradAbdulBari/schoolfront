// src/context/AuthContext.js
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

  const login = async (username, password) => {
    try {
      console.log('🔍 Frontend login attempt:', { username });
      
      const response = await api.post('/api/auth/login', { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      console.log('✅ Login response received:', response.data);
      
      // 🔧 ENHANCED: More robust response format handling
      let token, userData;
      
      // Handle new format: { success: true, token, user }
      if (response.data.success && response.data.token && response.data.user) {
        token = response.data.token;
        userData = response.data.user;
      } 
      // Handle old format: { token, user } (without success field)
      else if (response.data.token && response.data.user) {
        token = response.data.token;
        userData = response.data.user;
      }
      // Handle edge case: success true but missing data
      else if (response.data.success === false) {
        console.error('❌ Login failed - server returned success: false');
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
      // Handle unexpected format
      else {
        console.error('❌ Invalid response format:', response.data);
        return { 
          success: false, 
          message: 'Invalid response from server. Please try again.' 
        };
      }
      
      // 🔧 ENHANCED: Strict validation before proceeding
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
      
      // 🔧 ENHANCED: More specific error handling
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
      
      // 🔧 ENHANCED: Handle both response formats for registration too
      if (response.data.success !== false) {
        return { 
          success: true, 
          message: response.data.message || 'Registration successful! Please login.' 
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Registration failed' 
        };
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // 🔧 ENHANCED: Same improved error handling as login
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

  // 🔧 ADDED: Method to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // 🔧 ADDED: Method to refresh user data if needed
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