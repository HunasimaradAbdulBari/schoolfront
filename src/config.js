// src/config.js - Complete configuration with your exact URLs

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Set API base URL based on environment with your exact URLs
export const API_BASE_URL = isDevelopment 
  ? "http://localhost:5000"                    // Local development backend
  : "https://astrawebserver.onrender.com";     // Your production backend URL

// Debug logging (only in development)
if (isDevelopment) {
  console.log('🔍 Frontend Config (Development):', {
    API_BASE_URL,
    currentOrigin: window.location.origin,
    isDevelopment,
    frontendURL: 'http://localhost:3000',
    backendURL: API_BASE_URL
  });
} else {
  console.log('🔍 Frontend Config (Production):', {
    API_BASE_URL,
    currentOrigin: window.location.origin,
    isDevelopment,
    frontendURL: 'https://astrapre-school.onrender.com',
    backendURL: API_BASE_URL
  });
}

// Export complete configuration
export const APP_CONFIG = {
  API_BASE_URL,
  TIMEOUT: 30000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  URLS: {
    FRONTEND_LOCAL: 'http://localhost:3000',
    FRONTEND_PRODUCTION: 'https://astrapre-school.onrender.com',
    BACKEND_LOCAL: 'http://localhost:5000',
    BACKEND_PRODUCTION: 'https://astrawebserver.onrender.com'
  }
};