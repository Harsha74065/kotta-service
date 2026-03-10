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
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const PaymentsView = () => {
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [upiSettings, setUpiSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', status: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({ service_id: '', amount: '', status: 'pending' });
  const [createError, setCreateError] = useState('');

  const [qrDialog, setQrDialog] = useState({ open: false, payment: null });

  useEffect(() => {
    fetchPayments();
    fetchServices();
    fetchPaymentSettings();
    fetchUpiSettings();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/payments`);
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/services`);
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/payment-settings`);
      setPaymentSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchUpiSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/upi-settings`);
      setUpiSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', completed: 'success', failed: 'error' };
    return colors[status] || 'default';
  };

  const getActiveAdminUpi = () => {
    return upiSettings.find(u => u.is_active) || upiSettings[0] || null;
  };

  const generateUpiUrl = (upiId, name, amount) => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount || ''}&cu=INR&tn=${encodeURIComponent('Service Payment')}`;
  };

  const handleStartEdit = (payment) => {
    setEditingId(payment.id);
    setEditData({ amount: payment.amount.toString(), status: payment.status });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ amount: '', status: '' });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    try {
      const adminUpi = getActiveAdminUpi();
      await axios.put(`${API_URL}/admin/payments/${id}`, {
        amount: parseFloat(editData.amount),
        status: editData.status,
        pay_to: 'admin',
        upi_id: adminUpi?.upi_id || null
      });
      setEditingId(null);
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating payment', severity: 'error' });
    }
  };

  const handleCreateOpen = () => {
    setCreateOpen(true);
    setCreateData({ service_id: '', amount: '', status: 'pending' });
    setCreateError('');
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'service_id') {
      const selectedService = services.find(s => s.id === parseInt(value));
      if (selectedService) {
        const setting = paymentSettings.find(ps => ps.service_type === selectedService.service_type);
        setCreateData({ ...createData, service_id: value, amount: setting ? setting.amount.toString() : createData.amount });
        return;
      }
    }
    setCreateData({ ...createData, [name]: value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!createData.service_id || !createData.amount) {
      setCreateError('Please select a service and enter an amount');
      return;
    }
    try {
      const adminUpi = getActiveAdminUpi();
      await axios.post(`${API_URL}/admin/payments`, {
        service_id: parseInt(createData.service_id),
        amount: parseFloat(createData.amount),
        status: createData.status,
        pay_to: 'admin',
        upi_id: adminUpi?.upi_id || null
      });
      handleCreateClose();
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment created successfully!', severity: 'success' });
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Error creating payment');
    }
  };

  const handleShowQr = (payment) => {
    const upiId = payment.upi_id || getActiveAdminUpi()?.upi_id;
    if (!upiId) {
      setSnackbar({ open: true, message: 'No UPI ID configured! Go to Payment Settings → Add UPI Scanner first.', severity: 'error' });
      return;
    }
    setQrDialog({ open: true, payment });
  };

  const servicesWithoutPayment = services.filter(
    service => !payments.some(payment => payment.service_id === service.id)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Payments Overview</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen} color="primary">
          Create Payment
        </Button>
      </Box>

      {upiSettings.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ No UPI Scanner configured! Go to <strong>Payment Settings</strong> → <strong>Add UPI Scanner</strong> to set up your payment QR code.
        </Alert>
      )}

      {/* Create Payment Dialog */}
      <Dialog open={createOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle>Create Payment for Service</DialogTitle>
          <DialogContent>
            {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
            <TextField
              fullWidth select label="Select Service" name="service_id"
              value={createData.service_id} onChange={handleCreateChange}
              margin="normal" required InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">-- Select a Service --</MenuItem>
              {servicesWithoutPayment.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  #{service.id} - {service.service_type} ({service.company}) - {service.display_customer_name || service.customer_name || 'Unknown'}
                  {service.technician_name ? ` [Tech: ${service.technician_name}]` : ''}
                </MenuItem>
              ))}
              {servicesWithoutPayment.length === 0 && (
                <MenuItem value="" disabled>All services already have payments</MenuItem>
              )}
            </TextField>
            <TextField
              fullWidth label="Amount (₹)" name="amount" type="number"
              value={createData.amount} onChange={handleCreateChange}
              margin="normal" required
              inputProps={{ min: 0, step: 0.01 }}
              InputLabelProps={{ shrink: true }}
              helperText="Amount is auto-filled from Payment Settings if available"
            />

            {/* Admin Scanner Info */}
            {getActiveAdminUpi() ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                💳 Customer will pay to: <strong>{getActiveAdminUpi().name}</strong> ({getActiveAdminUpi().upi_id})
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ No active UPI scanner! Go to Payment Settings → Add UPI Scanner first.
              </Alert>
            )}

            {getActiveAdminUpi() && createData.amount && (
              <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Payment QR Preview:</Typography>
                <QRCodeSVG
                  value={generateUpiUrl(getActiveAdminUpi().upi_id, getActiveAdminUpi().name, createData.amount)}
                  size={150}
                  level="H"
                  includeMargin
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  {getActiveAdminUpi().name} • ₹{createData.amount}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth select label="Payment Status" name="status"
              value={createData.status} onChange={handleCreateChange}
              margin="normal" InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Create Payment</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog.open} onClose={() => setQrDialog({ open: false, payment: null })} maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          <Typography variant="h5">Payment QR Code</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4 }}>
          {qrDialog.payment && (() => {
            const adminUpi = getActiveAdminUpi();
            const upiId = adminUpi?.upi_id;
            const upiName = adminUpi?.name || 'Service Company';
            return upiId ? (
              <>
                <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '2px solid #e0e0e0', display: 'inline-block' }}>
                  <QRCodeSVG
                    value={generateUpiUrl(upiId, upiName, qrDialog.payment.amount)}
                    size={250}
                    level="H"
                    includeMargin
                  />
                </Box>
                <Typography variant="h6" sx={{ mt: 2 }}>₹{qrDialog.payment.amount.toFixed(2)}</Typography>
                <Typography variant="body1" fontWeight="bold">{upiName}</Typography>
                <Typography variant="body2" color="primary">{upiId}</Typography>
                <Chip
                  label="Payment goes to Admin Account"
                  color="secondary"
                  sx={{ mt: 1, fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Customer: {qrDialog.payment.display_customer_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Service: {qrDialog.payment.service_type} ({qrDialog.payment.company})
                </Typography>
              </>
            ) : (
              <Alert severity="error">No UPI Scanner configured! Go to Payment Settings → Add UPI Scanner first.</Alert>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setQrDialog({ open: false, payment: null })} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Service</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Method</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>
                  <strong>{payment.display_customer_name || payment.customer_name || '-'}</strong><br />
                  <small>{payment.display_customer_phone || payment.customer_phone || ''}</small>
                </TableCell>
                <TableCell>
                  {payment.service_type}<br />
                  <small style={{ color: '#666' }}>({payment.company})</small>
                </TableCell>
                <TableCell>
                  {editingId === payment.id ? (
                    <TextField
                      size="small" name="amount" type="number"
                      value={editData.amount} onChange={handleEditChange}
                      variant="outlined" inputProps={{ min: 0, step: 0.01 }}
                      sx={{ width: 100 }}
                    />
                  ) : (
                    <Typography fontWeight="bold" color="primary">₹{payment.amount.toFixed(2)}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === payment.id ? (
                    <TextField
                      select size="small" name="status"
                      value={editData.status} onChange={handleEditChange}
                      variant="outlined" sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </TextField>
                  ) : (
                    <Chip label={payment.status} color={getStatusColor(payment.status)} size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={payment.payment_method || 'Manual'} size="small" color="default" variant="outlined" />
                </TableCell>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {editingId === payment.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton color="success" onClick={() => handleSaveEdit(payment.id)}>
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton color="default" onClick={handleCancelEdit}>
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Show QR Code">
                        <IconButton color="secondary" onClick={() => handleShowQr(payment)}>
                          <QrCodeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Payment">
                        <IconButton color="primary" onClick={() => handleStartEdit(payment)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No payments found. Click "Create Payment" to add one.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsView;
