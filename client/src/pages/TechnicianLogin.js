import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const TechnicianLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { technicianLogin, isTechAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in as technician, redirect to dashboard
  useEffect(() => {
    if (isTechAuthenticated) {
      navigate('/technician/dashboard', { replace: true });
    }
  }, [isTechAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await technicianLogin(email, password);
    
    if (result.success) {
      navigate('/technician/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <BuildIcon sx={{ fontSize: 50, color: '#1976d2' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Technician Login
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Login to view your assigned services and customer details
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              placeholder="Enter your email"
              InputLabelProps={{ shrink: true }}
              autoComplete="new-email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              placeholder="Enter your password"
              InputLabelProps={{ shrink: true }}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Technician Login'}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} to="/">
                ← Back to Home
              </MuiLink>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TechnicianLogin;
