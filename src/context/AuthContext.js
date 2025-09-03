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
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const res = await api.get('/api/auth/verify');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Admin registration (existing functionality)
  const register = async ({ username, password, name, email }) => {
    try {
      await api.post('/api/auth/register', { username, password, name, email });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // NEW: Parent registration with OTP
  const sendOTP = async (phone, carrier) => {
    try {
      const res = await api.post('/api/auth/send-otp', { phone, carrier });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const verifyOTPAndRegister = async ({ phone, otp, name, password, carrier }) => {
    try {
      const res = await api.post('/api/auth/verify-otp-register', {
        phone, otp, name, password, carrier
      });
      return { success: true, message: res.data.message, studentsLinked: res.data.studentsLinked };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const resendOTP = async (phone, carrier) => {
    try {
      const res = await api.post('/api/auth/resend-otp', { phone, carrier });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  // NEW: Get available carriers
  const getCarriers = async () => {
    try {
      const res = await api.get('/api/auth/carriers');
      return { success: true, carriers: res.data.carriers };
    } catch (error) {
      console.error('Error fetching carriers:', error);
      // Return default carriers if API fails
      return { 
        success: true, 
        carriers: [
          { value: 'airtel', label: 'Airtel' },
          { value: 'jio', label: 'Jio' },
          { value: 'vodafone', label: 'Vodafone' },
          { value: 'tmobile', label: 'T-Mobile' },
          { value: 'verizon', label: 'Verizon' },
          { value: 'att', label: 'AT&T' },
          { value: 'sprint', label: 'Sprint' }
        ]
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // NEW: Role checking utilities
  const isAdmin = () => user?.role === 'admin';
  const isParent = () => user?.role === 'parent';
  const hasStudents = () => user?.studentIds?.length > 0;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP,
    getCarriers,
    isAdmin,
    isParent,
    hasStudents
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
