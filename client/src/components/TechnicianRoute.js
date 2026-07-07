import React, { useLayoutEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const TechnicianRoute = ({ children }) => {
  const { isTechAuthenticated, loading, setActiveTechToken } = useAuth();

  // Set tech token before child components fetch data (useLayoutEffect runs first)
  useLayoutEffect(() => {
    if (isTechAuthenticated) {
      setActiveTechToken();
    }
  }, [isTechAuthenticated, setActiveTechToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isTechAuthenticated) {
    return <Navigate to="/technician/login" replace />;
  }

  return children;
};

export default TechnicianRoute;
