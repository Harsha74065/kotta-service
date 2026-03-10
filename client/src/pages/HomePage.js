import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Build as BuildIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const HomePage = () => {
  // Open in a new separate browser tab
  const openAdminPortal = () => {
    window.open('/admin/login', '_blank');
  };

  const openTechnicianPortal = () => {
    window.open('/technician/login', '_blank');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <BuildIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Service Company Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Complete Service Tracking & Technician Management System
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StorageIcon fontSize="small" />
              <Typography variant="body2">Database Storage</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">Customer Records</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon fontSize="small" />
              <Typography variant="body2">Due Date Reminders</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Login Cards */}
      <Container maxWidth="md" sx={{ mt: -4, mb: 6, flexGrow: 1 }}>
        <Grid container spacing={4}>
          {/* Admin Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={6} sx={{ textAlign: 'center', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ py: 5 }}>
                <Box sx={{ bgcolor: '#fce4ec', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <AdminIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Admin Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Manage services, customers, technicians, payments & track due dates
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                  <LockIcon fontSize="small" color="error" />
                  <Typography variant="body2" color="error" fontWeight="bold">
                    Private & Protected
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={openAdminPortal}
                  endIcon={<OpenInNewIcon />}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                >
                  Open Admin Portal
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Technician Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={6} sx={{ textAlign: 'center', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ py: 5 }}>
                <Box sx={{ bgcolor: '#e3f2fd', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <BuildIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Technician Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  View assigned services, customer details, phone numbers & due dates
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    All Customer Data Available
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={openTechnicianPortal}
                  endIcon={<OpenInNewIcon />}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                >
                  Open Technician Portal
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: '#fff', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h6" align="center" gutterBottom fontWeight="bold" color="text.secondary">
            How It Works
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5">1️⃣</Typography>
                <Typography variant="body2" fontWeight="bold">Admin adds customers & services</Typography>
                <Typography variant="caption" color="text.secondary">Store all customer details in database</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5">2️⃣</Typography>
                <Typography variant="body2" fontWeight="bold">Technician views assigned work</Typography>
                <Typography variant="caption" color="text.secondary">See customer phone, address & service details</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5">3️⃣</Typography>
                <Typography variant="body2" fontWeight="bold">Track due dates & reminders</Typography>
                <Typography variant="caption" color="text.secondary">Admin sets due date, system reminds when service is due</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, color: '#888' }}>
        <Typography variant="body2">
          &copy; 2026 Service Company Management. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
