import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register'; // ✅ NEW
import Dashboard from './components/Dashboard';
import './App.css';
import { motion } from 'framer-motion';


import AOS from 'aos';
import 'aos/dist/aos.css';

// useEffect(() => {
//   AOS.init({ duration: 2 });
// }, []);



function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* ✅ NEW */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              }
            />
                        {/* <Route
              path="/"
              element={<Navigate to="/dashboard" />}
            /> */}

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
