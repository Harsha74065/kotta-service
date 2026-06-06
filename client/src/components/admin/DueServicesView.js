import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Chip, Card, CardContent, Grid, Button, IconButton,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Tooltip, Switch, Tabs, Tab, Divider
} from '@mui/material';
import {
  Schedule as ScheduleIcon, Warning as WarningIcon, Phone as PhoneIcon,
  Person as PersonIcon, CheckCircle as CheckIcon, NotificationsActive as BellIcon,
  Settings as SettingsIcon, Add as AddIcon, Delete as DeleteIcon,
  AutoAwesome as AutoIcon, History as HistoryIcon, Refresh as RefreshIcon,
  Edit as EditIcon, Timer as TimerIcon, CalendarMonth as CalendarIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const serviceTypes = ['Fridge', 'AC', 'TV', 'Washing Machine', 'Microwave', 'Other'];

const DueServicesView = () => {
  const [services, setServices] = useState([]);
  const [reminderSettings, setReminderSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reminder settings form
  const [settingDialog, setSettingDialog] = useState({ open: false, data: null });
  const [settingForm, setSettingForm] = useState({ service_type: '', reminder_months: 6 });

  // Customer history dialog
  const [historyDialog, setHistoryDialog] = useState({ open: false, customerId: null, customerName: '' });
  const [customerHistory, setCustomerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dueRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/due-services`),
        axios.get(`${API_URL}/admin/reminder-settings`)
      ]);
      setServices(dueRes.data.services);
      setReminderSettings(settingsRes.data.settings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  // ==================== REMINDER SETTINGS ACTIONS ====================
  const handleSaveSetting = async () => {
    if (!settingForm.service_type || !settingForm.reminder_months) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
      return;
    }
    try {
      await axios.post(`${API_URL}/admin/reminder-settings`, settingForm);
      setSnackbar({ open: true, message: 'Reminder setting saved!', severity: 'success' });
      setSettingDialog({ open: false, data: null });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving setting', severity: 'error' });
    }
  };

  const handleToggleSetting = async (setting) => {
    try {
      await axios.post(`${API_URL}/admin/reminder-settings`, {
        service_type: setting.service_type,
        reminder_months: setting.reminder_months,
        is_active: setting.is_active ? 0 : 1
      });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error toggling', severity: 'error' });
    }
  };

  const handleDeleteSetting = async (id) => {
    if (!window.confirm('Delete this reminder setting?')) return;
    try {
      await axios.delete(`${API_URL}/admin/reminder-settings/${id}`);
      setSnackbar({ open: true, message: 'Setting deleted', severity: 'success' });
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting', severity: 'error' });
    }
  };

  // ==================== CUSTOMER HISTORY ====================
  const handleViewHistory = async (customerId, customerName) => {
    if (!customerId) {
      setSnackbar({ open: true, message: 'No linked customer ID', severity: 'warning' });
      return;
    }
    setHistoryDialog({ open: true, customerId, customerName });
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/customer-history/${customerId}`);
      setCustomerHistory(res.data.services);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Split services
  const now = new Date();
  const overdueServices = services.filter(s => {
    const d = getDaysUntilDue(s.effective_due_date || s.due_date);
    return d !== null && d < 0;
  });
  const urgentServices = services.filter(s => {
    const d = getDaysUntilDue(s.effective_due_date || s.due_date);
    return d !== null && d >= 0 && d <= 7;
  });
  const upcomingServices = services.filter(s => {
    const d = getDaysUntilDue(s.effective_due_date || s.due_date);
    return d !== null && d > 7;
  });
  const autoReminderCount = services.filter(s => s.is_auto_reminder || s.reminder_auto === 1).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading reminders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <BellIcon sx={{ fontSize: 36, color: '#e91e63' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">Service Reminders</Typography>
            <Typography variant="body2" color="text.secondary">
              Auto-reminds you when a customer needs service again (e.g., every 6 months)
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><RefreshIcon /></IconButton></Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <WarningIcon sx={{ fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">{overdueServices.length}</Typography>
              <Typography variant="caption">Overdue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TimerIcon sx={{ fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">{urgentServices.length}</Typography>
              <Typography variant="caption">Within 7 Days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CalendarIcon sx={{ fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">{upcomingServices.length}</Typography>
              <Typography variant="caption">Upcoming</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <AutoIcon sx={{ fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">{autoReminderCount}</Typography>
              <Typography variant="caption">Auto-Reminders</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ScheduleIcon sx={{ fontSize: 28 }} />
              <Typography variant="h4" fontWeight="bold">{services.length}</Typography>
              <Typography variant="caption">Total Due</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<BellIcon />} label={`Due Services (${services.length})`} iconPosition="start" />
          <Tab icon={<SettingsIcon />} label={`Reminder Settings (${reminderSettings.length})`} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ==================== TAB 0: DUE SERVICES ==================== */}
      {tabValue === 0 && (
        <>
          {/* Explanation Banner */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
            <Typography variant="body2" color="success.dark">
              <AutoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              <strong>How Auto-Reminders Work:</strong> When you mark a service as <strong>"Completed"</strong>,
              the system automatically calculates the next service due date based on your Reminder Settings
              (e.g., Fridge → 6 months, AC → 6 months). You'll see it here when it's time to call the customer back!
            </Typography>
          </Paper>

          {services.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No upcoming due services!</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete services to auto-generate reminders, or set due dates manually.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={3}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e91e63' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Days Left</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Completed</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Technician</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service, index) => {
                    const effectiveDue = service.effective_due_date || service.next_due_date || service.due_date;
                    const daysLeft = getDaysUntilDue(effectiveDue);
                    const isAuto = service.is_auto_reminder || service.reminder_auto === 1;
                    const isOverdue = daysLeft !== null && daysLeft < 0;

                    return (
                      <TableRow key={service.id} sx={{
                        bgcolor: isOverdue ? '#ffcdd2'
                          : daysLeft !== null && daysLeft <= 3 ? '#ffebee'
                          : daysLeft !== null && daysLeft <= 7 ? '#fff8e1'
                          : isAuto ? '#f3e5f5' : 'inherit',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {isAuto ? (
                            <Chip icon={<AutoIcon />} label="Auto" size="small"
                              sx={{ bgcolor: '#9c27b0', color: 'white', fontWeight: 'bold' }} />
                          ) : (
                            <Chip label="Manual" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon fontSize="small" color={isOverdue ? 'error' : daysLeft <= 7 ? 'warning' : 'action'} />
                            <strong>{effectiveDue ? new Date(effectiveDue).toLocaleDateString() : '-'}</strong>
                          </Box>
                          {service.reminder_months && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Every {service.reminder_months} months
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={isOverdue ? <WarningIcon /> : <ScheduleIcon />}
                            label={isOverdue ? `OVERDUE ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'TODAY!' : `${daysLeft} days`}
                            color={isOverdue ? 'error' : daysLeft <= 3 ? 'error' : daysLeft <= 7 ? 'warning' : 'info'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
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
                            <Typography variant="body2" sx={{ cursor: 'pointer', color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}
                              onClick={() => navigator.clipboard.writeText(service.display_customer_phone)}>
                              {service.display_customer_phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150 }}>
                          <Typography variant="body2" noWrap title={service.display_customer_address || ''}>
                            {service.display_customer_address || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{service.service_type}</TableCell>
                        <TableCell>{service.company}</TableCell>
                        <TableCell>
                          {service.completed_date
                            ? new Date(service.completed_date).toLocaleDateString()
                            : service.service_date
                            ? new Date(service.service_date).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{service.technician_name || 'Not assigned'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {/* Call via WhatsApp */}
                            {service.display_customer_phone && service.display_customer_phone !== '-' && (
                              <Tooltip title="Message on WhatsApp">
                                <IconButton size="small" color="success"
                                  onClick={() => {
                                    const phone = service.display_customer_phone.replace(/[^0-9]/g, '');
                                    const msg = encodeURIComponent(
                                      `Hi ${service.display_customer_name},\n\nThis is a reminder from ServiceOps. Your ${service.service_type} (${service.company}) service is due. Would you like to schedule a service visit?\n\nThank you!`
                                    );
                                    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
                                  }}>
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {/* View customer history */}
                            {service.customer_id && (
                              <Tooltip title="View Customer History">
                                <IconButton size="small" color="primary"
                                  onClick={() => handleViewHistory(service.customer_id, service.display_customer_name)}>
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
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
              ⚠️ <strong>Important:</strong> Overdue services appear in RED — call the customer ASAP!
              Auto-reminders (purple badge) are set automatically when you complete a service.
              Click the WhatsApp icon to send a reminder message directly.
            </Typography>
          </Paper>
        </>
      )}

      {/* ==================== TAB 1: REMINDER SETTINGS ==================== */}
      {tabValue === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
            <Typography variant="body2" color="primary">
              <SettingsIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              <strong>Configure auto-reminder periods:</strong> Set how many months after completing a service
              the system should remind you to contact the customer again.
              Example: Fridge → 6 months, AC → 6 months, TV → 12 months.
            </Typography>
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">Reminder Settings by Service Type</Typography>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => {
                setSettingForm({ service_type: '', reminder_months: 6 });
                setSettingDialog({ open: true, data: null });
              }}>
              Add Setting
            </Button>
          </Box>

          <Grid container spacing={2}>
            {reminderSettings.map((setting) => (
              <Grid item xs={12} sm={6} md={4} key={setting.id}>
                <Card elevation={3} sx={{
                  borderLeft: `5px solid ${setting.is_active ? '#4caf50' : '#bdbdbd'}`,
                  opacity: setting.is_active ? 1 : 0.6,
                  '&:hover': { boxShadow: 6 }
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{setting.service_type}</Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <TimerIcon color="primary" />
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            {setting.reminder_months} months
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          After completing a {setting.service_type} service, remind after {setting.reminder_months} months
                        </Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <Tooltip title={setting.is_active ? 'Active — click to disable' : 'Disabled — click to enable'}>
                          <Switch checked={!!setting.is_active} color="success"
                            onChange={() => handleToggleSetting(setting)} />
                        </Tooltip>
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small" color="primary"
                            onClick={() => {
                              setSettingForm({ service_type: setting.service_type, reminder_months: setting.reminder_months });
                              setSettingDialog({ open: true, data: setting });
                            }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteSetting(setting.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {reminderSettings.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 60, color: '#bdbdbd' }} />
                  <Typography variant="h6" color="text.secondary">No reminder settings configured</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add settings so the system auto-reminds you when customers need service again
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* ==================== ADD/EDIT SETTING DIALOG ==================== */}
      <Dialog open={settingDialog.open} onClose={() => setSettingDialog({ open: false, data: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#e3f2fd' }}>
          <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#1976d2' }} />
          {settingDialog.data ? 'Edit Reminder' : 'Add Reminder Setting'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField select label="Service Type" fullWidth value={settingForm.service_type}
              disabled={!!settingDialog.data}
              onChange={(e) => setSettingForm(prev => ({ ...prev, service_type: e.target.value }))}>
              {serviceTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField label="Remind After (months)" type="number" fullWidth
              value={settingForm.reminder_months}
              onChange={(e) => setSettingForm(prev => ({ ...prev, reminder_months: parseInt(e.target.value) || 1 }))}
              inputProps={{ min: 1, max: 60 }}
              helperText="How many months after service completion to remind you" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setSettingDialog({ open: false, data: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSetting}>
            {settingDialog.data ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== CUSTOMER HISTORY DIALOG ==================== */}
      <Dialog open={historyDialog.open} onClose={() => setHistoryDialog({ open: false, customerId: null, customerName: '' })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f3e5f5' }}>
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#9c27b0' }} />
          Service History — {historyDialog.customerName}
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : customerHistory.length === 0 ? (
            <Typography color="text.secondary" align="center" py={4}>No service history found</Typography>
          ) : (
            <TableContainer sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Service Type</strong></TableCell>
                    <TableCell><strong>Brand</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Service Date</strong></TableCell>
                    <TableCell><strong>Completed</strong></TableCell>
                    <TableCell><strong>Next Due</strong></TableCell>
                    <TableCell><strong>Technician</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerHistory.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{s.service_type}</TableCell>
                      <TableCell>{s.company}</TableCell>
                      <TableCell>
                        <Chip label={s.status} size="small"
                          color={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'warning' : 'default'} />
                      </TableCell>
                      <TableCell>{s.service_date ? new Date(s.service_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{s.completed_date ? new Date(s.completed_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        {s.next_due_date ? (
                          <Chip icon={<AutoIcon />} label={new Date(s.next_due_date).toLocaleDateString()} size="small"
                            sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }} />
                        ) : s.due_date ? (
                          new Date(s.due_date).toLocaleDateString()
                        ) : '-'}
                      </TableCell>
                      <TableCell>{s.technician_name || '-'}</TableCell>
                      <TableCell>
                        {s.payment_amount ? `₹${s.payment_amount} (${s.payment_status})` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ open: false, customerId: null, customerName: '' })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DueServicesView;
