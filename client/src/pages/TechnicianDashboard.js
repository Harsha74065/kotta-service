import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Build as BuildIcon,
  Logout as LogoutIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { techUser: user, techLogout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState([]);
  const [dueServices, setDueServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [qrDialog, setQrDialog] = useState({ open: false, data: null, loading: false });
  const [adminScanner, setAdminScanner] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [servicesRes, dueRes, statsRes, scannerRes] = await Promise.all([
        axios.get(`${API_URL}/technician/my-services`),
        axios.get(`${API_URL}/technician/due-services`),
        axios.get(`${API_URL}/technician/dashboard`),
        axios.get(`${API_URL}/technician/admin-scanner`)
      ]);
      setServices(servicesRes.data.services);
      setDueServices(dueRes.data.services);
      setStats(statsRes.data.stats);
      setAdminScanner(scannerRes.data.upi);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    techLogout();
    navigate('/technician/login');
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      await axios.put(`${API_URL}/technician/services/${serviceId}/status`, { status: newStatus });
      setSnackbar({ open: true, message: `Service marked as ${newStatus}!`, severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating status', severity: 'error' });
    }
  };

  const handleShowPaymentQR = async (serviceId) => {
    setQrDialog({ open: true, data: null, loading: true });
    try {
      const response = await axios.get(`${API_URL}/technician/payment-qr/${serviceId}`);
      setQrDialog({ open: true, data: response.data.payment, loading: false });
    } catch (error) {
      setQrDialog({ open: false, data: null, loading: false });
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'No payment assigned for this service yet. Ask admin to create payment.',
        severity: 'warning'
      });
    }
  };

  const handleMarkPaymentCollected = async (serviceId) => {
    try {
      await axios.put(`${API_URL}/technician/payment-collected/${serviceId}`);
      setSnackbar({ open: true, message: 'Payment marked as collected!', severity: 'success' });
      setQrDialog({ open: false, data: null, loading: false });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error marking payment', severity: 'error' });
    }
  };

  const generateUpiUrl = (upiId, name, amount) => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount || ''}&cu=INR&tn=${encodeURIComponent('Service Payment')}`;
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', assigned: 'info', in_progress: 'primary', completed: 'success' };
    return colors[status] || 'default';
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Bar */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <BuildIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Technician Panel
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name} ({user?.specialization || 'General'})
          </Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: '#e3f2fd', borderTop: '3px solid #1976d2' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">{stats?.totalAssigned || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Total Assigned</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: '#fff3e0', borderTop: '3px solid #ff9800' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: '#e65100' }} fontWeight="bold">{stats?.pendingServices || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: '#e8eaf6', borderTop: '3px solid #3f51b5' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: '#283593' }} fontWeight="bold">{stats?.inProgressServices || 0}</Typography>
                <Typography variant="body2" color="text.secondary">In Progress</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: '#e8f5e9', borderTop: '3px solid #4caf50' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: '#1b5e20' }} fontWeight="bold">{stats?.completedServices || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: '#fce4ec', borderTop: '3px solid #e91e63' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: '#880e4f' }} fontWeight="bold">{stats?.dueSoon || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Due Soon</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Admin Payment Scanner - Always Visible */}
        {adminScanner && (
          <Paper 
            elevation={4} 
            sx={{ 
              mb: 3, 
              p: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <QrCodeIcon sx={{ fontSize: 35 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Payment Scanner
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  Show this QR code to the customer for payment. All payments go directly to admin account.
                </Typography>
                <Chip 
                  label={`UPI: ${adminScanner.upi_id}`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}
                />
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  {adminScanner.name || 'Admin'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
                  💡 Customer can scan using PhonePe / GPay / Paytm / any UPI app
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  bgcolor: 'white', 
                  p: 2, 
                  borderRadius: 3, 
                  display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  <QRCodeSVG
                    value={`upi://pay?pa=${adminScanner.upi_id}&pn=${encodeURIComponent(adminScanner.name || 'Admin')}&cu=INR`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                    Scan to Pay
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
            <Tab label={`All Services (${services.length})`} icon={<BuildIcon />} iconPosition="start" />
            <Tab label={`Due Soon (${dueServices.length})`} icon={<WarningIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* All Services Tab */}
        {tabValue === 0 && (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow 
                    key={service.id}
                    sx={{ 
                      '&:hover': { bgcolor: '#f5f5f5' },
                      bgcolor: service.status === 'pending' ? '#fffde7' : 
                               service.status === 'in_progress' ? '#e3f2fd' : 'inherit'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <strong>{service.customer_name}</strong>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        <a href={`tel:${service.customer_phone}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                          {service.customer_phone}
                        </a>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" color="action" />
                        {service.customer_address}
                      </Box>
                    </TableCell>
                    <TableCell><strong>{service.service_type}</strong></TableCell>
                    <TableCell>{service.company}</TableCell>
                    <TableCell>{service.description || '-'}</TableCell>
                    <TableCell>
                      {service.service_date
                        ? new Date(service.service_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {service.due_date ? (
                        <Chip
                          icon={<ScheduleIcon />}
                          label={new Date(service.due_date).toLocaleDateString()}
                          size="small"
                          color={getDaysUntilDue(service.due_date) <= 7 ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(service.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {service.payment_amount ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            ₹{service.payment_amount}
                          </Typography>
                          <Chip
                            label={service.payment_status}
                            color={service.payment_status === 'completed' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                        {service.status !== 'completed' && (
                          <FormControl size="small" sx={{ minWidth: 130 }}>
                            <Select
                              value=""
                              displayEmpty
                              onChange={(e) => handleStatusChange(service.id, e.target.value)}
                              renderValue={() => <span style={{ color: '#999' }}>Update</span>}
                            >
                              <MenuItem value="in_progress">Mark In Progress</MenuItem>
                              <MenuItem value="completed">Mark Completed</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                        {service.status === 'completed' && (
                          <Chip icon={<CheckIcon />} label="Done" color="success" size="small" />
                        )}
                        {/* Collect Payment Button */}
                        {service.payment_amount && service.payment_status !== 'completed' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            startIcon={<QrCodeIcon />}
                            onClick={() => handleShowPaymentQR(service.id)}
                            sx={{ mt: 0.5, fontSize: '0.7rem' }}
                          >
                            Collect ₹{service.payment_amount}
                          </Button>
                        )}
                        {service.payment_status === 'completed' && (
                          <Chip icon={<PaymentIcon />} label="Paid" color="success" size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary" variant="h6">
                        No services assigned to you yet.
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Admin will assign services to you. Check back later!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Due Soon Tab */}
        {tabValue === 1 && (
          <Box>
            {dueServices.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CheckIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No upcoming due services!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All your services are up to date.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {dueServices.map((service) => {
                  const daysLeft = getDaysUntilDue(service.due_date);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          borderLeft: `4px solid ${daysLeft <= 3 ? '#f44336' : daysLeft <= 7 ? '#ff9800' : '#1976d2'}`,
                          '&:hover': { boxShadow: 6 }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {service.service_type}
                            </Typography>
                            <Chip 
                              label={daysLeft <= 0 ? 'OVERDUE' : `${daysLeft} days`}
                              color={daysLeft <= 3 ? 'error' : daysLeft <= 7 ? 'warning' : 'info'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {service.company}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2"><strong>{service.customer_name}</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <PhoneIcon fontSize="small" color="primary" />
                              <a href={`tel:${service.customer_phone}`} style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
                                {service.customer_phone}
                              </a>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <HomeIcon fontSize="small" color="action" />
                              <Typography variant="body2">{service.customer_address}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon fontSize="small" color="warning" />
                              <Typography variant="body2">
                                Due: <strong>{new Date(service.due_date).toLocaleDateString()}</strong>
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Payment QR Dialog */}
        <Dialog
          open={qrDialog.open}
          onClose={() => setQrDialog({ open: false, data: null, loading: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <QrCodeIcon sx={{ fontSize: 50, color: '#9c27b0' }} />
            <Typography variant="h5" fontWeight="bold">Collect Payment</Typography>
            <Typography variant="body2" color="text.secondary">
              Show this QR code to the customer
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            {qrDialog.loading ? (
              <CircularProgress />
            ) : qrDialog.data ? (
              <>
                {/* Customer Info */}
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="body1">
                    <strong>Customer:</strong> {qrDialog.data.display_customer_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Service:</strong> {qrDialog.data.service_type} ({qrDialog.data.company})
                  </Typography>
                </Paper>

                {/* Amount */}
                <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                  ₹{qrDialog.data.amount?.toFixed(2)}
                </Typography>

                {/* QR Code */}
                {qrDialog.data.qr_upi_id ? (
                  <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '3px solid #9c27b0', display: 'inline-block', mb: 2 }}>
                    <QRCodeSVG
                      value={generateUpiUrl(qrDialog.data.qr_upi_id, qrDialog.data.qr_name, qrDialog.data.amount)}
                      size={250}
                      level="H"
                      includeMargin
                    />
                  </Box>
                ) : (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    No UPI ID configured. Contact admin to set up payment scanner.
                  </Alert>
                )}

                <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                  {qrDialog.data.qr_name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {qrDialog.data.qr_upi_id}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Chip
                  label="Payment goes to Admin Account"
                  color="secondary"
                  sx={{ mb: 1, fontWeight: 'bold' }}
                />

                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Ask customer to scan this QR code using PhonePe / GPay / Paytm
                </Typography>
              </>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            {qrDialog.data && qrDialog.data.status !== 'completed' && (
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckIcon />}
                onClick={() => handleMarkPaymentCollected(qrDialog.data.service_id)}
              >
                Payment Received ✓
              </Button>
            )}
            <Button
              onClick={() => setQrDialog({ open: false, data: null, loading: false })}
              variant="outlined"
              size="large"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Info Box */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
          <Typography variant="body2" color="primary">
            💡 <strong>Technician Info:</strong> You can see all your assigned services with customer details. 
            Click on a phone number to call the customer. Use the <strong>"Collect ₹"</strong> button to show the payment QR code to the customer.
            After the customer pays, click <strong>"Payment Received"</strong> to mark it done.
          </Typography>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicianDashboard;
