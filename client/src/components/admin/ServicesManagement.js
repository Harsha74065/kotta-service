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
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const serviceTypes = ['Fridge', 'AC', 'TV', 'Washing Machine', 'Microwave', 'Other'];

const companyBrands = [
  'Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Bosch',
  'Voltas', 'Daikin', 'Blue Star', 'Carrier', 'Hitachi', 'Panasonic',
  'Sony', 'Toshiba', 'Sharp', 'Philips', 'TCL', 'Xiaomi', 'OnePlus',
  'IFB', 'Siemens', 'Electrolux', 'Videocon', 'Sansui', 'Micromax',
  'Lloyd', 'Crompton', 'Bajaj', 'Havells', 'Orient', 'Usha',
  'Kenstar', 'Morphy Richards', 'Prestige', 'Butterfly', 'Pigeon',
  'Maharaja Whiteline', 'Kent', 'Eureka Forbes', 'Aquaguard',
  'BPL', 'Croma', 'Realme', 'Vivo', 'Oppo', 'Other'
];

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    service_type: '', company: '', description: '', service_date: '', due_date: '',
    customer_name: '', customer_phone: '', customer_address: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: '' });

  // Add Service Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addData, setAddData] = useState({
    customer_id: '', customer_name: '', customer_phone: '', customer_address: '',
    service_type: '', company: '', description: '',
    service_date: '', technician_id: '', due_date: ''
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchTechnicians();
    fetchCustomers();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/services`);
      setServices(response.data.services);
    } catch (error) {
      setError('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/technicians`);
      setTechnicians(response.data.technicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/customers`);
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Add Service handlers
  const handleAddDialogOpen = () => {
    setAddData({
      customer_id: '', customer_name: '', customer_phone: '', customer_address: '',
      service_type: '', company: '', description: '',
      service_date: '', technician_id: '', due_date: ''
    });
    setAddDialogOpen(true);
  };

  const handleAddChange = (e) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };

  const handleAddService = async () => {
    if (!addData.customer_name || !addData.service_type || !addData.company) {
      setSnackbar({ open: true, message: 'Please fill Customer Name, Service Type, and Company', severity: 'error' });
      return;
    }
    setAddLoading(true);
    try {
      await axios.post(`${API_URL}/admin/services`, addData);
      setAddDialogOpen(false);
      fetchServices();
      fetchCustomers(); // Refresh customers (new customer may have been auto-created)
      setSnackbar({ open: true, message: 'Service created successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error creating service', severity: 'error' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/services/${serviceId}/status`, { status: newStatus });
      fetchServices();
      setSnackbar({ open: true, message: 'Status updated successfully!', severity: 'success' });
    } catch (error) {
      setError('Error updating status');
    }
  };

  const handleTechnicianAssign = async (serviceId, technicianId) => {
    try {
      await axios.put(`${API_URL}/admin/services/${serviceId}/assign`, { technician_id: technicianId });
      fetchServices();
      setSnackbar({ open: true, message: 'Technician assigned successfully!', severity: 'success' });
    } catch (error) {
      setError('Error assigning technician');
    }
  };

  const handleStartEdit = (service) => {
    setEditingId(service.id);
    setEditData({
      service_type: service.service_type,
      company: service.company || '',
      description: service.description || '',
      service_date: service.service_date ? service.service_date.split('T')[0] : '',
      due_date: service.due_date ? service.due_date.split('T')[0] : '',
      customer_name: service.display_customer_name || service.customer_name || '',
      customer_phone: service.display_customer_phone || service.customer_phone || '',
      customer_address: service.display_customer_address || service.customer_address || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/services/${id}`, editData);
      setEditingId(null);
      fetchServices();
      setSnackbar({ open: true, message: 'Service updated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating service', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/admin/services/${deleteConfirm.id}`);
      fetchServices();
      setDeleteConfirm({ open: false, id: null, type: '' });
      setSnackbar({ open: true, message: 'Service deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting service', severity: 'error' });
      setDeleteConfirm({ open: false, id: null, type: '' });
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Services Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddDialogOpen} sx={{ borderRadius: 2 }}>
          Add Service
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Add Service Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Service</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              freeSolo
              options={customers.map((c) => ({ label: `${c.name} (${c.phone})`, id: c.id, name: c.name, phone: c.phone, address: c.address }))}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
              inputValue={addData.customer_name}
              onInputChange={(event, newValue) => {
                setAddData({ ...addData, customer_name: newValue, customer_id: '' });
              }}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'object') {
                  setAddData({
                    ...addData,
                    customer_id: newValue.id,
                    customer_name: newValue.name,
                    customer_phone: newValue.phone || '',
                    customer_address: newValue.address || ''
                  });
                } else {
                  setAddData({ ...addData, customer_id: '', customer_name: newValue || '' });
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Customer Name *" placeholder="Type name or select existing customer" InputLabelProps={{ shrink: true }} fullWidth />
              )}
            />
            <TextField
              label="Customer Phone" name="customer_phone"
              value={addData.customer_phone} onChange={handleAddChange}
              fullWidth InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Customer Address" name="customer_address"
              value={addData.customer_address} onChange={handleAddChange}
              fullWidth multiline rows={2} InputLabelProps={{ shrink: true }}
            />
            <TextField
              select label="Service Type *" name="service_type"
              value={addData.service_type} onChange={handleAddChange}
              fullWidth InputLabelProps={{ shrink: true }}
            >
              <MenuItem value=""><em>Select Service Type</em></MenuItem>
              {serviceTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <Autocomplete
              freeSolo options={companyBrands}
              inputValue={addData.company}
              onInputChange={(event, newValue) => {
                setAddData({ ...addData, company: newValue });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Company/Brand *" placeholder="Type or select brand" InputLabelProps={{ shrink: true }} fullWidth />
              )}
            />
            <TextField
              label="Description" name="description"
              value={addData.description} onChange={handleAddChange}
              fullWidth multiline rows={3} placeholder="Describe the issue..."
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Service Date" name="service_date" type="datetime-local"
              value={addData.service_date} onChange={handleAddChange}
              fullWidth InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Next Due Date (for follow-up reminder)" name="due_date" type="date"
              value={addData.due_date} onChange={handleAddChange}
              fullWidth InputLabelProps={{ shrink: true }}
              helperText="Set when the customer may need service again (e.g., after 1 year)"
            />
            <TextField
              select label="Assign Technician" name="technician_id"
              value={addData.technician_id} onChange={handleAddChange}
              fullWidth InputLabelProps={{ shrink: true }}
            >
              <MenuItem value=""><em>None (Assign Later)</em></MenuItem>
              {technicians.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  {tech.name} {tech.specialization ? `(${tech.specialization})` : ''} - {tech.phone}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained" disabled={addLoading}>
            {addLoading ? 'Creating...' : 'Create Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, type: '' })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete service <strong>#{deleteConfirm.id} ({deleteConfirm.type})</strong>? This will also delete related payments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, type: '' })}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Service Type</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Technician</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Service Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Payment</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => {
              const daysLeft = getDaysUntilDue(service.due_date);
              return (
                <TableRow key={service.id} sx={{ bgcolor: daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? '#fff8e1' : 'inherit' }}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="customer_name" value={editData.customer_name} onChange={handleEditChange} variant="outlined" />
                    ) : (
                      <strong>{service.display_customer_name || service.customer_name || '-'}</strong>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="customer_phone" value={editData.customer_phone} onChange={handleEditChange} variant="outlined" />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="primary" />
                        {service.display_customer_phone || service.customer_phone || '-'}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField select size="small" name="service_type" value={editData.service_type} onChange={handleEditChange} variant="outlined" sx={{ minWidth: 120 }}>
                        {serviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      service.service_type
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="company" value={editData.company} onChange={handleEditChange} variant="outlined" />
                    ) : (
                      service.company
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="description" value={editData.description} onChange={handleEditChange} variant="outlined" multiline />
                    ) : (
                      service.description || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={service.technician_id || ''}
                        onChange={(e) => handleTechnicianAssign(service.id, e.target.value)}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) return <span style={{ color: '#999' }}>Select Technician</span>;
                          const tech = technicians.find(t => t.id === selected);
                          return tech ? tech.name : 'Select Technician';
                        }}
                      >
                        <MenuItem value=""><em>None (Unassign)</em></MenuItem>
                        {technicians.map((tech) => (
                          <MenuItem key={tech.id} value={tech.id}>
                            {tech.name} {tech.specialization ? `(${tech.specialization})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select value={service.status} onChange={(e) => handleStatusChange(service.id, e.target.value)}>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="assigned">Assigned</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="service_date" type="date" value={editData.service_date} onChange={handleEditChange} variant="outlined" InputLabelProps={{ shrink: true }} />
                    ) : (
                      service.service_date ? new Date(service.service_date).toLocaleDateString() : '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <TextField size="small" name="due_date" type="date" value={editData.due_date} onChange={handleEditChange} variant="outlined" InputLabelProps={{ shrink: true }} />
                    ) : service.due_date ? (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={new Date(service.due_date).toLocaleDateString()}
                        size="small"
                        color={daysLeft !== null && daysLeft <= 7 ? 'error' : daysLeft !== null && daysLeft <= 30 ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {service.payment_amount
                      ? `₹${service.payment_amount} (${service.payment_status})`
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {editingId === service.id ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton color="success" onClick={() => handleSaveEdit(service.id)}>
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
                        <Tooltip title="Edit Service">
                          <IconButton color="primary" onClick={() => handleStartEdit(service)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Service">
                          <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, id: service.id, type: service.service_type })}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No services found. Click "Add Service" to create one.</Typography>
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

export default ServicesManagement;
