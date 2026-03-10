import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [techUser, setTechUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check both tokens and restore sessions
  useEffect(() => {
    const initAuth = async () => {
      const adminToken = localStorage.getItem('admin_token');
      const techToken = localStorage.getItem('tech_token');

      // Clean up old single token if exists
      const oldToken = localStorage.getItem('token');
      if (oldToken) {
        localStorage.removeItem('token');
      }

      const promises = [];

      if (adminToken) {
        promises.push(
          axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          })
            .then(res => {
              if (res.data.user.role === 'admin') {
                setAdminUser(res.data.user);
              } else {
                localStorage.removeItem('admin_token');
              }
            })
            .catch(() => {
              localStorage.removeItem('admin_token');
            })
        );
      }

      if (techToken) {
        promises.push(
          axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${techToken}` }
          })
            .then(res => {
              if (res.data.user.role === 'technician') {
                setTechUser(res.data.user);
              } else {
                localStorage.removeItem('tech_token');
              }
            })
            .catch(() => {
              localStorage.removeItem('tech_token');
            })
        );
      }

      await Promise.all(promises);
      setLoading(false);
    };

    initAuth();
  }, []);

  // Admin login - only for admin users
  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      if (user.role !== 'admin') {
        return { success: false, message: 'Access denied. Admin login required.' };
      }

      localStorage.setItem('admin_token', token);
      setAdminUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Technician login - only for technician users
  const technicianLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/technician-login`, { email, password });
      const { token, user } = response.data;

      localStorage.setItem('tech_token', token);
      setTechUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Separate logout functions
  const adminLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setAdminUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const techLogout = useCallback(() => {
    localStorage.removeItem('tech_token');
    setTechUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Set active token for axios - call when entering admin or tech area
  const setActiveAdminToken = useCallback(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const setActiveTechToken = useCallback(() => {
    const token = localStorage.getItem('tech_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const value = {
    // Admin auth
    adminUser,
    adminLogin,
    adminLogout,
    isAdminAuthenticated: !!adminUser,
    isAdmin: adminUser?.role === 'admin',
    setActiveAdminToken,

    // Technician auth
    techUser,
    technicianLogin,
    techLogout,
    isTechAuthenticated: !!techUser,
    isTechnician: techUser?.role === 'technician',
    setActiveTechToken,

    // Common
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
