import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const DueServicesView = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueServices();
  }, []);

  const fetchDueServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/due-services`);
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching due services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Split into urgent (within 7 days) and upcoming
  const urgentServices = services.filter(s => getDaysUntilDue(s.due_date) <= 7);
  const upcomingServices = services.filter(s => getDaysUntilDue(s.due_date) > 7);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Due Service Reminders
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track when customers need follow-up services. Set due dates when creating services to get reminders here.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fce4ec', borderLeft: '4px solid #e91e63' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Urgent (within 7 days)</Typography>
              <Typography variant="h3" sx={{ color: '#880e4f', fontWeight: 'bold' }}>
                {urgentServices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Upcoming (8-30 days)</Typography>
              <Typography variant="h3" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                {upcomingServices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total Due Services</Typography>
              <Typography variant="h3" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                {services.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {services.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No upcoming due services!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set due dates when creating services to track follow-up reminders here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e91e63' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Days Left</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Technician</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Service</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service, index) => {
                const daysLeft = getDaysUntilDue(service.due_date);
                return (
                  <TableRow 
                    key={service.id}
                    sx={{ 
                      bgcolor: daysLeft <= 3 ? '#ffebee' : daysLeft <= 7 ? '#fff8e1' : 'inherit',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color={daysLeft <= 7 ? 'error' : 'warning'} />
                        <strong>{new Date(service.due_date).toLocaleDateString()}</strong>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={daysLeft <= 7 ? <WarningIcon /> : <ScheduleIcon />}
                        label={daysLeft <= 0 ? 'OVERDUE' : `${daysLeft} days`}
                        color={daysLeft <= 3 ? 'error' : daysLeft <= 7 ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <strong>{service.display_customer_name}</strong>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        {service.display_customer_phone}
                      </Box>
                    </TableCell>
                    <TableCell>{service.service_type}</TableCell>
                    <TableCell>{service.company}</TableCell>
                    <TableCell>{service.technician_name || 'Not assigned'}</TableCell>
                    <TableCell>
                      {service.completed_date
                        ? new Date(service.completed_date).toLocaleDateString()
                        : service.service_date
                        ? new Date(service.service_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Paper sx={{ p: 2, mt: 2, bgcolor: '#fce4ec', border: '1px solid #f48fb1' }}>
        <Typography variant="body2" color="error">
          ⚠️ <strong>Important:</strong> Due dates remind you when a customer may need service again (e.g., after 1 year).
          Set due dates when creating services in the Services Management page.
          The technician can also see these reminders in their dashboard.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DueServicesView;
