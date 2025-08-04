// Debug version - replace your config.js temporarily
// export const API_BASE_URL = "https://astrawebserver.onrender.com ";
// For local development
export const API_BASE_URL = "http://localhost:5000";

// For production (comment out during local development)
// export const API_BASE_URL = "https://astrawebserver.onrender.com";

// Debug: Log the configuration
// console.log('🔍 Frontend Config:', {
//   API_BASE_URL,
//   currentOrigin: window.location.origin,
//   currentHostname: window.location.hostname,
//   currentProtocol: window.location.protocol,
//   userAgent: navigator.userAgent
// });

// // Test the backend URL
// fetch(`${API_BASE_URL}/health`)
//   .then(response => response.json())
//   .then(data => {
//     console.log('✅ Backend health check successful:', data);
//   })
//   .catch(error => {
//     console.error('❌ Backend health check failed:', error);
//   });