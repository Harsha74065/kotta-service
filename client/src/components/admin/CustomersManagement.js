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
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const serviceTypes = ['AC', 'Fridge', 'TV', 'Washing Machine', 'Microwave', 'Other'];

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    service_type: '',
    notes: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    service_type: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/customers`);
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', phone: '', email: '', address: '', service_type: '', notes: '' });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone) {
      setError('Name and phone are required');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/customers`, formData);
      fetchCustomers();
      handleClose();
      setSnackbar({ open: true, message: 'Customer added successfully!', severity: 'success' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding customer');
    }
  };

  const handleStartEdit = (customer) => {
    setEditingId(customer.id);
    setEditData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      service_type: customer.service_type || '',
      notes: customer.notes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', phone: '', email: '', address: '', service_type: '', notes: '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/customers/${id}`, editData);
      setEditingId(null);
      fetchCustomers();
      setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating customer', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/admin/customers/${deleteConfirm.id}`);
      fetchCustomers();
      setDeleteConfirm({ open: false, id: null, name: '' });
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting customer', severity: 'error' });
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Customers Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Customer
        </Button>
      </Box>

      {/* Add Customer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth label="Customer Name *" name="name"
              value={formData.name} onChange={handleChange}
              margin="normal" required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth label="Phone Number *" name="phone"
              value={formData.phone} onChange={handleChange}
              margin="normal" required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth label="Email" name="email"
              type="email" value={formData.email} onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth label="Address" name="address"
              value={formData.address} onChange={handleChange}
              margin="normal" multiline rows={2}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth select label="Service Type" name="service_type"
              value={formData.service_type} onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value=""><em>Select Service Type</em></MenuItem>
              {serviceTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Notes" name="notes"
              value={formData.notes} onChange={handleChange}
              margin="normal" multiline rows={2}
              placeholder="Any additional notes about the customer..."
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add Customer</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
              <TableCell><strong>Service Type</strong></TableCell>
              <TableCell><strong>Notes</strong></TableCell>
              <TableCell><strong>Added Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField size="small" name="name" value={editData.name} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    <strong>{customer.name}</strong>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField size="small" name="phone" value={editData.phone} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon fontSize="small" color="primary" />
                      {customer.phone}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField size="small" name="email" value={editData.email} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    customer.email || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField size="small" name="address" value={editData.address} onChange={handleEditChange} variant="outlined" multiline />
                  ) : (
                    customer.address || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField select size="small" name="service_type" value={editData.service_type} onChange={handleEditChange} variant="outlined" sx={{ minWidth: 130 }}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {serviceTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    customer.service_type ? (
                      <Chip label={customer.service_type} color="primary" size="small" variant="outlined" />
                    ) : '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === customer.id ? (
                    <TextField size="small" name="notes" value={editData.notes} onChange={handleEditChange} variant="outlined" multiline />
                  ) : (
                    customer.notes || '-'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(customer.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {editingId === customer.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton color="success" onClick={() => handleSaveEdit(customer.id)}>
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
                        <IconButton color="primary" onClick={() => handleStartEdit(customer)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, id: customer.id, name: customer.name })}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No customers found. Add one to get started.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
        <Typography variant="body2" color="primary">
          💡 <strong>Tip:</strong> Customers are automatically created when you add a new service with a new customer name.
          You can also add customers here directly and select them later when creating services.
        </Typography>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomersManagement;
