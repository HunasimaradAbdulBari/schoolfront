// src/services/api.js - Complete API service with FIXED connection issues
import axios from 'axios';
import { API_BASE_URL } from '../config';

// ✅ FIXED: Create axios instance with better settings for production
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // ✅ REDUCED from 30s to 15s for Render.com
  withCredentials: false,
  // ✅ ADDED: Better retry and connection settings
  validateStatus: (status) => status < 500, // Don't reject 4xx errors
  maxRedirects: 3
});

// ✅ ENHANCED: Request interceptor with better error handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ FIXED: Add explicit headers for Render.com compatibility
    config.headers['Accept'] = 'application/json';
    config.headers['Cache-Control'] = 'no-cache';
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('🔍 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// ✅ ENHANCED: Response interceptor with comprehensive error handling
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
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      responseData: error.response?.data,
      isNetworkError: !error.response,
      isTimeoutError: error.code === 'ECONNABORTED'
    });
    
    // ✅ ENHANCED: Better error categorization and handling
    if (error.code === 'ECONNABORTED') {
      console.error('🕐 Request timeout - server may be slow or sleeping');
      error.message = 'Connection timeout. The server might be starting up, please try again in a moment.';
    }
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('🌐 Network error - cannot reach server at:', API_BASE_URL);
      error.message = 'Network error. Cannot connect to server. Please check your internet connection and try again.';
    }
    
    if (error.code === 'ERR_INTERNET_DISCONNECTED') {
      console.error('📡 Internet disconnected');
      error.message = 'Internet connection lost. Please check your network and try again.';
    }
    
    // ✅ ENHANCED: Handle specific HTTP status codes
    if (error.response?.status === 0) {
      console.error('🚫 Status 0 - Server unreachable');
      error.message = 'Server is unreachable. Please try again in a few moments.';
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
    
    // ✅ ADDED: Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('🔥 Server error:', error.response.status);
      error.message = 'Server error. Please try again in a few moments.';
    }
    
    // ✅ ADDED: Handle CORS errors specifically
    if (error.message && error.message.toLowerCase().includes('cors')) {
      console.error('🚫 CORS Error detected');
      error.message = 'Connection blocked by security policy. Please try refreshing the page.';
    }
    
    return Promise.reject(error);
  }
);

// ✅ ENHANCED: API health check function with retry logic
export const checkAPIHealth = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Checking API health at: ${API_BASE_URL} (attempt ${i + 1}/${retries})`);
      const response = await api.get('/health');
      console.log('✅ API Health Check Success:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Health Check Failed (attempt ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        throw error; // Last attempt failed
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
      console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// ✅ ENHANCED: Test connection function with detailed diagnostics
export const testConnection = async () => {
  try {
    console.log('🔍 Running connection diagnostics...');
    console.log('📍 Current location:', window.location.href);
    console.log('🔗 API Base URL:', API_BASE_URL);
    console.log('🌐 Online status:', navigator.onLine);
    
    // ✅ NEW: Try multiple endpoints for better diagnostics
    const tests = [];
    
    // Test 1: Basic health check
    try {
      const healthData = await checkAPIHealth(2);
      tests.push({
        test: 'Health Check',
        status: 'SUCCESS',
        data: healthData
      });
    } catch (error) {
      tests.push({
        test: 'Health Check',
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Test 2: Root endpoint
    try {
      const rootResponse = await api.get('/', { timeout: 10000 });
      tests.push({
        test: 'Root Endpoint',
        status: 'SUCCESS',
        data: rootResponse.data
      });
    } catch (error) {
      tests.push({
        test: 'Root Endpoint',
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Test 3: Connection test endpoint
    try {
      const testResponse = await api.get('/test-connection', { timeout: 10000 });
      tests.push({
        test: 'Connection Test',
        status: 'SUCCESS',
        data: testResponse.data
      });
    } catch (error) {
      tests.push({
        test: 'Connection Test',
        status: 'FAILED',
        error: error.message
      });
    }
    
    // Determine overall status
    const successfulTests = tests.filter(test => test.status === 'SUCCESS').length;
    const overallSuccess = successfulTests > 0;
    
    const result = {
      success: overallSuccess,
      message: overallSuccess 
        ? `Connection successful (${successfulTests}/${tests.length} tests passed)` 
        : 'Connection failed (all tests failed)',
      tests,
      diagnostics: {
        apiBaseUrl: API_BASE_URL,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        timestamp: new Date().toISOString(),
        location: window.location.href
      }
    };
    
    if (overallSuccess) {
      console.log('✅ Connection test completed successfully');
    } else {
      console.error('❌ All connection tests failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message,
      diagnostics: {
        apiBaseUrl: API_BASE_URL,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        timestamp: new Date().toISOString(),
        location: window.location.href
      }
    };
  }
};

// ✅ NEW: Wake up server function for Render.com free tier
export const wakeUpServer = async () => {
  try {
    console.log('⏰ Waking up server...');
    const startTime = Date.now();
    
    // Make a simple request to wake up the server
    const response = await api.get('/', { 
      timeout: 30000 // Longer timeout for wake up
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Server wake up successful in ${duration}ms`);
    
    return {
      success: true,
      duration,
      message: 'Server is awake and ready'
    };
  } catch (error) {
    console.error('❌ Server wake up failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to wake up server'
    };
  }
};

// ✅ NEW: Retry wrapper for important requests
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true
  } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Request attempt ${attempt}/${maxRetries}`);
      const result = await requestFn();
      console.log(`✅ Request succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.log(`❌ Request failed on attempt ${attempt}:`, error.message);
      
      if (attempt === maxRetries) {
        throw error; // Last attempt, re-throw the error
      }
      
      // Calculate delay with exponential backoff if enabled
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};