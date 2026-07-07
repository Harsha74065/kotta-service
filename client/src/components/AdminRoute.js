import React, { useLayoutEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading, setActiveAdminToken } = useAuth();

  // Set admin token before child components fetch data (useLayoutEffect runs first)
  useLayoutEffect(() => {
    if (isAdminAuthenticated) {
      setActiveAdminToken();
    }
  }, [isAdminAuthenticated, setActiveAdminToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;
