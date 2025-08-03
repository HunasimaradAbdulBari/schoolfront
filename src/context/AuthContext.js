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
      
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        console.error('❌ Invalid response format:', response.data);
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
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      
      return { success: false, message: errorMessage };
    }
  };

  const register = async ({ username, password, name, email }) => {
    try {
      console.log('🔍 Frontend register attempt:', { username, name, email });
      
      const requestData = { username, password, name };
      if (email) {
        requestData.email = email;
      }
      
      await api.post('/api/auth/register', requestData);
      console.log('✅ Registration successful');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
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