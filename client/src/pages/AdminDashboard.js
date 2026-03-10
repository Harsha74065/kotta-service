import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Logout as LogoutIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotifIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import DashboardHome from '../components/admin/DashboardHome';
import ServicesManagement from '../components/admin/ServicesManagement';
import CustomersManagement from '../components/admin/CustomersManagement';
import TechniciansManagement from '../components/admin/TechniciansManagement';
import PaymentSettings from '../components/admin/PaymentSettings';
import PaymentsView from '../components/admin/PaymentsView';
import DueServicesView from '../components/admin/DueServicesView';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const drawerWidth = 240;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser: user, adminLogout } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    fetchDueCount();
  }, []);

  const fetchDueCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/due-services`);
      setDueCount(response.data.services?.length || 0);
    } catch (error) {
      console.error('Error fetching due count:', error);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { text: 'Services', icon: <BuildIcon />, path: 'services' },
    { text: 'Due Reminders', icon: <Badge badgeContent={dueCount} color="error" max={99}><ScheduleIcon /></Badge>, path: 'due-services' },
    { text: 'Customers', icon: <PeopleIcon />, path: 'customers' },
    { text: 'Technicians', icon: <PersonIcon />, path: 'technicians' },
    { text: 'Payment Settings', icon: <SettingsIcon />, path: 'payment-settings' },
    { text: 'Payments', icon: <PaymentIcon />, path: 'payments' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Service Company - Admin Panel
          </Typography>

          {/* Notification Bell */}
          {dueCount > 0 && (
            <Tooltip title={`${dueCount} services due soon — Click to view`}>
              <IconButton
                color="inherit"
                onClick={() => {
                  setSelectedMenu('due-services');
                  navigate('/admin/due-services');
                }}
                sx={{
                  mr: 1,
                  animation: 'ring 1.5s ease-in-out infinite',
                  '@keyframes ring': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '10%, 30%': { transform: 'rotate(10deg)' },
                    '20%, 40%': { transform: 'rotate(-10deg)' },
                    '50%': { transform: 'rotate(0deg)' }
                  }
                }}
              >
                <Badge badgeContent={dueCount} color="error" max={99}>
                  <NotifIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selectedMenu === item.path}
                  onClick={() => {
                    setSelectedMenu(item.path);
                    navigate(`/admin/${item.path}`);
                  }}
                  sx={item.path === 'due-services' && dueCount > 0 ? {
                    bgcolor: selectedMenu === item.path ? undefined : '#fff3e0',
                    '&:hover': { bgcolor: '#ffe0b2' }
                  } : {}}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="services" element={<ServicesManagement />} />
          <Route path="due-services" element={<DueServicesView />} />
          <Route path="customers" element={<CustomersManagement />} />
          <Route path="technicians" element={<TechniciansManagement />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          <Route path="payments" element={<PaymentsView />} />
          <Route path="*" element={<DashboardHome />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
