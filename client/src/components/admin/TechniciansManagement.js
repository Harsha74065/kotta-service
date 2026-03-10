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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const TechniciansManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
    upi_id: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
    upi_id: ''
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/technicians`);
      setTechnicians(response.data.technicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', email: '', phone: '', specialization: '', password: '', upi_id: '' });
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

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(`${API_URL}/admin/technicians`, formData);
      fetchTechnicians();
      handleClose();
      setSnackbar({ open: true, message: 'Technician added successfully! They can now login.', severity: 'success' });
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding technician');
    }
  };

  const handleStartEdit = (tech) => {
    setEditingId(tech.id);
    setEditData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      specialization: tech.specialization || '',
      password: '', // Don't show existing password
      upi_id: tech.upi_id || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', email: '', phone: '', specialization: '', password: '', upi_id: '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/technicians/${id}`, editData);
      setEditingId(null);
      fetchTechnicians();
      setSnackbar({ open: true, message: 'Technician updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating technician', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/admin/technicians/${deleteConfirm.id}`);
      fetchTechnicians();
      setDeleteConfirm({ open: false, id: null, name: '' });
      setSnackbar({ open: true, message: 'Technician deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting technician', severity: 'error' });
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
        <Typography variant="h4">Technicians Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Technician
        </Button>
      </Box>

      {/* Add Technician Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Technician</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth label="Name" name="name"
              value={formData.name} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Email (Login ID)" name="email" type="email"
              value={formData.email} onChange={handleChange}
              margin="normal" required
              helperText="Technician will use this email to login"
            />
            <TextField
              fullWidth label="Password (for Login)" name="password" type="password"
              value={formData.password} onChange={handleChange}
              margin="normal" required
              helperText="Minimum 6 characters. Technician uses this to login."
            />
            <TextField
              fullWidth label="Phone" name="phone"
              value={formData.phone} onChange={handleChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Specialization" name="specialization"
              value={formData.specialization} onChange={handleChange}
              margin="normal" placeholder="e.g., AC, Fridge, TV"
            />
            <TextField
              fullWidth label="UPI ID (Optional)" name="upi_id"
              value={formData.upi_id} onChange={handleChange}
              margin="normal" placeholder="e.g., techname@paytm"
              helperText="If customer should pay to this technician's UPI"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add Technician</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete technician <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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
              <TableCell><strong>Email (Login ID)</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Specialization</strong></TableCell>
              <TableCell><strong>UPI ID</strong></TableCell>
              <TableCell><strong>New Password</strong></TableCell>
              <TableCell><strong>Added Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {technicians.map((tech) => (
              <TableRow key={tech.id}>
                <TableCell>{tech.id}</TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField size="small" name="name" value={editData.name} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    tech.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField size="small" name="email" type="email" value={editData.email} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    tech.email
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField size="small" name="phone" value={editData.phone} onChange={handleEditChange} variant="outlined" />
                  ) : (
                    tech.phone
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField size="small" name="specialization" value={editData.specialization} onChange={handleEditChange} variant="outlined" placeholder="e.g., AC, Fridge, TV" />
                  ) : (
                    tech.specialization || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField
                      size="small" name="upi_id"
                      value={editData.upi_id} onChange={handleEditChange}
                      variant="outlined" placeholder="e.g., name@paytm"
                    />
                  ) : (
                    <Typography variant="body2" color={tech.upi_id ? 'primary' : 'text.secondary'}>
                      {tech.upi_id || '-'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === tech.id ? (
                    <TextField
                      size="small" name="password" type="password"
                      value={editData.password} onChange={handleEditChange}
                      variant="outlined" placeholder="Leave blank to keep current"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">••••••</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(tech.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  {editingId === tech.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton color="success" onClick={() => handleSaveEdit(tech.id)}>
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
                        <IconButton color="primary" onClick={() => handleStartEdit(tech)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, id: tech.id, name: tech.name })}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {technicians.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No technicians found. Add one to get started.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
        <Typography variant="body2" color="primary">
          💡 <strong>Tip:</strong> When you add a technician, they get a login (email + password). 
          They can login at the Technician Portal to see their assigned services with all customer details and phone numbers.
        </Typography>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TechniciansManagement;
