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
      
      // 🔧 FIX: Handle both response formats
      let token, userData;
      
      if (response.data.success) {
        // New format: { success: true, token, user }
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.token) {
        // Old format: { token, user }
        token = response.data.token;
        userData = response.data.user;
      } else {
        console.error('❌ Invalid response format:', response.data);
        return { success: false, message: 'Invalid response from server' };
      }
      
      if (!token || !userData) {
        console.error('❌ Missing token or user data:', { token: !!token, userData: !!userData });
        return { success: false, message: 'Invalid response from server' };
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
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
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
      return { success: true, message: response.data.message };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Cannot connect to server.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please try again later.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
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

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};