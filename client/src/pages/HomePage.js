import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Card, CardContent, CardActions, Grid,
  AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Build as BuildIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  OpenInNew as OpenInNewIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Engineering as TechIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { text: 'Features', icon: <InfoIcon />, action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
    { text: 'Portfolio', icon: <PersonIcon />, action: () => navigate('/portfolio') },
    { text: 'Admin Login', icon: <AdminIcon />, action: () => navigate('/admin/login') },
    { text: 'Technician Login', icon: <TechIcon />, action: () => navigate('/technician/login') }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>

      {/* ============ NAVIGATION BAR ============ */}
      <AppBar position="fixed" sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <BuildIcon sx={{ fontSize: 32, color: '#ffd54f' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" lineHeight={1.1}>
                  ServiceOps
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>
                  Service Operations Platform
                </Typography>
              </Box>
            </Box>

            {/* Desktop Nav Links */}
            {!isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button color="inherit" startIcon={<HomeIcon />}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                  Home
                </Button>
                <Button color="inherit" startIcon={<InfoIcon />}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ textTransform: 'none' }}>
                  Features
                </Button>
                <Button color="inherit" startIcon={<PersonIcon />}
                  onClick={() => navigate('/portfolio')}
                  sx={{ textTransform: 'none' }}>
                  Portfolio
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AdminIcon />}
                  onClick={() => navigate('/admin/login')}
                  sx={{
                    color: 'white', borderColor: 'rgba(255,255,255,0.5)',
                    textTransform: 'none', fontWeight: 'bold', ml: 1,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}>
                  Admin Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<TechIcon />}
                  onClick={() => navigate('/technician/login')}
                  sx={{
                    bgcolor: '#ffd54f', color: '#1a237e', textTransform: 'none', fontWeight: 'bold',
                    '&:hover': { bgcolor: '#ffca28' }
                  }}>
                  Technician Login
                </Button>
              </Box>
            ) : (
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} edge="end">
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '1px solid #e0e0e0' }}>
            <BuildIcon sx={{ fontSize: 36, color: '#1976d2' }} />
            <Typography variant="h6" fontWeight="bold">ServiceOps</Typography>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem button key={item.text} onClick={() => { item.action(); setDrawerOpen(false); }}
                sx={{ '&:hover': { bgcolor: '#e3f2fd' } }}>
                <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 'bold' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Toolbar />

      {/* ============ HERO SECTION ============ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #1a237e 100%)',
        color: 'white', py: { xs: 6, md: 10 }, textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, left: -30, width: 150, height: 150,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)'
        }} />

        <Container maxWidth="md">
          <BuildIcon sx={{ fontSize: 70, mb: 2, color: '#ffd54f' }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold"
            sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }}>
            Service Operations Platform
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3, fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
            Service Tracking • Customer Records • Technician Portal • Due Reminders • Payments
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {[
              { icon: <StorageIcon fontSize="small" />, text: 'Database Storage' },
              { icon: <PhoneIcon fontSize="small" />, text: 'Customer Records' },
              { icon: <ScheduleIcon fontSize="small" />, text: 'Due Reminders' },
              { icon: <PaymentIcon fontSize="small" />, text: 'Payments & QR' }
            ].map((item, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: 5
              }}>
                {item.icon}
                <Typography variant="body2">{item.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large"
              startIcon={<AdminIcon />} endIcon={<OpenInNewIcon />}
              onClick={() => navigate('/admin/login')}
              sx={{
                bgcolor: '#f44336', px: 4, py: 1.5, borderRadius: 3, fontSize: '1rem', fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(244,67,54,0.4)',
                '&:hover': { bgcolor: '#d32f2f', boxShadow: '0 6px 20px rgba(244,67,54,0.5)' }
              }}>
              Admin Portal
            </Button>
            <Button variant="contained" size="large"
              startIcon={<TechIcon />} endIcon={<OpenInNewIcon />}
              onClick={() => navigate('/technician/login')}
              sx={{
                bgcolor: '#ffd54f', color: '#1a237e', px: 4, py: 1.5, borderRadius: 3, fontSize: '1rem', fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255,213,79,0.4)',
                '&:hover': { bgcolor: '#ffca28', boxShadow: '0 6px 20px rgba(255,213,79,0.5)' }
              }}>
              Technician Portal
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ============ LOGIN CARDS ============ */}
      <Container maxWidth="md" sx={{ mt: -4, mb: 6, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Admin Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{
              textAlign: 'center', borderRadius: 3, height: '100%',
              transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 12 }
            }}>
              <CardContent sx={{ py: 5 }}>
                <Box sx={{ bgcolor: '#fce4ec', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <AdminIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">Admin Portal</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Manage services, customers, technicians and payments in one place
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                  <LockIcon fontSize="small" color="error" />
                  <Typography variant="body2" color="error" fontWeight="bold">Private & Protected</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button variant="contained" color="error" size="large"
                  onClick={() => navigate('/admin/login')}
                  endIcon={<OpenInNewIcon />}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}>
                  Open Admin Portal
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Technician Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={8} sx={{
              textAlign: 'center', borderRadius: 3, height: '100%',
              transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 12 }
            }}>
              <CardContent sx={{ py: 5 }}>
                <Box sx={{ bgcolor: '#e3f2fd', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <BuildIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">Technician Portal</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  View assigned services, customer details, phone numbers & due date reminders
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="primary" fontWeight="bold">All Customer Data Available</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button variant="contained" color="primary" size="large"
                  onClick={() => navigate('/technician/login')}
                  endIcon={<OpenInNewIcon />}
                  sx={{ px: 5, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}>
                  Open Technician Portal
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ============ FEATURES SECTION ============ */}
      <Box id="features" sx={{ bgcolor: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            Platform Features
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Everything you need to run a professional service business
          </Typography>

          <Grid container spacing={3}>
            {[
              { icon: <BuildIcon sx={{ fontSize: 40, color: '#1976d2' }} />, title: 'Service Management', desc: 'Create, track, and manage all service requests with customer details', color: '#e3f2fd' },
              { icon: <ScheduleIcon sx={{ fontSize: 40, color: '#ff9800' }} />, title: 'Auto Reminders', desc: 'Auto-reminds you after 6 months when a customer needs service again', color: '#fff3e0' },
              { icon: <PaymentIcon sx={{ fontSize: 40, color: '#4caf50' }} />, title: 'Payment & QR', desc: 'Create payments, generate UPI QR codes for easy customer payments', color: '#e8f5e9' },
              { icon: <TechIcon sx={{ fontSize: 40, color: '#607d8b' }} />, title: 'Technician Portal', desc: 'Dedicated panel for technicians to view tasks and customer details', color: '#eceff1' }
            ].map((feature, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{
                  height: '100%', textAlign: 'center', p: 2, borderRadius: 3,
                  transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                }}>
                  <Box sx={{ bgcolor: feature.color, borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, mt: 1 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ HOW IT WORKS ============ */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
            How It Works
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              { step: '1️⃣', title: 'Add customer when they contact you', desc: 'When someone calls or visits, admin enters name, phone & service — no need to have every number upfront' },
              { step: '2️⃣', title: 'Assign technician to the job', desc: 'Admin picks the right technician for each service request' },
              { step: '3️⃣', title: 'Technician completes the service', desc: 'Updates status, collects payment via QR code' },
              { step: '4️⃣', title: 'System auto-reminds after 6 months', desc: 'When service is due again, you get notified automatically' }
            ].map((step, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>{step.step}</Typography>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>{step.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ FOOTER ============ */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white', py: 4, textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <BuildIcon sx={{ color: '#ffd54f' }} />
            <Typography variant="h6" fontWeight="bold">ServiceOps</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
            Service Operations Platform
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Button size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}
              onClick={() => navigate('/portfolio')}>Portfolio</Button>
            <Button size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}
              onClick={() => navigate('/admin/login')}>Admin Login</Button>
            <Button size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}
              onClick={() => navigate('/technician/login')}>Technician Login</Button>
            <Button size="small" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none' }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</Button>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © 2026 ServiceOps. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
