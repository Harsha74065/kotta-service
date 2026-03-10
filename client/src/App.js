import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import TechnicianRoute from './components/TechnicianRoute';

// Pages
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import TechnicianLogin from './pages/TechnicianLogin';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Technician Login */}
            <Route path="/technician/login" element={<TechnicianLogin />} />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Protected Technician Dashboard */}
            <Route
              path="/technician/*"
              element={
                <TechnicianRoute>
                  <TechnicianDashboard />
                </TechnicianRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
