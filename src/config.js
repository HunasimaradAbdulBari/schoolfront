



// src/config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://schoolback-1.onrender.com' 
    : 'http://localhost:10000');

export { API_BASE_URL };

