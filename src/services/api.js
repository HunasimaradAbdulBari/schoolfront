// src/services/api.js - Complete API service with your URLs
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with your backend URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('🔍 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('✅ API Response Success:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      responseData: error.response?.data,
      isNetworkError: !error.response,
      isTimeoutError: error.code === 'ECONNABORTED'
    });
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('🕐 Request timeout - server may be slow');
    }
    
    if (!error.response) {
      console.error('🌐 Network error - cannot reach server at:', API_BASE_URL);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - clearing tokens and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on auth pages
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API health check function
export const checkAPIHealth = async () => {
  try {
    console.log('🔍 Checking API health at:', API_BASE_URL);
    const response = await api.get('/health');
    console.log('✅ API Health Check Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    throw error;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const healthData = await checkAPIHealth();
    return {
      success: true,
      message: 'Connection successful',
      data: healthData
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection failed',
      error: error.message
    };
  }
};