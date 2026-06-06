import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Build as BuildIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as ActiveIcon,
  Warning as WarningIcon,
  NotificationsActive as AlertIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowIcon,
  AutoFixHigh as SmartIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dueServices, setDueServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, dueRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard`),
        axios.get(`${API_URL}/admin/due-services`)
      ]);
      setStats(statsRes.data.stats);
      setDueServices(dueRes.data.services);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Split due services (use effective_due_date from auto-reminders)
  const getEffectiveDue = (s) => s.effective_due_date || s.next_due_date || s.due_date;
  // Completed visits should not show as OVERDUE/URGENT on the dashboard (due list still includes them for history / next_due_date)
  const isOpenService = (s) => s.status !== 'completed';
  const overdueServices = dueServices.filter(
    s => isOpenService(s) && getDaysUntilDue(getEffectiveDue(s)) <= 0
  );
  const urgentServices = dueServices.filter(s => {
    if (!isOpenService(s)) return false;
    const days = getDaysUntilDue(getEffectiveDue(s));
    return days > 0 && days <= 7;
  });
  const upcomingServices = dueServices.filter(s => {
    const days = getDaysUntilDue(getEffectiveDue(s));
    return days > 7 && days <= 30;
  });

  const statCards = [
    {
      title: 'Total Services',
      value: stats?.totalServices || 0,
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/admin/services',
      message: `You have ${stats?.totalServices || 0} total services. Navigating to Services...`
    },
    {
      title: 'Active Services',
      value: stats?.activeServices || 0,
      icon: <ActiveIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      path: '/admin/services',
      message: `${stats?.activeServices || 0} services are currently active. Navigating to Services...`
    },
    {
      title: 'Completed',
      value: stats?.completedServices || 0,
      icon: <CheckIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/admin/services',
      message: `${stats?.completedServices || 0} services completed. Navigating to Services...`
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/admin/customers',
      message: `You have ${stats?.totalCustomers || 0} customers. Navigating to Customers...`
    },
    {
      title: 'Technicians',
      value: stats?.totalTechnicians || 0,
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/admin/technicians',
      message: `${stats?.totalTechnicians || 0} technicians registered. Navigating to Technicians...`
    },
    {
      title: 'Due Soon',
      value: stats?.dueSoon || 0,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      path: '/admin/due-services',
      message: stats?.dueSoon > 0
        ? `⚠️ ${stats?.dueSoon} services are due soon! Navigating to Due Reminders...`
        : '✅ No services due soon. Navigating to Due Reminders...'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/admin/payments',
      message: `Total revenue: ₹${stats?.totalRevenue?.toFixed(2) || '0.00'}. Navigating to Payments...`
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* ============ ALERT NOTIFICATIONS ============ */}

      {/* OVERDUE Services Alert - RED */}
      {overdueServices.length > 0 && (
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningIcon fontSize="large" />}
          sx={{ mb: 2, borderRadius: 2, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.85 } } }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/due-services')} endIcon={<ArrowIcon />}>
              View All
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {overdueServices.length} OVERDUE Service{overdueServices.length > 1 ? 's' : ''}!
          </AlertTitle>
          {overdueServices.slice(0, 3).map((s, i) => (
            <Typography key={i} variant="body2">
              • <strong>{s.display_customer_name}</strong> — {s.service_type} ({s.company}) — Due: {new Date(getEffectiveDue(s)).toLocaleDateString()} — Phone: {s.display_customer_phone}
              {s.is_auto_reminder ? ' 🤖 Auto' : ''}
            </Typography>
          ))}
          {overdueServices.length > 3 && (
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              ...and {overdueServices.length - 3} more overdue services
            </Typography>
          )}
        </Alert>
      )}

      {/* URGENT Services Alert (within 7 days) - ORANGE */}
      {urgentServices.length > 0 && (
        <Alert
          severity="warning"
          variant="filled"
          icon={<AlertIcon fontSize="large" />}
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/due-services')} endIcon={<ArrowIcon />}>
              View All
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {urgentServices.length} Service{urgentServices.length > 1 ? 's' : ''} Due Within 7 Days!
          </AlertTitle>
          {urgentServices.slice(0, 3).map((s, i) => {
            const days = getDaysUntilDue(getEffectiveDue(s));
            return (
              <Typography key={i} variant="body2">
                • <strong>{s.display_customer_name}</strong> — {s.service_type} ({s.company}) — Due in <strong>{days} day{days !== 1 ? 's' : ''}</strong> ({new Date(getEffectiveDue(s)).toLocaleDateString()}) — Phone: {s.display_customer_phone}
                {s.is_auto_reminder ? ' 🤖 Auto' : ''}
              </Typography>
            );
          })}
          {urgentServices.length > 3 && (
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              ...and {urgentServices.length - 3} more urgent services
            </Typography>
          )}
        </Alert>
      )}

      {/* UPCOMING Services Alert (8-30 days) - BLUE */}
      <Collapse in={alertOpen && upcomingServices.length > 0}>
        <Alert
          severity="info"
          icon={<ScheduleIcon fontSize="large" />}
          sx={{ mb: 2, borderRadius: 2, border: '1px solid #90caf9' }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => navigate('/admin/due-services')} endIcon={<ArrowIcon />}>
                View All
              </Button>
              <IconButton size="small" color="inherit" onClick={() => setAlertOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {upcomingServices.length} Service{upcomingServices.length > 1 ? 's' : ''} Due in Next 30 Days
          </AlertTitle>
          {upcomingServices.slice(0, 3).map((s, i) => {
            const days = getDaysUntilDue(getEffectiveDue(s));
            return (
              <Typography key={i} variant="body2">
                • <strong>{s.display_customer_name}</strong> — {s.service_type} — Due in {days} days ({new Date(getEffectiveDue(s)).toLocaleDateString()})
                {s.is_auto_reminder ? ' 🤖 Auto' : ''}
              </Typography>
            );
          })}
          {upcomingServices.length > 3 && (
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              ...and {upcomingServices.length - 3} more upcoming services
            </Typography>
          )}
        </Alert>
      </Collapse>

      {/* No due services - All Good */}
      {dueServices.length === 0 && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckIcon />}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>All Clear!</AlertTitle>
          No services due in the next 30 days. Everything is on track!
        </Alert>
      )}

      {/* ============ STAT CARDS ============ */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderTop: `4px solid ${card.color}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 8,
                  transform: 'translateY(-4px)',
                  bgcolor: `${card.color}08`
                }
              }}
              onClick={() => {
                setSnackbar({ open: true, message: card.message, severity: 'info' });
                setTimeout(() => navigate(card.path), 800);
              }}
            >
              <Box sx={{ color: card.color, mb: 2 }}>
                {card.icon}
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {card.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ============ DUE SERVICES QUICK VIEW ============ */}
      {dueServices.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="error">
              <AlertIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Upcoming Due Services
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => navigate('/admin/due-services')}
              endIcon={<ArrowIcon />}
            >
              View All Reminders
            </Button>
          </Box>
          <Grid container spacing={2}>
            {dueServices.slice(0, 6).map((service) => {
              const effectiveDue = getEffectiveDue(service);
              const daysLeft = getDaysUntilDue(effectiveDue);
              const isOverdue = daysLeft <= 0;
              const isUrgent = daysLeft > 0 && daysLeft <= 7;
              const isAuto = service.is_auto_reminder || service.reminder_auto === 1;
              const borderColor = isOverdue ? '#f44336' : isUrgent ? '#ff9800' : isAuto ? '#9c27b0' : '#1976d2';

              return (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderLeft: `5px solid ${borderColor}`,
                      '&:hover': { boxShadow: 6 },
                      bgcolor: isOverdue ? '#fff5f5' : isUrgent ? '#fffbf0' : isAuto ? '#faf5ff' : '#f8fbff'
                    }}
                  >
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {service.service_type} — {service.company}
                        </Typography>
                        <Box display="flex" gap={0.5}>
                          {isAuto && (
                            <Chip icon={<SmartIcon />} label="Auto" size="small"
                              sx={{ bgcolor: '#9c27b0', color: 'white' }} />
                          )}
                          <Chip
                            icon={isOverdue ? <WarningIcon /> : <ScheduleIcon />}
                            label={isOverdue ? 'OVERDUE' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
                            color={isOverdue ? 'error' : isUrgent ? 'warning' : 'info'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>{service.display_customer_name}</strong></Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        <Typography
                          variant="body2"
                          sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => {
                            navigator.clipboard.writeText(service.display_customer_phone);
                          }}
                          title="Click to copy phone number"
                        >
                          {service.display_customer_phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <ScheduleIcon fontSize="small" color={isOverdue ? 'error' : 'warning'} />
                        <Typography variant="body2" color={isOverdue ? 'error' : 'text.secondary'}>
                          Due: <strong>{new Date(effectiveDue).toLocaleDateString()}</strong>
                          {isAuto && service.reminder_months ? ` (every ${service.reminder_months}mo)` : ''}
                        </Typography>
                      </Box>
                      {service.technician_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BuildIcon fontSize="small" color="action" />
                          <Typography variant="body2">Tech: {service.technician_name}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Snackbar for card click messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '0.95rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardHome;
