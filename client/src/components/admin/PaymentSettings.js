import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const serviceTypes = ['Fridge', 'AC', 'TV', 'Washing Machine', 'Microwave', 'Other'];

const PaymentSettings = () => {
  const [settings, setSettings] = useState([]);
  const [upiSettings, setUpiSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [upiOpen, setUpiOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    amount: ''
  });
  const [upiFormData, setUpiFormData] = useState({
    upi_id: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [upiError, setUpiError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    service_type: '',
    amount: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: '', target: '' });
  const [previewUpi, setPreviewUpi] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchUpiSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/payment-settings`);
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    } finally {
      setLoading(false);
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ service_type: '', amount: '' });
    setError('');
  };

  const handleUpiOpen = () => setUpiOpen(true);
  const handleUpiClose = () => {
    setUpiOpen(false);
    setUpiFormData({ upi_id: '', name: '' });
    setUpiError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpiChange = (e) => {
    setUpiFormData({
      ...upiFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API_URL}/admin/payment-settings`, {
        service_type: formData.service_type,
        amount: parseFloat(formData.amount)
      });
      fetchSettings();
      handleClose();
      setSnackbar({ open: true, message: 'Payment setting saved successfully!', severity: 'success' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving payment setting');
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    setUpiError('');

    try {
      await axios.post(`${API_URL}/admin/upi-settings`, {
        upi_id: upiFormData.upi_id,
        name: upiFormData.name
      });
      fetchUpiSettings();
      handleUpiClose();
      setSnackbar({ open: true, message: 'UPI Scanner added successfully!', severity: 'success' });
    } catch (error) {
      setUpiError(error.response?.data?.message || 'Error saving UPI setting');
    }
  };

  const handleActivateUpi = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/upi-settings/${id}/activate`);
      fetchUpiSettings();
      setSnackbar({ open: true, message: 'UPI activated as default scanner!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error activating UPI', severity: 'error' });
    }
  };

  const handleDeleteUpi = async () => {
    try {
      await axios.delete(`${API_URL}/admin/upi-settings/${deleteConfirm.id}`);
      fetchUpiSettings();
      setDeleteConfirm({ open: false, id: null, type: '', target: '' });
      setSnackbar({ open: true, message: 'UPI deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting UPI', severity: 'error' });
      setDeleteConfirm({ open: false, id: null, type: '', target: '' });
    }
  };

  // Start editing
  const handleStartEdit = (setting) => {
    setEditingId(setting.id);
    setEditData({
      service_type: setting.service_type,
      amount: setting.amount.toString()
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ service_type: '', amount: '' });
  };

  // Save edited payment setting
  const handleSaveEdit = async (id) => {
    try {
      await axios.post(`${API_URL}/admin/payment-settings`, {
        service_type: editData.service_type,
        amount: parseFloat(editData.amount)
      });
      setEditingId(null);
      fetchSettings();
      setSnackbar({ open: true, message: 'Payment setting updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating payment setting', severity: 'error' });
    }
  };

  // Delete payment setting
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/admin/payment-settings/${deleteConfirm.id}`);
      fetchSettings();
      setDeleteConfirm({ open: false, id: null, type: '', target: '' });
      setSnackbar({ open: true, message: 'Payment setting deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting payment setting', severity: 'error' });
      setDeleteConfirm({ open: false, id: null, type: '', target: '' });
    }
  };

  const generateUpiUrl = (upiId, name, amount) => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount || ''}&cu=INR&tn=${encodeURIComponent('Service Payment')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ==================== UPI SCANNER SETTINGS ==================== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          UPI Scanner Settings
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleUpiOpen}
        >
          Add UPI Scanner
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add your UPI ID here. Customer will scan this QR code to pay. The <strong>active</strong> UPI will be used by default for all payments.
      </Typography>

      {upiSettings.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No UPI Scanner added yet! Add your UPI ID so customers can scan and pay.
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {upiSettings.map((upi) => (
            <Grid item xs={12} sm={6} md={4} key={upi.id}>
              <Card
                elevation={upi.is_active ? 6 : 2}
                sx={{
                  borderTop: `4px solid ${upi.is_active ? '#4caf50' : '#ccc'}`,
                  position: 'relative',
                  '&:hover': { boxShadow: 6 }
                }}
              >
                <CardContent>
                  {upi.is_active && (
                    <Chip
                      icon={<StarIcon />}
                      label="ACTIVE"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {upi.name}
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
                    {upi.upi_id}
                  </Typography>

                  {/* QR Preview */}
                  <Box sx={{ textAlign: 'center', mb: 2, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #eee' }}>
                    <QRCodeSVG
                      value={generateUpiUrl(upi.upi_id, upi.name, '')}
                      size={150}
                      level="H"
                      includeMargin
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Scan to Pay
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {!upi.is_active && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleActivateUpi(upi.id)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={<QrCodeIcon />}
                      onClick={() => setPreviewUpi(upi)}
                    >
                      Preview QR
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => setDeleteConfirm({ open: true, id: upi.id, type: upi.upi_id, target: 'upi' })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      {/* ==================== PAYMENT AMOUNT SETTINGS ==================== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Payment Amount Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Payment Setting
        </Button>
      </Box>

      {/* Add Payment Setting Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Set Payment Amount</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth
              select
              label="Service Type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              margin="normal"
              required
            >
              <MenuItem value="">Select Service Type</MenuItem>
              {serviceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Amount (₹)"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add UPI Dialog */}
      <Dialog open={upiOpen} onClose={handleUpiClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleUpiSubmit}>
          <DialogTitle>
            <QrCodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Add UPI Scanner
          </DialogTitle>
          <DialogContent>
            {upiError && <Alert severity="error" sx={{ mb: 2 }}>{upiError}</Alert>}
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter your UPI ID (e.g., yourname@paytm, yourphone@ybl, etc.). A QR code will be generated automatically.
            </Alert>
            <TextField
              fullWidth
              label="UPI ID"
              name="upi_id"
              value={upiFormData.upi_id}
              onChange={handleUpiChange}
              margin="normal"
              required
              placeholder="example@paytm or 9876543210@ybl"
              helperText="Your UPI ID from PhonePe, GPay, Paytm, etc."
            />
            <TextField
              fullWidth
              label="Display Name"
              name="name"
              value={upiFormData.name}
              onChange={handleUpiChange}
              margin="normal"
              required
              placeholder="Your Name or Business Name"
              helperText="Name shown on payment screen when customer scans"
            />
            {upiFormData.upi_id && upiFormData.name && (
              <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>QR Preview:</Typography>
                <QRCodeSVG
                  value={generateUpiUrl(upiFormData.upi_id, upiFormData.name, '')}
                  size={180}
                  level="H"
                  includeMargin
                />
                <Typography variant="caption" display="block" color="text.secondary">
                  {upiFormData.name} • {upiFormData.upi_id}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpiClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary">Add Scanner</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* QR Preview Dialog */}
      <Dialog open={!!previewUpi} onClose={() => setPreviewUpi(null)} maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          <Typography variant="h5">Payment QR Code</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4 }}>
          {previewUpi && (
            <>
              <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '2px solid #e0e0e0', display: 'inline-block' }}>
                <QRCodeSVG
                  value={generateUpiUrl(previewUpi.upi_id, previewUpi.name, '')}
                  size={250}
                  level="H"
                  includeMargin
                />
              </Box>
              <Typography variant="h6" sx={{ mt: 2 }}>{previewUpi.name}</Typography>
              <Typography variant="body1" color="primary">{previewUpi.upi_id}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Customer scans this code with any UPI app (PhonePe, GPay, Paytm) to pay
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setPreviewUpi(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, type: '', target: '' })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm.type}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, type: '', target: '' })}>Cancel</Button>
          <Button
            onClick={deleteConfirm.target === 'upi' ? handleDeleteUpi : handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Service Type</strong></TableCell>
              <TableCell><strong>Amount (₹)</strong></TableCell>
              <TableCell><strong>Last Updated</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell>
                  {editingId === setting.id ? (
                    <TextField
                      select
                      size="small"
                      name="service_type"
                      value={editData.service_type}
                      onChange={handleEditChange}
                      variant="outlined"
                      sx={{ minWidth: 150 }}
                    >
                      {serviceTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    setting.service_type
                  )}
                </TableCell>
                <TableCell>
                  {editingId === setting.id ? (
                    <TextField
                      size="small"
                      name="amount"
                      type="number"
                      value={editData.amount}
                      onChange={handleEditChange}
                      variant="outlined"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  ) : (
                    `₹${setting.amount.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  {new Date(setting.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {editingId === setting.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton color="success" onClick={() => handleSaveEdit(setting.id)}>
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
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleStartEdit(setting)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, id: setting.id, type: setting.service_type, target: 'payment' })}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {settings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No payment settings found. Add one to get started.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentSettings;
