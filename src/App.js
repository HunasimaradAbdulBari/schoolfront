import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AstraLandingPage from './components/AstraLandingPage';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Layout from './components/Layout';
import useSessionTimeout from './utils/sessionTimeout'; // ✅ Add this line
import './App.css';

function App() {
  useSessionTimeout(); // ✅ Activate the timeout logic

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
            <Route path="/astralandingpage" element={<AstraLandingPage/>} />
              <Route index element={<Navigate to="/AstraLandingPage" replace />} />

              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;